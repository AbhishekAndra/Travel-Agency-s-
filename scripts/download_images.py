#!/usr/bin/env python3
"""
Stackly — downloads real source photos from Unsplash's official API into a
local folder, using the exact filenames/paths scripts/optimize_images.py
already expects (assets/images/{hero,destinations,hotels,tours,gallery}/...).
Run this first, then run optimize_images.py against its output — no
renaming needed in between.

Unsplash's old "Source" API (source.unsplash.com) was shut down; this uses
their real, current API instead, which needs a free Access Key.

Setup:
    pip install requests
    1. Go to https://unsplash.com/oauth/applications
    2. "New Application" -> accept the API terms -> copy the "Access Key"
       (NOT the Secret Key)

Usage:
    python scripts/download_images.py --key YOUR_ACCESS_KEY
    # or set it once: set UNSPLASH_ACCESS_KEY=YOUR_ACCESS_KEY   (Windows)
    #                 export UNSPLASH_ACCESS_KEY=YOUR_ACCESS_KEY (macOS/Linux)

Unsplash's free "Demo" tier allows 50 requests/hour. This script fetches
~89 images, so it WILL hit that limit partway through a first run — that's
expected, not an error. Every file is skipped if it already exists, so
just wait ~an hour and re-run the exact same command to pick up where you
left off. Images are listed hero/page-banners and destinations first
(highest visual impact, lowest count), so a rate-limited first run still
nets the images that matter most.
"""

import argparse
import os
import sys
import time
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("requests is required: pip install requests")

API_SEARCH_URL = "https://api.unsplash.com/search/photos"

