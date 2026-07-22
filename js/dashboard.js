/* ==========================================================================
   Voyara — Dashboard page logic
   Requires a logged-in user (redirects to login.html otherwise). Renders
   My Bookings from localStorage 'voyaraBookings' and Wishlist from
   'voyaraWishlist' — both filtered by the current user's email. Neither key
   is written anywhere yet (checkout/wishlist flows aren't built), so both
   tabs render their empty state until those exist; expected shape once they
   do: { userEmail, ...itemFields }.
   ========================================================================== */

(function () {
  'use strict';

  var formatCurrency = window.VoyaraData.formatCurrency;

  var EMPTY_ILLUSTRATION = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="32" cy="32" r="26" stroke-dasharray="4 5"/><path d="M22 28h20a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H22a2 2 0 0 1-2-2V30a2 2 0 0 1 2-2z"/><path d="M27 28v-4a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v4"/><line x1="20" y1="36" x2="44" y2="36"/></svg>';

  function renderEmptyState(container, title, message, actionLabel, actionHref) {
    container.innerHTML =
      '<div class="empty-state">' +
        EMPTY_ILLUSTRATION +
        '<h3>' + title + '</h3>' +
        '<p>' + message + '</p>' +
        (actionLabel ? '<a href="' + actionHref + '" class="btn btn-outline">' + actionLabel + '</a>' : '') +
      '</div>';
  }

  function readLocalArray(key) {
    try {
      var raw = window.localStorage.getItem(key);
      var value = raw ? JSON.parse(raw) : [];
      return Array.isArray(value) ? value : [];
    } catch (err) {
      return [];
    }
  }

  function renderBookingItem(booking) {
    var dateLabel = booking.date
      ? new Date(booking.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
      : '';
    var metaParts = [booking.destination, dateLabel].filter(Boolean);

    return (
      '<div class="booking-item">' +
        '<div class="booking-item-image" style="background-image:url(\'' + (booking.image || '') + '\')"></div>' +
        '<div>' +
          '<p class="booking-item-title">' + (booking.title || 'Booking') + '</p>' +
          '<p class="booking-item-meta">' + metaParts.join(' · ') + '</p>' +
        '</div>' +
        '<p class="booking-item-price">' + (booking.total ? formatCurrency(booking.total) : '') + '</p>' +
      '</div>'
    );
  }

  function renderBookings(user) {
    var container = document.getElementById('tab-bookings');
    var mine = readLocalArray('voyaraBookings').filter(function (b) { return b.userEmail === user.email; });

    if (!mine.length) {
      renderEmptyState(
        container,
        'No bookings yet',
        'Start planning your next trip and it will show up here.',
        'Browse Packages',
        'packages.html'
      );
      return;
    }

    container.innerHTML = '<div class="booking-list">' + mine.map(renderBookingItem).join('') + '</div>';
  }

  function renderWishlist(user) {
    var container = document.getElementById('tab-wishlist');
    var mine = readLocalArray('voyaraWishlist').filter(function (w) { return w.userEmail === user.email; });

    if (!mine.length) {
      renderEmptyState(
        container,
        'Your wishlist is empty',
        'Tap the heart icon on any destination or package to save it here.',
        'Explore Destinations',
        '../index.html'
      );
      return;
    }

    container.innerHTML = '<div class="booking-list">' + mine.map(renderBookingItem).join('') + '</div>';
  }

  function initProfileForm(user) {
    var form = document.getElementById('profile-form');
    var nameInput = document.getElementById('profile-name');
    var emailInput = document.getElementById('profile-email');
    var phoneInput = document.getElementById('profile-phone');
    var successEl = document.getElementById('profile-form-success');

    nameInput.value = user.name || '';
    emailInput.value = user.email || '';
    phoneInput.value = user.phone || '';

    function setFieldError(fieldId, errorId, message) {
      var field = document.getElementById(fieldId);
      var errorEl = document.getElementById(errorId);
      field.classList.toggle('has-error', !!message);
      errorEl.textContent = message || '';
    }

    function validateName() {
      if (nameInput.value.trim().length < 2) {
        setFieldError('profile-name-field', 'profile-name-error', 'Please enter your full name.');
        return false;
      }
      setFieldError('profile-name-field', 'profile-name-error', '');
      return true;
    }

    function validateEmail() {
      var value = emailInput.value.trim();
      if (!value || !window.VoyaraAuth.isValidEmail(value)) {
        setFieldError('profile-email-field', 'profile-email-error', 'Enter a valid email address.');
        return false;
      }
      var existing = window.VoyaraAuth.findUserByEmail(value);
      if (existing && existing.id !== user.id) {
        setFieldError('profile-email-field', 'profile-email-error', 'This email is already in use by another account.');
        return false;
      }
      setFieldError('profile-email-field', 'profile-email-error', '');
      return true;
    }

    function validatePhone() {
      var value = phoneInput.value.trim();
      if (value && !/^[0-9+\-\s()]{7,15}$/.test(value)) {
        setFieldError('profile-phone-field', 'profile-phone-error', 'Enter a valid phone number.');
        return false;
      }
      setFieldError('profile-phone-field', 'profile-phone-error', '');
      return true;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      successEl.hidden = true;

      var isNameValid = validateName();
      var isEmailValid = validateEmail();
      var isPhoneValid = validatePhone();
      if (!isNameValid || !isEmailValid || !isPhoneValid) return;

      var result = window.VoyaraAuth.updateProfile({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim()
      });

      if (!result.ok) return;

      user = result.user;
      document.getElementById('dashboard-username').textContent = user.name;

      var accountLabel = document.getElementById('account-label');
      if (accountLabel) accountLabel.textContent = user.name;

      successEl.hidden = false;
    });
  }

  function init() {
    if (!document.getElementById('dashboard-username')) return;

    var user = window.VoyaraAuth.getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    document.getElementById('dashboard-username').textContent = user.name;

    window.VoyaraUtils.initTabs();
    renderBookings(user);
    renderWishlist(user);
    initProfileForm(user);

    document.getElementById('dashboard-logout-btn').addEventListener('click', function () {
      window.VoyaraAuth.logout();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
