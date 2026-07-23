/* ==========================================================================
   Stackly — Lightweight animation utility (no external libraries)
   Reveal-on-scroll, counter-up, typing effect, parallax — all gated behind
   prefers-reduced-motion. Self-initializes on every page; page scripts that
   re-render content (filtered listings) should call
   window.StacklyAnimations.refreshReveal() after updating the DOM so newly
   inserted [data-reveal] elements get picked up.
   ========================================================================== */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STAGGER_STEP_MS = 80;
  var STAGGER_MAX_STEPS = 8;

  /* ------------------------------------------------------------------------
     Reveal on scroll: data-reveal="fade-up" | "fade-left" | "fade-right" | "zoom-in"
     Optional data-reveal-delay="200" overrides auto-stagger for that element.
     ------------------------------------------------------------------------ */

  var revealObserver = null;

  function getRevealObserver() {
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    }
    return revealObserver;
  }

  function applyStagger(items) {
    var groups = new Map();

    items.forEach(function (el) {
      if (el.hasAttribute('data-reveal-delay')) return;
      var parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });

    groups.forEach(function (siblings) {
      siblings.forEach(function (el, i) {
        el.style.transitionDelay = (Math.min(i, STAGGER_MAX_STEPS) * STAGGER_STEP_MS) + 'ms';
      });
    });

    items.forEach(function (el) {
      if (el.hasAttribute('data-reveal-delay')) {
        el.style.transitionDelay = el.dataset.revealDelay + 'ms';
      }
    });
  }

  // Scans for [data-reveal] elements not yet processed (no data-reveal-init),
  // assigns the matching reveal-* class, staggers them, and observes them.
  // Safe to call repeatedly — e.g. after a filtered listing re-renders.
  function refreshReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]:not([data-reveal-init])'));
    if (!items.length) return;

    items.forEach(function (el) {
      el.classList.add('reveal-' + el.dataset.reveal);
      el.setAttribute('data-reveal-init', 'true');
    });

    if (prefersReducedMotion) {
      items.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }

    applyStagger(items);
    var observer = getRevealObserver();
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------------
     Number counter-up: data-count-to="500" on the element whose text is
     replaced. Optional data-count-decimals, data-count-suffix, data-count-duration.
     ------------------------------------------------------------------------ */

  function formatCounterValue(el, value) {
    var decimals = Number(el.dataset.countDecimals) || 0;
    var suffix = el.dataset.countSuffix || '';
    return value.toFixed(decimals) + suffix;
  }

  function animateCounter(el) {
    var target = parseFloat(el.dataset.countTo);
    if (isNaN(target)) return;
    var duration = Number(el.dataset.countDuration) || 1600;
    var start = null;

    function tick(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = formatCounterValue(el, target * eased);
      if (progress < 1) {
        window.requestAnimationFrame(tick);
      } else {
        el.textContent = formatCounterValue(el, target);
      }
    }

    window.requestAnimationFrame(tick);
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-count-to]');
    if (!counters.length) return;

    if (prefersReducedMotion) {
      counters.forEach(function (el) {
        el.textContent = formatCounterValue(el, parseFloat(el.dataset.countTo));
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------------
     Typing effect: data-typing-text="Full sentence" on an element. Types out
     once on load. The element's aria-label (set in HTML) keeps the full text
     available to assistive tech throughout, regardless of animation state.
     ------------------------------------------------------------------------ */

  function initTyping() {
    var el = document.querySelector('[data-typing-text]');
    if (!el) return;

    var fullText = el.dataset.typingText;
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', fullText);

    if (prefersReducedMotion) {
      el.textContent = fullText;
      return;
    }

    el.textContent = '';
    var speed = Number(el.dataset.typingSpeed) || 35;
    var i = 0;

    function typeNext() {
      el.textContent = fullText.slice(0, i);
      i++;
      if (i <= fullText.length) {
        window.setTimeout(typeNext, speed);
      }
    }

    typeNext();
  }

  /* ------------------------------------------------------------------------
     Parallax: data-parallax on the (oversized) layer that should move.
     Optional data-parallax-speed (default 0.3), data-parallax-max (default
     60, px) — translation is clamped to ±max, and the layer's CSS must be
     sized with that same buffer (e.g. inset -max, height +2*max) so the
     clamp never reveals empty space at the edges.
     ------------------------------------------------------------------------ */

  function initParallax() {
    var layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length || prefersReducedMotion) return;

    function update() {
      layers.forEach(function (el) {
        var speed = Number(el.dataset.parallaxSpeed) || 0.3;
        var max = Number(el.dataset.parallaxMax) || 60;
        var rect = el.parentElement.getBoundingClientRect();
        // Only bother once the hero is within a viewport height of view.
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        var offset = Math.max(-max, Math.min(max, window.scrollY * speed));
        el.style.transform = 'translateY(' + offset + 'px)';
      });
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  function init() {
    refreshReveal();
    initCounters();
    initTyping();
    initParallax();
  }

  document.addEventListener('DOMContentLoaded', init);

  window.StacklyAnimations = {
    refreshReveal: refreshReveal
  };
})();
