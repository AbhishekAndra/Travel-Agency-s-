/* ==========================================================================
   Voyara — Home page logic
   Search widget: validates a destination is picked, then navigates to the
   packages listing pre-filtered to it (packages.js reads ?destination=).
   ========================================================================== */

(function () {
  'use strict';

  var destinations = (window.VoyaraData && window.VoyaraData.destinations) || [];

  function populateDestinations() {
    var select = document.getElementById('search-destination');
    destinations.forEach(function (dest) {
      var option = document.createElement('option');
      var label = dest.name + ', ' + dest.country;
      option.value = label;
      option.textContent = label;
      select.appendChild(option);
    });
  }

  var setFieldError = window.VoyaraUtils.setFieldError;

  function handleSubmit(event) {
    event.preventDefault();

    var select = document.getElementById('search-destination');
    var travelers = document.getElementById('search-travelers').value;

    if (!select.value) {
      setFieldError('search-destination-field', 'search-destination-error', 'Please choose a destination to search.');
      return;
    }
    setFieldError('search-destination-field', 'search-destination-error', '');

    var params = new URLSearchParams();
    params.set('destination', select.value);
    params.set('travelers', travelers);

    window.location.href = 'pages/packages.html?' + params.toString();
  }

  function init() {
    var form = document.getElementById('search-widget');
    if (!form) return;

    populateDestinations();
    form.addEventListener('submit', handleSubmit);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
