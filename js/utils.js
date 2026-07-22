/* ==========================================================================
   Voyara — Shared utility helpers + header behavior
   Runs on every page load (utils.js is loaded site-wide).
   ========================================================================== */

(function () {
  'use strict';

  function highlightActiveNav() {
    var current = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (current === '') current = 'index.html';

    var links = document.querySelectorAll('.main-nav a, .mobile-nav a');
    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      var target = href.split('/').pop().split('?')[0].split('#')[0].toLowerCase();
      if (target === current) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function updateCartBadge() {
    var badge = document.getElementById('cart-badge');
    if (!badge) return;

    var count = (window.VoyaraCart && typeof window.VoyaraCart.getItemCount === 'function')
      ? window.VoyaraCart.getItemCount()
      : 0;

    badge.textContent = String(count);
    badge.hidden = count <= 0;
  }

  // No add-to-wishlist UI exists anywhere yet, so 'voyaraWishlist' is always
  // empty today — this just makes sure the badge is correct (hidden) rather
  // than stale or erroring once that UI does exist.
  function updateWishlistBadge() {
    var badge = document.getElementById('wishlist-badge');
    if (!badge) return;

    var count = 0;
    try {
      var raw = window.localStorage.getItem('voyaraWishlist');
      var items = raw ? JSON.parse(raw) : [];
      count = Array.isArray(items) ? items.length : 0;
    } catch (err) {
      count = 0;
    }

    badge.textContent = String(count);
    badge.hidden = count <= 0;
  }

  function initHeaderScroll() {
    var header = document.getElementById('site-header');
    if (!header) return;
    var THRESHOLD = 40;

    function onScroll() {
      header.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initMobileNav() {
    var toggle = document.getElementById('menu-toggle');
    var panel = document.getElementById('mobile-nav');
    if (!toggle || !panel) return;

    function closeMenu() {
      toggle.setAttribute('aria-expanded', 'false');
      panel.classList.remove('is-open');
      document.body.classList.remove('mobile-nav-open');
    }

    function openMenu() {
      toggle.setAttribute('aria-expanded', 'true');
      panel.classList.add('is-open');
      document.body.classList.add('mobile-nav-open');
    }

    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
  }

  // Footer newsletter form — present on every page. No backend, so a valid
  // submit just confirms inline and resets the field (never a silent no-op).
  function initNewsletterForm() {
    var form = document.getElementById('newsletter-form');
    if (!form) return;

    var input = document.getElementById('newsletter-email');
    var errorEl = document.getElementById('newsletter-email-error');
    var successEl = document.getElementById('newsletter-success');

    function setError(message) {
      input.classList.toggle('has-error', !!message);
      errorEl.textContent = message || '';
    }

    input.addEventListener('input', function () {
      successEl.hidden = true;
      if (errorEl.textContent) setError('');
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input.value.trim();

      if (!value || !(window.VoyaraAuth && window.VoyaraAuth.isValidEmail(value))) {
        setError('Enter a valid email address.');
        return;
      }

      setError('');
      form.reset();
      successEl.hidden = false;
    });
  }

  function initHeader() {
    highlightActiveNav();
    updateCartBadge();
    updateWishlistBadge();
    initHeaderScroll();
    initMobileNav();
    initNewsletterForm();
  }

  document.addEventListener('DOMContentLoaded', initHeader);

  var STAR_FILLED = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L6 21l1.6-7L2.2 9.2l7.1-.6L12 2z"/></svg>';
  var STAR_EMPTY = '<svg class="is-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L6 21l1.6-7L2.2 9.2l7.1-.6L12 2z"/></svg>';

  function renderStars(rating) {
    var rounded = Math.round(rating);
    var stars = '';
    for (var i = 1; i <= 5; i++) {
      stars += i <= rounded ? STAR_FILLED : STAR_EMPTY;
    }
    return '<span class="rating-stars">' + stars + '<span class="rating-value">' + rating.toFixed(1) + '</span></span>';
  }

  // Generic tab switcher: wires up any `.tab-btn[data-tab="x"]` to show/hide
  // its matching `#tab-x` panel. Used by package-detail and dashboard.
  function initTabs() {
    var buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.tab-panel').forEach(function (p) { p.hidden = true; });

        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        document.getElementById('tab-' + btn.dataset.tab).hidden = false;
      });
    });
  }

  window.VoyaraUtils = {
    highlightActiveNav: highlightActiveNav,
    updateCartBadge: updateCartBadge,
    updateWishlistBadge: updateWishlistBadge,
    initHeaderScroll: initHeaderScroll,
    initMobileNav: initMobileNav,
    initNewsletterForm: initNewsletterForm,
    initHeader: initHeader,
    renderStars: renderStars,
    initTabs: initTabs
  };
})();
