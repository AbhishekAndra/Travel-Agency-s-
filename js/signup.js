/* ==========================================================================
   Stackly — Sign Up page logic
   Inline field validation, then hands off to StacklyAuth.signup().
   ========================================================================== */

(function () {
  'use strict';

  var MIN_PASSWORD_LENGTH = 8;

  var nameInput = document.getElementById('signup-name');
  var emailInput = document.getElementById('signup-email');
  var passwordInput = document.getElementById('signup-password');
  var confirmInput = document.getElementById('signup-confirm-password');

  var setFieldError = window.StacklyUtils.setFieldError;

  function validateName() {
    var error = window.StacklyUtils.validateNameValue(nameInput.value);
    setFieldError('name-field', 'name-error', error);
    return !error;
  }

  function validateEmail() {
    var error = window.StacklyUtils.validateEmailValue(emailInput.value);
    setFieldError('email-field', 'email-error', error);
    return !error;
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

    var isValid = window.StacklyUtils.validateFieldsAndFocus([
      { input: nameInput, validate: validateName },
      { input: emailInput, validate: validateEmail },
      { input: passwordInput, validate: validatePassword },
      { input: confirmInput, validate: validateConfirmPassword }
    ]);
    if (!isValid) return;

    var result = window.StacklyAuth.signup({
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

    if (window.StacklyAuth.getCurrentUser()) {
      window.location.href = 'dashboard.html';
      return;
    }

    bindLiveValidation();
    form.addEventListener('submit', handleSubmit);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