# (relative output path under --dst, search query, orientation)
IMAGES = [
    # ---- Hero / page banners ----
    ("hero/home.jpg", "cliffside coastal town sunset travel", "landscape"),
    ("hero/about.jpg", "travel planning desk scenic office", "landscape"),
    ("hero/contact.jpg", "world map travel compass", "landscape"),
    ("hero/flights.jpg", "airplane wing sky clouds", "landscape"),
    ("hero/hotels.jpg", "luxury hotel pool resort", "landscape"),

    # ---- Destinations (12) ----
    ("destinations/santorini.jpg", "santorini greece caldera sunset", "landscape"),
    ("destinations/kyoto.jpg", "kyoto japan temple bamboo", "landscape"),
    ("destinations/zermatt.jpg", "zermatt switzerland matterhorn village", "landscape"),
    ("destinations/bali.jpg", "bali indonesia rice terrace", "landscape"),
    ("destinations/cusco.jpg", "machu picchu peru mountains", "landscape"),
    ("destinations/paris.jpg", "paris france eiffel tower", "landscape"),
    ("destinations/maldives.jpg", "maldives overwater villa lagoon", "landscape"),
    ("destinations/queenstown.jpg", "queenstown new zealand lake mountains", "landscape"),
    ("destinations/banff.jpg", "banff canada turquoise lake rockies", "landscape"),
    ("destinations/dubai.jpg", "dubai skyline desert dunes", "landscape"),
    ("destinations/amalfi-coast.jpg", "amalfi coast italy cliffside village", "landscape"),
    ("destinations/reykjavik.jpg", "iceland aurora borealis glacier", "landscape"),

    # ---- Hotels (12) ----
    ("hotels/aegean-cliffside-suites.jpg", "santorini infinity pool cliffside hotel", "landscape"),
    ("hotels/kyoto-riverstone-ryokan.jpg", "japanese ryokan traditional room", "landscape"),
    ("hotels/matterhorn-alpine-lodge.jpg", "alpine lodge mountain chalet", "landscape"),
    ("hotels/jimbaran-bay-villas.jpg", "bali pool villa tropical", "landscape"),
    ("hotels/sacred-valley-monastery-hotel.jpg", "peru boutique hotel andes", "landscape"),
    ("hotels/maison-seine-paris.jpg", "boutique hotel paris facade", "landscape"),
    ("hotels/azure-lagoon-water-villas.jpg", "maldives overwater villa deck", "landscape"),
    ("hotels/remarkables-view-hotel.jpg", "new zealand mountain hotel room", "landscape"),
    ("hotels/rockies-springs-grand-hotel.jpg", "grand hotel canadian rockies", "landscape"),
    ("hotels/dune-pearl-palace.jpg", "luxury desert resort dubai", "landscape"),
    ("hotels/cliffside-amalfi-retreat.jpg", "amalfi coast hotel terrace pool", "landscape"),
    ("hotels/northern-lights-geothermal-retreat.jpg", "iceland geothermal spa pool", "landscape"),

    # ---- Tours (12) ----
    ("tours/santorini-sunset-photography-tour.jpg", "santorini blue dome church sunset", "landscape"),
    ("tours/kyoto-zen-culture-immersion.jpg", "japanese zen garden tea ceremony", "landscape"),
    ("tours/swiss-alps-trekking-expedition.jpg", "alps hiking trail glacier", "landscape"),
    ("tours/bali-wellness-yoga-journey.jpg", "yoga retreat rice terrace bali", "landscape"),
    ("tours/machu-picchu-trekking-trail.jpg", "inca trail trekkers machu picchu", "landscape"),
    ("tours/paris-culinary-discovery.jpg", "paris pastry cooking class", "landscape"),
    ("tours/maldives-marine-safari.jpg", "manta ray snorkeling maldives", "landscape"),
    ("tours/queenstown-adventure-rush.jpg", "bungee jump adventure new zealand", "landscape"),
    ("tours/banff-wildlife-nature-tour.jpg", "grizzly bear canadian wilderness", "landscape"),
    ("tours/dubai-luxury-desert-escape.jpg", "desert dune dinner stars dubai", "landscape"),
    ("tours/amalfi-coast-sailing-tour.jpg", "sailboat amalfi coast capri", "landscape"),
    ("tours/iceland-ring-road-explorer.jpg", "northern lights iceland landscape", "landscape"),

    # ---- Gallery (48: 4 per destination) ----
    ("gallery/santorini-01.jpg", "santorini oia whitewashed buildings", "landscape"),
    ("gallery/santorini-02.jpg", "santorini wine vineyard", "landscape"),
    ("gallery/santorini-03.jpg", "santorini volcano boat cruise", "landscape"),
    ("gallery/santorini-04.jpg", "santorini black sand beach", "landscape"),
    ("gallery/kyoto-01.jpg", "fushimi inari torii gates", "landscape"),
    ("gallery/kyoto-02.jpg", "arashiyama bamboo grove kyoto", "landscape"),
    ("gallery/kyoto-03.jpg", "kinkaku-ji golden pavilion", "landscape"),
    ("gallery/kyoto-04.jpg", "nara deer park japan", "landscape"),
    ("gallery/zermatt-01.jpg", "gornergrat railway matterhorn", "landscape"),
    ("gallery/zermatt-02.jpg", "glacier paradise switzerland", "landscape"),
    ("gallery/zermatt-03.jpg", "five lakes trail zermatt", "landscape"),
    ("gallery/zermatt-04.jpg", "swiss alpine chalet spa", "landscape"),
    ("gallery/bali-01.jpg", "tegallalang rice terrace bali", "landscape"),
    ("gallery/bali-02.jpg", "balinese temple tirta empul", "landscape"),
    ("gallery/bali-03.jpg", "balinese spa massage flowers", "landscape"),
    ("gallery/bali-04.jpg", "seminyak beach club sunset", "landscape"),
    ("gallery/cusco-01.jpg", "sacred valley peru cusco", "landscape"),
    ("gallery/cusco-02.jpg", "machu picchu sunrise", "landscape"),
    ("gallery/cusco-03.jpg", "peru andes mountain air", "landscape"),
    ("gallery/cusco-04.jpg", "cusco city plaza peru", "landscape"),
    ("gallery/paris-01.jpg", "louvre museum paris", "landscape"),
    ("gallery/paris-02.jpg", "montmartre paris street", "landscape"),
    ("gallery/paris-03.jpg", "french pastry patisserie", "landscape"),
    ("gallery/paris-04.jpg", "seine river paris evening", "landscape"),
    ("gallery/maldives-01.jpg", "maldives coral reef snorkeling", "landscape"),
    ("gallery/maldives-02.jpg", "maldives bioluminescent beach night", "landscape"),
    ("gallery/maldives-03.jpg", "maldives sandbank picnic", "landscape"),
    ("gallery/maldives-04.jpg", "dolphin cruise maldives", "landscape"),
    ("gallery/queenstown-01.jpg", "kawarau bridge bungee queenstown", "landscape"),
    ("gallery/queenstown-02.jpg", "shotover jet boat new zealand", "landscape"),
    ("gallery/queenstown-03.jpg", "milford sound new zealand", "landscape"),
    ("gallery/queenstown-04.jpg", "lake wakatipu skydive view", "landscape"),
    ("gallery/banff-01.jpg", "moraine lake canoe canada", "landscape"),
    ("gallery/banff-02.jpg", "icefields parkway canada", "landscape"),
    ("gallery/banff-03.jpg", "grizzly bear gondola banff", "landscape"),
    ("gallery/banff-04.jpg", "banff wildlife photography", "landscape"),
    ("gallery/dubai-01.jpg", "burj khalifa dubai skyline", "landscape"),
    ("gallery/dubai-02.jpg", "dubai falconry desert", "landscape"),
    ("gallery/dubai-03.jpg", "luxury yacht dubai marina", "landscape"),
    ("gallery/dubai-04.jpg", "dubai desert dune dinner", "landscape"),
    ("gallery/amalfi-coast-01.jpg", "positano cliffside village italy", "landscape"),
    ("gallery/amalfi-coast-02.jpg", "capri island boat italy", "landscape"),
    ("gallery/amalfi-coast-03.jpg", "limoncello sorrento italy", "landscape"),
    ("gallery/amalfi-coast-04.jpg", "amalfi coastal village dinner", "landscape"),
    ("gallery/reykjavik-01.jpg", "golden circle geysir iceland", "landscape"),
    ("gallery/reykjavik-02.jpg", "glacier lagoon iceland boat", "landscape"),
    ("gallery/reykjavik-03.jpg", "black sand beach vik iceland", "landscape"),
    ("gallery/reykjavik-04.jpg", "reykjavik northern lights hunting", "landscape"),
]


