/* ==========================================================================
   Stackly — Shared utility helpers + header behavior
   Runs on every page load (utils.js is loaded site-wide).
   ========================================================================== */

(function () {
  'use strict';

  // Root-absolute paths ("/assets/...") break on GitHub Pages project sites
  // (served at username.github.io/repo-name/, not the domain root), since
  // the browser resolves them against the domain root instead. This file
  // and data.js are both loaded from the site root (index.html) AND one
  // level down (pages/*.html), so a single hardcoded relative prefix can't
  // serve both — this detects the actual depth from the page's own URL and
  // computes the right one at runtime, regardless of deployment subpath.
  var ROOT_PATH = /\/pages\//.test(window.location.pathname) ? '../' : '';

  // ---- Shared field validators ----
  // Every form site-wide (contact, login, signup, checkout traveler
  // details, newsletter) uses these so the rules and messages stay
  // identical everywhere. Each returns an error string, or '' when valid.
  var NAME_PATTERN = /^[A-Za-z\s]+$/;
  var NAME_MAX_LENGTH = 30;
  var PHONE_PATTERN = /^\d{10}$/;

  function validateNameValue(value) {
    var trimmed = (value || '').trim();
    if (!trimmed) return 'This field is required.';
    if (!NAME_PATTERN.test(trimmed)) return 'Only alphabets allowed.';
    if (trimmed.length > NAME_MAX_LENGTH) return 'Maximum 30 characters.';
    return '';
  }

  function validateEmailValue(value) {
    var trimmed = (value || '').trim();
    if (!trimmed || !(window.StacklyAuth && window.StacklyAuth.isValidEmail(trimmed))) {
      return 'Enter a valid email address.';
    }
    return '';
  }

  function validatePhoneValue(value) {
    var trimmed = (value || '').trim();
    if (!PHONE_PATTERN.test(trimmed)) return 'Enter a valid 10-digit phone number.';
    return '';
  }

  // Runs each {input, validate} pair (validate returns true/false and is
  // expected to paint its own error state), then focuses the first field
  // that failed — used by every form's submit handler so a blocked
  // submission always lands keyboard/screen-reader focus on the first
  // problem instead of silently doing nothing.
  function validateFieldsAndFocus(fields) {
    var firstInvalid = null;
    var allValid = true;
    fields.forEach(function (f) {
      var valid = f.validate(f.input);
      if (!valid) {
        allValid = false;
        if (!firstInvalid) firstInvalid = f.input;
      }
    });
    if (firstInvalid) firstInvalid.focus();
    return allValid;
  }

  // Wires a live "X/max" counter under a textarea (native maxlength does
  // the hard-capping — the counter is purely visual feedback, not itself
  // an error state, so it's intentionally NOT aria-live: announcing on
  // every keystroke would be noisy for screen reader users).
  function initCharCounter(textareaId, counterId, maxLength) {
    var textarea = document.getElementById(textareaId);
    var counter = document.getElementById(counterId);
    if (!textarea || !counter) return;

    function update() {
      var length = textarea.value.length;
      counter.textContent = length + '/' + maxLength;
      counter.classList.toggle('is-limit', length >= maxLength);
    }

    textarea.addEventListener('input', update);
    update();
  }

  // ---- Shared field-error UI ----
  // Toggles .has-error on a .form-field wrapper and writes the message
  // into its error span. Used by every form's validation (checkout,
  // contact, dashboard, home search widget, login, signup).
  function setFieldError(fieldId, errorId, message) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById(errorId);
    field.classList.toggle('has-error', !!message);
    errorEl.textContent = message || '';
  }

  // ---- Shared localStorage helpers ----
  // Safe array read for any JSON-array-shaped localStorage key
  // (stacklyBookings, stacklyWishlist, ...). Used by checkout, confirmation,
  // and dashboard.
  function readLocalArray(key) {
    try {
      var raw = window.localStorage.getItem(key);
      var value = raw ? JSON.parse(raw) : [];
      return Array.isArray(value) ? value : [];
    } catch (err) {
      return [];
    }
  }

  // ---- Shared order/booking item formatting ----
  // A cart/booking item is either a flight (airline + from/to + times) or
  // everything else (title + destination + travelDate) — these three read
  // whichever shape applies. Used by checkout.js and confirmation.js.
  function getItemTitle(item) {
    return item.type === 'flight' ? (item.airline + ' — ' + item.from + ' to ' + item.to) : item.title;
  }

  function getItemDestination(item) {
    return item.type === 'flight' ? item.to : item.destination;
  }

  function getItemDateLabel(item) {
    if (item.type === 'flight') return item.departTime + ' – ' + item.arriveTime;
    if (!item.travelDate) return '';
    return new Date(item.travelDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // ---- Shared price-range slider (flights.js, hotels.js) ----
  // Both pages have identical #price-min/#price-max/#price-range-fill
  // markup; only how `bounds` gets computed (from flight prices vs. hotel
  // nightly rates) differs, so that stays in each page's own script.
  // `state`/`bounds` are mutated in place (both callers pass their own
  // module-level objects by reference).
  function initPriceRangeInputs(state, bounds) {
    state.priceMin = bounds.min;
    state.priceMax = bounds.max;

    var minInput = document.getElementById('price-min');
    var maxInput = document.getElementById('price-max');
    [minInput, maxInput].forEach(function (input) {
      input.min = bounds.min;
      input.max = bounds.max;
      input.step = 1000;
    });
    minInput.value = bounds.min;
    maxInput.value = bounds.max;
  }

  function updatePriceRangeUI(state, bounds, formatCurrency) {
    var minInput = document.getElementById('price-min');
    var maxInput = document.getElementById('price-max');
    var fill = document.getElementById('price-range-fill');
    var minLabel = document.getElementById('price-min-label');
    var maxLabel = document.getElementById('price-max-label');

    var min = Number(minInput.value);
    var max = Number(maxInput.value);
    if (min > max) {
      var temp = min;
      min = max;
      max = temp;
    }

    state.priceMin = min;
    state.priceMax = max;

    minLabel.textContent = formatCurrency(min);
    maxLabel.textContent = formatCurrency(max);

    var range = bounds.max - bounds.min || 1;
    var leftPct = ((min - bounds.min) / range) * 100;
    var rightPct = ((max - bounds.min) / range) * 100;
    fill.style.left = leftPct + '%';
    fill.style.width = (rightPct - leftPct) + '%';
  }

  // Root-absolute so it resolves the same from both / and /pages/, same
  // convention as data.js's asset paths. A neutral branded graphic (not a
  // broken-image icon) shown until the real .webp files referenced in src/
  // srcset below are supplied.
  var PLACEHOLDER_IMAGE = ROOT_PATH + 'assets/images/placeholder.svg';

  // Shared `sizes` value for listing-card images: matches the 1/2/3-column
  // breakpoints already used by packages.css/hotels.css/tours.css.
  var CARD_IMAGE_SIZES = '(max-width: 599px) 92vw, (max-width: 1099px) 46vw, 30vw';

  // Builds `stem-480w.ext, stem-800w.ext, base.ext` style srcset strings.
  // `basePath` is the canonical/largest file; `widths` (ascending, last
  // entry = basePath's own width) names the smaller variants that must
  // exist alongside it, e.g. buildSrcset('/a/santorini.webp', [480, 800])
  // -> "/a/santorini-480w.webp 480w, /a/santorini.webp 800w".
  function buildSrcset(basePath, widths) {
    var dot = basePath.lastIndexOf('.');
    var stem = basePath.slice(0, dot);
    var ext = basePath.slice(dot);
    var max = widths[widths.length - 1];
    return widths.map(function (w) {
      var file = (w === max) ? basePath : (stem + '-' + w + 'w' + ext);
      return file + ' ' + w + 'w';
    }).join(', ');
  }

  // Renders a production-ready <img>: explicit width/height (prevents
  // layout shift before the file loads), lazy-loading by default (pass
  // { loading: 'eager', fetchPriority: 'high' } for the hero/LCP image
  // only), and a same-origin onerror fallback to the branded placeholder so
  // a not-yet-supplied file never renders as a broken-image icon. `alt`
  // must always be meaningful — callers pass '' only for decorative images.
  function renderImg(options) {
    var loading = options.loading || 'lazy';
    var classAttr = options.className ? ' class="' + options.className + '"' : '';
    var srcsetAttr = options.srcset ? ' srcset="' + options.srcset + '" sizes="' + (options.sizes || '100vw') + '"' : '';
    var fetchPriorityAttr = options.fetchPriority ? ' fetchpriority="' + options.fetchPriority + '"' : '';
    var extraAttr = options.attrs ? ' ' + options.attrs : '';

    return (
      '<img' + classAttr + extraAttr +
      ' src="' + options.src + '"' + srcsetAttr +
      ' width="' + options.width + '" height="' + options.height + '"' +
      ' alt="' + options.alt + '" loading="' + loading + '"' + fetchPriorityAttr +
      ' onerror="this.onerror=null;this.removeAttribute(\'srcset\');this.src=\'' + PLACEHOLDER_IMAGE + '\';">'
    );
  }

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

    var count = (window.StacklyCart && typeof window.StacklyCart.getItemCount === 'function')
      ? window.StacklyCart.getItemCount()
      : 0;

    badge.textContent = String(count);
    badge.hidden = count <= 0;
  }

  var WISHLIST_KEY = 'stacklyWishlist';

  function readWishlist() {
    try {
      var raw = window.localStorage.getItem(WISHLIST_KEY);
      var items = raw ? JSON.parse(raw) : [];
      return Array.isArray(items) ? items : [];
    } catch (err) {
      return [];
    }
  }

  function saveWishlist(items) {
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  }

  function updateWishlistBadge() {
    var badge = document.getElementById('wishlist-badge');
    if (!badge) return;

    var count = readWishlist().length;
    badge.textContent = String(count);
    badge.hidden = count <= 0;
  }

  // Same root-vs-pages/ relative-link convention already used throughout the
  // site's markup (e.g. index.html links "pages/login.html", nested pages
  // link "login.html").
  function getLoginUrl() {
    return window.location.pathname.indexOf('/pages/') !== -1 ? 'login.html' : 'pages/login.html';
  }

  // Toggles a { userEmail, type, id, ...data } entry in 'stacklyWishlist',
  // matching the shape dashboard.js's renderWishlist()/renderBookingItem()
  // already expect (title, destination, image, total). Returns true if the
  // item is now saved, false if it was just removed, or null if the visitor
  // isn't logged in (in which case they're redirected to log in first).
  function toggleWishlist(type, id, data) {
    var user = window.StacklyAuth && window.StacklyAuth.getCurrentUser();
    if (!user) {
      window.location.href = getLoginUrl();
      return null;
    }

    var items = readWishlist();
    var index = -1;
    for (var i = 0; i < items.length; i++) {
      if (items[i].userEmail === user.email && items[i].type === type && items[i].id === id) {
        index = i;
        break;
      }
    }

    if (index > -1) {
      items.splice(index, 1);
      saveWishlist(items);
      updateWishlistBadge();
      return false;
    }

    items.push(Object.assign({ userEmail: user.email, type: type, id: id }, data));
    saveWishlist(items);
    updateWishlistBadge();
    return true;
  }

  // Reflects saved state onto every [data-wishlist-type] heart currently in
  // the DOM. Page scripts call this after (re-)rendering a card grid, the
  // same way they call StacklyAnimations.refreshReveal().
  function syncWishlistHearts() {
    var user = window.StacklyAuth && window.StacklyAuth.getCurrentUser();
    var mine = user ? readWishlist().filter(function (w) { return w.userEmail === user.email; }) : [];

    document.querySelectorAll('.wishlist-heart').forEach(function (btn) {
      var active = mine.some(function (w) {
        return w.type === btn.dataset.wishlistType && w.id === btn.dataset.wishlistId;
      });
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  var HEART_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.35-9.5-8.5C.5 8 2 4.5 5.5 4.5c2 0 3.5 1.2 4.5 2.7C11 5.7 12.5 4.5 14.5 4.5 18 4.5 19.5 8 19.5 11.5 17 15.65 12 20 12 20z"/></svg>';

  // Builds the wishlist-heart overlay button used on package/hotel/tour
  // cards. title/destination/image/price are stored on the saved entry so
  // dashboard.js can render it without a second data lookup.
  function renderWishlistHeart(type, id, title, destination, image, price) {
    return (
      '<button type="button" class="wishlist-heart" data-wishlist-type="' + type + '" data-wishlist-id="' + id + '" ' +
        'data-wishlist-title="' + title + '" data-wishlist-destination="' + destination + '" ' +
        'data-wishlist-image="' + image + '" data-wishlist-price="' + price + '" ' +
        'aria-label="Save to wishlist" aria-pressed="false">' +
        HEART_ICON +
      '</button>'
    );
  }

  function initWishlistHearts() {
    document.addEventListener('click', function (event) {
      var btn = event.target.closest('.wishlist-heart');
      if (!btn) return;
      event.preventDefault();

      var data = {
        title: btn.dataset.wishlistTitle,
        destination: btn.dataset.wishlistDestination,
        image: btn.dataset.wishlistImage,
        total: Number(btn.dataset.wishlistPrice) || 0
      };

      var nowActive = toggleWishlist(btn.dataset.wishlistType, btn.dataset.wishlistId, data);
      if (nowActive === null) return;

      btn.classList.toggle('is-active', nowActive);
      btn.setAttribute('aria-pressed', String(nowActive));
    });
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

  function initScrollToTop() {
    var btn = document.getElementById('scroll-to-top');
    if (!btn) return;
    var THRESHOLD = 480;

    function onScroll() {
      btn.classList.toggle('is-visible', window.scrollY > THRESHOLD);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    btn.addEventListener('click', function () {
      var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  // Closes the mobile filters panel (flights/hotels/packages/tours.html)
  // on Escape and returns focus to the toggle button that opened it —
  // toggleMobileFilters() itself has no Escape handling, and this needs to
  // run on every page since it's a document-level keydown listener, but
  // no-ops immediately wherever #filters-panel doesn't exist.
  function initFiltersPanelEscape() {
    var panel = document.getElementById('filters-panel');
    var toggle = document.getElementById('filters-toggle');
    if (!panel || !toggle) return;

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && panel.classList.contains('is-open')) {
        toggleMobileFilters(false);
        toggle.focus();
      }
    });
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

    function validate() {
      var error = validateEmailValue(input.value);
      setError(error);
      return !error;
    }

    input.addEventListener('blur', validate);
    input.addEventListener('input', function () {
      successEl.hidden = true;
      if (input.classList.contains('has-error')) validate();
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!validate()) {
        input.focus();
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
    initWishlistHearts();
    initScrollToTop();
    initFiltersPanelEscape();
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

  // Shared by every filterable listing page (flights/hotels/packages/tours):
  // reads the checked values of every `input[name="x"]` checkbox in the
  // filters panel.
  function getCheckedValues(name) {
    var boxes = document.querySelectorAll('input[name="' + name + '"]:checked');
    return Array.prototype.map.call(boxes, function (box) { return box.value; });
  }

  // Shared by every filterable listing page: opens/closes the mobile
  // filters panel (`#filters-panel` + `#filters-toggle`, both a fixed id
  // convention across flights/hotels/packages/tours.html).
  function toggleMobileFilters(open) {
    var panel = document.getElementById('filters-panel');
    var toggle = document.getElementById('filters-toggle');
    panel.classList.toggle('is-open', open);
    document.body.classList.toggle('filters-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  // Wires the mobile filters panel's open/close/clear buttons — identical
  // across all four listing pages. Each page still binds its own extra
  // controls (price range, sort) separately since those aren't shared.
  function bindFilterPanelEvents(onFilterChange, onReset) {
    document.getElementById('filters-panel').addEventListener('change', function (event) {
      if (event.target.matches('input[type="checkbox"]')) onFilterChange();
    });
    document.getElementById('filters-clear').addEventListener('click', onReset);
    document.getElementById('empty-state-clear').addEventListener('click', onReset);
    document.getElementById('filters-toggle').addEventListener('click', function () {
      toggleMobileFilters(true);
    });
    document.getElementById('filters-close').addEventListener('click', function () {
      toggleMobileFilters(false);
    });
  }

  // Honors ?destination= (from the homepage search widget, or a related
  // tour's "View Details" link) by pre-checking the matching destination
  // filter checkbox, if present. Only updates state — the caller's own
  // render() paints the result. Used by packages.js and tours.js.
  function applyDestinationFromQuery(state) {
    var params = new URLSearchParams(window.location.search);
    var destination = params.get('destination');
    if (!destination) return;

    var checkbox = document.querySelector('input[name="destination"][value="' + CSS.escape(destination) + '"]');
    if (!checkbox) return;

    checkbox.checked = true;
    state.destinations = getCheckedValues('destination');
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

  window.StacklyUtils = {
    highlightActiveNav: highlightActiveNav,
    updateCartBadge: updateCartBadge,
    updateWishlistBadge: updateWishlistBadge,
    initHeaderScroll: initHeaderScroll,
    initMobileNav: initMobileNav,
    initNewsletterForm: initNewsletterForm,
    initHeader: initHeader,
    renderStars: renderStars,
    getCheckedValues: getCheckedValues,
    toggleMobileFilters: toggleMobileFilters,
    initTabs: initTabs,
    renderWishlistHeart: renderWishlistHeart,
    syncWishlistHearts: syncWishlistHearts,
    toggleWishlist: toggleWishlist,
    renderImg: renderImg,
    buildSrcset: buildSrcset,
    PLACEHOLDER_IMAGE: PLACEHOLDER_IMAGE,
    ROOT_PATH: ROOT_PATH,
    CARD_IMAGE_SIZES: CARD_IMAGE_SIZES,
    validateNameValue: validateNameValue,
    validateEmailValue: validateEmailValue,
    validatePhoneValue: validatePhoneValue,
    validateFieldsAndFocus: validateFieldsAndFocus,
    initCharCounter: initCharCounter,
    setFieldError: setFieldError,
    readLocalArray: readLocalArray,
    getItemTitle: getItemTitle,
    getItemDestination: getItemDestination,
    getItemDateLabel: getItemDateLabel,
    initPriceRangeInputs: initPriceRangeInputs,
    updatePriceRangeUI: updatePriceRangeUI,
    bindFilterPanelEvents: bindFilterPanelEvents,
    applyDestinationFromQuery: applyDestinationFromQuery
  };
})();
