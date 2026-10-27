/**
 * FairShift 360 - Core Application Logic
 * Vanilla JavaScript (ES6+), zero build step required.
 * Fully compatible with direct browser execution, GitHub Pages, Netlify.
 */

(function () {
  'use strict';

  // Application State
  const state = {
    currentLang: localStorage.getItem('fairshift_lang') || 'en',
    currentUser: null,
    activeTab: 'dashboard',
    activeShift: null, // If clock-in is active: { startTime, date, onBreak, breakStartTime, totalBreakMinutes }
    timerInterval: null
  };

  // DOM Elements cache
  let dom = {};

  function init() {
    cacheDomElements();
    attachEventListeners();
    applyLanguage(state.currentLang);
    checkSavedSession();
    checkActiveShift();
    updateSupabaseStatusBadge();
  }

  function cacheDomElements() {
    dom = {
      loginPortalView: document.getElementById('login-portal-view'),
      appPortalView: document.getElementById('app-portal-view'),
      loginLangSelect: document.getElementById('login-lang-select'),
      appLangSelect: document.getElementById('app-lang-select'),
      loginSupabaseStatusBadge: document.getElementById('login-supabase-status-badge'),
      appSupabaseStatusBadge: document.getElementById('app-supabase-status-badge'),
      supabaseModal: document.getElementById('supabase-modal'),
      supabaseUrlInput: document.getElementById('supabase-url-input'),
      supabaseKeyInput: document.getElementById('supabase-key-input'),
      btnSaveSupabase: document.getElementById('btn-save-supabase'),
      btnDisconnectSupabase: document.getElementById('btn-disconnect-supabase'),
      btnCloseSupabaseModal: document.getElementById('btn-close-supabase-modal'),
      
      btnSelectExisting: document.getElementById('btn-select-existing'),
      btnSelectNew: document.getElementById('btn-select-new'),
      formSignin: document.getElementById('form-signin'),
      formRegister: document.getElementById('form-register'),
      btnToggleSigninPassword: document.getElementById('btn-toggle-signin-password'),
      btnToggleRegPassword: document.getElementById('btn-toggle-reg-password'),
      linkNeedHelp: document.getElementById('link-need-help'),
      
      cardSectorFactory: document.getElementById('card-sector-factory'),
      cardSectorSchool: document.getElementById('card-sector-school'),
      regSector: document.getElementById('reg-sector'),
      
      dashboardSection: document.getElementById('dashboard-section'),
      btnSignout: document.getElementById('btn-signout'),
      userProfileBadge: document.getElementById('user-profile-badge'),
      userNameDisplay: document.getElementById('user-name-display'),
      userRoleDisplay: document.getElementById('user-role-display'),
      userSectorBadge: document.getElementById('user-sector-badge'),
      
      navTabsContainer: document.getElementById('authenticated-nav'),
      navAdminTab: document.getElementById('nav-admin-tab'),
      
      // Clock in / out card
      clockTimerDisplay: document.getElementById('clock-timer-display'),
      clockStatusText: document.getElementById('clock-status-text'),
      btnClockIn: document.getElementById('btn-clock-in'),
      btnClockOut: document.getElementById('btn-clock-out'),
      btnTakeBreak: document.getElementById('btn-take-break'),
      
      // Views
      viewOverview: document.getElementById('view-overview'),
      viewShifts: document.getElementById('view-shifts'),
      viewPay: document.getElementById('view-pay'),
      viewSafety: document.getElementById('view-safety'),
      viewFeedback: document.getElementById('view-feedback'),
      viewSkills: document.getElementById('view-skills'),
      viewFatigue: document.getElementById('view-fatigue'),
      viewAdmin: document.getElementById('view-admin'),
      
      // Pay Discrepancy Modal
      discrepancyModal: document.getElementById('discrepancy-modal'),
      formDiscrepancy: document.getElementById('form-discrepancy'),
      btnCloseDiscrepancy: document.getElementById('btn-close-discrepancy'),
      
      // Add Skill Modal
      skillModal: document.getElementById('skill-modal'),
      formAddSkill: document.getElementById('form-add-skill'),
      btnCloseSkill: document.getElementById('btn-close-skill'),
      
      // Safety Form
      formSafetyReport: document.getElementById('form-safety-report'),
      safetyRefSearchInput: document.getElementById('safety-ref-search-input'),
      btnSearchSafetyRef: document.getElementById('btn-search-safety-ref'),
      safetySearchResultBox: document.getElementById('safety-search-result-box'),
      
      // Feedback Form
      formFeedback: document.getElementById('form-feedback'),
      
      // Toast container
      toastContainer: document.getElementById('toast-container')
    };
  }

  function attachEventListeners() {
    // Language change synchronizer
    const handleLangChange = (e) => {
      setLanguage(e.target.value);
    };
    if (dom.loginLangSelect) {
      dom.loginLangSelect.value = state.currentLang;
      dom.loginLangSelect.addEventListener('change', handleLangChange);
    }
    if (dom.appLangSelect) {
      dom.appLangSelect.value = state.currentLang;
      dom.appLangSelect.addEventListener('change', handleLangChange);
    }

    // Supabase config modals
    if (dom.loginSupabaseStatusBadge) {
      dom.loginSupabaseStatusBadge.addEventListener('click', openSupabaseModal);
    }
    if (dom.appSupabaseStatusBadge) {
      dom.appSupabaseStatusBadge.addEventListener('click', openSupabaseModal);
    }
    if (dom.btnCloseSupabaseModal) {
      dom.btnCloseSupabaseModal.addEventListener('click', closeSupabaseModal);
    }
    if (dom.btnSaveSupabase) {
      dom.btnSaveSupabase.addEventListener('click', handleConnectSupabase);
    }
    if (dom.btnDisconnectSupabase) {
      dom.btnDisconnectSupabase.addEventListener('click', handleDisconnectSupabase);
    }

    // User type question selection (Existing vs New User)
    if (dom.btnSelectExisting) {
      dom.btnSelectExisting.addEventListener('click', () => switchAuthTab('signin'));
    }
    if (dom.btnSelectNew) {
      dom.btnSelectNew.addEventListener('click', () => switchAuthTab('register'));
    }

    // Password visibility toggles
    if (dom.btnToggleSigninPassword) {
      dom.btnToggleSigninPassword.addEventListener('click', () => {
        const input = document.getElementById('signin-password');
        if (input.type === 'password') {
          input.type = 'text';
          dom.btnToggleSigninPassword.textContent = '🙈';
        } else {
          input.type = 'password';
          dom.btnToggleSigninPassword.textContent = '👁️';
        }
      });
    }

    if (dom.btnToggleRegPassword) {
      dom.btnToggleRegPassword.addEventListener('click', () => {
        const input = document.getElementById('reg-password');
        if (input.type === 'password') {
          input.type = 'text';
          dom.btnToggleRegPassword.textContent = '🙈';
        } else {
          input.type = 'password';
          dom.btnToggleRegPassword.textContent = '👁️';
        }
      });
    }

    // Sector selection cards in registration
    if (dom.cardSectorFactory && dom.cardSectorSchool) {
      dom.cardSectorFactory.addEventListener('click', () => {
        dom.cardSectorFactory.classList.add('selected');
        dom.cardSectorSchool.classList.remove('selected');
        if (dom.regSector) dom.regSector.value = 'factory';
      });
      dom.cardSectorSchool.addEventListener('click', () => {
        dom.cardSectorSchool.classList.add('selected');
        dom.cardSectorFactory.classList.remove('selected');
        if (dom.regSector) dom.regSector.value = 'school';
      });
    }

    // Help link
    if (dom.linkNeedHelp) {
      dom.linkNeedHelp.addEventListener('click', () => {
        showToast('Use any 1-Click Demo Account below or sign in with your enterprise credentials.', 'info');
      });
    }

    // Form signin & registration
    if (dom.formSignin) {
      dom.formSignin.addEventListener('submit', handleSignIn);
    }
    if (dom.formRegister) {
      dom.formRegister.addEventListener('submit', handleRegister);
    }

    // Sign out
    if (dom.btnSignout) {
      dom.btnSignout.addEventListener('click', handleSignOut);
    }

    // Quick demo account buttons
    document.querySelectorAll('[data-demo-email]').forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.getAttribute('data-demo-email');
        const pass = btn.getAttribute('data-demo-pass');
        quickLoginDemo(email, pass);
      });
    });

    // Nav tabs
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) switchTab(tab);
      });
    });

    // Attendance buttons
    if (dom.btnClockIn) dom.btnClockIn.addEventListener('click', handleClockIn);
    if (dom.btnClockOut) dom.btnClockOut.addEventListener('click', handleClockOut);
    if (dom.btnTakeBreak) dom.btnTakeBreak.addEventListener('click', handleToggleBreak);

    // Pay Discrepancy
    const openDisputeBtn = document.getElementById('btn-open-discrepancy-modal');
    if (openDisputeBtn) {
      openDisputeBtn.addEventListener('click', () => {
        dom.discrepancyModal.classList.remove('hidden');
      });
    }
    if (dom.btnCloseDiscrepancy) {
      dom.btnCloseDiscrepancy.addEventListener('click', () => {
        dom.discrepancyModal.classList.add('hidden');
      });
    }
    if (dom.formDiscrepancy) {
      dom.formDiscrepancy.addEventListener('submit', handleDiscrepancySubmit);
    }

    // Skill Modal
    const openSkillBtn = document.getElementById('btn-open-skill-modal');
    if (openSkillBtn) {
      openSkillBtn.addEventListener('click', () => {
        dom.skillModal.classList.remove('hidden');
      });
    }
    if (dom.btnCloseSkill) {
      dom.btnCloseSkill.addEventListener('click', () => {
        dom.skillModal.classList.add('hidden');
      });
    }
    if (dom.formAddSkill) {
      dom.formAddSkill.addEventListener('submit', handleAddSkill);
    }

    // Safety Form
    if (dom.formSafetyReport) {
      dom.formSafetyReport.addEventListener('submit', handleSafetyReportSubmit);
    }
    if (dom.btnSearchSafetyRef) {
      dom.btnSearchSafetyRef.addEventListener('click', handleSearchSafetyReport);
    }

    // Anonymous Feedback
    if (dom.formFeedback) {
      dom.formFeedback.addEventListener('submit', handleFeedbackSubmit);
    }
  }

  // Multilingual Handler
  function setLanguage(lang) {
    state.currentLang = lang;
    localStorage.setItem('fairshift_lang', lang);
    if (dom.loginLangSelect) dom.loginLangSelect.value = lang;
    if (dom.appLangSelect) dom.appLangSelect.value = lang;
    applyLanguage(lang);
    if (state.currentUser) {
      renderCurrentDashboard();
    }
  }

  function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = window.getTranslation ? window.getTranslation(lang, key) : key;
      if (el.tagName === 'INPUT' && el.type === 'submit') {
        el.value = text;
      } else if (el.hasAttribute('placeholder')) {
        el.setAttribute('placeholder', text);
      } else {
        el.textContent = text;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = window.getTranslation ? window.getTranslation(lang, key) : key;
      el.setAttribute('placeholder', text);
    });
  }

  function t(key) {
    return window.getTranslation ? window.getTranslation(state.currentLang, key) : key;
  }

  // Supabase Status & Modal
  function updateSupabaseStatusBadge() {
    const isLive = window.FairShiftSupabase && window.FairShiftSupabase.isLive();
    const badges = [dom.loginSupabaseStatusBadge, dom.appSupabaseStatusBadge];
    badges.forEach(b => {
      if (!b) return;
      if (isLive) {
        b.className = 'badge-mode badge-live';
        b.innerHTML = '● ' + t('connected_supabase');
      } else {
        b.className = 'badge-mode badge-demo';
        b.innerHTML = '● ' + t('demo_mode_active');
      }
    });
  }

  function openSupabaseModal() {
    dom.supabaseModal.classList.remove('hidden');
    const isLive = window.FairShiftSupabase && window.FairShiftSupabase.isLive();
    if (isLive) {
      dom.supabaseUrlInput.value = window.FairShiftSupabase.url;
      dom.supabaseKeyInput.value = window.FairShiftSupabase.anonKey;
      dom.btnDisconnectSupabase.classList.remove('hidden');
    } else {
      dom.supabaseUrlInput.value = '';
      dom.supabaseKeyInput.value = '';
      dom.btnDisconnectSupabase.classList.add('hidden');
    }
  }

  function closeSupabaseModal() {
    dom.supabaseModal.classList.add('hidden');
  }

  function handleConnectSupabase() {
    const url = dom.supabaseUrlInput.value.trim();
    const key = dom.supabaseKeyInput.value.trim();
    if (!url || !key) {
      showToast('Please provide both Project URL and Public Anon Key', 'error');
      return;
    }
    try {
      window.FairShiftSupabase.connectLive(url, key);
      updateSupabaseStatusBadge();
      closeSupabaseModal();
      showToast('Successfully connected to Supabase!', 'success');
    } catch (err) {
      showToast('Connection failed: ' + err.message, 'error');
    }
  }

  function handleDisconnectSupabase() {
    window.FairShiftSupabase.disconnectLive();
    updateSupabaseStatusBadge();
    closeSupabaseModal();
    showToast('Switched back to Simulated Demo Mode.', 'success');
  }

  // Auth Handling - Toggle between Existing User & New User
  function switchAuthTab(tab) {
    if (tab === 'signin') {
      if (dom.btnSelectExisting) dom.btnSelectExisting.classList.add('active');
      if (dom.btnSelectNew) dom.btnSelectNew.classList.remove('active');
      dom.formSignin.classList.remove('hidden');
      dom.formRegister.classList.add('hidden');
    } else {
      if (dom.btnSelectNew) dom.btnSelectNew.classList.add('active');
      if (dom.btnSelectExisting) dom.btnSelectExisting.classList.remove('active');
      dom.formRegister.classList.remove('hidden');
      dom.formSignin.classList.add('hidden');
    }
  }

  function handleSignIn(e) {
    e.preventDefault();
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;

    const users = window.FairShiftSupabase.getUsers();
    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!matched) {
      showToast('Account not found. Please check your credentials or click a Demo Account below.', 'error');
      return;
    }

    if (matched.password !== password) {
      showToast('Incorrect password. Please try again.', 'error');
      return;
    }

    loginUser(matched);
  }

  function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm-password').value;
    const sector = dom.regSector ? dom.regSector.value : 'factory';
    const dob = document.getElementById('reg-dob').value;
    const phone = document.getElementById('reg-phone').value.trim();
    const address = document.getElementById('reg-address').value.trim();

    if (password !== confirm) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    const users = window.FairShiftSupabase.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      showToast('An account with this email already exists.', 'error');
      return;
    }

    // Enforce role security: Public registration strictly creates worker or staff.
    // Administrative and supervisor roles require sign-off.
    const assignedRole = sector === 'school' ? 'staff' : 'worker';
    const roleTitle = sector === 'school' ? 'Registered Faculty' : 'Production Floor Worker';

    const newUser = {
      id: 'usr_' + Date.now(),
      name,
      email,
      password,
      sector,
      role: assignedRole,
      roleTitle,
      department: sector === 'school' ? 'Academics' : 'Assembly Operations',
      hourlyRate: sector === 'school' ? 320 : 220,
      phone: phone || 'Unlisted',
      address: address || 'Confidential',
      dob: dob || '',
      avatar: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      weeklyHours: 40
    };

    users.push(newUser);
    window.FairShiftSupabase.saveUsers(users);
    showToast('Registration successful! Welcome to FairShift 360.', 'success');
    loginUser(newUser);
  }

  function quickLoginDemo(email, password) {
    const users = window.FairShiftSupabase.getUsers();
    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      loginUser(matched);
      showToast(`Logged in as ${matched.name} (${matched.roleTitle})`, 'success');
    } else {
      showToast('Demo account not found. Resetting demo data...', 'error');
      window.FairShiftSupabase.resetDemoData();
      const freshUser = window.FairShiftSupabase.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
      if (freshUser) loginUser(freshUser);
    }
  }

  function loginUser(user) {
    state.currentUser = user;
    sessionStorage.setItem('fairshift_active_user', JSON.stringify(user));
    
    // UI Transition: Hide Dedicated Login Page, Reveal Application Portal
    if (dom.loginPortalView) dom.loginPortalView.classList.add('hidden');
    if (dom.appPortalView) dom.appPortalView.classList.remove('hidden');
    
    dom.userNameDisplay.textContent = user.name;
    dom.userRoleDisplay.textContent = `${user.roleTitle} (${user.role.toUpperCase()})`;
    dom.userSectorBadge.textContent = user.sector === 'school' ? 'School Sector' : 'Factory Sector';
    dom.userSectorBadge.className = `sector-badge ${user.sector}`;

    // Show/hide Admin Console tab based on authorized role (Supervisor, Admin/HR)
    if (user.role === 'admin' || user.role === 'supervisor') {
      dom.navAdminTab.classList.remove('hidden');
    } else {
      dom.navAdminTab.classList.add('hidden');
      if (state.activeTab === 'admin') {
        state.activeTab = 'dashboard';
      }
    }

    switchTab(state.activeTab || 'dashboard');
    renderCurrentDashboard();
    checkActiveShift();
  }

  function handleSignOut() {
    state.currentUser = null;
    sessionStorage.removeItem('fairshift_active_user');
    
    // UI Transition: Hide Application Portal, Reveal Dedicated Login Page
    if (dom.appPortalView) dom.appPortalView.classList.add('hidden');
    if (dom.loginPortalView) dom.loginPortalView.classList.remove('hidden');
    
    switchAuthTab('signin');
    showToast('You have signed out safely.', 'success');
  }

  function checkSavedSession() {
    const saved = sessionStorage.getItem('fairshift_active_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        loginUser(user);
      } catch (e) {
        sessionStorage.removeItem('fairshift_active_user');
      }
    }
  }

  // Tab Switching
  function switchTab(tabName) {
    state.activeTab = tabName;
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Hide all views
    const views = [
      dom.viewOverview,
      dom.viewShifts,
      dom.viewPay,
      dom.viewSafety,
      dom.viewFeedback,
      dom.viewSkills,
      dom.viewFatigue,
      dom.viewAdmin
    ];
    views.forEach(v => {
      if (v) v.classList.add('hidden');
    });

    switch (tabName) {
      case 'dashboard':
        if (dom.viewOverview) dom.viewOverview.classList.remove('hidden');
        renderOverview();
        break;
      case 'shifts':
        if (dom.viewShifts) dom.viewShifts.classList.remove('hidden');
        renderShiftsView();
        break;
      case 'pay':
        if (dom.viewPay) dom.viewPay.classList.remove('hidden');
        renderPayView();
        break;
      case 'safety':
        if (dom.viewSafety) dom.viewSafety.classList.remove('hidden');
        renderSafetyView();
        break;
      case 'feedback':
        if (dom.viewFeedback) dom.viewFeedback.classList.remove('hidden');
        renderFeedbackView();
        break;
      case 'skills':
        if (dom.viewSkills) dom.viewSkills.classList.remove('hidden');
        renderSkillsView();
        break;
      case 'fatigue':
        if (dom.viewFatigue) dom.viewFatigue.classList.remove('hidden');
        renderFatigueView();
        break;
      case 'admin':
        if (dom.viewAdmin) dom.viewAdmin.classList.remove('hidden');
        renderAdminView();
        break;
    }
  }

  function renderCurrentDashboard() {
    switchTab(state.activeTab);
  }

  // Attendance Clock-in / Clock-out Engine
  function checkActiveShift() {
    const savedShift = localStorage.getItem('fairshift_active_clockin_' + (state.currentUser ? state.currentUser.id : ''));
    if (savedShift) {
      try {
        state.activeShift = JSON.parse(savedShift);
        startClockTimer();
        updateClockUI();
      } catch (e) {
        state.activeShift = null;
      }
    } else {
      state.activeShift = null;
      updateClockUI();
    }
  }

  function handleClockIn() {
    if (!state.currentUser) return;
    const now = new Date();
    state.activeShift = {
      startTime: now.getTime(),
      date: now.toISOString().slice(0, 10),
      clockInTime: now.toTimeString().slice(0, 5),
      onBreak: false,
      breakStartTime: null,
      totalBreakMinutes: 0
    };
    localStorage.setItem('fairshift_active_clockin_' + state.currentUser.id, JSON.stringify(state.activeShift));
    startClockTimer();
    updateClockUI();
    showToast('Shift started. Work hours are being recorded accurately.', 'success');
  }

  function handleToggleBreak() {
    if (!state.activeShift) return;
    const now = new Date().getTime();
    if (!state.activeShift.onBreak) {
      state.activeShift.onBreak = true;
      state.activeShift.breakStartTime = now;
      showToast('15m rest break started. Refresh and rehydrate!', 'info');
    } else {
      const breakDuration = Math.round((now - state.activeShift.breakStartTime) / (1000 * 60));
      state.activeShift.totalBreakMinutes += breakDuration;
      state.activeShift.onBreak = false;
      state.activeShift.breakStartTime = null;
      showToast('Shift resumed. Safe working!', 'success');
    }
    localStorage.setItem('fairshift_active_clockin_' + state.currentUser.id, JSON.stringify(state.activeShift));
    updateClockUI();
  }

  function handleClockOut() {
    if (!state.activeShift || !state.currentUser) return;
    const now = new Date();
    const elapsedMs = now.getTime() - state.activeShift.startTime;
    const totalHoursFloat = (elapsedMs / (1000 * 60 * 60)) - (state.activeShift.totalBreakMinutes / 60);
    const validHours = Math.max(0.25, parseFloat(totalHoursFloat.toFixed(2)));

    const regularHours = Math.min(8.0, validHours);
    const overtimeHours = validHours > 8.0 ? parseFloat((validHours - 8.0).toFixed(2)) : 0;

    const newShiftRecord = {
      id: 'shf_' + Date.now(),
      userId: state.currentUser.id,
      sector: state.currentUser.sector,
      date: state.activeShift.date,
      type: state.currentUser.sector === 'school' ? 'Academic Teaching Session' : 'Standard Factory Shift',
      clockIn: state.activeShift.clockInTime,
      clockOut: now.toTimeString().slice(0, 5),
      breakMinutes: state.activeShift.totalBreakMinutes,
      regularHours: regularHours,
      overtimeHours: overtimeHours,
      status: 'pending',
      notes: 'Recorded via FairShift 360 clock-in engine.'
    };

    window.FairShiftSupabase.addShift(newShiftRecord);
    localStorage.removeItem('fairshift_active_clockin_' + state.currentUser.id);
    state.activeShift = null;
    if (state.timerInterval) clearInterval(state.timerInterval);

    updateClockUI();
    renderOverview();
    showToast(`Shift concluded! ${validHours} hrs recorded (OT: ${overtimeHours} hrs). Sent for supervisor approval.`, 'success');
  }

  function startClockTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      if (!state.activeShift) {
        clearInterval(state.timerInterval);
        return;
      }
      const now = new Date().getTime();
      const diffMs = now - state.activeShift.startTime;
      const totalSec = Math.floor(diffMs / 1000);
      const hours = String(Math.floor(totalSec / 3600)).padStart(2, '0');
      const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
      const secs = String(totalSec % 60).padStart(2, '0');
      if (dom.clockTimerDisplay) {
        dom.clockTimerDisplay.textContent = `${hours}:${mins}:${secs}`;
      }

      // Check for fatigue alert threshold (> 6 consecutive hours without break)
      if (totalSec >= 6 * 3600 && !state.activeShift.onBreak) {
        const fatigueAlert = document.getElementById('fatigue-alert-strip');
        if (fatigueAlert) {
          fatigueAlert.classList.remove('hidden');
          fatigueAlert.className = 'alert-strip danger';
          fatigueAlert.innerHTML = `⚠️ <strong>FATIGUE SAFEGUARD TRIGGERED:</strong> You have worked over 6 consecutive hours. Continuous work impairs safety. Please take an immediate 15-minute rest break.`;
        }
      }
    }, 1000);
  }

  function updateClockUI() {
    if (!dom.clockStatusText) return;
    if (state.activeShift) {
      if (state.activeShift.onBreak) {
        dom.clockStatusText.textContent = t('shift_on_break');
        dom.btnTakeBreak.textContent = t('shift_end_break');
      } else {
        dom.clockStatusText.textContent = t('shift_in_progress');
        dom.btnTakeBreak.textContent = t('shift_start_break');
      }
      dom.btnClockIn.classList.add('hidden');
      dom.btnClockOut.classList.remove('hidden');
      dom.btnTakeBreak.classList.remove('hidden');
    } else {
      dom.clockTimerDisplay.textContent = '00:00:00';
      dom.clockStatusText.textContent = t('today_status');
      dom.btnClockIn.classList.remove('hidden');
      dom.btnClockOut.classList.add('hidden');
      dom.btnTakeBreak.classList.add('hidden');
    }
  }

  // Overview View Renderer
  function renderOverview() {
    if (!state.currentUser) return;
    const shifts = window.FairShiftSupabase.getShifts(state.currentUser.sector, state.currentUser.id);
    const reports = window.FairShiftSupabase.getSafetyReports(state.currentUser.sector, state.currentUser.id, state.currentUser.role);
    
    // Calculate total hours worked
    let totalRegular = 0;
    let totalOvertime = 0;
    shifts.forEach(s => {
      totalRegular += parseFloat(s.regularHours || 0);
      totalOvertime += parseFloat(s.overtimeHours || 0);
    });

    const totalHours = totalRegular + totalOvertime;
    const rate = state.currentUser.hourlyRate || 250;
    const estimatedPay = (totalRegular * rate) + (totalOvertime * rate * 1.5);

    // Update stats
    const elHours = document.getElementById('dash-stat-hours');
    const elPay = document.getElementById('dash-stat-pay');
    const elReports = document.getElementById('dash-stat-reports');
    const elFatigue = document.getElementById('dash-stat-fatigue');

    if (elHours) elHours.textContent = `${totalHours.toFixed(1)} hrs`;
    if (elPay) elPay.textContent = `₹${Math.round(estimatedPay).toLocaleString('en-IN')}`;
    if (elReports) elReports.textContent = reports.length;
    if (elFatigue) {
      if (totalHours > 44) {
        elFatigue.textContent = t('stat_fatigue_danger');
        elFatigue.parentElement.className = 'stat-card danger';
      } else if (totalHours > 36) {
        elFatigue.textContent = t('stat_fatigue_warning');
        elFatigue.parentElement.className = 'stat-card warning';
      } else {
        elFatigue.textContent = t('stat_fatigue_safe');
        elFatigue.parentElement.className = 'stat-card';
      }
    }

    renderShiftsTable('overview-recent-shifts-table', shifts.slice(0, 5));
  }

  // Shifts Table Renderer
  function renderShiftsTable(tableId, shiftsList) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;
    if (shiftsList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color: var(--text-light);">No shift records found. Clock in to begin recording.</td></tr>`;
      return;
    }
    tbody.innerHTML = shiftsList.map(s => `
      <tr>
        <td><strong>${s.date}</strong></td>
        <td>${s.type}</td>
        <td>${s.clockIn}</td>
        <td>${s.clockOut || 'Active'}</td>
        <td>${s.regularHours}h</td>
        <td><span style="${s.overtimeHours > 0 ? 'color: var(--teal-accent); font-weight:700;' : ''}">${s.overtimeHours}h</span></td>
        <td><span class="status-pill ${s.status}">${t('status_' + s.status)}</span></td>
      </tr>
    `).join('');
  }

  function renderShiftsView() {
    if (!state.currentUser) return;
    const shifts = window.FairShiftSupabase.getShifts(state.currentUser.sector, state.currentUser.id);
    renderShiftsTable('full-shifts-table', shifts);
  }

  // Explain My Pay View
  function renderPayView() {
    if (!state.currentUser) return;
    const shifts = window.FairShiftSupabase.getShifts(state.currentUser.sector, state.currentUser.id);
    
    let regularHours = 0;
    let overtimeHours = 0;
    shifts.forEach(s => {
      regularHours += parseFloat(s.regularHours || 0);
      overtimeHours += parseFloat(s.overtimeHours || 0);
    });

    const rate = state.currentUser.hourlyRate || 250;
    const baseEarnings = regularHours * rate;
    const overtimeEarnings = overtimeHours * (rate * 1.5);
    const grossTotal = baseEarnings + overtimeEarnings;

    // Statutory Deductions (EPF 12% on basic, ESI 0.75%)
    const epf = Math.round(baseEarnings * 0.12);
    const esi = Math.round(grossTotal * 0.0075);
    const welfare = 50;
    const totalDeductions = epf + esi + welfare;
    const netPay = Math.max(0, grossTotal - totalDeductions);

    document.getElementById('pay-hourly-rate').textContent = `₹${rate}/hr`;
    document.getElementById('pay-regular-hours').textContent = `${regularHours.toFixed(1)} hrs`;
    document.getElementById('pay-regular-subtotal').textContent = `₹${Math.round(baseEarnings).toLocaleString('en-IN')}`;
    
    document.getElementById('pay-overtime-hours').textContent = `${overtimeHours.toFixed(1)} hrs`;
    document.getElementById('pay-overtime-subtotal').textContent = `₹${Math.round(overtimeEarnings).toLocaleString('en-IN')}`;
    
    document.getElementById('pay-gross-total').textContent = `₹${Math.round(grossTotal).toLocaleString('en-IN')}`;
    document.getElementById('pay-epf').textContent = `- ₹${epf.toLocaleString('en-IN')}`;
    document.getElementById('pay-esi').textContent = `- ₹${esi.toLocaleString('en-IN')}`;
    document.getElementById('pay-welfare').textContent = `- ₹${welfare.toLocaleString('en-IN')}`;
    document.getElementById('pay-net-takehome').textContent = `₹${Math.round(netPay).toLocaleString('en-IN')}`;

    // Render past disputes
    renderDisputesTable();
  }

  function handleDiscrepancySubmit(e) {
    e.preventDefault();
    if (!state.currentUser) return;
    const hours = parseFloat(document.getElementById('dispute-hours').value);
    const reason = document.getElementById('dispute-reason').value.trim();

    const rate = state.currentUser.hourlyRate || 250;
    const disputedAmount = Math.round(hours * rate);

    const disputeRecord = {
      id: 'dsp_' + Date.now(),
      sector: state.currentUser.sector,
      userId: state.currentUser.id,
      workerName: state.currentUser.name,
      date: new Date().toISOString().slice(0, 10),
      hoursDisputed: hours,
      amountDisputed: disputedAmount,
      reason: reason,
      status: 'pending',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    window.FairShiftSupabase.addDispute(disputeRecord);
    dom.discrepancyModal.classList.add('hidden');
    dom.formDiscrepancy.reset();
    renderDisputesTable();
    showToast('Discrepancy ticket filed with Payroll. Ticket ID: ' + disputeRecord.id, 'success');
  }

  function renderDisputesTable() {
    const tbody = document.getElementById('disputes-table-body');
    if (!tbody || !state.currentUser) return;
    const disputes = window.FairShiftSupabase.getDisputes(state.currentUser.sector, state.currentUser.id);
    if (disputes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 15px; color: var(--text-light);">No active pay disputes recorded.</td></tr>`;
      return;
    }
    tbody.innerHTML = disputes.map(d => `
      <tr>
        <td><strong>${d.date}</strong></td>
        <td>${d.hoursDisputed} hrs</td>
        <td>₹${d.amountDisputed}</td>
        <td>${d.reason}</td>
        <td><span class="status-pill ${d.status}">${d.status}</span></td>
      </tr>
    `).join('');
  }

  // Safe Voice (Safety Reporting)
  function renderSafetyView() {
    if (!state.currentUser) return;
    const reports = window.FairShiftSupabase.getSafetyReports(state.currentUser.sector, state.currentUser.id, state.currentUser.role);
    renderSafetyReportsList(reports);
  }

  function handleSafetyReportSubmit(e) {
    e.preventDefault();
    if (!state.currentUser) return;

    const category = document.getElementById('safety-category').value;
    const priority = document.getElementById('safety-priority').value;
    const location = document.getElementById('safety-location').value.trim();
    const description = document.getElementById('safety-description').value.trim();
    const isAnonymous = document.getElementById('safety-anonymous-checkbox').checked;

    // Generate reference code
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const refCode = `SV-${new Date().getFullYear()}-${randomCode}`;

    const report = {
      id: 'rep_' + Date.now(),
      refCode: refCode,
      sector: state.currentUser.sector,
      authorId: isAnonymous ? null : state.currentUser.id,
      authorName: isAnonymous ? 'Anonymous Reporter' : state.currentUser.name,
      isAnonymous: isAnonymous,
      category: category,
      priority: priority,
      location: location,
      description: description,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'reported',
      timeline: [
        {
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          text: `Report filed ${isAnonymous ? 'Anonymously' : 'by verified worker'}. Severity: ${priority.toUpperCase()}.`
        }
      ]
    };

    window.FairShiftSupabase.addSafetyReport(report);
    dom.formSafetyReport.reset();
    renderSafetyView();
    showToast(`Safety report logged! Your confidential reference number is: ${refCode}`, 'success');
  }

  function handleSearchSafetyReport() {
    const query = dom.safetyRefSearchInput.value.trim().toUpperCase();
    if (!query) {
      showToast('Please enter a Reference Code (e.g. SV-2026-8941)', 'error');
      return;
    }
    const allReports = window.FairShiftSupabase.getSafetyReports(state.currentUser.sector);
    const found = allReports.find(r => r.refCode.toUpperCase() === query);

    if (!found) {
      dom.safetySearchResultBox.classList.remove('hidden');
      dom.safetySearchResultBox.innerHTML = `<div style="padding:15px; color:var(--danger); font-weight:600;">No report found with Reference Code: ${query}</div>`;
      return;
    }

    dom.safetySearchResultBox.classList.remove('hidden');
    dom.safetySearchResultBox.innerHTML = `
      <div style="background:var(--bg-muted); padding:16px; border-radius:var(--radius-md); border-left:4px solid var(--teal-accent);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <strong>Ref: ${found.refCode}</strong>
          <span class="status-pill ${found.status}">${t('status_' + found.status)}</span>
        </div>
        <p style="font-size:0.9rem; margin-bottom:6px;"><strong>${found.category}</strong> (Priority: ${found.priority.toUpperCase()})</p>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:8px;">📍 ${found.location}</p>
        <p style="font-size:0.85rem; margin-bottom:12px;">"${found.description}"</p>
        <div style="font-size:0.8rem; background:white; padding:10px; border-radius:4px; border:1px solid var(--border-color);">
          <strong style="display:block; margin-bottom:6px;">Remediation Timeline:</strong>
          ${(found.timeline || []).map(tl => `<div style="margin-bottom:4px; color:var(--text-muted); font-size:0.75rem;">• <em>${tl.date}</em>: ${tl.text}</div>`).join('')}
        </div>
      </div>
    `;
  }

  function renderSafetyReportsList(reports) {
    const container = document.getElementById('safety-reports-list');
    if (!container) return;
    if (reports.length === 0) {
      container.innerHTML = `<p style="color:var(--text-light); text-align:center; padding:20px;">No safety reports logged in this workspace yet.</p>`;
      return;
    }
    container.innerHTML = reports.map(r => `
      <div style="background:white; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; margin-bottom:12px; box-shadow:var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div>
            <strong style="color:var(--primary-navy); font-size:0.95rem;">${r.category}</strong>
            <span style="font-size:0.75rem; color:var(--text-muted); margin-left:8px; font-family:monospace;">${r.refCode}</span>
          </div>
          <span class="status-pill ${r.status}">${t('status_' + r.status)}</span>
        </div>
        <p style="font-size:0.85rem; color:var(--text-main); margin-bottom:8px;">${r.description}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; color:var(--text-muted);">
          <span>📍 ${r.location}</span>
          <span>Filed: ${r.createdAt} ${r.isAnonymous ? '• <em>Anonymous</em>' : ''}</span>
        </div>
      </div>
    `).join('');
  }

  // Anonymous Feedback
  function renderFeedbackView() {
    if (!state.currentUser) return;
    const feedbacks = window.FairShiftSupabase.getFeedback(state.currentUser.sector);
    const container = document.getElementById('feedback-feed');
    if (!container) return;
    if (feedbacks.length === 0) {
      container.innerHTML = `<p style="color:var(--text-light); text-align:center; padding:20px;">No anonymous feedback submitted yet.</p>`;
      return;
    }
    container.innerHTML = feedbacks.map(f => `
      <div style="background:white; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:14px; margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <strong style="color:var(--teal-dark); font-size:0.85rem;">🔒 ${f.category}</strong>
          <span style="font-size:0.75rem; color:var(--text-light);">${f.createdAt}</span>
        </div>
        <p style="font-size:0.88rem; color:var(--text-main);">"${f.text}"</p>
      </div>
    `).join('');
  }

  function handleFeedbackSubmit(e) {
    e.preventDefault();
    if (!state.currentUser) return;
    const category = document.getElementById('feedback-category').value;
    const text = document.getElementById('feedback-text').value.trim();

    const record = {
      id: 'fdb_' + Date.now(),
      sector: state.currentUser.sector,
      category: category,
      text: text,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'received'
    };

    window.FairShiftSupabase.addFeedback(record);
    dom.formFeedback.reset();
    renderFeedbackView();
    showToast('Feedback submitted anonymously! Identity strictly protected.', 'success');
  }

  // Skill Passport
  function renderSkillsView() {
    if (!state.currentUser) return;
    const skills = window.FairShiftSupabase.getSkills(state.currentUser.id);
    const container = document.getElementById('skills-cards-container');
    if (!container) return;
    if (skills.length === 0) {
      container.innerHTML = `<p style="color:var(--text-light); grid-column: 1 / -1; text-align:center; padding:20px;">No credentials registered in Skill Passport yet. Click "+ Register Training or Skill" to add one.</p>`;
      return;
    }
    container.innerHTML = skills.map(s => `
      <div class="skill-passport-card ${s.verified ? 'verified' : ''}">
        <div>
          <div class="skill-header">
            <span class="skill-title-text">${s.title}</span>
            ${s.verified ? '<span class="status-pill verified">Verified</span>' : '<span class="status-pill pending">Pending</span>'}
          </div>
          <p class="skill-meta">Issued by: <strong>${s.issuer}</strong></p>
          <p class="skill-meta">Date Completed: ${s.dateCompleted}</p>
          <p class="skill-meta">Valid Until: ${s.validUntil || 'Lifetime'}</p>
        </div>
        <div style="font-size:0.75rem; color:var(--teal-accent); font-weight:600; margin-top:10px;">
          ✓ SDG 8 Verified Vocational Competency
        </div>
      </div>
    `).join('');
  }

  function handleAddSkill(e) {
    e.preventDefault();
    if (!state.currentUser) return;
    const title = document.getElementById('skill-input-title').value.trim();
    const issuer = document.getElementById('skill-input-issuer').value.trim();
    const dateCompleted = document.getElementById('skill-input-date').value;
    const validUntil = document.getElementById('skill-input-expiry').value;

    const skill = {
      id: 'skl_' + Date.now(),
      userId: state.currentUser.id,
      sector: state.currentUser.sector,
      title: title,
      issuer: issuer,
      dateCompleted: dateCompleted,
      validUntil: validUntil || 'Lifetime',
      verified: true
    };

    window.FairShiftSupabase.addSkill(skill);
    dom.skillModal.classList.add('hidden');
    dom.formAddSkill.reset();
    renderSkillsView();
    showToast('Credential verified and added to your Skill Passport!', 'success');
  }

  // Fatigue View
  function renderFatigueView() {
    if (!state.currentUser) return;
    const shifts = window.FairShiftSupabase.getShifts(state.currentUser.sector, state.currentUser.id);
    let totalWeekly = 0;
    shifts.forEach(s => {
      totalWeekly += (parseFloat(s.regularHours || 0) + parseFloat(s.overtimeHours || 0));
    });

    const weeklyProgress = Math.min(100, Math.round((totalWeekly / 48) * 100));
    const progressBar = document.getElementById('fatigue-weekly-bar');
    const weeklyText = document.getElementById('fatigue-weekly-hours-text');

    if (progressBar) {
      progressBar.style.width = weeklyProgress + '%';
      if (weeklyProgress >= 90) {
        progressBar.style.backgroundColor = 'var(--danger)';
      } else if (weeklyProgress >= 75) {
        progressBar.style.backgroundColor = 'var(--warning)';
      } else {
        progressBar.style.backgroundColor = 'var(--teal-accent)';
      }
    }
    if (weeklyText) weeklyText.textContent = `${totalWeekly.toFixed(1)} / 48 hrs (${weeklyProgress}%)`;
  }

  // Admin & Supervisor Management Console
  function renderAdminView() {
    if (!state.currentUser || (state.currentUser.role !== 'admin' && state.currentUser.role !== 'supervisor')) {
      return;
    }

    const currentSector = state.currentUser.sector;
    const users = window.FairShiftSupabase.getUsers().filter(u => u.sector === currentSector);
    const shifts = window.FairShiftSupabase.getShifts(currentSector);
    const hazards = window.FairShiftSupabase.getSafetyReports(currentSector);
    const disputes = window.FairShiftSupabase.getDisputes(currentSector);

    const pendingShifts = shifts.filter(s => s.status === 'pending');
    const openHazards = hazards.filter(h => h.status !== 'resolved');
    const openDisputes = disputes.filter(d => d.status === 'pending');

    // Counts
    document.getElementById('admin-workers-count').textContent = users.length;
    document.getElementById('admin-pending-shifts-count').textContent = pendingShifts.length;
    document.getElementById('admin-open-hazards-count').textContent = openHazards.length;
    document.getElementById('admin-open-disputes-count').textContent = openDisputes.length;

    // Shift Approval Queue
    const shiftsQueue = document.getElementById('admin-shifts-queue-body');
    if (shiftsQueue) {
      if (pendingShifts.length === 0) {
        shiftsQueue.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:15px; color:var(--text-light);">No pending shifts awaiting verification. All clean!</td></tr>`;
      } else {
        shiftsQueue.innerHTML = pendingShifts.map(s => {
          const user = users.find(u => u.id === s.userId) || { name: 'Worker', roleTitle: 'Personnel' };
          return `
            <tr>
              <td><strong>${user.name}</strong><br><small style="color:var(--text-light);">${user.roleTitle}</small></td>
              <td>${s.date}</td>
              <td>${s.regularHours}h</td>
              <td>${s.overtimeHours}h</td>
              <td>${s.notes || '-'}</td>
              <td>
                <button class="btn-header btn-primary-header" style="font-size:0.75rem; padding:4px 8px;" onclick="window.approveShift('${s.id}')">
                  Approve
                </button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Hazard Remediation Queue
    const hazardQueue = document.getElementById('admin-hazards-queue-body');
    if (hazardQueue) {
      if (openHazards.length === 0) {
        hazardQueue.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:15px; color:var(--text-light);">No active safety hazards flagged. Workplace is safe!</td></tr>`;
      } else {
        hazardQueue.innerHTML = openHazards.map(h => `
          <tr>
            <td><strong>${h.refCode}</strong><br><small>${h.category}</small></td>
            <td>📍 ${h.location}</td>
            <td><span class="status-pill critical">${h.priority.toUpperCase()}</span></td>
            <td><span class="status-pill ${h.status}">${h.status}</span></td>
            <td>
              <div style="display:flex; gap:4px;">
                <button class="btn-header" style="font-size:0.75rem; padding:4px 8px; color:var(--primary-navy);" onclick="window.updateHazardStatus('${h.id}', 'investigating')">
                  Investigate
                </button>
                <button class="btn-header btn-primary-header" style="font-size:0.75rem; padding:4px 8px;" onclick="window.updateHazardStatus('${h.id}', 'resolved')">
                  Resolve
                </button>
              </div>
            </td>
          </tr>
        `).join('');
      }
    }

    // Payroll Queries Queue
    const disputesQueue = document.getElementById('admin-disputes-queue-body');
    if (disputesQueue) {
      if (openDisputes.length === 0) {
        disputesQueue.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:15px; color:var(--text-light);">No pending payroll discrepancy tickets.</td></tr>`;
      } else {
        disputesQueue.innerHTML = openDisputes.map(d => `
          <tr>
            <td><strong>${d.workerName}</strong></td>
            <td>${d.hoursDisputed}h (₹${d.amountDisputed})</td>
            <td>${d.reason}</td>
            <td><span class="status-pill pending">${d.status}</span></td>
            <td>
              <button class="btn-header btn-primary-header" style="font-size:0.75rem; padding:4px 8px;" onclick="window.resolvePayrollDispute('${d.id}')">
                Accept & Adjust
              </button>
            </td>
          </tr>
        `).join('');
      }
    }
  }

  // Global actions for inline buttons
  window.approveShift = function(shiftId) {
    const list = JSON.parse(localStorage.getItem('fairshift_shifts') || '[]');
    const target = list.find(s => s.id === shiftId);
    if (target) {
      target.status = 'verified';
      localStorage.setItem('fairshift_shifts', JSON.stringify(list));
      renderAdminView();
      showToast('Shift approved and verified successfully.', 'success');
    }
  };

  window.updateHazardStatus = function(hazardId, newStatus) {
    window.FairShiftSupabase.updateSafetyReportStatus(hazardId, newStatus, `Action updated by supervisor ${state.currentUser.name}`);
    renderAdminView();
    showToast(`Hazard status updated to: ${newStatus.toUpperCase()}`, 'success');
  };

  window.resolvePayrollDispute = function(disputeId) {
    window.FairShiftSupabase.resolveDispute(disputeId);
    renderAdminView();
    showToast('Payroll adjustment approved and resolved.', 'success');
  };

  // Toast Helper
  function showToast(message, type = 'info') {
    if (!dom.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span> <span>${message}</span>`;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
