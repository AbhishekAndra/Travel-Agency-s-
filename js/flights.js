/* ==========================================================================
   Voyara — Flights page logic
   Filters, sorts, and renders js/data.js flights[] with no page reloads.
   ========================================================================== */

(function () {
  'use strict';

  var flights = (window.VoyaraData && window.VoyaraData.flights) || [];
  var formatCurrency = window.VoyaraData.formatCurrency;

  var state = {
    priceMin: 0,
    priceMax: 0,
    stops: [],
    departure: [],
    airlines: [],
    sort: 'price-asc'
  };

  var bounds = { min: 0, max: 0 };

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

  function getCheckedValues(name) {
    var boxes = document.querySelectorAll('input[name="' + name + '"]:checked');
    return Array.prototype.map.call(boxes, function (box) { return box.value; });
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

  function renderFlightCard(flight) {
    return (
      '<article class="flight-card listing-card">' +
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
    }
  }

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
    state.stops = getCheckedValues('stops');
    state.departure = getCheckedValues('departure');
    state.airlines = getCheckedValues('airline');
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

    document.getElementById('flights-grid').addEventListener('click', function (event) {
      var button = event.target.closest('[data-flight-id]');
      if (!button) return;
      var flight = flights.filter(function (f) { return f.id === button.dataset.flightId; })[0];
      if (!flight) return;
      window.VoyaraCart.setDirectBooking('flight', flight);
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
