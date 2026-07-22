/* ==========================================================================
   Voyara — Sign Up page logic
   Inline field validation, then hands off to VoyaraAuth.signup().
   ========================================================================== */

(function () {
  'use strict';

  var MIN_PASSWORD_LENGTH = 8;

  var nameInput = document.getElementById('signup-name');
  var emailInput = document.getElementById('signup-email');
  var passwordInput = document.getElementById('signup-password');
  var confirmInput = document.getElementById('signup-confirm-password');

  function setFieldError(fieldId, errorId, message) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById(errorId);
    field.classList.toggle('has-error', !!message);
    errorEl.textContent = message || '';
  }

  function validateName() {
    var value = nameInput.value.trim();
    if (value.length < 2) {
      setFieldError('name-field', 'name-error', 'Please enter your full name.');
      return false;
    }
    setFieldError('name-field', 'name-error', '');
    return true;
  }

  function validateEmail() {
    var value = emailInput.value.trim();
    if (!value) {
      setFieldError('email-field', 'email-error', 'Email is required.');
      return false;
    }
    if (!window.VoyaraAuth.isValidEmail(value)) {
      setFieldError('email-field', 'email-error', 'Enter a valid email address.');
      return false;
    }
    setFieldError('email-field', 'email-error', '');
    return true;
  }

  function validatePassword() {
    if (passwordInput.value.length < MIN_PASSWORD_LENGTH) {
      setFieldError('password-field', 'password-error', 'Password must be at least ' + MIN_PASSWORD_LENGTH + ' characters.');
      return false;
    }
    setFieldError('password-field', 'password-error', '');
    return true;
  }

  function validateConfirmPassword() {
    if (confirmInput.value !== passwordInput.value) {
      setFieldError('confirm-password-field', 'confirm-password-error', 'Passwords do not match.');
      return false;
    }
    setFieldError('confirm-password-field', 'confirm-password-error', '');
    return true;
  }

  function bindLiveValidation() {
    nameInput.addEventListener('blur', validateName);
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('blur', validatePassword);
    confirmInput.addEventListener('blur', validateConfirmPassword);

    [nameInput, emailInput, passwordInput, confirmInput].forEach(function (input) {
      input.addEventListener('input', function () {
        if (input.closest('.form-field').classList.contains('has-error')) {
          input.dispatchEvent(new Event('blur'));
        }
      });
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    var isNameValid = validateName();
    var isEmailValid = validateEmail();
    var isPasswordValid = validatePassword();
    var isConfirmValid = validateConfirmPassword();

    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) {
      return;
    }

    var result = window.VoyaraAuth.signup({
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value
    });

    if (!result.ok) {
      setFieldError('email-field', 'email-error', result.error);
      return;
    }

    window.location.href = 'dashboard.html';
  }

  function init() {
    var form = document.getElementById('signup-form');
    if (!form) return;

    if (window.VoyaraAuth.getCurrentUser()) {
      window.location.href = 'dashboard.html';
      return;
    }

    bindLiveValidation();
    form.addEventListener('submit', handleSubmit);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
