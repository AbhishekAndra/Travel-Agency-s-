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

  function durationBucket(days) {
    if (days <= 5) return 'short';
    if (days <= 7) return 'medium';
    return 'long';
  }

  function getCheckedValues(name) {
    var boxes = document.querySelectorAll('input[name="' + name + '"]:checked');
    return Array.prototype.map.call(boxes, function (box) { return box.value; });
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

  function renderPackageCard(pkg) {
    return (
      '<article class="package-card listing-card">' +
        '<div class="listing-card-image" style="background-image:url(\'' + pkg.image + '\')">' +
          '<span class="listing-card-tag">' + pkg.duration.days + 'D/' + pkg.duration.nights + 'N</span>' +
        '</div>' +
        '<div class="listing-card-body">' +
          '<h3>' + pkg.title + '</h3>' +
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
    }
  }

  function resetFilters() {
    document.querySelectorAll('.filters-panel input[type="checkbox"]').forEach(function (box) {
      box.checked = false;
    });
    state.duration = [];
    state.destinations = [];
    render();
  }

  function handleFilterChange() {
    state.duration = getCheckedValues('duration');
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

  // Honors ?destination= from the homepage search widget by pre-checking
  // the matching destination filter, if that destination has any packages.
  // Only updates state — init()'s own render() call paints the result.
  function applyDestinationFromQuery() {
    var params = new URLSearchParams(window.location.search);
    var destination = params.get('destination');
    if (!destination) return;

    var checkbox = document.querySelector('input[name="destination"][value="' + CSS.escape(destination) + '"]');
    if (!checkbox) return;

    checkbox.checked = true;
    state.destinations = getCheckedValues('destination');
  }

  function init() {
    if (!document.getElementById('packages-grid')) return;
    populateDestinationFilter();
    bindEvents();
    applyDestinationFromQuery();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
