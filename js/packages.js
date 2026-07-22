/* ==========================================================================
   Voyara — Packages page logic
   Filters and renders js/data.js packages[] with no page reloads.
   ========================================================================== */

(function () {
  'use strict';

  var packages = (window.VoyaraData && window.VoyaraData.packages) || [];
  var formatCurrency = window.VoyaraData.formatCurrency;

  var state = {
    duration: [],
    destinations: []
  };

  // ---- Filtering ----
  function durationBucket(days) {
    if (days <= 5) return 'short';
    if (days <= 7) return 'medium';
    return 'long';
  }

  function populateDestinationFilter() {
    var container = document.getElementById('destination-filter');
    if (!container) return;

    var counts = {};
    packages.forEach(function (p) {
      counts[p.destination] = (counts[p.destination] || 0) + 1;
    });

    var destinations = Object.keys(counts).sort();
    container.innerHTML = destinations.map(function (destination) {
      return '<label class="checkbox-row">' +
        '<input type="checkbox" name="destination" value="' + destination + '"> ' + destination +
        ' <span class="count">(' + counts[destination] + ')</span>' +
        '</label>';
    }).join('');
  }

  function filterPackages() {
    return packages.filter(function (p) {
      if (state.duration.length && state.duration.indexOf(durationBucket(p.duration.days)) === -1) return false;
      if (state.destinations.length && state.destinations.indexOf(p.destination) === -1) return false;
      return true;
    });
  }

  // ---- Rendering ----
  function renderPackageImg(pkg) {
    return window.VoyaraUtils.renderImg({
      className: 'listing-card-image-bg',
      src: pkg.image,
      srcset: window.VoyaraUtils.buildSrcset(pkg.image, [480, 800]),
      sizes: window.VoyaraUtils.CARD_IMAGE_SIZES,
      width: 800,
      height: 600,
      alt: pkg.title + ' — ' + pkg.destination
    });
  }

  function renderPackageCard(pkg) {
    return (
      '<article class="package-card listing-card" data-reveal="fade-up">' +
        '<div class="listing-card-image">' +
          renderPackageImg(pkg) +
          '<span class="listing-card-tag">' + pkg.duration.days + 'D/' + pkg.duration.nights + 'N</span>' +
          window.VoyaraUtils.renderWishlistHeart('package', pkg.id, pkg.title, pkg.destination, pkg.image, pkg.price) +
        '</div>' +
        '<div class="listing-card-body">' +
          '<h3>' + pkg.title + '</h3>' +
          window.VoyaraUtils.renderStars(pkg.rating) +
          '<p class="package-card-destination">' + pkg.destination + '</p>' +
          '<p class="listing-card-price">' + formatCurrency(pkg.price) + '<span>/person</span></p>' +
          '<a href="package-detail.html?id=' + pkg.id + '" class="btn btn-outline">View Details</a>' +
        '</div>' +
      '</article>'
    );
  }

  function render() {
    var results = filterPackages();
    var grid = document.getElementById('packages-grid');
    var emptyState = document.getElementById('empty-state');
    var resultCount = document.getElementById('result-count');

    resultCount.innerHTML = '<strong>' + results.length + '</strong> package' + (results.length === 1 ? '' : 's') + ' found';

    if (results.length === 0) {
      grid.innerHTML = '';
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
      grid.innerHTML = results.map(renderPackageCard).join('');
      if (window.VoyaraAnimations) window.VoyaraAnimations.refreshReveal();
      window.VoyaraUtils.syncWishlistHearts();
    }
  }

  // ---- Events & init ----
  function resetFilters() {
    document.querySelectorAll('.filters-panel input[type="checkbox"]').forEach(function (box) {
      box.checked = false;
    });
    state.duration = [];
    state.destinations = [];
    render();
  }

  function handleFilterChange() {
    state.duration = window.VoyaraUtils.getCheckedValues('duration');
    state.destinations = window.VoyaraUtils.getCheckedValues('destination');
    render();
  }

  function bindEvents() {
    window.VoyaraUtils.bindFilterPanelEvents(handleFilterChange, resetFilters);
  }

  function init() {
    if (!document.getElementById('packages-grid')) return;
    populateDestinationFilter();
    bindEvents();
    window.VoyaraUtils.applyDestinationFromQuery(state);
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