def download_one(session, key, rel_path, query, orientation, dst_root, skip_existing):
    out_path = dst_root / rel_path
    if skip_existing and out_path.exists():
        return "skipped"

    out_path.parent.mkdir(parents=True, exist_ok=True)

    resp = session.get(
        API_SEARCH_URL,
        params={"query": query, "orientation": orientation, "per_page": 1, "content_filter": "high"},
        headers={"Authorization": "Client-ID " + key},
        timeout=15,
    )

    if resp.status_code == 403:
        return "rate_limited"
    resp.raise_for_status()

    results = resp.json().get("results")
    if not results:
        return "no_results"

    photo = results[0]
    image_url = photo["urls"]["raw"] + "&w=2000&q=85&fm=jpg"

    # Unsplash API Guidelines require pinging this whenever a photo is
    # actually used (not just previewed) — best-effort, never fatal.
    try:
        session.get(
            photo["links"]["download_location"],
            headers={"Authorization": "Client-ID " + key},
            timeout=10,
        )
    except requests.RequestException:
        pass

    img_resp = session.get(image_url, timeout=30)
    img_resp.raise_for_status()
    out_path.write_bytes(img_resp.content)
    return "downloaded"


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--key", default=os.environ.get("UNSPLASH_ACCESS_KEY"),
                         help="Unsplash Access Key (or set UNSPLASH_ACCESS_KEY env var)")
    parser.add_argument("--dst", default="source_images", help="Output folder (default: ./source_images)")
    parser.add_argument("--no-skip-existing", action="store_true", help="Re-download files that already exist")
    parser.add_argument("--delay", type=float, default=1.0, help="Seconds between requests (default: 1.0)")
    args = parser.parse_args()

    if not args.key:
        sys.exit(
            "Missing Access Key. Pass --key YOUR_KEY or set UNSPLASH_ACCESS_KEY.\n"
            "Get a free one at https://unsplash.com/oauth/applications (New Application)."
        )

    dst_root = Path(args.dst)
    session = requests.Session()
    counts = {"downloaded": 0, "skipped": 0, "no_results": 0, "rate_limited": 0, "error": 0}

    for i, (rel_path, query, orientation) in enumerate(IMAGES, 1):
        try:
            result = download_one(session, args.key, rel_path, query, orientation, dst_root, not args.no_skip_existing)
        except requests.RequestException as exc:
            print(f"[{i}/{len(IMAGES)}] ERROR      {rel_path}: {exc}")
            counts["error"] += 1
            continue

        counts[result] = counts.get(result, 0) + 1
        print(f"[{i}/{len(IMAGES)}] {result:11} {rel_path}  (\"{query}\")")

        if result == "rate_limited":
            print("\nHit Unsplash's hourly rate limit (50 requests/hour on the free Demo tier).")
            print("Expected for a set this size, not a bug. Wait about an hour, then re-run the")
            print("exact same command — files already downloaded are skipped automatically.")
            break

        if result == "downloaded":
            time.sleep(args.delay)

    total_have = counts["downloaded"] + counts["skipped"]
    print(f"\nDone this run: {counts['downloaded']} downloaded, {counts['skipped']} already present, "
          f"{counts['no_results']} had no results, {counts['error']} errored.")

    if total_have < len(IMAGES):
        print(f"{total_have}/{len(IMAGES)} images ready. Re-run this same command later for the rest.")
    else:
        print(f"All {len(IMAGES)} images ready. Next:\n"
              f"  python scripts/optimize_images.py --src {args.dst} --dst assets/images")


if __name__ == "__main__":
    main()
