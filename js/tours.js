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

  function getCheckedValues(name) {
    var boxes = document.querySelectorAll('input[name="' + name + '"]:checked');
    return Array.prototype.map.call(boxes, function (box) { return box.value; });
  }

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

  function renderTourCard(tour) {
    return (
      '<article class="tour-card listing-card">' +
        '<div class="listing-card-image" style="background-image:url(\'' + tour.image + '\')">' +
          '<span class="listing-card-tag listing-card-tag--gold">' + tour.theme + '</span>' +
        '</div>' +
        '<div class="listing-card-body">' +
          '<h3>' + tour.title + '</h3>' +
          '<p class="tour-card-meta">' + tour.destination + ' · ' + tour.duration + ' · ' + tour.groupSize + '</p>' +
          '<p class="listing-card-price">' + formatCurrency(tour.price) + '<span>/person</span></p>' +
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
    }
  }

  function resetFilters() {
    document.querySelectorAll('.filters-panel input[type="checkbox"]').forEach(function (box) {
      box.checked = false;
    });
    state.themes = [];
    state.destinations = [];
    render();
  }

  function handleFilterChange() {
    state.themes = getCheckedValues('theme');
    state.destinations = getCheckedValues('destination');
    render();
  }

  function toggleMobileFilters(open) {
    var panel = document.getElementById('filters-panel');
    var toggle = document.getElementById('filters-toggle');
    panel.classList.toggle('is-open', open);
    document.body.classList.toggle('filters-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  function bindEvents() {
    document.getElementById('filters-panel').addEventListener('change', function (event) {
      if (event.target.matches('input[type="checkbox"]')) handleFilterChange();
    });

    document.getElementById('filters-clear').addEventListener('click', resetFilters);
    document.getElementById('empty-state-clear').addEventListener('click', resetFilters);

    document.getElementById('filters-toggle').addEventListener('click', function () {
      toggleMobileFilters(true);
    });
    document.getElementById('filters-close').addEventListener('click', function () {
      toggleMobileFilters(false);
    });
  }

  function init() {
    if (!document.getElementById('tours-grid')) return;
    populateFilter('theme-filter', 'theme', tours.map(function (t) { return t.theme; }));
    populateFilter('destination-filter', 'destination', tours.map(function (t) { return t.destination; }));
    bindEvents();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
