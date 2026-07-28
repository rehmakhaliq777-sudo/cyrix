/* ============================================================
   CYBERSAFE AUTH SYSTEM — auth.js
   - No auto-popup; modal opens via hero "Sign Up / Login" button
   - Closeable modal (backdrop click, ✕ button, Escape key)
   - Confirm Password field shown on Sign Up
   - Continue with Google (simulated)
   - Profile avatar in navbar top-right after login
   - Guest mode: full browsing, no progress saved
   - Logout: clears auth only, preserves quiz/XP data
============================================================ */
(function () {
  'use strict';

  const AUTH_KEY         = 'cyrix_auth';
  const ACCOUNTS_KEY     = 'cyrix_accounts';
  const OLD_AUTH_KEY     = 'cybersafe_auth';      // legacy — migrate on first load
  const OLD_ACCOUNTS_KEY = 'cybersafe_accounts';  // legacy — migrate on first load
  const IS_HOME      = ['/', '/index.html', ''].includes(window.location.pathname) ||
                       window.location.pathname.endsWith('index.html');

  /* ─────────────────── Storage helpers ─────────────────── */
  function getAuth() {
    try {
      // Migrate old key on first load
      if (!localStorage.getItem(AUTH_KEY)) {
        const legacy = localStorage.getItem(OLD_AUTH_KEY);
        if (legacy) { localStorage.setItem(AUTH_KEY, legacy); localStorage.removeItem(OLD_AUTH_KEY); }
      }
      const r = localStorage.getItem(AUTH_KEY); return r ? JSON.parse(r) : null;
    } catch { return null; }
  }
  function saveAuth(data)   { localStorage.setItem(AUTH_KEY, JSON.stringify(data)); }
  function clearAuth()      { localStorage.removeItem(AUTH_KEY); }
  function getAccounts()    {
    try {
      // Migrate old accounts key
      if (!localStorage.getItem(ACCOUNTS_KEY)) {
        const legacy = localStorage.getItem(OLD_ACCOUNTS_KEY);
        if (legacy) { localStorage.setItem(ACCOUNTS_KEY, legacy); localStorage.removeItem(OLD_ACCOUNTS_KEY); }
      }
      const r = localStorage.getItem(ACCOUNTS_KEY); return r ? JSON.parse(r) : [];
    } catch { return []; }
  }
  function saveAccounts(a)  { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(a)); }

  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /* ─────────────────── Inject modal DOM ─────────────────── */
  function injectModal() {
    if (document.getElementById('auth-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Sign in to CYRIX');
    modal.innerHTML = `
      <div class="auth-backdrop" id="auth-backdrop"></div>
      <div class="auth-card" id="auth-card">
        <!-- Close button -->
        <button class="auth-close" id="auth-close" type="button" aria-label="Close">✕</button>

        <!-- Glow orbs -->
        <div class="auth-orb auth-orb-1"></div>
        <div class="auth-orb auth-orb-2"></div>

        <!-- Header -->
        <div class="auth-header">
          <div class="auth-logo">
            <div class="auth-logo-icon"></div>
            <span>CYRIX</span>
          </div>
          <h2 class="auth-title" id="auth-title">Welcome Back</h2>
          <p class="auth-subtitle" id="auth-subtitle">Log in to track your progress and achievements</p>
        </div>

        <!-- Form -->
        <form class="auth-form" id="auth-form" novalidate>
          <!-- Name (signup only) -->
          <div class="auth-field" id="auth-name-field" style="display:none;">
            <label class="auth-label" for="auth-name">Full Name</label>
            <input class="auth-input" type="text" id="auth-name" placeholder="Your full name" autocomplete="name" />
          </div>

          <!-- Email -->
          <div class="auth-field">
            <label class="auth-label" for="auth-email">Email</label>
            <input class="auth-input" type="email" id="auth-email" placeholder="you@example.com" autocomplete="email" />
          </div>

          <!-- Password -->
          <div class="auth-field">
            <label class="auth-label" for="auth-password">Password</label>
            <div class="auth-pwd-wrap">
              <input class="auth-input" type="password" id="auth-password" placeholder="Your password" autocomplete="current-password" />
              <button class="auth-pwd-toggle" type="button" id="auth-pwd-toggle" aria-label="Toggle password">👁</button>
            </div>
          </div>

          <!-- Confirm Password (signup only) -->
          <div class="auth-field" id="auth-confirm-field" style="display:none;">
            <label class="auth-label" for="auth-confirm">Confirm Password</label>
            <div class="auth-pwd-wrap">
              <input class="auth-input" type="password" id="auth-confirm" placeholder="Repeat your password" autocomplete="new-password" />
              <button class="auth-pwd-toggle" type="button" id="auth-confirm-toggle" aria-label="Toggle confirm password">👁</button>
            </div>
          </div>

          <!-- Error -->
          <p class="auth-error" id="auth-error" style="display:none;"></p>

          <!-- Buttons -->
          <div class="auth-btn-row">
            <button class="auth-btn auth-btn-login" type="button" id="auth-login-btn">Log In</button>
            <button class="auth-btn auth-btn-signup" type="button" id="auth-signup-btn" style="display:none;">Sign Up</button>
          </div>
        </form>

        <!-- Toggle -->
        <p class="auth-toggle-link">
          <span id="auth-toggle-text">Don't have an account?</span>
          <button class="auth-toggle-btn" type="button" id="auth-toggle-btn">Sign Up</button>
        </p>
      </div>
    `;
    document.body.appendChild(modal);
  }

  /* ─────────────────── Modal show / hide ─────────────────── */
  let isSignupMode = false;

  function showModal(startSignup) {
    setMode(!!startSignup);
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.classList.add('auth-modal-visible');
    document.body.classList.add('auth-modal-open');
    setTimeout(() => { const el = document.getElementById(isSignupMode ? 'auth-name' : 'auth-email'); if (el) el.focus(); }, 350);
  }

  function hideModal() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.classList.remove('auth-modal-visible');
    document.body.classList.remove('auth-modal-open');
  }

  function setMode(signup) {
    isSignupMode = signup;
    const $ = (id) => document.getElementById(id);
    const err = $('auth-error');
    if (err) { err.style.display = 'none'; err.textContent = ''; }

    if (signup) {
      if ($('auth-title'))        $('auth-title').textContent    = 'Create Account';
      if ($('auth-subtitle'))     $('auth-subtitle').textContent = 'Join CYRIX and start your cybersecurity journey';
      if ($('auth-name-field'))   $('auth-name-field').style.display    = '';
      if ($('auth-confirm-field'))$('auth-confirm-field').style.display = '';
      if ($('auth-toggle-text'))  $('auth-toggle-text').textContent = 'Already have an account?';
      if ($('auth-toggle-btn'))   $('auth-toggle-btn').textContent  = 'Log In';
      if ($('auth-login-btn'))    $('auth-login-btn').style.display  = 'none';
      if ($('auth-signup-btn'))   $('auth-signup-btn').style.display = '';
      if ($('auth-password'))     $('auth-password').setAttribute('autocomplete', 'new-password');
    } else {
      if ($('auth-title'))        $('auth-title').textContent    = 'Welcome Back';
      if ($('auth-subtitle'))     $('auth-subtitle').textContent = 'Log in to track your progress and achievements';
      if ($('auth-name-field'))   $('auth-name-field').style.display    = 'none';
      if ($('auth-confirm-field'))$('auth-confirm-field').style.display = 'none';
      if ($('auth-toggle-text'))  $('auth-toggle-text').textContent = "Don't have an account?";
      if ($('auth-toggle-btn'))   $('auth-toggle-btn').textContent  = 'Sign Up';
      if ($('auth-login-btn'))    $('auth-login-btn').style.display  = '';
      if ($('auth-signup-btn'))   $('auth-signup-btn').style.display = 'none';
      if ($('auth-password'))     $('auth-password').setAttribute('autocomplete', 'current-password');
    }
  }

  function showError(msg) {
    const el = document.getElementById('auth-error');
    if (el) { el.textContent = msg; el.style.display = ''; }
  }

  /* ─────────────────── Login / Signup logic ─────────────────── */
  function performLogin(name, email) {
    const user = { name: name || email.split('@')[0], email, photoUrl: null };
    saveAuth(user);
    if (window.CyberProgress) window.CyberProgress.updateProfile(user.name, user.email);
    hideModal();
    updateHeroState(user);
    updateAvatarUI(user);
  }

  /* ─────────────────── Hero section state (index only) ─────────────────── */
  function updateHeroState(user) {
    if (!IS_HOME) return;
    const btn     = document.getElementById('hero-auth-btn');
    const welcome = document.getElementById('hero-welcome');
    if (user) {
      if (btn)     btn.style.display     = 'none';
      if (welcome) { welcome.textContent = `Welcome, ${user.name.split(' ')[0]}!`; welcome.style.display = ''; }
    } else {
      if (btn)     btn.style.display     = '';
      if (welcome) welcome.style.display = 'none';
    }
  }

  /* ─────────────────── Profile avatar + dropdown ─────────────────── */
  function injectProfileAvatar(user) {
    const controls = document.querySelector('.controls');
    if (!controls) return;
    const existing = document.getElementById('auth-avatar-wrap');
    if (existing) existing.remove();

    const wrap = document.createElement('div');
    wrap.id        = 'auth-avatar-wrap';
    wrap.className = 'auth-avatar-wrap';

    const initials = user ? getInitials(user.name) : '';
    const hasPhoto = user && user.photoUrl;

    const avatarInner = hasPhoto
      ? `<img src="${user.photoUrl}" alt="${user.name}" class="auth-avatar-img" />`
      : user
        ? `<span class="auth-avatar-initials">${initials}</span>`
        : `<svg class="auth-avatar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`;

    const dropdownInner = user ? `
      <a href="/profile.html#stats" class="auth-dropdown-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        Dashboard
      </a>
      <a href="/profile.html" class="auth-dropdown-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        My Profile
      </a>
      <a href="/profile.html#quiz-history" class="auth-dropdown-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
        Quiz History
      </a>
      <a href="/profile.html#progress" class="auth-dropdown-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        Progress Report
      </a>
      <a href="/profile.html#achievements" class="auth-dropdown-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
        Achievements
      </a>
      <a href="#" class="auth-dropdown-item" id="auth-settings-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        Settings
      </a>
      <div class="auth-dropdown-sep"></div>
      <button class="auth-dropdown-item auth-dropdown-logout" type="button" id="auth-logout-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Logout
      </button>
    ` : `
      <button class="auth-dropdown-item" type="button" id="avatar-signin-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        Sign In
      </button>
    `;

    wrap.innerHTML = `
      <button class="auth-avatar-btn" id="auth-avatar-btn" aria-label="Profile menu" aria-expanded="false">
        ${avatarInner}
        <span class="auth-avatar-glow"></span>
      </button>
      <div class="auth-dropdown" id="auth-dropdown" aria-hidden="true">
        <div class="auth-dropdown-header">
          <div class="auth-dropdown-avatar">${avatarInner}</div>
          <div class="auth-dropdown-info">
            <span class="auth-dropdown-name">${user ? user.name : 'Guest'}</span>
            <span class="auth-dropdown-email">${user ? user.email : 'Not signed in'}</span>
          </div>
        </div>
        <div class="auth-dropdown-sep"></div>
        ${dropdownInner}
      </div>
    `;

    const hamburger = controls.querySelector('#hamburger');
    hamburger ? controls.insertBefore(wrap, hamburger) : controls.appendChild(wrap);
  }

  function updateAvatarUI(user) {
    injectProfileAvatar(user);
    bindDropdown();
  }

  function bindDropdown() {
    const avatarBtn = document.getElementById('auth-avatar-btn');
    const dropdown  = document.getElementById('auth-dropdown');
    if (!avatarBtn || !dropdown) return;

    // Toggle open/close
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dropdown.classList.toggle('auth-dropdown-open');
      avatarBtn.setAttribute('aria-expanded', String(open));
      dropdown.setAttribute('aria-hidden', String(!open));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      const wrap = document.getElementById('auth-avatar-wrap');
      if (wrap && !wrap.contains(e.target)) {
        dropdown.classList.remove('auth-dropdown-open');
        avatarBtn.setAttribute('aria-expanded', 'false');
        dropdown.setAttribute('aria-hidden', 'true');
      }
    });

    // Logout
    const logoutBtn = document.getElementById('auth-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        clearAuth();
        dropdown.classList.remove('auth-dropdown-open');
        updateHeroState(null);
        updateAvatarUI(null);
      });
    }

    // Sign in from avatar (guest state)
    const signinBtn = document.getElementById('avatar-signin-btn');
    if (signinBtn) {
      signinBtn.addEventListener('click', () => {
        dropdown.classList.remove('auth-dropdown-open');
        showModal(false);
      });
    }
  }

  /* ─────────────────── Main init ─────────────────── */
  function init() {
    injectModal();

    const user = getAuth();

    // Always inject avatar
    injectProfileAvatar(user);
    bindDropdown();

    // Hero button (index.html only)
    if (IS_HOME) {
      updateHeroState(user);
      const heroBtn = document.getElementById('hero-auth-btn');
      if (heroBtn) heroBtn.addEventListener('click', () => showModal(false));
    }

    /* ── Modal bindings ── */
    const closeBtn = document.getElementById('auth-close');
    if (closeBtn) closeBtn.addEventListener('click', hideModal);

    const backdrop = document.getElementById('auth-backdrop');
    if (backdrop) backdrop.addEventListener('click', hideModal);

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideModal(); });

    // Mode toggle
    const toggleBtn = document.getElementById('auth-toggle-btn');
    if (toggleBtn) toggleBtn.addEventListener('click', () => setMode(!isSignupMode));

    // Password visibility
    const pwdToggle = document.getElementById('auth-pwd-toggle');
    const pwdInput  = document.getElementById('auth-password');
    if (pwdToggle && pwdInput) {
      pwdToggle.addEventListener('click', () => {
        const show = pwdInput.type === 'password';
        pwdInput.type = show ? 'text' : 'password';
        pwdToggle.textContent = show ? '🙈' : '👁';
      });
    }

    // Confirm password visibility
    const confirmToggle = document.getElementById('auth-confirm-toggle');
    const confirmInput  = document.getElementById('auth-confirm');
    if (confirmToggle && confirmInput) {
      confirmToggle.addEventListener('click', () => {
        const show = confirmInput.type === 'password';
        confirmInput.type = show ? 'text' : 'password';
        confirmToggle.textContent = show ? '🙈' : '👁';
      });
    }

    // Log In
    const loginBtn = document.getElementById('auth-login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        const email    = (document.getElementById('auth-email')    || {}).value || '';
        const password = (document.getElementById('auth-password') || {}).value || '';
        if (!email.trim())        { showError('Please enter your email.'); return; }
        if (!email.includes('@')) { showError('Please enter a valid email.'); return; }
        if (!password.trim())     { showError('Please enter your password.'); return; }
        const accounts = getAccounts();
        const account  = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
        if (!account)                        { showError('No account found. Please sign up first.'); return; }
        if (account.password !== password)   { showError('Incorrect password.'); return; }
        performLogin(account.name, account.email);
      });
    }

    // Sign Up
    const signupBtn = document.getElementById('auth-signup-btn');
    if (signupBtn) {
      signupBtn.addEventListener('click', () => {
        const name     = (document.getElementById('auth-name')    || {}).value || '';
        const email    = (document.getElementById('auth-email')   || {}).value || '';
        const password = (document.getElementById('auth-password')|| {}).value || '';
        const confirm  = (document.getElementById('auth-confirm') || {}).value || '';
        if (!name.trim())         { showError('Please enter your full name.'); return; }
        if (!email.trim())        { showError('Please enter your email.'); return; }
        if (!email.includes('@')) { showError('Please enter a valid email.'); return; }
        if (!password.trim())     { showError('Please enter a password.'); return; }
        if (password.length < 6)  { showError('Password must be at least 6 characters.'); return; }
        if (password !== confirm)  { showError('Passwords do not match.'); return; }
        const accounts = getAccounts();
        if (accounts.find(a => a.email.toLowerCase() === email.toLowerCase())) {
          showError('An account with this email already exists. Please log in.');
          return;
        }
        accounts.push({ name: name.trim(), email: email.trim(), password });
        saveAccounts(accounts);
        performLogin(name.trim(), email.trim());
      });
    }

    // Enter key submits form
    const form = document.getElementById('auth-form');
    if (form) {
      form.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          isSignupMode ? (signupBtn && signupBtn.click()) : (loginBtn && loginBtn.click());
        }
      });
    }
  }

  /* ─────────────────── Boot ─────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
