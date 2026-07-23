/* ==========================================================================
   Stackly — Home page logic
   Search widget: validates a destination is picked, then navigates to the
   packages listing pre-filtered to it (packages.js reads ?destination=).
   ========================================================================== */

(function () {
  'use strict';

  var destinations = (window.StacklyData && window.StacklyData.destinations) || [];

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

  function renderDestinationCard(dest) {
    var img = window.StacklyUtils.renderImg({
      className: 'listing-card-image-bg',
      src: dest.image,
      srcset: window.StacklyUtils.buildSrcset(dest.image, [480, 800]),
      sizes: window.StacklyUtils.CARD_IMAGE_SIZES,
      width: 480,
      height: 360,
      alt: dest.name + ', ' + dest.country
    });

    return (
      '<article class="destination-card listing-card" data-reveal="fade-up">' +
        '<div class="listing-card-image">' +
          img +
          window.StacklyUtils.renderWishlistHeart('destination', dest.id, dest.name, dest.name + ', ' + dest.country, dest.image, dest.startingPrice) +
        '</div>' +
        '<div class="listing-card-body">' +
          '<h3>' + dest.name + '</h3>' +
          '<p class="destination-card-country">' + dest.country + '</p>' +
          '<p class="listing-card-price">' + window.StacklyData.formatCurrency(dest.startingPrice) + '<span>/starting</span></p>' +
          '<a href="pages/destination-detail.html?id=' + dest.id + '" class="btn btn-outline">Explore</a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderFeaturedDestinations() {
    var grid = document.getElementById('featured-destinations-grid');
    if (!grid) return;

    grid.innerHTML = destinations.slice(0, 6).map(renderDestinationCard).join('');
    if (window.StacklyAnimations) window.StacklyAnimations.refreshReveal();
    window.StacklyUtils.syncWishlistHearts();
  }

  var setFieldError = window.StacklyUtils.setFieldError;

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
    renderFeaturedDestinations();

    var form = document.getElementById('search-widget');
    if (!form) return;

    populateDestinations();
    form.addEventListener('submit', handleSubmit);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
