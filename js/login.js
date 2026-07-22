/* ==========================================================================
   Voyara — Login page logic
   Inline field validation, then hands off to VoyaraAuth.login().
   ========================================================================== */

(function () {
  'use strict';

  var emailInput = document.getElementById('login-email');
  var passwordInput = document.getElementById('login-password');

  function setFieldError(fieldId, errorId, message) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById(errorId);
    field.classList.toggle('has-error', !!message);
    errorEl.textContent = message || '';
  }

  function setFormError(message) {
    var el = document.getElementById('login-form-error');
    el.textContent = message || '';
    el.hidden = !message;
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
    if (!passwordInput.value) {
      setFieldError('password-field', 'password-error', 'Password is required.');
      return false;
    }
    setFieldError('password-field', 'password-error', '');
    return true;
  }

  function bindLiveValidation() {
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('blur', validatePassword);

    [emailInput, passwordInput].forEach(function (input) {
      input.addEventListener('input', function () {
        setFormError('');
        if (input.closest('.form-field').classList.contains('has-error')) {
          input.dispatchEvent(new Event('blur'));
        }
      });
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    var isEmailValid = validateEmail();
    var isPasswordValid = validatePassword();
    if (!isEmailValid || !isPasswordValid) return;

    var result = window.VoyaraAuth.login(emailInput.value.trim(), passwordInput.value);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    window.location.href = 'dashboard.html';
  }

  function init() {
    var form = document.getElementById('login-form');
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
