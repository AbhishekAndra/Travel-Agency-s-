#!/usr/bin/env python3
"""
Voyara — local image optimizer.

Run this against a folder of source .jpg/.png images (mirroring the site's
assets/images/{hero,destinations,hotels,tours,gallery,testimonials,icons}/
layout) to produce the .webp files the site's <img> tags already reference.

Usage:
    pip install Pillow
    python scripts/optimize_images.py --src ./source_images --dst ./assets/images

Nothing under --src is modified; output is written to --dst, mirroring the
same subfolder structure.
"""

import argparse
import io
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")

try:
    RESAMPLE = Image.Resampling.LANCZOS
except AttributeError:  # Pillow < 9.1
    RESAMPLE = Image.LANCZOS

VALID_EXTENSIONS = {'.jpg', '.jpeg', '.png'}

# Max output width per top-level assets/images/ subfolder. "destinations"
# doubles as the package card image (packages reuse the destination photo),
# so it isn't listed separately.
FOLDER_MAX_WIDTH = {
    'hero': 1920,
    'destinations': 800,
    'hotels': 800,
    'tours': 800,
    'gallery': 600,
    'testimonials': 600,
    'icons': 128,
}

SIZE_CAP_BYTES = 100 * 1024
START_QUALITY = 82
QUALITY_STEP = 5
FLOOR_QUALITY = 50
WEBP_METHOD = 6  # slowest/best compression effort Pillow's webp encoder offers


def human_size(num_bytes):
    size = float(num_bytes)
    for unit in ('B', 'KB', 'MB', 'GB'):
        if size < 1024 or unit == 'GB':
            return f"{size:.1f}{unit}"
        size /= 1024
    return f"{size:.1f}TB"


def prepare_mode(img):
    """WebP supports RGB and RGBA — normalize everything else (P, CMYK, L, ...)
    into one of those two, preserving transparency where it exists."""
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        return img.convert('RGBA')
    return img.convert('RGB')


def resize_if_needed(img, max_width):
    if max_width is None:
        return img
    width, height = img.size
    if width <= max_width:
        return img  # never upscale
    ratio = max_width / float(width)
    new_size = (max_width, max(1, round(height * ratio)))
    return img.resize(new_size, RESAMPLE)


def save_webp_under_cap(img, out_path):
    """Encodes at START_QUALITY, stepping down by QUALITY_STEP until the
    result fits SIZE_CAP_BYTES or FLOOR_QUALITY is reached. Always writes the
    best attempt to disk; returns whether the cap was actually met so the
    caller can flag files that couldn't hit it without over-compressing
    further."""
    quality = START_QUALITY

    while True:
        buffer = io.BytesIO()
        img.save(buffer, format='WEBP', quality=quality, method=WEBP_METHOD)
        size = buffer.tell()

        if size <= SIZE_CAP_BYTES:
            out_path.write_bytes(buffer.getvalue())
            return size, quality, True

        if quality <= FLOOR_QUALITY:
            # Never met the cap even at FLOOR_QUALITY — write this floor-quality
            # attempt anyway (best available without compressing further) and
            # let the caller flag it.
            out_path.write_bytes(buffer.getvalue())
            return size, quality, False

        # Clamp the last step so FLOOR_QUALITY itself always gets tried,
        # regardless of whether (START_QUALITY - FLOOR_QUALITY) is an exact
        # multiple of QUALITY_STEP.
        quality = max(FLOOR_QUALITY, quality - QUALITY_STEP)


def iter_source_images(src_root):
    for path in sorted(src_root.rglob('*')):
        if path.is_file() and path.suffix.lower() in VALID_EXTENSIONS:
            yield path


def process_image(path, src_root, dst_root):
    rel = path.relative_to(src_root)
    top_folder = rel.parts[0] if len(rel.parts) > 1 else None
    max_width = FOLDER_MAX_WIDTH.get(top_folder)

    out_path = (dst_root / rel).with_suffix('.webp')
    out_path.parent.mkdir(parents=True, exist_ok=True)

    original_size = path.stat().st_size

    with Image.open(path) as img:
        img = prepare_mode(img)
        img = resize_if_needed(img, max_width)
        final_size, used_quality, met_cap = save_webp_under_cap(img, out_path)

    return {
        'rel': rel,
        'top_folder': top_folder,
        'original_size': original_size,
        'final_size': final_size,
        'quality': used_quality,
        'met_cap': met_cap,
        'unrecognized_folder': top_folder is not None and top_folder not in FOLDER_MAX_WIDTH,
    }


def print_report(results, errors):
    if not results and not errors:
        print("No .jpg/.png files found.")
        return

    name_width = max((len(str(r['rel'])) for r in results), default=20)
    name_width = max(name_width, len('FILE'))

    header = f"{'FILE':<{name_width}}  {'BEFORE':>9}  {'AFTER':>9}  {'SAVED':>7}  Q"
    print(header)
    print('-' * len(header))

    total_before = 0
    total_after = 0
    flagged = []
    unrecognized = []

    for r in results:
        total_before += r['original_size']
        total_after += r['final_size']

        saved_pct = (1 - r['final_size'] / r['original_size']) * 100 if r['original_size'] else 0
        flag = '' if r['met_cap'] else '  ⚠ over cap'
        print(f"{str(r['rel']):<{name_width}}  {human_size(r['original_size']):>9}  "
              f"{human_size(r['final_size']):>9}  {saved_pct:>6.1f}%  {r['quality']}{flag}")

        if not r['met_cap']:
            flagged.append(r)
        if r['unrecognized_folder']:
            unrecognized.append(r)

    print('-' * len(header))
    total_saved = total_before - total_after
    saved_pct = (total_saved / total_before * 100) if total_before else 0
    print(f"Total: {human_size(total_before)} -> {human_size(total_after)}  "
          f"(saved {human_size(total_saved)}, {saved_pct:.1f}%) across {len(results)} file(s)")

    if unrecognized:
        print(f"\nNote: {len(unrecognized)} file(s) sat outside a recognized subfolder "
              f"({', '.join(sorted(FOLDER_MAX_WIDTH))}) — not resized, only re-encoded:")
        for r in unrecognized:
            print(f"  - {r['rel']}")

    if flagged:
        print(f"\n⚠ {len(flagged)} file(s) still exceed {human_size(SIZE_CAP_BYTES)} "
              f"even at quality={FLOOR_QUALITY} (kept at the floor rather than "
              f"over-compressing further — resize/re-shoot these):")
        for r in flagged:
            print(f"  - {r['rel']}  ({human_size(r['final_size'])})")

    if errors:
        print(f"\n✗ {len(errors)} file(s) failed to process:")
        for path, err in errors:
            print(f"  - {path}: {err}")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--src', default='source_images', help='Folder of source .jpg/.png images (default: ./source_images)')
    parser.add_argument('--dst', default='assets/images', help='Output folder for .webp files (default: ./assets/images)')
    args = parser.parse_args()

    src_root = Path(args.src)
    dst_root = Path(args.dst)

    if not src_root.is_dir():
        sys.exit(f"Source folder not found: {src_root}")

    results = []
    errors = []

    for path in iter_source_images(src_root):
        try:
            results.append(process_image(path, src_root, dst_root))
        except Exception as exc:  # keep going on a single bad file
            errors.append((path.relative_to(src_root), exc))

    print_report(results, errors)


if __name__ == '__main__':
    main()
