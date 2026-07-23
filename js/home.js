/* ==========================================================================
   Stackly — Home page logic
   Search widget: validates a destination is picked, then navigates to the
   packages listing pre-filtered to it (packages.js reads ?destination=).
   ========================================================================== */

(function () {
  'use strict';

  var destinations = (window.StacklyData && window.StacklyData.destinations) || [];
  var tours = (window.StacklyData && window.StacklyData.tours) || [];
  var hotels = (window.StacklyData && window.StacklyData.hotels) || [];
  var FEATURED_TOUR_TITLES = ['Machu Picchu Trekking Trail', 'Maldives Marine Safari', 'Amalfi Coast Sailing Tour'];
  var FEATURED_HOTEL_NAMES = ['Northern Lights Geothermal Retreat', 'Dune Pearl Palace', 'Rockies Springs Grand Hotel'];

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

  function renderTourCard(tour) {
    var img = window.StacklyUtils.renderImg({
      className: 'listing-card-image-bg',
      src: tour.image,
      srcset: window.StacklyUtils.buildSrcset(tour.image, [480, 800]),
      sizes: window.StacklyUtils.CARD_IMAGE_SIZES,
      width: 480,
      height: 360,
      alt: tour.title + ' — ' + tour.destination
    });

    return (
      '<article class="tour-card listing-card" data-reveal="fade-up">' +
        '<div class="listing-card-image">' +
          img +
          '<span class="listing-card-tag listing-card-tag--gold">' + tour.theme + '</span>' +
          window.StacklyUtils.renderWishlistHeart('tour', tour.id, tour.title, tour.destination, tour.image, tour.price) +
        '</div>' +
        '<div class="listing-card-body">' +
          '<h3>' + tour.title + '</h3>' +
          '<p class="destination-card-country">' + tour.destination + '</p>' +
          window.StacklyUtils.renderStars(tour.rating) +
          '<p class="listing-card-price">' + window.StacklyData.formatCurrency(tour.price) + '<span>/person</span></p>' +
          '<a href="pages/tours.html?destination=' + encodeURIComponent(tour.destination) + '" class="btn btn-outline">View Details</a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderFeaturedTours() {
    var grid = document.getElementById('featured-tours-grid');
    if (!grid) return;

    var featured = FEATURED_TOUR_TITLES
      .map(function (title) { return tours.filter(function (t) { return t.title === title; })[0]; })
      .filter(Boolean);

    grid.innerHTML = featured.map(renderTourCard).join('');
    if (window.StacklyAnimations) window.StacklyAnimations.refreshReveal();
    window.StacklyUtils.syncWishlistHearts();
  }

  function renderHotelCard(hotel) {
    var img = window.StacklyUtils.renderImg({
      className: 'listing-card-image-bg',
      src: hotel.image,
      srcset: window.StacklyUtils.buildSrcset(hotel.image, [480, 800]),
      sizes: window.StacklyUtils.CARD_IMAGE_SIZES,
      width: 480,
      height: 360,
      alt: hotel.name + ', ' + hotel.destination
    });

    var destId = window.StacklyData.findDestinationId(hotel.destination);
    var link = destId ? 'pages/destination-detail.html?id=' + destId : 'pages/hotels.html';

    return (
      '<article class="hotel-card listing-card" data-reveal="fade-up">' +
        '<div class="listing-card-image">' +
          img +
          window.StacklyUtils.renderWishlistHeart('hotel', hotel.id, hotel.name, hotel.destination, hotel.image, hotel.pricePerNight) +
        '</div>' +
        '<div class="listing-card-body">' +
          '<h3>' + hotel.name + '</h3>' +
          '<p class="destination-card-country">' + hotel.destination + '</p>' +
          window.StacklyUtils.renderStars(hotel.rating) +
          '<p class="listing-card-price">' + window.StacklyData.formatCurrency(hotel.pricePerNight) + '<span>/night</span></p>' +
          '<a href="' + link + '" class="btn btn-outline">View Details</a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderFeaturedHotels() {
    var grid = document.getElementById('featured-hotels-grid');
    if (!grid) return;

    var featured = FEATURED_HOTEL_NAMES
      .map(function (name) { return hotels.filter(function (h) { return h.name === name; })[0]; })
      .filter(Boolean);

    grid.innerHTML = featured.map(renderHotelCard).join('');
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
    renderFeaturedTours();
    renderFeaturedHotels();

    var form = document.getElementById('search-widget');
    if (!form) return;

    populateDestinations();
    form.addEventListener('submit', handleSubmit);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
