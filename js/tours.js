/* ==========================================================================
   Voyara — Tours page logic
   Filters and renders js/data.js tours[] with no page reloads.
   ========================================================================== */

(function () {
  'use strict';

  var tours = (window.VoyaraData && window.VoyaraData.tours) || [];
  var formatCurrency = window.VoyaraData.formatCurrency;

  var state = {
    themes: [],
    destinations: []
  };

  // ---- Filtering ----
  function populateFilter(containerId, inputName, values) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var counts = {};
    values.forEach(function (v) {
      counts[v] = (counts[v] || 0) + 1;
    });

    var options = Object.keys(counts).sort();
    container.innerHTML = options.map(function (option) {
      return '<label class="checkbox-row">' +
        '<input type="checkbox" name="' + inputName + '" value="' + option + '"> ' + option +
        ' <span class="count">(' + counts[option] + ')</span>' +
        '</label>';
    }).join('');
  }

  function filterTours() {
    return tours.filter(function (t) {
      if (state.themes.length && state.themes.indexOf(t.theme) === -1) return false;
      if (state.destinations.length && state.destinations.indexOf(t.destination) === -1) return false;
      return true;
    });
  }

  // ---- Rendering ----
  function renderTourCard(tour) {
    var destId = window.VoyaraData.findDestinationId(tour.destination);
    var tourImg = window.VoyaraUtils.renderImg({
      className: 'listing-card-image-bg',
      src: tour.image,
      srcset: window.VoyaraUtils.buildSrcset(tour.image, [480, 800]),
      sizes: window.VoyaraUtils.CARD_IMAGE_SIZES,
      width: 800,
      height: 600,
      alt: tour.title + ' — ' + tour.destination
    });

    return (
      '<article class="tour-card listing-card" data-reveal="fade-up">' +
        '<div class="listing-card-image">' +
          tourImg +
          '<span class="listing-card-tag listing-card-tag--gold">' + tour.theme + '</span>' +
          window.VoyaraUtils.renderWishlistHeart('tour', tour.id, tour.title, tour.destination, tour.image, tour.price) +
        '</div>' +
        '<div class="listing-card-body">' +
          '<h3>' + tour.title + '</h3>' +
          window.VoyaraUtils.renderStars(tour.rating) +
          '<p class="tour-card-meta">' + tour.destination + ' · ' + tour.duration + ' · ' + tour.groupSize + '</p>' +
          '<p class="listing-card-price">' + formatCurrency(tour.price) + '<span>/person</span></p>' +
          (destId ? '<a href="destination-detail.html?id=' + destId + '" class="btn btn-outline">View Details</a>' : '') +
        '</div>' +
      '</article>'
    );
  }

  function render() {
    var results = filterTours();
    var grid = document.getElementById('tours-grid');
    var emptyState = document.getElementById('empty-state');
    var resultCount = document.getElementById('result-count');

    resultCount.innerHTML = '<strong>' + results.length + '</strong> tour' + (results.length === 1 ? '' : 's') + ' found';

    if (results.length === 0) {
      grid.innerHTML = '';
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
      grid.innerHTML = results.map(renderTourCard).join('');
      if (window.VoyaraAnimations) window.VoyaraAnimations.refreshReveal();
      window.VoyaraUtils.syncWishlistHearts();
    }
  }

  // ---- Events & init ----
  function resetFilters() {
    document.querySelectorAll('.filters-panel input[type="checkbox"]').forEach(function (box) {
      box.checked = false;
    });
    state.themes = [];
    state.destinations = [];
    render();
  }

  function handleFilterChange() {
    state.themes = window.VoyaraUtils.getCheckedValues('theme');
    state.destinations = window.VoyaraUtils.getCheckedValues('destination');
    render();
  }

  function bindEvents() {
    window.VoyaraUtils.bindFilterPanelEvents(handleFilterChange, resetFilters);
  }

  function init() {
    if (!document.getElementById('tours-grid')) return;
    populateFilter('theme-filter', 'theme', tours.map(function (t) { return t.theme; }));
    populateFilter('destination-filter', 'destination', tours.map(function (t) { return t.destination; }));
    bindEvents();
    window.VoyaraUtils.applyDestinationFromQuery(state);
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
