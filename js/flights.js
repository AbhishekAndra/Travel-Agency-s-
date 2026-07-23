/* ==========================================================================
   Stackly — Flights page logic
   Filters, sorts, and renders js/data.js flights[] with no page reloads.
   ========================================================================== */

(function () {
  'use strict';

  var flights = (window.StacklyData && window.StacklyData.flights) || [];
  var formatCurrency = window.StacklyData.formatCurrency;

  var state = {
    priceMin: 0,
    priceMax: 0,
    stops: [],
    departure: [],
    airlines: [],
    sort: 'price-asc'
  };

  var bounds = { min: 0, max: 0 };

  // ---- Formatting/bucketing helpers ----
  function getInitials(name) {
    return name
      .split(' ')
      .map(function (word) { return word.charAt(0); })
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  function getDepartureBucket(timeStr) {
    var hour = parseInt(timeStr.split(':')[0], 10);
    if (hour < 6) return 'early-morning';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  function parseDurationMinutes(durationStr) {
    var match = durationStr.match(/(\d+)h\s*(\d+)?m?/);
    if (!match) return 0;
    var hours = parseInt(match[1], 10) || 0;
    var minutes = parseInt(match[2], 10) || 0;
    return hours * 60 + minutes;
  }

  function timeToMinutes(timeStr) {
    var parts = timeStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  function stopsBucket(stops) {
    return stops >= 2 ? 2 : stops;
  }

  function computePriceBounds() {
    var prices = flights.map(function (f) { return f.price; });
    var min = Math.floor(Math.min.apply(null, prices) / 1000) * 1000;
    var max = Math.ceil(Math.max.apply(null, prices) / 1000) * 1000;
    return { min: min, max: max };
  }

  function populateAirlineFilter() {
    var container = document.getElementById('airline-filter');
    if (!container) return;

    var counts = {};
    flights.forEach(function (f) {
      counts[f.airline] = (counts[f.airline] || 0) + 1;
    });

    var airlines = Object.keys(counts).sort();
    container.innerHTML = airlines.map(function (airline) {
      return '<label class="checkbox-row">' +
        '<input type="checkbox" name="airline" value="' + airline + '"> ' + airline +
        ' <span class="count">(' + counts[airline] + ')</span>' +
        '</label>';
    }).join('');
  }

  // initPriceRange/updatePriceRangeUI's DOM wiring is shared with hotels.js
  // via window.StacklyUtils (identical #price-min/#price-max/#price-range-fill
  // markup on both pages) — these stay as same-named local wrappers so every
  // existing zero-arg call site below keeps working unchanged.
  function initPriceRange() {
    bounds = computePriceBounds();
    window.StacklyUtils.initPriceRangeInputs(state, bounds);
    updatePriceRangeUI();
  }

  function updatePriceRangeUI() {
    window.StacklyUtils.updatePriceRangeUI(state, bounds, formatCurrency);
  }

  // ---- Filtering & sorting ----
  function filterFlights() {
    return flights.filter(function (f) {
      if (f.price < state.priceMin || f.price > state.priceMax) return false;
      if (state.stops.length && state.stops.indexOf(String(stopsBucket(f.stops))) === -1) return false;
      if (state.departure.length && state.departure.indexOf(getDepartureBucket(f.departTime)) === -1) return false;
      if (state.airlines.length && state.airlines.indexOf(f.airline) === -1) return false;
      return true;
    });
  }

  function sortFlights(list) {
    var sorted = list.slice();
    if (state.sort === 'price-asc') {
      sorted.sort(function (a, b) { return a.price - b.price; });
    } else if (state.sort === 'duration') {
      sorted.sort(function (a, b) { return parseDurationMinutes(a.duration) - parseDurationMinutes(b.duration); });
    } else if (state.sort === 'departure') {
      sorted.sort(function (a, b) { return timeToMinutes(a.departTime) - timeToMinutes(b.departTime); });
    }
    return sorted;
  }

  function stopsLabel(stops) {
    if (stops === 0) return 'Non-stop';
    return stops + (stops === 1 ? ' Stop' : ' Stops');
  }

  // ---- Rendering ----
  function renderFlightCard(flight) {
    return (
      '<article class="flight-card listing-card" data-reveal="fade-up">' +
        '<div class="flight-card-airline">' +
          '<span class="avatar-badge">' + getInitials(flight.airline) + '</span>' +
          '<div>' +
            '<p class="flight-card-airline-name">' + flight.airline + '</p>' +
            '<p class="flight-card-class">' + flight.class + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="flight-card-route">' +
          '<div class="flight-card-time">' +
            '<span class="time">' + flight.departTime + '</span>' +
            '<span class="airport">' + flight.from + '</span>' +
          '</div>' +
          '<div class="flight-card-path">' +
            '<span class="duration">' + flight.duration + '</span>' +
            '<span class="path-line"></span>' +
            '<span class="stops">' + stopsLabel(flight.stops) + '</span>' +
          '</div>' +
          '<div class="flight-card-time">' +
            '<span class="time">' + flight.arriveTime + '</span>' +
            '<span class="airport">' + flight.to + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="flight-card-action">' +
          '<p class="listing-card-price">' + formatCurrency(flight.price) + '<span>/person</span></p>' +
          '<button type="button" class="btn btn-accent" data-flight-id="' + flight.id + '">Select</button>' +
        '</div>' +
      '</article>'
    );
  }

  function render() {
    var results = sortFlights(filterFlights());
    var grid = document.getElementById('flights-grid');
    var emptyState = document.getElementById('empty-state');
    var resultCount = document.getElementById('result-count');

    resultCount.innerHTML = '<strong>' + results.length + '</strong> flight' + (results.length === 1 ? '' : 's') + ' found';

    if (results.length === 0) {
      grid.innerHTML = '';
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
      grid.innerHTML = results.map(renderFlightCard).join('');
      if (window.StacklyAnimations) window.StacklyAnimations.refreshReveal();
    }
  }

  // ---- Events & init ----
  function resetFilters() {
    document.querySelectorAll('.filters-panel input[type="checkbox"]').forEach(function (box) {
      box.checked = false;
    });
    state.stops = [];
    state.departure = [];
    state.airlines = [];
    document.getElementById('price-min').value = bounds.min;
    document.getElementById('price-max').value = bounds.max;
    updatePriceRangeUI();
    render();
  }

  function handleFilterChange() {
    state.stops = window.StacklyUtils.getCheckedValues('stops');
    state.departure = window.StacklyUtils.getCheckedValues('departure');
    state.airlines = window.StacklyUtils.getCheckedValues('airline');
    render();
  }

  function bindEvents() {
    window.StacklyUtils.bindFilterPanelEvents(handleFilterChange, resetFilters);

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

    document.getElementById('flights-grid').addEventListener('click', function (event) {
      var button = event.target.closest('[data-flight-id]');
      if (!button) return;
      var flight = flights.filter(function (f) { return f.id === button.dataset.flightId; })[0];
      if (!flight) return;
      window.StacklyCart.setDirectBooking('flight', flight);
      window.location.href = 'checkout.html';
    });
  }

  function init() {
    if (!document.getElementById('flights-grid')) return;
    populateAirlineFilter();
    initPriceRange();
    bindEvents();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
