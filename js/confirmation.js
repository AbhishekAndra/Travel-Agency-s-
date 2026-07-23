/* ==========================================================================
   Stackly — Confirmation page logic
   Reads ?bookingId= and renders the matching entry from 'stacklyBookings'.
   ========================================================================== */

(function () {
  'use strict';

  var formatCurrency = window.StacklyData.formatCurrency;

  var readLocalArray = window.StacklyUtils.readLocalArray;

  var getItemTitle = window.StacklyUtils.getItemTitle;
  var getItemDestination = window.StacklyUtils.getItemDestination;
  var getItemDateLabel = window.StacklyUtils.getItemDateLabel;

  // ---- Rendering & init ----
  function renderBooking(booking) {
    document.getElementById('booking-id').textContent = booking.bookingId;

    document.getElementById('confirmation-items').innerHTML = booking.items.map(function (item) {
      return (
        '<div class="confirmation-item">' +
          '<div>' +
            '<p class="confirmation-item-title">' + getItemTitle(item) + '</p>' +
            '<p class="confirmation-item-meta">' + [getItemDestination(item), getItemDateLabel(item)].filter(Boolean).join(' · ') + '</p>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    document.getElementById('confirmation-subtotal').textContent = formatCurrency(booking.subtotal);
    document.getElementById('confirmation-tax').textContent = formatCurrency(booking.tax);
    document.getElementById('confirmation-total').textContent = formatCurrency(booking.total);

    var traveler = booking.travelerDetails || {};
    var travelerHtml =
      '<div class="confirmation-traveler-row"><span>Name</span><span>' + (traveler.name || '') + '</span></div>' +
      '<div class="confirmation-traveler-row"><span>Email</span><span>' + (traveler.email || '') + '</span></div>' +
      '<div class="confirmation-traveler-row"><span>Phone</span><span>' + (traveler.phone || '') + '</span></div>' +
      '<div class="confirmation-traveler-row"><span>Travelers</span><span>' + (booking.travelerCount || 1) + '</span></div>';

    if (traveler.otherTravelerNames && traveler.otherTravelerNames.length) {
      travelerHtml += '<div class="confirmation-traveler-row"><span>Other Travelers</span><span>' + traveler.otherTravelerNames.join(', ') + '</span></div>';
    }
    document.getElementById('confirmation-traveler').innerHTML = travelerHtml;
  }

  function bindDownloadStub() {
    document.getElementById('download-itinerary-btn').addEventListener('click', function () {
      document.getElementById('download-note').hidden = false;
    });
  }

  function init() {
    if (!document.getElementById('confirmation-content')) return;

    var params = new URLSearchParams(window.location.search);
    var bookingId = params.get('bookingId');
    var booking = readLocalArray('stacklyBookings').filter(function (b) { return b.bookingId === bookingId; })[0];

    if (!booking) {
      document.getElementById('not-found-state').hidden = false;
      document.getElementById('confirmation-content').hidden = true;
      return;
    }

    document.getElementById('confirmation-content').hidden = false;
    renderBooking(booking);
    bindDownloadStub();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
