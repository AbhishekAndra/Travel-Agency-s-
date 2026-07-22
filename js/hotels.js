/* ==========================================================================
   Voyara — Hotels page logic
   Filters, sorts, and renders js/data.js hotels[] with no page reloads.
   ========================================================================== */

(function () {
  'use strict';

  var hotels = (window.VoyaraData && window.VoyaraData.hotels) || [];
  var formatCurrency = window.VoyaraData.formatCurrency;

  var state = {
    priceMin: 0,
    priceMax: 0,
    ratings: [],
    amenities: [],
    sort: 'price-asc'
  };

  var bounds = { min: 0, max: 0 };

  var AMENITY_ICONS = {
    wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8.5a15 15 0 0 1 20 0"/><path d="M5.5 12a10 10 0 0 1 13 0"/><path d="M9 15.5a5 5 0 0 1 6 0"/><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/></svg>',
    pool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0"/><path d="M3 12c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0"/></svg>',
    spa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c2 3-2 4-2 7a2 2 0 0 0 4 0c0-1-1-1.5-1-2"/><path d="M6 21c0-5 3-8 6-8s6 3 6 8"/></svg>',
    breakfast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h13a3 3 0 0 1 0 6h-1"/><path d="M4 9v7a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9"/><path d="M8 3v3M11 3v3"/></svg>',
    beach: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v4"/><path d="M4 21c2-9 6-13 8-13s6 4 8 13"/><path d="M4 21h16"/></svg>',
    view: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 19l6-9 4 5 2-3 6 7z"/></svg>',
    concierge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="7" r="3"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/></svg>',
    allInclusive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="8" cy="12" r="4"/><circle cx="16" cy="12" r="4"/></svg>',
    golf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 21V4l10 4-10 4"/></svg>',
    fireplace: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c2 3-2 4-2 7a2 2 0 1 0 4 0c0-1.5-1-2-1-3 2 1 3 3 3 5a4 4 0 1 1-8 0c0-4 2-6 4-9z"/></svg>',
    default: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l4 4 10-10"/></svg>'
  };

  function getAmenityIcon(amenity) {
    var key = amenity.toLowerCase();
    if (key.indexOf('wifi') !== -1) return AMENITY_ICONS.wifi;
    if (key.indexOf('pool') !== -1 || key.indexOf('water') !== -1 || key.indexOf('lagoon') !== -1) return AMENITY_ICONS.pool;
    if (key.indexOf('spa') !== -1) return AMENITY_ICONS.spa;
    if (key.indexOf('breakfast') !== -1) return AMENITY_ICONS.breakfast;
    if (key.indexOf('beach') !== -1) return AMENITY_ICONS.beach;
    if (key.indexOf('view') !== -1) return AMENITY_ICONS.view;
    if (key.indexOf('concierge') !== -1 || key.indexOf('butler') !== -1) return AMENITY_ICONS.concierge;
    if (key.indexOf('all-inclusive') !== -1) return AMENITY_ICONS.allInclusive;
    if (key.indexOf('golf') !== -1) return AMENITY_ICONS.golf;
    if (key.indexOf('fireplace') !== -1) return AMENITY_ICONS.fireplace;
    return AMENITY_ICONS.default;
  }

  function getCheckedValues(name) {
    var boxes = document.querySelectorAll('input[name="' + name + '"]:checked');
    return Array.prototype.map.call(boxes, function (box) { return box.value; });
  }

  function computePriceBounds() {
    var prices = hotels.map(function (h) { return h.pricePerNight; });
    var min = Math.floor(Math.min.apply(null, prices) / 1000) * 1000;
    var max = Math.ceil(Math.max.apply(null, prices) / 1000) * 1000;
    return { min: min, max: max };
  }

  function populateAmenitiesFilter() {
    var container = document.getElementById('amenities-filter');
    if (!container) return;

    var counts = {};
    hotels.forEach(function (h) {
      h.amenities.forEach(function (a) {
        counts[a] = (counts[a] || 0) + 1;
      });
    });

    var amenities = Object.keys(counts).sort();
    container.innerHTML = amenities.map(function (amenity) {
      return '<label class="checkbox-row">' +
        '<input type="checkbox" name="amenity" value="' + amenity + '"> ' + amenity +
        ' <span class="count">(' + counts[amenity] + ')</span>' +
        '</label>';
    }).join('');
  }

  function initPriceRange() {
    bounds = computePriceBounds();
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

    updatePriceRangeUI();
  }

  function updatePriceRangeUI() {
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

  function filterHotels() {
    return hotels.filter(function (h) {
      if (h.pricePerNight < state.priceMin || h.pricePerNight > state.priceMax) return false;
      if (state.ratings.length) {
        var meetsAnyRating = state.ratings.some(function (r) { return h.rating >= Number(r); });
        if (!meetsAnyRating) return false;
      }
      if (state.amenities.length) {
        var hasAllAmenities = state.amenities.every(function (a) { return h.amenities.indexOf(a) !== -1; });
        if (!hasAllAmenities) return false;
      }
      return true;
    });
  }

  function sortHotels(list) {
    var sorted = list.slice();
    if (state.sort === 'price-asc') {
      sorted.sort(function (a, b) { return a.pricePerNight - b.pricePerNight; });
    } else if (state.sort === 'rating-desc') {
      sorted.sort(function (a, b) { return b.rating - a.rating; });
    }
    return sorted;
  }

  function renderHotelCard(hotel) {
    var visibleAmenities = hotel.amenities.slice(0, 4);
    var remaining = hotel.amenities.length - visibleAmenities.length;

    var amenitiesHtml = visibleAmenities.map(function (a) {
      return '<span class="amenity-icon" title="' + a + '">' + getAmenityIcon(a) + '</span>';
    }).join('');

    if (remaining > 0) {
      amenitiesHtml += '<span class="amenity-more">+' + remaining + ' more</span>';
    }

    return (
      '<article class="hotel-card listing-card">' +
        '<div class="listing-card-image" style="background-image:url(\'' + hotel.image + '\')"></div>' +
        '<div class="listing-card-body">' +
          '<div class="hotel-card-header">' +
            '<h3>' + hotel.name + '</h3>' +
          '</div>' +
          '' + window.VoyaraUtils.renderStars(hotel.rating) +
          '<p class="hotel-card-destination">' + hotel.destination + '</p>' +
          '<div class="hotel-card-amenities">' + amenitiesHtml + '</div>' +
          '<p class="listing-card-price">' + formatCurrency(hotel.pricePerNight) + '<span>/night</span></p>' +
        '</div>' +
      '</article>'
    );
  }

  function render() {
    var results = sortHotels(filterHotels());
    var grid = document.getElementById('hotels-grid');
    var emptyState = document.getElementById('empty-state');
    var resultCount = document.getElementById('result-count');

    resultCount.innerHTML = '<strong>' + results.length + '</strong> hotel' + (results.length === 1 ? '' : 's') + ' found';

    if (results.length === 0) {
      grid.innerHTML = '';
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
      grid.innerHTML = results.map(renderHotelCard).join('');
    }
  }

  function resetFilters() {
    document.querySelectorAll('.filters-panel input[type="checkbox"]').forEach(function (box) {
      box.checked = false;
    });
    state.ratings = [];
    state.amenities = [];
    document.getElementById('price-min').value = bounds.min;
    document.getElementById('price-max').value = bounds.max;
    updatePriceRangeUI();
    render();
  }

  function handleFilterChange() {
    state.ratings = getCheckedValues('rating');
    state.amenities = getCheckedValues('amenity');
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

    ['price-min', 'price-max'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', function () {
        updatePriceRangeUI();
        render();
      });
    });

    document.getElementById('sort-select').addEventListener('change', function (event) {
      state.sort = event.target.value;
      render();
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
    if (!document.getElementById('hotels-grid')) return;
    populateAmenitiesFilter();
    initPriceRange();
    bindEvents();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
