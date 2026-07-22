/* ==========================================================================
   Voyara — Auth logic (signup, login, session, profile)
   Plain localStorage — no hashing. Fine for this training project, not for
   a real app. Also renders the header account menu (Login link vs. name +
   dropdown) on every page, since the header markup is shared site-wide.
   ========================================================================== */

(function () {
  'use strict';

  var USERS_KEY = 'voyaraUsers';
  var CURRENT_USER_KEY = 'voyaraCurrentUser';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ---- Storage access ----
  function getUsers() {
    try {
      var raw = window.localStorage.getItem(USERS_KEY);
      var users = raw ? JSON.parse(raw) : [];
      return Array.isArray(users) ? users : [];
    } catch (err) {
      return [];
    }
  }

  function saveUsers(users) {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function findUserByEmail(email) {
    var normalized = String(email).trim().toLowerCase();
    return getUsers().filter(function (u) { return u.email.toLowerCase() === normalized; })[0] || null;
  }

  // ---- Session ----
  function getCurrentUser() {
    try {
      var raw = window.localStorage.getItem(CURRENT_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function setCurrentUser(user) {
    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  function logout() {
    window.localStorage.removeItem(CURRENT_USER_KEY);
    window.location.reload();
  }

  // ---- Public API (used by signup.js, login.js, dashboard.js, and any
  // form doing inline email validation) ----
  function isValidEmail(email) {
    return EMAIL_RE.test(String(email).trim());
  }

  // Returns { ok: true, user } or { ok: false, error }
  function signup(details) {
    var name = String(details.name || '').trim();
    var email = String(details.email || '').trim();
    var password = String(details.password || '');

    if (findUserByEmail(email)) {
      return { ok: false, error: 'An account with this email already exists.' };
    }

    var user = {
      id: 'usr-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name,
      email: email,
      phone: '',
      password: password,
      createdAt: new Date().toISOString()
    };

    var users = getUsers();
    users.push(user);
    saveUsers(users);
    setCurrentUser(user);

    return { ok: true, user: user };
  }

  // Returns { ok: true, user } or { ok: false, error }
  function login(email, password) {
    var user = findUserByEmail(email);
    if (!user || user.password !== password) {
      return { ok: false, error: 'Incorrect email or password.' };
    }
    setCurrentUser(user);
    return { ok: true, user: user };
  }

  // Merges `updates` (e.g. { name, email, phone }) into the current user,
  // persisting to both the users list and the current-session copy.
  function updateProfile(updates) {
    var current = getCurrentUser();
    if (!current) return { ok: false, error: 'Not logged in.' };

    var merged = Object.assign({}, current, updates);
    var users = getUsers().map(function (u) { return u.id === merged.id ? merged : u; });

    saveUsers(users);
    setCurrentUser(merged);

    return { ok: true, user: merged };
  }

  // ---- Header account menu UI (runs on every page) ----
  function renderAccountMenu() {
    var menu = document.getElementById('account-menu');
    var trigger = document.getElementById('account-trigger');
    var label = document.getElementById('account-label');
    var dropdown = document.getElementById('account-dropdown');
    var mobileLink = document.getElementById('mobile-account-link');
    if (!trigger || !label) return;

    var user = getCurrentUser();
    var isLoggedIn = !!user;

    label.textContent = isLoggedIn ? user.name : 'Login';

    if (mobileLink) {
      mobileLink.textContent = isLoggedIn ? 'Dashboard' : 'Login';
      if (isLoggedIn && mobileLink.dataset.dashboardHref) {
        mobileLink.setAttribute('href', mobileLink.dataset.dashboardHref);
      }
    }

    if (!isLoggedIn) {
      return;
    }

    trigger.setAttribute('aria-expanded', 'false');

    function closeDropdown() {
      trigger.setAttribute('aria-expanded', 'false');
      if (dropdown) dropdown.hidden = true;
      menu.classList.remove('is-open');
    }

    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      if (dropdown) dropdown.hidden = expanded;
      if (menu) menu.classList.toggle('is-open', !expanded);
    });

    document.addEventListener('click', function (event) {
      if (menu && !menu.contains(event.target) && trigger.getAttribute('aria-expanded') === 'true') {
        closeDropdown();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
        closeDropdown();
        trigger.focus();
      }
    });

    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (event) {
        event.preventDefault();
        logout();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', renderAccountMenu);

  window.VoyaraAuth = {
    USERS_KEY: USERS_KEY,
    CURRENT_USER_KEY: CURRENT_USER_KEY,
    getUsers: getUsers,
    findUserByEmail: findUserByEmail,
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser,
    logout: logout,
    isValidEmail: isValidEmail,
    signup: signup,
    login: login,
    updateProfile: updateProfile,
    renderAccountMenu: renderAccountMenu
  };
})();
