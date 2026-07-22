/* ==========================================================================
   Voyara — Destination Detail page logic
   Reads ?id= from the URL and renders a single js/data.js destination plus
   its related packages/hotels/tours.
   ========================================================================== */

(function () {
  'use strict';

  var data = window.VoyaraData || {};
  var formatCurrency = data.formatCurrency;

  // flights/hotels/packages/tours store destination as a free-text string
  // ("Dubai, UAE", "Maldives") that doesn't always match `name + ', ' + country`
  // exactly (abbreviations, country-as-destination cases). Matching on the
  // destination name as a prefix is robust to both.
  function belongsToDestination(itemDestination, destination) {
    return itemDestination.indexOf(destination.name) === 0;
  }

  // ---- Related package/hotel/tour card rendering ----
  function renderCardImg(src, alt) {
    return window.VoyaraUtils.renderImg({
      className: 'listing-card-image-bg',
      src: src,
      srcset: window.VoyaraUtils.buildSrcset(src, [480, 800]),
      sizes: window.VoyaraUtils.CARD_IMAGE_SIZES,
      width: 800,
      height: 600,
      alt: alt
    });
  }

  function renderPackageCard(pkg) {
    return (
      '<article class="package-card listing-card related-card" data-reveal="fade-up">' +
        '<div class="listing-card-image">' +
          renderCardImg(pkg.image, pkg.title + ' — ' + pkg.destination) +
          '<span class="listing-card-tag">' + pkg.duration.days + 'D/' + pkg.duration.nights + 'N</span>' +
          window.VoyaraUtils.renderWishlistHeart('package', pkg.id, pkg.title, pkg.destination, pkg.image, pkg.price) +
        '</div>' +
        '<div class="listing-card-body">' +
          '<h3>' + pkg.title + '</h3>' +
          window.VoyaraUtils.renderStars(pkg.rating) +
          '<p class="listing-card-price">' + formatCurrency(pkg.price) + '<span>/person</span></p>' +
          '<a href="package-detail.html?id=' + pkg.id + '" class="btn btn-outline">View Details</a>' +
        '</div>' +
      '</article>'
    );
  }

  // No dedicated hotel-detail page exists site-wide yet, so unlike packages
  // and tours this card has no "View Details" target — heart + rating +
  // price only.
  function renderHotelCard(hotel) {
    return (
      '<article class="hotel-card listing-card related-card" data-reveal="fade-up">' +
        '<div class="listing-card-image">' +
          renderCardImg(hotel.image, hotel.name + ', ' + hotel.destination) +
          window.VoyaraUtils.renderWishlistHeart('hotel', hotel.id, hotel.name, hotel.destination, hotel.image, hotel.pricePerNight) +
        '</div>' +
        '<div class="listing-card-body">' +
          '<h3>' + hotel.name + '</h3>' +
          window.VoyaraUtils.renderStars(hotel.rating) +
          '<p class="listing-card-price">' + formatCurrency(hotel.pricePerNight) + '<span>/night</span></p>' +
        '</div>' +
      '</article>'
    );
  }

  function renderTourCard(tour) {
    return (
      '<article class="tour-card listing-card related-card" data-reveal="fade-up">' +
        '<div class="listing-card-image">' +
          renderCardImg(tour.image, tour.title + ' — ' + tour.destination) +
          '<span class="listing-card-tag listing-card-tag--gold">' + tour.theme + '</span>' +
          window.VoyaraUtils.renderWishlistHeart('tour', tour.id, tour.title, tour.destination, tour.image, tour.price) +
        '</div>' +
        '<div class="listing-card-body">' +
          '<h3>' + tour.title + '</h3>' +
          window.VoyaraUtils.renderStars(tour.rating) +
          '<p class="related-card-meta">' + tour.duration + ' · ' + tour.groupSize + '</p>' +
          '<p class="listing-card-price">' + formatCurrency(tour.price) + '<span>/person</span></p>' +
          '<a href="tours.html?destination=' + encodeURIComponent(tour.destination) + '" class="btn btn-outline">View Details</a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderRelatedSection(sectionId, gridId, items, renderCard) {
    var section = document.getElementById(sectionId);
    var grid = document.getElementById(gridId);

    if (!items.length) {
      section.hidden = true;
      return;
    }

    section.hidden = false;
    grid.innerHTML = items.map(renderCard).join('');
  }

  // ---- Destination page rendering & init ----
  function renderDestination(destination) {
    document.title = destination.name + ' | Voyara';

    document.getElementById('destination-name').textContent = destination.name;
    document.getElementById('destination-country').textContent = destination.country;
    document.getElementById('breadcrumb-name').textContent = destination.name;
    document.getElementById('about-name').textContent = destination.name;
    document.getElementById('destination-description').textContent = destination.shortDescription;

    var heroBg = document.getElementById('hero-banner-bg');
    heroBg.src = destination.image;
    heroBg.srcset = window.VoyaraUtils.buildSrcset(destination.image, [480, 800]);
    heroBg.sizes = '100vw';
    heroBg.alt = 'Panoramic view of ' + destination.name + ', ' + destination.country;

    var label = destination.name + ', ' + destination.country;
    document.getElementById('packages-destination-label').textContent = label;
    document.getElementById('hotels-destination-label').textContent = label;
    document.getElementById('tours-destination-label').textContent = label;

    var relatedPackages = data.packages.filter(function (p) { return belongsToDestination(p.destination, destination); });
    var relatedHotels = data.hotels.filter(function (h) { return belongsToDestination(h.destination, destination); });
    var relatedTours = data.tours.filter(function (t) { return belongsToDestination(t.destination, destination); });

    renderRelatedSection('related-packages-section', 'related-packages', relatedPackages, renderPackageCard);
    renderRelatedSection('related-hotels-section', 'related-hotels', relatedHotels, renderHotelCard);
    renderRelatedSection('related-tours-section', 'related-tours', relatedTours, renderTourCard);
    if (window.VoyaraAnimations) window.VoyaraAnimations.refreshReveal();
    window.VoyaraUtils.syncWishlistHearts();

    if (destination.bestTime) {
      document.getElementById('best-time-period').textContent = destination.bestTime.period;
      document.getElementById('best-time-note').textContent = destination.bestTime.note;
    } else {
      document.getElementById('best-time-card').hidden = true;
    }
  }

  function init() {
    if (!document.getElementById('detail-content')) return;

    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    var destination = (data.destinations || []).filter(function (d) { return d.id === id; })[0];

    if (!destination) {
      document.getElementById('not-found-state').hidden = false;
      document.getElementById('detail-content').hidden = true;
      return;
    }

    renderDestination(destination);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
