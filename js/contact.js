/* ==========================================================================
   Voyara — Contact page logic
   No backend — validates, shows an inline success message, and resets the
   form. Never uses alert().
   ========================================================================== */

(function () {
  'use strict';

  function setFieldError(fieldId, errorId, message) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById(errorId);
    field.classList.toggle('has-error', !!message);
    errorEl.textContent = message || '';
  }

  function validateName(input) {
    if (input.value.trim().length < 2) {
      setFieldError('contact-name-field', 'contact-name-error', 'Please enter your name.');
      return false;
    }
    setFieldError('contact-name-field', 'contact-name-error', '');
    return true;
  }

  function validateEmail(input) {
    var value = input.value.trim();
    if (!value || !window.VoyaraAuth.isValidEmail(value)) {
      setFieldError('contact-email-field', 'contact-email-error', 'Enter a valid email address.');
      return false;
    }
    setFieldError('contact-email-field', 'contact-email-error', '');
    return true;
  }

  function validateSubject(input) {
    if (input.value.trim().length < 2) {
      setFieldError('contact-subject-field', 'contact-subject-error', 'Please enter a subject.');
      return false;
    }
    setFieldError('contact-subject-field', 'contact-subject-error', '');
    return true;
  }

  function validateMessage(input) {
    if (input.value.trim().length < 10) {
      setFieldError('contact-message-field', 'contact-message-error', 'Please enter at least 10 characters.');
      return false;
    }
    setFieldError('contact-message-field', 'contact-message-error', '');
    return true;
  }

  function init() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var nameInput = document.getElementById('contact-name');
    var emailInput = document.getElementById('contact-email');
    var subjectInput = document.getElementById('contact-subject');
    var messageInput = document.getElementById('contact-message');
    var successEl = document.getElementById('contact-success');

    var fields = [
      { input: nameInput, validate: validateName },
      { input: emailInput, validate: validateEmail },
      { input: subjectInput, validate: validateSubject },
      { input: messageInput, validate: validateMessage }
    ];

    fields.forEach(function (f) {
      f.input.addEventListener('blur', function () { f.validate(f.input); });
      f.input.addEventListener('input', function () {
        successEl.hidden = true;
        if (f.input.closest('.form-field').classList.contains('has-error')) {
          f.validate(f.input);
        }
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var isValid = fields.reduce(function (allValid, f) {
        return f.validate(f.input) && allValid;
      }, true);

      if (!isValid) return;

      form.reset();
      successEl.hidden = false;
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
