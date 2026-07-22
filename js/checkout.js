/* ==========================================================================
   Voyara — Checkout page logic (3-step wizard)
   Order comes from either a direct booking (flights.js "Select" or
   package-detail.js "Book Now" — sessionStorage, skips the cart) or, if
   there's no direct booking, the full persistent cart. Whichever it is, the
   resulting order is always homogeneous (all-flight or all-package) given
   what the rest of the site currently supports, which keeps the pricing
   logic below simple.
   ========================================================================== */

(function () {
  'use strict';

  var formatCurrency = window.VoyaraData.formatCurrency;
  var PHONE_RE = /^[0-9+\-\s()]{7,15}$/;
  var CARD_EXPIRY_RE = /^(0[1-9]|1[0-2])\/\d{2}$/;
  var UPI_RE = /^[\w.-]+@[\w.-]+$/;
  var MAX_TRAVELERS = 9;

  var order = null;

  var state = {
    step: 1,
    travelerCount: 1,
    primary: { name: '', email: '', phone: '' },
    travelerNames: [],
    payment: { method: 'card' }
  };

  /* ---- Order resolution ---- */

  function resolveOrder() {
    var direct = window.VoyaraCart.getDirectBooking();
    if (direct) {
      var item = Object.assign({}, direct.item, { type: direct.type });
      return { source: 'direct', type: direct.type, items: [item] };
    }
    var cartItems = window.VoyaraCart.getItems();
    return { source: 'cart', type: 'package', items: cartItems };
  }

  function getItemTitle(item) {
    return item.type === 'flight' ? (item.airline + ' — ' + item.from + ' to ' + item.to) : item.title;
  }

  function getItemDestination(item) {
    return item.type === 'flight' ? item.to : item.destination;
  }

  function getItemDateLabel(item) {
    if (item.type === 'flight') return item.departTime + ' – ' + item.arriveTime;
    if (!item.travelDate) return '';
    return new Date(item.travelDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function getItemLineTotal(item) {
    if (order.type === 'flight') {
      return (Number(item.price) || 0) * state.travelerCount;
    }
    return (Number(item.totalPrice) || 0) * (Number(item.qty) || 1);
  }

  function getOrderTotals() {
    var subtotal = order.items.reduce(function (sum, item) { return sum + getItemLineTotal(item); }, 0);
    var tax = Math.round(subtotal * window.VoyaraCart.TAX_RATE);
    return { subtotal: subtotal, tax: tax, total: subtotal + tax };
  }

  function computeDefaultTravelerCount() {
    if (order.type === 'flight') return 1;
    var total = order.items.reduce(function (sum, item) {
      return sum + (Number(item.adults) || 0) + (Number(item.children) || 0);
    }, 0);
    return total || 1;
  }

  /* ---- Step indicator ---- */

  function renderStepIndicator() {
    document.querySelectorAll('.checkout-step').forEach(function (stepEl) {
      var stepNum = Number(stepEl.dataset.step);
      stepEl.classList.toggle('is-active', stepNum === state.step);
      stepEl.classList.toggle('is-complete', stepNum < state.step);
    });
  }

  function goToStep(stepNum) {
    state.step = stepNum;
    document.querySelectorAll('.checkout-panel').forEach(function (panel) { panel.hidden = true; });
    document.getElementById('checkout-step-' + stepNum).hidden = false;
    renderStepIndicator();
    if (stepNum === 3) renderReview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---- Traveler count + names (step 1) ---- */

  function renderTravelerCountControl() {
    var container = document.getElementById('traveler-count-control');

    if (order.type === 'flight') {
      container.innerHTML =
        '<div class="stepper">' +
          '<button type="button" class="stepper-btn" id="traveler-count-decrease" aria-label="Decrease travelers">−</button>' +
          '<span id="traveler-count-value">' + state.travelerCount + '</span>' +
          '<button type="button" class="stepper-btn" id="traveler-count-increase" aria-label="Increase travelers">+</button>' +
        '</div>';

      document.getElementById('traveler-count-decrease').addEventListener('click', function () { adjustTravelerCount(-1); });
      document.getElementById('traveler-count-increase').addEventListener('click', function () { adjustTravelerCount(1); });
    } else {
      var adults = order.items.reduce(function (s, i) { return s + (Number(i.adults) || 0); }, 0);
      var children = order.items.reduce(function (s, i) { return s + (Number(i.children) || 0); }, 0);
      var text = adults + ' Adult' + (adults === 1 ? '' : 's');
      if (children) text += ', ' + children + ' Child' + (children === 1 ? '' : 'ren');
      container.innerHTML = '<p class="traveler-count-readonly">' + text + '</p>';
    }
  }

  function adjustTravelerCount(delta) {
    var next = state.travelerCount + delta;
    if (next < 1 || next > MAX_TRAVELERS) return;
    state.travelerCount = next;
    document.getElementById('traveler-count-value').textContent = next;
    renderTravelerNamesList();
    renderSummarySidebar();
  }

  function renderTravelerNamesList() {
    var container = document.getElementById('traveler-names-list');
    var extra = state.travelerCount - 1;

    if (extra <= 0) {
      container.innerHTML = '';
      state.travelerNames = [];
      return;
    }

    var html = '<p class="traveler-names-heading">Names of other travelers</p>';
    for (var i = 0; i < extra; i++) {
      var value = state.travelerNames[i] || '';
      html +=
        '<div class="form-field" id="traveler-name-' + i + '-field">' +
          '<label for="traveler-name-' + i + '">Traveler ' + (i + 2) + ' Name</label>' +
          '<input type="text" id="traveler-name-' + i + '" data-index="' + i + '" value="' + value.replace(/"/g, '&quot;') + '">' +
          '<span class="field-error" id="traveler-name-' + i + '-error"></span>' +
        '</div>';
    }
    container.innerHTML = html;

    container.querySelectorAll('input').forEach(function (input) {
      input.addEventListener('input', function () {
        state.travelerNames[Number(input.dataset.index)] = input.value;
      });
    });
  }

  function setFieldError(fieldId, errorId, message) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById(errorId);
    field.classList.toggle('has-error', !!message);
    errorEl.textContent = message || '';
  }

  function validateStep1() {
    var nameInput = document.getElementById('traveler-name');
    var emailInput = document.getElementById('traveler-email');
    var phoneInput = document.getElementById('traveler-phone');
    var isValid = true;

    if (nameInput.value.trim().length < 2) {
      setFieldError('traveler-name-field', 'traveler-name-error', 'Please enter the traveler’s full name.');
      isValid = false;
    } else {
      setFieldError('traveler-name-field', 'traveler-name-error', '');
    }

    if (!window.VoyaraAuth.isValidEmail(emailInput.value.trim())) {
      setFieldError('traveler-email-field', 'traveler-email-error', 'Enter a valid email address.');
      isValid = false;
    } else {
      setFieldError('traveler-email-field', 'traveler-email-error', '');
    }

    if (!PHONE_RE.test(phoneInput.value.trim())) {
      setFieldError('traveler-phone-field', 'traveler-phone-error', 'Enter a valid phone number.');
      isValid = false;
    } else {
      setFieldError('traveler-phone-field', 'traveler-phone-error', '');
    }

    for (var i = 0; i < state.travelerCount - 1; i++) {
      var value = (state.travelerNames[i] || '').trim();
      if (value.length < 2) {
        setFieldError('traveler-name-' + i + '-field', 'traveler-name-' + i + '-error', 'Please enter this traveler’s name.');
        isValid = false;
      } else {
        setFieldError('traveler-name-' + i + '-field', 'traveler-name-' + i + '-error', '');
      }
    }

    if (isValid) {
      state.primary.name = nameInput.value.trim();
      state.primary.email = emailInput.value.trim();
      state.primary.phone = phoneInput.value.trim();
    }

    return isValid;
  }

  /* ---- Payment (step 2) ---- */

  function togglePaymentFields() {
    document.getElementById('payment-card-fields').hidden = state.payment.method !== 'card';
    document.getElementById('payment-upi-fields').hidden = state.payment.method !== 'upi';
    document.getElementById('payment-netbanking-fields').hidden = state.payment.method !== 'netbanking';
  }

  function bindPaymentMethodToggle() {
    document.querySelectorAll('input[name="payment-method"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        state.payment.method = radio.value;
        togglePaymentFields();
      });
    });
  }

  function bindCardNumberFormatting() {
    document.getElementById('card-number').addEventListener('input', function (event) {
      var digits = event.target.value.replace(/\D/g, '').slice(0, 16);
      event.target.value = digits.replace(/(.{4})/g, '$1 ').trim();
    });
  }

  function validateStep2() {
    var isValid = true;

    if (state.payment.method === 'card') {
      var cardName = document.getElementById('card-name').value.trim();
      var cardNumber = document.getElementById('card-number').value.replace(/\s+/g, '');
      var expiry = document.getElementById('card-expiry').value.trim();
      var cvv = document.getElementById('card-cvv').value.trim();

      if (cardName.length < 2) {
        setFieldError('card-name-field', 'card-name-error', 'Enter the name on the card.');
        isValid = false;
      } else {
        setFieldError('card-name-field', 'card-name-error', '');
      }

      if (!/^\d{16}$/.test(cardNumber)) {
        setFieldError('card-number-field', 'card-number-error', 'Enter a valid 16-digit card number.');
        isValid = false;
      } else {
        setFieldError('card-number-field', 'card-number-error', '');
      }

      if (!CARD_EXPIRY_RE.test(expiry)) {
        setFieldError('card-expiry-field', 'card-expiry-error', 'Use MM/YY format.');
        isValid = false;
      } else {
        setFieldError('card-expiry-field', 'card-expiry-error', '');
      }

      if (!/^\d{3,4}$/.test(cvv)) {
        setFieldError('card-cvv-field', 'card-cvv-error', 'Enter a valid CVV.');
        isValid = false;
      } else {
        setFieldError('card-cvv-field', 'card-cvv-error', '');
      }

      if (isValid) {
        state.payment.cardName = cardName;
        state.payment.cardNumber = cardNumber;
        state.payment.expiry = expiry;
      }
    } else if (state.payment.method === 'upi') {
      var upiId = document.getElementById('upi-id').value.trim();
      if (!UPI_RE.test(upiId)) {
        setFieldError('upi-id-field', 'upi-id-error', 'Enter a valid UPI ID (e.g. name@bank).');
        isValid = false;
      } else {
        setFieldError('upi-id-field', 'upi-id-error', '');
        state.payment.upiId = upiId;
      }
    } else if (state.payment.method === 'netbanking') {
      var bank = document.getElementById('netbanking-bank').value;
      if (!bank) {
        setFieldError('netbanking-bank-field', 'netbanking-bank-error', 'Select your bank.');
        isValid = false;
      } else {
        setFieldError('netbanking-bank-field', 'netbanking-bank-error', '');
        state.payment.bank = bank;
      }
    }

    return isValid;
  }

  /* ---- Review (step 3) ---- */

  function renderReview() {
    document.getElementById('review-items').innerHTML = order.items.map(function (item) {
      return (
        '<div class="review-item">' +
          '<div>' +
            '<p class="review-item-title">' + getItemTitle(item) + '</p>' +
            '<p class="review-item-meta">' + [getItemDestination(item), getItemDateLabel(item)].filter(Boolean).join(' · ') + '</p>' +
          '</div>' +
          '<span>' + formatCurrency(getItemLineTotal(item)) + '</span>' +
        '</div>'
      );
    }).join('');

    var travelerRows =
      '<div class="review-traveler-row"><span>Name</span><span>' + state.primary.name + '</span></div>' +
      '<div class="review-traveler-row"><span>Email</span><span>' + state.primary.email + '</span></div>' +
      '<div class="review-traveler-row"><span>Phone</span><span>' + state.primary.phone + '</span></div>' +
      '<div class="review-traveler-row"><span>Travelers</span><span>' + state.travelerCount + '</span></div>';

    var otherNames = state.travelerNames.filter(Boolean);
    if (otherNames.length) {
      travelerRows += '<div class="review-traveler-row"><span>Other Travelers</span><span>' + otherNames.join(', ') + '</span></div>';
    }
    document.getElementById('review-traveler').innerHTML = travelerRows;

    var paymentSummary = '';
    if (state.payment.method === 'card') {
      paymentSummary = 'Card ending in ' + state.payment.cardNumber.slice(-4);
    } else if (state.payment.method === 'upi') {
      paymentSummary = 'UPI — ' + state.payment.upiId;
    } else {
      paymentSummary = 'Net Banking — ' + state.payment.bank;
    }
    document.getElementById('review-payment').innerHTML = '<p>' + paymentSummary + '</p>';
  }

  /* ---- Summary sidebar (persists across all 3 steps) ---- */

  function renderSummarySidebar() {
    document.getElementById('checkout-summary-items').innerHTML = order.items.map(function (item) {
      return (
        '<div class="checkout-summary-item">' +
          '<span class="checkout-summary-item-title">' + getItemTitle(item) + '</span>' +
          '<span class="checkout-summary-item-price">' + formatCurrency(getItemLineTotal(item)) + '</span>' +
        '</div>'
      );
    }).join('');

    var totals = getOrderTotals();
    document.getElementById('checkout-summary-subtotal').textContent = formatCurrency(totals.subtotal);
    document.getElementById('checkout-summary-tax').textContent = formatCurrency(totals.tax);
    document.getElementById('checkout-summary-total').textContent = formatCurrency(totals.total);
  }

  /* ---- Confirm booking ---- */

  function readLocalArray(key) {
    try {
      var raw = window.localStorage.getItem(key);
      var value = raw ? JSON.parse(raw) : [];
      return Array.isArray(value) ? value : [];
    } catch (err) {
      return [];
    }
  }

  function handleConfirmBooking() {
    var user = window.VoyaraAuth.getCurrentUser();
    var totals = getOrderTotals();
    var firstItem = order.items[0];

    var booking = {
      bookingId: window.VoyaraData.generateBookingId(),
      userEmail: user.email,
      createdAt: new Date().toISOString(),
      orderType: order.type,
      items: order.items,
      travelerCount: state.travelerCount,
      travelerDetails: {
        name: state.primary.name,
        email: state.primary.email,
        phone: state.primary.phone,
        otherTravelerNames: state.travelerNames.filter(Boolean)
      },
      paymentMethod: state.payment.method,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      title: order.items.length === 1 ? getItemTitle(firstItem) : (order.items.length + ' Bookings'),
      image: firstItem.image || '',
      destination: order.items.length === 1 ? getItemDestination(firstItem) : (order.items.length + ' Destinations'),
      date: firstItem.travelDate || new Date().toISOString()
    };

    var bookings = readLocalArray('voyaraBookings');
    bookings.push(booking);
    window.localStorage.setItem('voyaraBookings', JSON.stringify(bookings));

    if (order.source === 'direct') {
      window.VoyaraCart.clearDirectBooking();
    } else {
      window.VoyaraCart.clearCart();
    }
    window.VoyaraUtils.updateCartBadge();

    window.location.href = 'confirmation.html?bookingId=' + encodeURIComponent(booking.bookingId);
  }

  /* ---- Init ---- */

  function prefillFromUser(user) {
    document.getElementById('traveler-name').value = user.name || '';
    document.getElementById('traveler-email').value = user.email || '';
    document.getElementById('traveler-phone').value = user.phone || '';
    state.primary.name = user.name || '';
    state.primary.email = user.email || '';
    state.primary.phone = user.phone || '';
  }

  function bindNav() {
    document.getElementById('step1-next').addEventListener('click', function () {
      if (validateStep1()) goToStep(2);
    });
    document.getElementById('step2-back').addEventListener('click', function () { goToStep(1); });
    document.getElementById('step2-next').addEventListener('click', function () {
      if (validateStep2()) goToStep(3);
    });
    document.getElementById('step3-back').addEventListener('click', function () { goToStep(2); });
    document.getElementById('confirm-booking-btn').addEventListener('click', handleConfirmBooking);
  }

  function init() {
    if (!document.getElementById('checkout-content')) return;

    var user = window.VoyaraAuth.getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    order = resolveOrder();

    if (!order.items.length) {
      document.getElementById('not-found-state').hidden = false;
      document.getElementById('checkout-content').hidden = true;
      return;
    }

    state.travelerCount = computeDefaultTravelerCount();

    prefillFromUser(user);
    renderTravelerCountControl();
    renderTravelerNamesList();
    renderSummarySidebar();
    togglePaymentFields();
    bindPaymentMethodToggle();
    bindCardNumberFormatting();
    bindNav();
    renderStepIndicator();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
