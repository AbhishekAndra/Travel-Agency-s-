/* ==========================================================================
   Stackly — Contact page logic
   No backend — validates, shows an inline success message, and resets the
   form. Never uses alert().
   ========================================================================== */

(function () {
  'use strict';

  var setFieldError = window.StacklyUtils.setFieldError;

  function validateName(input) {
    var error = window.StacklyUtils.validateNameValue(input.value);
    setFieldError('contact-name-field', 'contact-name-error', error);
    return !error;
  }

  function validateEmail(input) {
    var error = window.StacklyUtils.validateEmailValue(input.value);
    setFieldError('contact-email-field', 'contact-email-error', error);
    return !error;
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
    if (!input.value.trim()) {
      setFieldError('contact-message-field', 'contact-message-error', 'This field is required.');
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

    window.StacklyUtils.initCharCounter('contact-message', 'contact-message-counter', 500);

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

      var isValid = window.StacklyUtils.validateFieldsAndFocus(fields);
      if (!isValid) return;

      form.reset();
      messageInput.dispatchEvent(new Event('input'));
      successEl.hidden = false;
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
