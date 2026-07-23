/* ==========================================================================
   Stackly — Package Detail page logic
   Reads ?id= from the URL and renders a single js/data.js package.
   ========================================================================== */

(function () {
  'use strict';

  var packages = (window.StacklyData && window.StacklyData.packages) || [];
  var formatCurrency = window.StacklyData.formatCurrency;

  var CHILD_PRICE_FACTOR = 0.5;
  var MAX_TRAVELERS = 9;
  var counts = { adults: 1, children: 0 };

  var CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l4 4 10-10"/></svg>';
  var X_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  var REVIEWS = [
    { name: 'Ananya R.', rating: 5, date: 'March 2026', comment: 'Every detail was handled beautifully — the itinerary struck the perfect balance between guided experiences and free time. Would book with Stackly again in a heartbeat.' },
    { name: 'Marcus T.', rating: 4, date: 'January 2026', comment: 'Genuinely well organized trip. The included excursions were worth it, and the accommodation was a step above what we expected for the price.' },
    { name: 'Priya K.', rating: 5, date: 'November 2025', comment: 'Our guide made the whole trip. Everything ran on time, communication before departure was excellent, and the pacing felt just right.' },
    { name: 'Daniel O.', rating: 4, date: 'September 2025', comment: 'A couple of the transfer times were tight, but otherwise a smooth, well-priced trip. The included breakfasts were a nice touch each morning.' }
  ];

  function todayISO() {
    var d = new Date();
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + month + '-' + day;
  }

  // ---- Gallery ----
  function renderGallery(pkg) {
    var images = (pkg.gallery && pkg.gallery.length) ? pkg.gallery : [pkg.image];
    var main = document.getElementById('gallery-main');
    var thumbsContainer = document.getElementById('gallery-thumbs');

    function setMain(src, index) {
      main.src = src;
      main.alt = pkg.title + ' — photo ' + (index + 1) + ' of ' + images.length;
    }

    setMain(images[0], 0);

    thumbsContainer.innerHTML = images.map(function (src, i) {
      return '<button type="button" class="gallery-thumb' + (i === 0 ? ' is-active' : '') +
        '" data-src="' + src + '" data-index="' + i + '" aria-label="Show photo ' + (i + 1) + '"' +
        (i === 0 ? ' aria-current="true"' : '') + '>' +
        window.StacklyUtils.renderImg({
          src: src,
          width: 400,
          height: 300,
          alt: pkg.title + ' thumbnail ' + (i + 1)
        }) +
        '</button>';
    }).join('');

    thumbsContainer.querySelectorAll('.gallery-thumb').forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        thumbsContainer.querySelectorAll('.gallery-thumb').forEach(function (t) {
          t.classList.remove('is-active');
          t.removeAttribute('aria-current');
        });
        thumb.classList.add('is-active');
        thumb.setAttribute('aria-current', 'true');
        setMain(thumb.dataset.src, Number(thumb.dataset.index));
      });
    });
  }

  // ---- Tab content rendering (overview/itinerary/inclusions/reviews) ----
  function renderOverview(pkg) {
    document.getElementById('tab-overview').innerHTML = '<p>' + pkg.description + '</p>';
  }

  function renderItinerary(pkg) {
    document.getElementById('tab-itinerary').innerHTML = pkg.itinerary.map(function (day) {
      return (
        '<div class="itinerary-day">' +
          '<div class="itinerary-day-badge">' + day.day + '</div>' +
          '<div><h2>Day ' + day.day + ': ' + day.title + '</h2><p>' + day.description + '</p></div>' +
        '</div>'
      );
    }).join('');
  }

  function renderInclusions(pkg) {
    var inclusionsHtml = pkg.inclusions.map(function (item) {
      return '<li>' + CHECK_ICON + '<span>' + item + '</span></li>';
    }).join('');

    var exclusionsHtml = pkg.exclusions.map(function (item) {
      return '<li>' + X_ICON + '<span>' + item + '</span></li>';
    }).join('');

    document.getElementById('tab-inclusions').innerHTML = (
      '<div class="inclusions-grid">' +
        '<div><h2>Included</h2><ul class="inclusions-list">' + inclusionsHtml + '</ul></div>' +
        '<div><h2>Not Included</h2><ul class="exclusions-list">' + exclusionsHtml + '</ul></div>' +
      '</div>'
    );
  }

  function renderReviews() {
    document.getElementById('tab-reviews').innerHTML = REVIEWS.map(function (r) {
      return (
        '<article class="review-card">' +
          '<div class="review-card-header">' +
            '<span class="review-card-name">' + r.name + '</span>' +
            '<span class="review-card-date">' + r.date + '</span>' +
          '</div>' +
          window.StacklyUtils.renderStars(r.rating) +
          '<p>' + r.comment + '</p>' +
        '</article>'
      );
    }).join('');
  }

  // ---- Traveler stepper & price summary ----
  function updateStepperUI() {
    document.getElementById('adults-count').textContent = counts.adults;
    document.getElementById('children-count').textContent = counts.children;
    document.querySelector('.stepper-btn[data-step="adults"][data-dir="-1"]').disabled = counts.adults <= 1;
    document.querySelector('.stepper-btn[data-step="adults"][data-dir="1"]').disabled = counts.adults >= MAX_TRAVELERS;
    document.querySelector('.stepper-btn[data-step="children"][data-dir="-1"]').disabled = counts.children <= 0;
    document.querySelector('.stepper-btn[data-step="children"][data-dir="1"]').disabled = counts.children >= MAX_TRAVELERS;
  }

  function getTotalPrice(pkg) {
    var childPrice = Math.round(pkg.price * CHILD_PRICE_FACTOR);
    return counts.adults * pkg.price + counts.children * childPrice;
  }

  function updatePriceSummary(pkg) {
    var childPrice = Math.round(pkg.price * CHILD_PRICE_FACTOR);
    var adultTotal = counts.adults * pkg.price;
    var childTotal = counts.children * childPrice;
    var childrenRow = document.getElementById('summary-children-row');

    document.getElementById('summary-adults-label').textContent =
      counts.adults + ' Adult' + (counts.adults === 1 ? '' : 's') + ' × ' + formatCurrency(pkg.price);
    document.getElementById('summary-adults-price').textContent = formatCurrency(adultTotal);

    if (counts.children > 0) {
      childrenRow.hidden = false;
      document.getElementById('summary-children-label').textContent =
        counts.children + ' Child' + (counts.children === 1 ? '' : 'ren') + ' × ' + formatCurrency(childPrice);
      document.getElementById('summary-children-price').textContent = formatCurrency(childTotal);
    } else {
      childrenRow.hidden = true;
    }

    document.getElementById('summary-total').textContent = formatCurrency(adultTotal + childTotal);
  }

  function bindStepper(pkg) {
    document.querySelectorAll('.stepper-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.step;
        var dir = Number(btn.dataset.dir);
        var min = key === 'adults' ? 1 : 0;
        var next = counts[key] + dir;
        if (next < min || next > MAX_TRAVELERS) return;
        counts[key] = next;
        updateStepperUI();
        updatePriceSummary(pkg);
      });
    });
  }

  var feedbackTimer = null;
  function showFeedback(message) {
    var el = document.getElementById('booking-feedback');
    el.textContent = message;
    el.hidden = false;
    window.clearTimeout(feedbackTimer);
    feedbackTimer = window.setTimeout(function () { el.hidden = true; }, 2500);
  }

  // ---- Booking actions (add to cart / book now) ----
  function buildBookingItem(pkg) {
    var dateInput = document.getElementById('travel-date');
    return {
      type: 'package',
      id: pkg.id,
      title: pkg.title,
      destination: pkg.destination,
      image: pkg.image,
      travelDate: dateInput.value,
      adults: counts.adults,
      children: counts.children,
      pricePerAdult: pkg.price,
      pricePerChild: Math.round(pkg.price * CHILD_PRICE_FACTOR),
      totalPrice: getTotalPrice(pkg),
      qty: 1
    };
  }

  function bindBookingActions(pkg) {
    document.getElementById('add-to-cart-btn').addEventListener('click', function () {
      var dateInput = document.getElementById('travel-date');
      if (!dateInput.value) {
        showFeedback('Please select a travel date.');
        return;
      }
      window.StacklyCart.addToCart(buildBookingItem(pkg));
      window.StacklyUtils.updateCartBadge();
      showFeedback('Added to your cart.');
    });

    document.getElementById('book-now-btn').addEventListener('click', function () {
      var dateInput = document.getElementById('travel-date');
      if (!dateInput.value) {
        showFeedback('Please select a travel date.');
        return;
      }
      window.StacklyCart.setDirectBooking('package', buildBookingItem(pkg));
      window.location.href = 'checkout.html';
    });
  }

  // ---- Page render & init ----
  function renderPackage(pkg) {
    document.title = pkg.title + ' | Stackly';
    document.getElementById('breadcrumb-title').textContent = pkg.title;
    document.getElementById('package-title').textContent = pkg.title;
    document.getElementById('package-destination').textContent = pkg.destination;
    document.getElementById('package-duration').textContent = pkg.duration.days + ' Days / ' + pkg.duration.nights + ' Nights';
    document.getElementById('package-rating').innerHTML = window.StacklyUtils.renderStars(pkg.rating);
    document.getElementById('booking-price').innerHTML = formatCurrency(pkg.price) + '<span>/adult</span>';
    document.getElementById('travel-date').min = todayISO();

    renderGallery(pkg);
    renderOverview(pkg);
    renderItinerary(pkg);
    renderInclusions(pkg);
    renderReviews();
    window.StacklyUtils.initTabs();
    updateStepperUI();
    updatePriceSummary(pkg);
    bindStepper(pkg);
    bindBookingActions(pkg);
  }

  function init() {
    if (!document.getElementById('detail-content')) return;

    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    var pkg = packages.filter(function (p) { return p.id === id; })[0];

    if (!pkg) {
      document.getElementById('not-found-state').hidden = false;
      document.getElementById('detail-content').hidden = true;
      return;
    }

    renderPackage(pkg);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
