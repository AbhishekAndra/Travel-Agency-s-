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

  function renderPackageCard(pkg) {
    return (
      '<article class="package-card listing-card related-card">' +
        '<div class="listing-card-image" style="background-image:url(\'' + pkg.image + '\')">' +
          '<span class="listing-card-tag">' + pkg.duration.days + 'D/' + pkg.duration.nights + 'N</span>' +
        '</div>' +
        '<div class="listing-card-body">' +
          '<h3>' + pkg.title + '</h3>' +
          '<p class="listing-card-price">' + formatCurrency(pkg.price) + '<span>/person</span></p>' +
          '<a href="package-detail.html?id=' + pkg.id + '" class="btn btn-outline">View Details</a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderHotelCard(hotel) {
    return (
      '<article class="hotel-card listing-card related-card">' +
        '<div class="listing-card-image" style="background-image:url(\'' + hotel.image + '\')"></div>' +
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
      '<article class="tour-card listing-card related-card">' +
        '<div class="listing-card-image" style="background-image:url(\'' + tour.image + '\')">' +
          '<span class="listing-card-tag listing-card-tag--gold">' + tour.theme + '</span>' +
        '</div>' +
        '<div class="listing-card-body">' +
          '<h3>' + tour.title + '</h3>' +
          '<p class="related-card-meta">' + tour.duration + ' · ' + tour.groupSize + '</p>' +
          '<p class="listing-card-price">' + formatCurrency(tour.price) + '<span>/person</span></p>' +
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

  function renderDestination(destination) {
    document.title = destination.name + ' | Voyara';

    document.getElementById('destination-name').textContent = destination.name;
    document.getElementById('destination-country').textContent = destination.country;
    document.getElementById('breadcrumb-name').textContent = destination.name;
    document.getElementById('about-name').textContent = destination.name;
    document.getElementById('destination-description').textContent = destination.shortDescription;

    document.getElementById('hero-banner').style.backgroundImage = "url('" + destination.image + "')";

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
