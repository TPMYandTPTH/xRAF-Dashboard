// Main Application Script with Updated Logic
document.addEventListener('DOMContentLoaded', function () {
  // =============================
  // Application State
  // =============================
  const AppState = {
    currentLanguage: 'en',
    statusChart: null,
    currentReferralsData: [],
    isLoading: false,
    debugMode: false, // Set to true for debugging
  };

  // =============================
  // Initialize application
  // =============================
  function initializeApp() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    updateTranslations();
    setupEventListeners();
    const phoneEl = document.getElementById('dashboard-phone');
    if (phoneEl) phoneEl.focus();

    // Test connection if in debug mode
    if (AppState.debugMode && window.ApiService && ApiService.testConnection) {
      ApiService.testConnection();
    }

    // Check for demo mode
    checkForDemoMode();
  }

  // =============================
  // Demo mode helper
  // =============================
  function checkForDemoMode() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') {
      const p = document.getElementById('dashboard-phone');
      const e = document.getElementById('dashboard-email');
      if (p) p.value = '0123456789';
      if (e) e.value = 'amr@tp.com';
    }
  }

  // =============================
  // Event listeners
  // =============================
  function setupEventListeners() {
    const langSel = document.getElementById('lang-select');
    if (langSel) langSel.addEventListener('change', handleLanguageChange);

    const submitBtn = document.getElementById('dashboard-submit');
    if (submitBtn) submitBtn.addEventListener('click', handleFormSubmit);

    const phoneEl = document.getElementById('dashboard-phone');
    if (phoneEl) {
      // Only numbers
      phoneEl.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
      });
    }

    // Delegate event handling for dynamic content
    document.addEventListener('click', function (e) {
      if (e.target.closest('.remind-btn')) {
        handleReminderClick(e);
      }
      if (e.target && e.target.id === 'dashboard-back') {
        handleBackButton();
      }
    });

    // Enter key support on the form
    const form = document.getElementById('dashboard-form');
    if (form) {
      form.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleFormSubmit();
        }
      });
    }
  }

  // =============================
  // Submit handler
  // =============================
  async function handleFormSubmit() {
    const phone = (document.getElementById('dashboard-phone')?.value || '').trim();
    const email = (document.getElementById('dashboard-email')?.value || '').trim();

    if (!validateInputs(phone, email)) return;

    setLoadingState(true);

    try {
      let apiData;

      // Demo credentials shortcut
      if (phone === '0123456789' && email.toLowerCase() === 'amr@tp.com') {
        apiData = generateMockData();
      } else {
        // Fetch real referrals from API
        if (!window.ApiService || !ApiService.fetchReferrals) {
          throw new Error('ApiService.fetchReferrals is not available');
        }
        apiData = await ApiService.fetchReferrals(phone, email);
      }

      // Process and store referrals with deduplication
      AppState.currentReferralsData = processReferrals(apiData);

      // Always show dashboard
      showReferralResults(AppState.currentReferralsData);
    } catch (error) {
      console.error('Error:', error);
      // Still show dashboard with empty data
      AppState.currentReferralsData = [];
      showReferralResults([]);
      showNonBlockingError(translations[AppState.currentLanguage]?.errorMessage || 'Something went wrong. Please try again.');
    } finally {
      setLoadingState(false);
    }
  }

  // =============================
  // Mock data for demo
  // =============================
  function generateMockData() {
    const today = new Date();
    const mockData = [
      // Hired examples
      {
        Person_system_id: 'TP020',
        First_Name: 'Tarek Ezz',
        Email: 'tarekezz@yahoo.com',
        Employee: '0123456789',
        Status: 'New Starter (Hired)',
        Source: 'xRAF',
        Location: 'Kuala Lumpur',
        F_Nationality: 'Egypt',
        CreatedDate: new Date(today - 150 * 86400000).toISOString(),
        UpdatedDate: new Date(today - 100 * 86400000).toISOString(),
      },
      {
        Person_system_id: 'TP021',
        First_Name: 'Loai',
        Email: 'loai@tp.com',
        Employee: '0123456789',
        Status: 'New Starter (Hired)',
        Source: 'xRAF',
        Location: 'Penang',
        F_Nationality: 'Yamen',
        CreatedDate: new Date(today - 150 * 86400000).toISOString(),
        UpdatedDate: new Date(today - 100 * 86400000).toISOString(),
      },
      {
        Person_system_id: 'TP022',
        First_Name: 'Micole Barrientos',
        Email: 'miki@tp.com',
        Employee: '0123456789',
        Status: 'New Starter (Hired)',
        Source: 'xRAF',
        Location: 'Penang',
        F_Nationality: 'Philipinese',
        CreatedDate: new Date(today - 150 * 86400000).toISOString(),
        UpdatedDate: new Date(today - 100 * 86400000).toISOString(),
      },
      {
        Person_system_id: 'TP023',
        First_Name: 'Anna Saw Yee Lin',
        Email: 'anna@tp.com',
        Employee: '0123456789',
        Status: 'New Starter (Hired)',
        Source: 'xRAF',
        Location: 'Penang',
        F_Nationality: 'Malaysian',
        CreatedDate: new Date(today - 150 * 86400000).toISOString(),
        UpdatedDate: new Date(today - 100 * 86400000).toISOString(),
      },
      {
        Person_system_id: 'TP024',
        First_Name: 'Pourya Tohidi',
        Email: 'pourya@tp.com',
        Employee: '0123456789',
        Status: 'New Starter (Hired)',
        Source: 'xRAF',
        Location: 'Penang',
        F_Nationality: 'Iran',
        CreatedDate: new Date(today - 150 * 86400000).toISOString(),
        UpdatedDate: new Date(today - 100 * 86400000).toISOString(),
      },
      {
        Person_system_id: 'TP025',
        First_Name: 'Melaine Sua',
        Email: 'melaine@tp.com',
        Employee: '0123456789',
        Status: 'New Starter (Hired)',
        Source: 'xRAF',
        Location: 'Penang',
        F_Nationality: 'Malaysian',
        CreatedDate: new Date(today - 150 * 86400000).toISOString(),
        UpdatedDate: new Date(today - 100 * 86400000).toISOString(),
      },

      // Application Received / Contact Attempt
      {
        Person_system_id: 'TP001',
        First_Name: 'Amr Ezz',
        Email: 'amr@gmail.com',
        Employee: '0183931348',
        Status: 'Application Received',
        Source: 'xRAF',
        Location: 'Kuala Lumpur',
        F_Nationality: 'Egypt',
        CreatedDate: new Date(today - 2 * 86400000).toISOString(),
        UpdatedDate: new Date(today - 2 * 86400000).toISOString(),
      },
      {
        Person_system_id: 'TP002',
        First_Name: 'Micole Barrientos',
        Email: 'Miki@hotmail.com',
        Employee: '0126240297',
        Status: 'Contact Attempt 1',
        Source: 'xRAF',
        Location: 'Penang',
        F_Nationality: 'Malaysian',
        CreatedDate: new Date(today - 5 * 86400000).toISOString(),
        UpdatedDate: new Date(today - 4 * 86400000).toISOString(),
      },

      // Assessment / Interview
      {
        Person_system_id: 'TP003',
        First_Name: 'Kumar Raj',
        Email: 'kumar.raj@yahoo.com',
        Employee: '0176543210',
        Status: 'SHL Assessment: Conversational Multichat ENG',
        Source: 'xRAF',
        Location: 'Johor Bahru',
        F_Nationality: 'Indian',
        CreatedDate: new Date(today - 10 * 86400000).toISOString(),
        UpdatedDate: new Date(today - 3 * 86400000).toISOString(),
      },
      {
        Person_system_id: 'TP004',
        First_Name: 'Jennifer Tan',
        Email: 'jennifer.tan@gmail.com',
        Employee: '0165432109',
        Status: 'Interview Scheduled',
        Source: 'xRAF',
        Location: 'Cyberjaya',
        F_Nationality: 'Malaysian',
        CreatedDate: new Date(today - 15 * 86400000).toISOString(),
        UpdatedDate: new Date(today - 1 * 86400000).toISOString(),
      },

      // Probation/Hired
      {
        Person_system_id: 'TP005',
        First_Name: 'Michael Wong',
        Email: 'michael.wong@outlook.com',
        Employee: '0154321098',
        Status: 'New Starter (Hired)',
        Source: 'xRAF',
        Location: 'Kuala Lumpur',
        F_Nationality: 'Malaysian',
        CreatedDate: new Date(today - 45 * 86400000).toISOString(),
        UpdatedDate: new Date(today - 30 * 86400000).toISOString(),
      },
      {
        Person_system_id: 'TP006',
        First_Name: 'Lisa Chen',
        Email: 'lisa.chen@gmail.com',
        Employee: '0143210987',
        Status: 'Onboarding Started',
        Source: 'xRAF',
        Location: 'Petaling Jaya',
        F_Nationality: 'Chinese',
        CreatedDate: new Date(today - 60 * 86400000).toISOString(),
        UpdatedDate: new Date(today - 50 * 86400000).toISOString(),
      },

      // Confirmed
      {
        Person_system_id: 'TP007',
        First_Name: 'David Lim',
        Email: 'david.lim@gmail.com',
        Employee: '0132109876',
        Status: 'Graduate',
        Source: 'xRAF',
        Location: 'Kuala Lumpur',
        F_Nationality: 'Malaysian',
        CreatedDate: new Date(today - 120 * 86400000).toISOString(),
        UpdatedDate: new Date(today - 95 * 86400000).toISOString(),
      },
      {
        Person_system_id: 'TP008',
        First_Name: 'Emily Ooi',
        Email: 'emily.ooi@yahoo.com',
        Employee: '0121098765',
        Status: 'New Starter (Hired)',
        Source: 'xRAF',
        Location: 'Penang',
        F_Nationality: 'Malaysian',
        CreatedDate: new Date(today - 150 * 86400000).toISOString(),
        UpdatedDate: new Date(today - 100 * 86400000).toISOString(),
      },

      // Previously Applied (no payment)
      {
        Person_system_id: 'TP009',
        First_Name: 'Jason Ng',
        Email: 'jason.ng@gmail.com',
        Employee: '0110987654',
        Status: 'Interview Complete / Offer Requested',
        Source: 'External Portal',
        Location: 'Shah Alam',
        F_Nationality: 'Malaysian',
        CreatedDate: new Date(today - 20 * 86400000).toISOString(),
        UpdatedDate: new Date(today - 10 * 86400000).toISOString(),
      },
      {
        Person_system_id: 'TP010',
        First_Name: 'Rachel Yap',
        Email: 'rachel.yap@hotmail.com',
        Employee: '0109876543',
        Status: 'Screened',
        Source: 'Internal Portal',
        Location: 'Subang Jaya',
        F_Nationality: 'Malaysian',
        CreatedDate: new Date(today - 25 * 86400000).toISOString(),
        UpdatedDate: new Date(today - 15 * 86400000).toISOString(),
      },

      // Not selected
      {
        Person_system_id: 'TP011',
        First_Name: 'Steven Toh',
        Email: 'steven.toh@gmail.com',
        Employee: '0198765432',
        Status: 'Eliminated - Assessment Results Did Not Meet Criteria',
        Source: 'xRAF',
        Location: 'Ipoh',
        F_Nationality: 'Malaysian',
        CreatedDate: new Date(today - 30 * 86400000).toISOString(),
        UpdatedDate: new Date(today - 20 * 86400000).toISOString(),
      },
      {
        Person_system_id: 'TP012',
        First_Name: 'Angela Low',
        Email: 'angela.low@yahoo.com',
        Employee: '0187654321',
        Status: 'Withdrew - Other Job Offer',
        Source: 'xRAF',
        Location: 'Melaka',
        F_Nationality: 'Malaysian',
        CreatedDate: new Date(today - 35 * 86400000).toISOString(),
        UpdatedDate: new Date(today - 25 * 86400000).toISOString(),
      },
    ];
    return mockData;
  }

  // =============================
  // Process API response
  // =============================
  function processReferrals(apiData) {
    if (!Array.isArray(apiData)) return [];

    // Create a Map to track unique referrals by email+name combination
    const uniqueReferrals = new Map();

    apiData.forEach((item) => {
      // Create unique key using email and name (or phone as fallback)
      const email = (item.Email || item.email || '').toLowerCase().trim();
      const name = (item.First_Name || item.name || 'Unknown').trim();
      const phone = (item.Employee || item.phone || '').trim();

      // Use email+name as primary key, or phone+name as fallback
      const uniqueKey = email ? `${email}_${name}` : `${phone}_${name}`;

      // If duplicate found, keep the one with more recent update date
      if (uniqueReferrals.has(uniqueKey)) {
        const existing = uniqueReferrals.get(uniqueKey);
        const existingDate = new Date(existing.UpdatedDate || existing.updatedDate || 0);
        const currentDate = new Date(item.UpdatedDate || item.updatedDate || 0);
        if (currentDate <= existingDate) return;
      }

      // Parse dates
      const parseDate = (dateStr) => {
        if (!dateStr) return new Date();
        if (typeof dateStr === 'string' && dateStr.includes('/')) {
          const [month, day, year] = dateStr.split(/[\/\s]/).filter(Boolean).map(Number);
          return new Date(year, month - 1, day);
        }
        return new Date(dateStr);
      };

      const updatedDate = parseDate(item.UpdatedDate || item.updatedDate);
      const createdDate = parseDate(item.CreatedDate || item.createdDate);
      const daysInStage = Math.floor((new Date() - updatedDate) / 86400000);
      const daysSinceCreation = Math.floor((new Date() - createdDate) / 86400000);

      // Status/source
      const rawStatus = (item.Status || item.status || 'Application Received').trim();
      const source = (item.Source || item.source || item.SourceName || '').trim();
      const isXRAF = source.toLowerCase().trim() === 'xraf';

      // Assessment
      const assessment = item.assessment || null;

      // Map status
      let mappedStatus = StatusMapping.mapStatusToGroup
        ? StatusMapping.mapStatusToGroup(rawStatus, assessment, source, daysInStage)
        : rawStatus;

      // Special case: hired > 90 days => confirmed
      if (mappedStatus === 'Hired (Probation)' && daysSinceCreation >= 90) {
        mappedStatus = 'Hired (Confirmed)';
      }

      const statusType = StatusMapping.getSimplifiedStatusType
        ? StatusMapping.getSimplifiedStatusType(rawStatus, assessment, source, daysInStage)
        : 'info';

      const stage = StatusMapping.determineStage
        ? StatusMapping.determineStage(rawStatus, assessment, source, daysInStage)
        : mappedStatus;

      // Need reminder?
      const needsAction = mappedStatus === 'Application Received';

      const processedReferral = {
        // IDs
        id: item.Person_system_id || item.personId || item.ID || uniqueKey,
        personId: item.Person_system_id || item.personId || item.ID,
        uniqueKey,

        // Contact info
        name,
        email,
        phone,

        // Status info
        status: rawStatus,
        mappedStatus,
        statusType,
        stage,

        // Source and eligibility
        source,
        isXRAF,
        isPreviousCandidate: !isXRAF && source !== '',

        // Assessment info
        assessment,
        hasPassedAssessment: assessment && assessment.score >= 70,
        assessmentScore: assessment ? assessment.score : null,
        assessmentDate: assessment ? assessment.date : null,

        // Location info
        location: item.Location || item.location || '',
        nationality: item.F_Nationality || item.nationality || '',

        // Dates
        createdDate,
        updatedDate,
        daysInStage,
        daysSinceCreation,

        // Action flags
        needsAction,

        // Payment eligibility
        isEligibleForAssessmentPayment:
          isXRAF &&
          (mappedStatus === 'Assessment Stage' ||
            mappedStatus === 'Hired (Probation)' ||
            mappedStatus === 'Hired (Confirmed)') &&
          (!assessment || assessment.score >= 70),
        isEligibleForProbationPayment: isXRAF && mappedStatus === 'Hired (Confirmed)',

        // Original data for debugging
        _original: item,
      };

      uniqueReferrals.set(uniqueKey, processedReferral);
    });

    // Convert Map values to array and sort by created date (newest first)
    return Array.from(uniqueReferrals.values()).sort((a, b) => b.createdDate - a.createdDate);
  }

  // =============================
  // Validation
  // =============================
  function validateInputs(phone, email) {
    let isValid = true;

    const phoneEl = document.getElementById('dashboard-phone');
    const emailEl = document.getElementById('dashboard-email');

    if (!validatePhone(phone)) {
      showError(phoneEl, translations[AppState.currentLanguage]?.phoneError || 'Invalid phone number.');
      isValid = false;
    } else {
      clearError(phoneEl);
    }

    if (!validateEmail(email)) {
      showError(emailEl, translations[AppState.currentLanguage]?.emailError || 'Invalid email address.');
      isValid = false;
    } else {
      clearError(emailEl);
    }

    return isValid;
  }

  function validatePhone(phone) {
    return /^01\d{8,9}$/.test(phone);
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(input, message) {
    if (!input) return;
    const formControl = input.closest('.mb-3');
    const error = formControl ? formControl.querySelector('.invalid-feedback') : null;
    if (error) error.textContent = message;
    input.classList.add('is-invalid');
  }

  function clearError(input) {
    if (input) input.classList.remove('is-invalid');
  }

  function setLoadingState(isLoading) {
    const submitBtn = document.getElementById('dashboard-submit');
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    const t = translations[AppState.currentLanguage] || translations.en || {};
    submitBtn.innerHTML = isLoading
      ? `<span class="spinner-border spinner-border-sm me-2"></span>${t.connectingMessage || 'Connecting...'}`
      : (t.viewStatusBtn || 'View Referral Status');
  }

  // =============================
  // Language change
  // =============================
  function handleLanguageChange(e) {
    AppState.currentLanguage = e.target.value;
    updateTranslations();
    if (document.getElementById('results-step')?.style.display !== 'none') {
      // re-render for localized labels/assets
      showReferralResults(AppState.currentReferralsData);
    }
  }

  // =============================
  // Results view
  // =============================
  function showReferralResults(referrals) {
    const authStep = document.getElementById('auth-step');
    const resultsStep = document.getElementById('results-step');
    if (authStep) authStep.style.display = 'none';
    if (resultsStep) {
      resultsStep.style.display = 'block';
      resultsStep.innerHTML = createResultsContent(referrals);
    }

    // Initialize dashboard components
    updateChart(referrals);
    updateEarningsTable(referrals);
    updateReminderSection(referrals);
    updateReferralList(referrals);
    updateStatusGuide();
    updateTranslations();

    // Failsafe: if any stats card accidentally has .progress, fix it
    fixProgressCardClasses();

    // Observe dynamic content in results for any late insertions
    if (resultsStep && 'MutationObserver' in window) {
      const mo = new MutationObserver(() => fixProgressCardClasses());
      mo.observe(resultsStep, { childList: true, subtree: true });
    }
  }

  function createResultsContent(referrals) {
    const hiredCount = referrals.filter(
      (r) => r.mappedStatus === 'Hired (Confirmed)' || r.mappedStatus === 'Hired (Probation)'
    ).length;

    const inProgressCount = referrals.filter(
      (r) => r.mappedStatus === 'Application Received' || r.mappedStatus === 'Assessment Stage'
    ).length;

    if (AppState.debugMode) {
      console.log('Referral Status Summary:');
      referrals.forEach((r) => {
        console.log(`${r.name}: ${r.status} -> ${r.mappedStatus} (Source: ${r.source})`);
      });
      console.log('In Progress Count:', inProgressCount);
      console.log('Hired Count:', hiredCount);
    }

    const emailVal = (document.getElementById('dashboard-email')?.value || '');
    const userName = (emailVal.split('@')[0] || 'You');

    return `
      <div class="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h3 class="user-name-display">${userName}</h3>
          <h4 data-translate="yourReferralsTitle">Your Referrals</h4>
        </div>
        <button id="dashboard-back" class="btn btn-outline-secondary" data-translate="backBtn">
          <i class="fas fa-arrow-left me-2"></i> Back
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="row mb-4">
        <div class="col-md-4 mb-3">
          <div class="card stats-card total">
            <div class="card-body text-center">
              <h5 class="card-title" data-translate="totalReferrals">Total Referrals</h5>
              <h3 class="text-primary">${referrals.length}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="card stats-card hired">
            <div class="card-body text-center">
              <h5 class="card-title" data-translate="hiredReferrals">Hired</h5>
              <h3 class="text-success">${hiredCount}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="card stats-card in-progress">
            <div class="card-body text-center">
              <h5 class="card-title" data-translate="inProgress">In Progress</h5>
              <h3 class="text-warning">${inProgressCount}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Distribution Chart -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title text-center mb-3" data-translate="statusDistribution">Status Distribution</h5>
          <div class="chart-container" style="position:relative;min-height:280px">
            <canvas id="statusChart"></canvas>
            <img src="TPLogo11.png" class="chart-logo" alt="TP Logo">
          </div>
        </div>
      </div>

      <!-- Earnings Table -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title text-center mb-3" data-translate="earningsTitle">Your Earnings</h5>
          <div class="table-responsive">
            <table class="earnings-table table table-striped align-middle">
              <thead>
                <tr>
                  <th data-translate="earningsStage">Stage</th>
                  <th data-translate="earningsAmount">Amount (RM)</th>
                  <th data-translate="earningsCount">Count</th>
                  <th data-translate="earningsTotal">Total</th>
                </tr>
              </thead>
              <tbody id="earnings-body"></tbody>
              <tfoot>
                <tr>
                  <th colspan="3" data-translate="earningsTotal">Total Earnings</th>
                  <th id="total-earnings">RM 0</th>
                </tr>
              </tfoot>
            </table>
          </div>
          <div class="text-center mt-3">
            <button type="button" class="btn btn-link" data-bs-toggle="modal" data-bs-target="#tngModal" data-translate="paymentNote">
              Payment Terms & Conditions
            </button>
          </div>
        </div>
      </div>

      <!-- Reminder Section -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title text-center mb-3" data-translate="remindFriendsTitle">Remind Your Friends</h5>
          <p class="text-center" data-translate="remindFriendsText">Help your friends complete their assessments to join TP!</p>
          <div id="friends-to-remind" class="row"></div>
        </div>
      </div>

      <!-- Referral List -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="mb-3">All Referrals</h5>
          <div id="referral-list"></div>
        </div>
      </div>

      <!-- Status Guide moved to end -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title text-center mb-4" data-translate="statusGuideTitle">Status Guide & Payment Information</h5>
          <div id="status-guide-content"></div>
        </div>
      </div>
    `;
  }

  // =============================
  // Back button
  // =============================
  function handleBackButton() {
    const auth = document.getElementById('auth-step');
    const results = document.getElementById('results-step');
    if (auth) auth.style.display = 'block';
    if (results) results.style.display = 'none';
    const phone = document.getElementById('dashboard-phone');
    const email = document.getElementById('dashboard-email');
    if (phone) phone.value = '';
    if (email) email.value = '';
    if (phone) phone.focus();
    AppState.currentReferralsData = [];
  }

  // =============================
  // WhatsApp reminder
  // =============================
  function handleReminderClick(e) {
    const button = e.target.closest('.remind-btn');
    if (!button) return;

    const name = button.dataset.name;
    const phone = button.dataset.phone;
    const lang = button.dataset.lang || AppState.currentLanguage;
    if (!phone) return;

    // Format phone for WhatsApp (Malaysia leading 6)
    const formattedPhone = phone.startsWith('0') ? '6' + phone : phone;

    const messages = {
      en: `Hello ${name},\n\nI hope this message finds you well. This is a friendly reminder regarding your application to Teleperformance.\n\nWe noticed that you haven't completed your assessment yet. Please check your personal email for the assessment link that was sent to you.\n\nCompleting the assessment is an important step in your application process. If you have any questions or need assistance, please don't hesitate to reach out.\n\nBest regards,\nTP Recruitment Team`,
      ja: `${name}様\n\nお世話になっております。テレパフォーマンスへのご応募に関するリマインダーです。\n\nまだアセスメントを完了されていないようです。個人のメールアドレスに送信されたアセスメントのリンクをご確認ください。\n\nアセスメントの完了は、応募プロセスの重要なステップです。ご不明な点がございましたら、お気軽にお問い合わせください。\n\nよろしくお願いいたします。\nTP採用チーム`,
      ko: `안녕하세요 ${name}님,\n\n텔레퍼포먼스 지원과 관련하여 안내 드립니다.\n\n아직 평가를 완료하지 않으신 것으로 확인됩니다. 개인 이메일로 발송된 평가 링크를 확인해 주시기 바랍니다.\n\n평가 완료는 지원 과정에서 중요한 단계입니다. 궁금한 점이 있으시면 언제든지 문의해 주세요.\n\n감사합니다.\nTP 채용팀`,
      "zh-CN": `${name} 您好，\n\n这是关于您申请Teleperformance的友好提醒。\n\n我们注意到您还没有完成评估。请查看您的个人邮箱中发送的评估链接。\n\n完成评估是申请过程中的重要步骤。如果您有任何问题或需要帮助，请随时与我们联系。\n\n祝好，\nTP招聘团队`,
      "zh-HK": `${name} 您好，\n\n這是關於您申請Teleperformance的友好提醒。\n\n我們注意到您還沒有完成評估。請查看您的個人郵箱中發送的評估鏈接。\n\n完成評估是申請過程中的重要步驟。如果您有任何問題或需要幫助，請隨時與我們聯繫。\n\n祝好，\nTP招聘團隊`,
    };

    const message = messages[lang] || messages.en;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  }

  // =============================
  // Chart
  // =============================
  function updateChart(referrals) {
    const ctx = document.getElementById('statusChart')?.getContext('2d');
    if (!ctx || !window.Chart) return;

    // Destroy previous chart
    if (AppState.statusChart) {
      AppState.statusChart.destroy();
    }

    // Count statuses using displayOrder
    const counts = {};
    const order = (StatusMapping.displayOrder || [
      'Application Received',
      'Assessment Stage',
      'Hired (Probation)',
      'Hired (Confirmed)',
      'Previously Applied (No Payment)',
      'Not Selected',
    ]);

    order.forEach((status) => (counts[status] = 0));
    referrals.forEach((r) => {
      if (counts[r.mappedStatus] !== undefined) counts[r.mappedStatus]++;
    });

    const colors = [
      '#0087FF', // Application Received - blue
      '#00d769', // Assessment Stage - green flash
      '#f5d200', // Hired (Probation) - yellow
      '#84c98b', // Hired (Confirmed) - green
      '#676767', // Previously Applied (No Payment) - gray
      '#dc3545', // Not Selected - red
    ];

    AppState.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: order.map(
          (status) => translations[AppState.currentLanguage]?.[`status${status.replace(/[\s()]/g, '')}`] || status
        ),
        datasets: [
          {
            data: order.map((status) => counts[status] || 0),
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#fff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 12 },
              generateLabels: function (chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i];
                    return {
                      text: `${label} (${value})`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      hidden: false,
                      index: i,
                    };
                  });
                }
                return [];
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  // =============================
  // Earnings table
  // =============================
  function updateEarningsTable(referrals) {
    const earningsBody = document.getElementById('earnings-body');
    if (!earningsBody) return;

    const assessmentPassed = referrals.filter((r) => r.isEligibleForAssessmentPayment).length;
    const probationCompleted = referrals.filter((r) => r.isEligibleForProbationPayment).length;

    const assessmentEarnings = assessmentPassed * 50;
    const probationEarnings = probationCompleted * 750;
    const totalEarnings = assessmentEarnings + probationEarnings;

    earningsBody.innerHTML = `
      <tr>
        <td data-translate="statusAssessmentPassed">Assessment Passed (Score ≥ 70%)</td>
        <td>RM 50</td>
        <td>${assessmentPassed}</td>
        <td>RM ${assessmentEarnings}</td>
      </tr>
      <tr>
        <td data-translate="statusProbationPassed">Probation Completed (90 days)</td>
        <td>RM 750</td>
        <td>${probationCompleted}</td>
        <td>RM ${probationEarnings}</td>
      </tr>
    `;

    const totalCell = document.getElementById('total-earnings');
    if (totalCell) totalCell.textContent = `RM ${totalEarnings}`;
  }

  // =============================
  // Reminder section
  // =============================
  function updateReminderSection(referrals) {
    const container = document.getElementById('friends-to-remind');
    if (!container) return;

    const friendsToRemind = referrals.filter((r) => r.mappedStatus === 'Application Received' && r.phone);

    if (friendsToRemind.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center">
          <p class="text-muted" data-translate="noRemindersNeeded">All your friends are on track!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    friendsToRemind.forEach((friend) => {
      container.innerHTML += `
        <div class="col-md-6 mb-3">
          <div class="friend-to-remind">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5>${friend.name}</h5>
              <span class="badge bg-${friend.statusType}">${friend.mappedStatus}</span>
            </div>
            <p class="small mb-1">${friend.email}</p>
            <p class="small mb-2"><span data-translate="referralDays">Days in Stage</span>: ${friend.daysInStage}</p>
            <button class="btn btn-primary w-100 remind-btn"
              data-name="${friend.name}"
              data-phone="${friend.phone}"
              data-lang="${AppState.currentLanguage}">
              <i class="fab fa-whatsapp me-2"></i>
              <span data-translate="remindBtn">Send Reminder</span>
            </button>
          </div>
        </div>
      `;
    });
  }

  // =============================
  // Referral list
  // =============================
  function updateReferralList(referrals) {
    const container = document.getElementById('referral-list');
    if (!container) return;

    if (referrals.length === 0) {
      container.innerHTML = `
        <div class="card">
          <div class="card-body text-center py-5 empty-state">
            <i class="fas fa-users empty-state-icon"></i>
            <h4 data-translate="noReferrals">No referrals found yet</h4>
            <p data-translate="startReferring">Start referring friends to see them appear here!</p>
            <a href="https://tpmyandtpth.github.io/xRAF/" class="btn btn-primary mt-3">
              <i class="fas fa-user-plus me-2"></i><span data-translate="referFriend">Refer a Friend</span>
            </a>
          </div>
        </div>
      `;
      return;
    }

    // Remove duplicate title (the card already has "All Referrals" above the container)
    container.innerHTML = '';

    // Sort referrals by status order
    const order = (StatusMapping.displayOrder || [
      'Application Received',
      'Assessment Stage',
      'Hired (Probation)',
      'Hired (Confirmed)',
      'Previously Applied (No Payment)',
      'Not Selected',
    ]);
    const sortedReferrals = [...referrals].sort((a, b) => {
      const aIndex = order.indexOf(a.mappedStatus);
      const bIndex = order.indexOf(b.mappedStatus);
      return aIndex - bIndex;
    });

    sortedReferrals.forEach((ref) => {
      const assessmentInfo = ref.assessment
        ? `<span class="assessment-score ${ref.assessmentScore < 70 ? 'low' : ''}">Score: ${ref.assessmentScore}%</span>`
        : '';

      container.innerHTML += `
        <div class="card referral-card status-${ref.statusType} mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h5>${ref.name}</h5>
                <p class="small text-muted mb-1">${ref.email}</p>
                ${ref.personId ? `<p class="small text-muted">ID: ${ref.personId}</p>` : ''}
              </div>
              <div class="text-end">
                <span class="badge bg-${ref.statusType} status-badge">
                  ${ref.mappedStatus}
                </span>
                ${assessmentInfo}
              </div>
            </div>

            <div class="row mt-3">
              <div class="col-md-3">
                <small class="text-muted" data-translate="referralStage">Stage</small>
                <p>${ref.stage}</p>
              </div>
              <div class="col-md-3">
                <small class="text-muted" data-translate="location">Location</small>
                <p>${ref.location || 'N/A'}</p>
              </div>
              <div class="col-md-3">
                <small class="text-muted" data-translate="referralDays">Days in Stage</small>
                <p>${ref.daysInStage}</p>
              </div>
              <div class="col-md-3">
                ${ref.needsAction && ref.phone
                  ? `
                    <button class="btn btn-sm btn-success w-100 remind-btn"
                      data-name="${ref.name}"
                      data-phone="${ref.phone}">
                      <i class="fab fa-whatsapp me-2"></i>
                      <span data-translate="remindBtn">Remind</span>
                    </button>
                  `
                  : ''}
              </div>
            </div>

            <div class="mt-2">
              <small class="text-muted">
                <span data-translate="source">Source</span>: ${ref.source || 'N/A'} |
                <span data-translate="statusDetails">Status Details</span>: ${ref.status}
              </small>
            </div>
          </div>
        </div>
      `;
    });
  }

  // =============================
  // Status guide
  // =============================
// Update status guide section (drop-in replacement)
function updateStatusGuide() {
  const container = document.getElementById('status-guide-content');
  if (!container) return;

  const t = translations[AppState.currentLanguage] || {};

  // Use provided `statusExamples` if available, otherwise fallback set
  const examplesList =
    (typeof statusExamples !== 'undefined' &&
     Array.isArray(statusExamples) &&
     statusExamples.length > 0)
      ? statusExamples
      : [
          {
            status: 'Application Received',
            description: 'Your referral has been received and is awaiting processing.',
            action: 'No action required.'
          },
          {
            status: 'Assessment Stage',
            description: 'Candidate is taking or awaiting the AI assessment / interview.',
            action: 'Encourage your friend to complete the assessment.'
          },
          {
            status: 'Hired (Probation)',
            description: 'Candidate hired and within the first 90 days.',
            action: 'Payment after confirmation.'
          },
          {
            status: 'Hired (Confirmed)',
            description: 'Candidate confirmed after probation.',
            action: 'Eligible for probation payment.'
          },
          {
            status: 'Previously Applied (No Payment)',
            description: 'Candidate applied before referral.',
            action: 'No payment is eligible for this case.'
          },
          {
            status: 'Not Selected',
            description: 'Candidate not proceeding.',
            action: 'No action required.'
          }
        ];

  const examplesHtml = examplesList.map(example => {
    // Color badge using your StatusMapping if available; else default to 'info'
    let statusType = (StatusMapping.getSimplifiedStatusType)
      ? StatusMapping.getSimplifiedStatusType(example.status)
      : 'info';
    if (example.status === 'Hired (Confirmed)') statusType = 'passed';
    if (example.status === 'Previously Applied (No Payment)') statusType = 'previously-applied';

    return `
      <div class="status-example">
        <div class="d-flex justify-content-between align-items-center">
          <strong>${t[`status${example.status.replace(/[\s()]/g, '')}`] || example.status}</strong>
          <span class="badge bg-${statusType}">
            ${example.status}
          </span>
        </div>
        <p class="mb-1 mt-2 small">${example.description}</p>
        <small class="text-muted">${example.action}</small>
      </div>
    `;
  }).join('');

  // Build Payment rows from earningsStructure if present, else your exact fallback rows
  let paymentRowsHtml = '';
  if (typeof earningsStructure !== 'undefined' && earningsStructure && Object.keys(earningsStructure).length) {
    paymentRowsHtml = Object.entries(earningsStructure).map(([_, value]) => `
      <tr>
        <td>${value.label}</td>
        <td>${value.condition}</td>
        <td><strong>${value.payment}</strong></td>
      </tr>
    `).join('');
  } else {
    // Fallback to the two lines you asked for
    paymentRowsHtml = `
      <tr>
        <td>Assessment Passed</td>
        <td>Candidate passes the AI assessment</td>
        <td><strong>RM50</strong></td>
      </tr>
      <tr>
        <td>Probation Completed</td>
        <td>Candidate completes 90-day probation period</td>
        <td><strong>RM750</strong></td>
      </tr>
    `;
  }

  container.innerHTML = `
    <div class="row">
      <!-- Status Examples -->
      <div class="col-md-6">
        <h6 class="mb-3" data-translate="statusExamples">Status Examples</h6>
        <div class="status-examples">
          ${examplesHtml}
        </div>
      </div>

      <!-- Payment Conditions -->
      <div class="col-md-6">
        <h6 class="mb-3" data-translate="paymentConditions">Payment Conditions</h6>
        <div class="table-responsive">
          <table class="table status-guide-table">
            <thead>
              <tr>
                <th data-translate="stage">Stage</th>
                <th data-translate="condition">Condition</th>
                <th data-translate="payment">Payment</th>
              </tr>
            </thead>
            <tbody>
              ${paymentRowsHtml}
              <tr>
                <td>Previously Applied</td>
                <td data-translate="noPaymentNote">Candidate applied before referral</td>
                <td><strong>No Payment</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="payment-notes mt-3">
          <p class="small mb-1"><i class="fas fa-info-circle me-2"></i>All payments via Touch 'n Go eWallet</p>
          <p class="small mb-1"><i class="fas fa-info-circle me-2"></i>Payments processed within 30 days</p>
          <p class="small"><i class="fas fa-info-circle me-2"></i>Must be active TP employee at payment time</p>
        </div>
      </div>
    </div>
  `;
}
// Update status guide section (drop-in replacement)
function updateStatusGuide() {
  const container = document.getElementById('status-guide-content');
  if (!container) return;

  const t = translations[AppState.currentLanguage] || {};

  // Use provided `statusExamples` if available, otherwise fallback set
  const examplesList =
    (typeof statusExamples !== 'undefined' &&
     Array.isArray(statusExamples) &&
     statusExamples.length > 0)
      ? statusExamples
      : [
          {
            status: 'Application Received',
            description: 'Your referral has been received and is awaiting processing.',
            action: 'No action required.'
          },
          {
            status: 'Assessment Stage',
            description: 'Candidate is taking or awaiting the AI assessment/interview.',
            action: 'Encourage your friend to complete the assessment.'
          },
          {
            status: 'Hired (Probation)',
            description: 'Candidate hired and within the first 90 days.',
            action: 'Payment after confirmation.'
          },
          {
            status: 'Hired (Confirmed)',
            description: 'Candidate confirmed after probation.',
            action: 'Eligible for probation payment.'
          },
          {
            status: 'Previously Applied (No Payment)',
            description: 'Candidate applied before referral.',
            action: 'No payment is eligible for this case.'
          },
          {
            status: 'Not Selected',
            description: 'Candidate not proceeding.',
            action: 'No action required.'
          }
        ];

  const examplesHtml = examplesList.map(example => {
    // Color badge using your StatusMapping if available; else default to 'info'
    let statusType = (StatusMapping.getSimplifiedStatusType)
      ? StatusMapping.getSimplifiedStatusType(example.status)
      : 'info';
    if (example.status === 'Hired (Confirmed)') statusType = 'passed';
    if (example.status === 'Previously Applied (No Payment)') statusType = 'previously-applied';

    return `
      <div class="status-example">
        <div class="d-flex justify-content-between align-items-center">
          <strong>${t[`status${example.status.replace(/[\s()]/g, '')}`] || example.status}</strong>
          <span class="badge bg-${statusType}">
            ${example.status}
          </span>
        </div>
        <p class="mb-1 mt-2 small">${example.description}</p>
        <small class="text-muted">${example.action}</small>
      </div>
    `;
  }).join('');

  // Build Payment rows from earningsStructure if present, else your exact fallback rows
  let paymentRowsHtml = '';
  if (typeof earningsStructure !== 'undefined' && earningsStructure && Object.keys(earningsStructure).length) {
    paymentRowsHtml = Object.entries(earningsStructure).map(([_, value]) => `
      <tr>
        <td>${value.label}</td>
        <td>${value.condition}</td>
        <td><strong>${value.payment}</strong></td>
      </tr>
    `).join('');
  } else {
    // Fallback to the two lines you asked for
    paymentRowsHtml = `
      <tr>
        <td>Assessment Passed</td>
        <td>Candidate passes the AI assessment</td>
        <td><strong>RM50</strong></td>
      </tr>
      <tr>
        <td>Probation Completed</td>
        <td>Candidate completes 90-day probation period</td>
        <td><strong>RM750</strong></td>
      </tr>
    `;
  }

  container.innerHTML = `
    <div class="row">
      <!-- Status Examples -->
      <div class="col-md-6">
        <h6 class="mb-3" data-translate="statusExamples">Status Examples</h6>
        <div class="status-examples">
          ${examplesHtml}
        </div>
      </div>

      <!-- Payment Conditions -->
      <div class="col-md-6">
        <h6 class="mb-3" data-translate="paymentConditions">Payment Conditions</h6>
        <div class="table-responsive">
          <table class="table status-guide-table">
            <thead>
              <tr>
                <th data-translate="stage">Stage</th>
                <th data-translate="condition">Condition</th>
                <th data-translate="payment">Payment</th>
              </tr>
            </thead>
            <tbody>
              ${paymentRowsHtml}
              <tr>
                <td>Previously Applied</td>
                <td data-translate="noPaymentNote">Candidate applied before referral</td>
                <td><strong>No Payment</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="payment-notes mt-3">
          <p class="small mb-1"><i class="fas fa-info-circle me-2"></i>All payments via Touch 'n Go eWallet</p>
          <p class="small mb-1"><i class="fas fa-info-circle me-2"></i>Payments processed within 30 days</p>
          <p class="small"><i class="fas fa-info-circle me-2"></i>Must be active TP employee at payment time</p>
        </div>
      </div>
    </div>
  `;
}
  // =============================
  // Translations
  // =============================
  function updateTranslations() {
    const lang = AppState.currentLanguage;
    const t = translations[lang] || translations.en || {};

    document.querySelectorAll('[data-translate]').forEach((el) => {
      const key = el.getAttribute('data-translate');
      if (t[key]) {
        el.textContent = t[key];
      }
    });

    document.querySelectorAll('[data-translate-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-translate-placeholder');
      if (t[key]) {
        el.placeholder = t[key];
      }
    });
  }

  // =============================
  // Alerts
  // =============================
  function showNonBlockingError(message) {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;

    const alertId = 'alert-' + Date.now();

    const alert = document.createElement('div');
    alert.id = alertId;
    alert.className = 'alert alert-warning alert-dismissible fade show';
    alert.setAttribute('role', 'alert');
    alert.innerHTML = `
      <i class="fas fa-exclamation-triangle me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    alertContainer.appendChild(alert);

    setTimeout(() => {
      const alertEl = document.getElementById(alertId);
      if (alertEl) {
        alertEl.classList.remove('show');
        setTimeout(() => alertEl.remove(), 150);
      }
    }, 5000);
  }

  // =============================
  // Failsafe: neutralize stray .progress on stats cards
  // =============================
  function fixProgressCardClasses() {
    document.querySelectorAll('.stats-card.progress').forEach((el) => {
      el.classList.remove('progress');
      el.classList.add('in-progress');
    });
  }

  // =============================
  // Kick things off
  // =============================
  initializeApp();

  // Expose state for debugging
  window.AppState = AppState;
  // Optional: expose handlers if needed elsewhere
  window.handleBackButton = handleBackButton;
});
