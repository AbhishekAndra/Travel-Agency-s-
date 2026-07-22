/* ==========================================================================
   Voyara — Login page logic
   Inline field validation, then hands off to VoyaraAuth.login().
   ========================================================================== */

(function () {
  'use strict';

  var emailInput = document.getElementById('login-email');
  var passwordInput = document.getElementById('login-password');

  var setFieldError = window.VoyaraUtils.setFieldError;

  function setFormError(message) {
    var el = document.getElementById('login-form-error');
    el.textContent = message || '';
    el.hidden = !message;
  }

  function validateEmail() {
    var error = window.VoyaraUtils.validateEmailValue(emailInput.value);
    setFieldError('email-field', 'email-error', error);
    return !error;
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

    var isValid = window.VoyaraUtils.validateFieldsAndFocus([
      { input: emailInput, validate: validateEmail },
      { input: passwordInput, validate: validatePassword }
    ]);
    if (!isValid) return;

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
