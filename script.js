// Main Application Script (robust & self-contained)
document.addEventListener('DOMContentLoaded', function () {
  // =============================
  // Application State
  // =============================
  const AppState = {
    currentLanguage: 'en',
    statusChart: null,
    currentReferralsData: [],
    isLoading: false,
    debugMode: false, // Set to true for console logs
  };

  // =============================
  // Defaults / Fallbacks (used when external globals are missing)
  // =============================
  const DEFAULT_DISPLAY_ORDER = [
    'Application Received',
    'Assessment Stage',
    'Hired (Probation)',
    'Hired (Confirmed)',
    'Previously Applied (No Payment)',
    'Not Selected',
  ];

  const DEFAULT_STATUS_EXAMPLES = [
    {
      status: 'Application Received',
      description: 'Your referral has been received and is awaiting processing.',
      action: 'No action required.',
    },
    {
      status: 'Assessment Stage',
      description: 'Candidate is taking or awaiting the AI assessment / interview.',
      action: 'Encourage your friend to complete the assessment.',
    },
    {
      status: 'Hired (Probation)',
      description: 'Candidate hired and within the first 90 days.',
      action: 'Payment after confirmation.',
    },
    {
      status: 'Hired (Confirmed)',
      description: 'Candidate confirmed after probation.',
      action: 'Eligible for probation payment.',
    },
    {
      status: 'Previously Applied (No Payment)',
      description: 'Candidate applied before referral.',
      action: 'No payment is eligible for this case.',
    },
    {
      status: 'Not Selected',
      description: 'Candidate not proceeding.',
      action: 'No action required.',
    },
  ];

  const DEFAULT_EARNINGS_STRUCTURE = {
    assessment_passed: {
      label: 'Assessment Passed',
      condition: 'Candidate passes the AI assessment',
      payment: 'RM50',
    },
    probation_completed: {
      label: 'Probation Completed',
      condition: 'Candidate completes 90-day probation period',
      payment: 'RM750',
    },
  };

  // Safe getters for possibly-missing globals
  const T = () => (window.translations ? (translations[AppState.currentLanguage] || translations.en || {}) : {});
  const DISPLAY_ORDER = () =>
    (window.StatusMapping && Array.isArray(StatusMapping.displayOrder) && StatusMapping.displayOrder.length
      ? StatusMapping.displayOrder
      : DEFAULT_DISPLAY_ORDER);

  const STATUS_EXAMPLES = () =>
    (typeof window.statusExamples !== 'undefined' && Array.isArray(window.statusExamples) && window.statusExamples.length
      ? window.statusExamples
      : DEFAULT_STATUS_EXAMPLES);

  const EARNINGS_STRUCTURE = () =>
    (typeof window.earningsStructure !== 'undefined' &&
    window.earningsStructure &&
    Object.keys(window.earningsStructure).length
      ? window.earningsStructure
      : DEFAULT_EARNINGS_STRUCTURE);

  // =============================
  // Initialize application
  // =============================
  function initializeApp() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    updateTranslations();
    setupEventListeners();
    document.getElementById('dashboard-phone')?.focus();

    if (AppState.debugMode && window.ApiService?.testConnection) {
      ApiService.testConnection();
    }

    checkForDemoMode();

    // Failsafe: if any stats card accidentally has .progress, fix it immediately
    fixProgressCardClasses();
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
    document.getElementById('lang-select')?.addEventListener('change', handleLanguageChange);
    document.getElementById('dashboard-submit')?.addEventListener('click', handleFormSubmit);

    // Only numbers in phone
    document.getElementById('dashboard-phone')?.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '');
    });

    // Delegate dynamic buttons
    document.addEventListener('click', function (e) {
      if (e.target.closest('.remind-btn')) {
        handleReminderClick(e);
      }
      if (e.target && e.target.id === 'dashboard-back') {
        handleBackButton();
      }
    });

    // Enter key submits
    document.getElementById('dashboard-form')?.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleFormSubmit();
      }
    });
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

      // Demo shortcut
      if (phone === '0123456789' && email.toLowerCase() === 'amr@tp.com') {
        apiData = generateMockData();
      } else {
        if (!window.ApiService?.fetchReferrals) {
          throw new Error('ApiService.fetchReferrals is not available');
        }
        apiData = await ApiService.fetchReferrals(phone, email);
      }

      AppState.currentReferralsData = processReferrals(apiData);
      showReferralResults(AppState.currentReferralsData);
    } catch (error) {
      console.error('Error:', error);
      AppState.currentReferralsData = [];
      showReferralResults([]);
      showNonBlockingError(T().errorMessage || 'Something went wrong. Please try again.');
    } finally {
      setLoadingState(false);
    }
  }

  // =============================
  // Mock data for demo
  // =============================
  function generateMockData() {
    const today = new Date();
    const d = (n) => new Date(today - n * 86400000).toISOString();
    return [
      // Hired examples
      { Person_system_id: 'TP020', First_Name: 'Tarek Ezz', Email: 'tarekezz@yahoo.com', Employee: '0123456789', Status: 'New Starter (Hired)', Source: 'xRAF', Location: 'Kuala Lumpur', F_Nationality: 'Egypt', CreatedDate: d(150), UpdatedDate: d(100) },
      { Person_system_id: 'TP021', First_Name: 'Loai', Email: 'loai@tp.com', Employee: '0123456789', Status: 'New Starter (Hired)', Source: 'xRAF', Location: 'Penang', F_Nationality: 'Yamen', CreatedDate: d(150), UpdatedDate: d(100) },
      { Person_system_id: 'TP022', First_Name: 'Micole Barrientos', Email: 'miki@tp.com', Employee: '0123456789', Status: 'New Starter (Hired)', Source: 'xRAF', Location: 'Penang', F_Nationality: 'Philipinese', CreatedDate: d(150), UpdatedDate: d(100) },
      { Person_system_id: 'TP023', First_Name: 'Anna Saw Yee Lin', Email: 'anna@tp.com', Employee: '0123456789', Status: 'New Starter (Hired)', Source: 'xRAF', Location: 'Penang', F_Nationality: 'Malaysian', CreatedDate: d(150), UpdatedDate: d(100) },
      { Person_system_id: 'TP024', First_Name: 'Pourya Tohidi', Email: 'pourya@tp.com', Employee: '0123456789', Status: 'New Starter (Hired)', Source: 'xRAF', Location: 'Penang', F_Nationality: 'Iran', CreatedDate: d(150), UpdatedDate: d(100) },
      { Person_system_id: 'TP025', First_Name: 'Melaine Sua', Email: 'melaine@tp.com', Employee: '0123456789', Status: 'New Starter (Hired)', Source: 'xRAF', Location: 'Penang', F_Nationality: 'Malaysian', CreatedDate: d(150), UpdatedDate: d(100) },

      // Application / Contact attempt
      { Person_system_id: 'TP001', First_Name: 'Amr Ezz', Email: 'amr@gmail.com', Employee: '0183931348', Status: 'Application Received', Source: 'xRAF', Location: 'Kuala Lumpur', F_Nationality: 'Egypt', CreatedDate: d(2), UpdatedDate: d(2) },
      { Person_system_id: 'TP002', First_Name: 'Micole Barrientos', Email: 'Miki@hotmail.com', Employee: '0126240297', Status: 'Contact Attempt 1', Source: 'xRAF', Location: 'Penang', F_Nationality: 'Malaysian', CreatedDate: d(5), UpdatedDate: d(4) },

      // Assessment / Interview
      { Person_system_id: 'TP003', First_Name: 'Kumar Raj', Email: 'kumar.raj@yahoo.com', Employee: '0176543210', Status: 'SHL Assessment: Conversational Multichat ENG', Source: 'xRAF', Location: 'Johor Bahru', F_Nationality: 'Indian', CreatedDate: d(10), UpdatedDate: d(3) },
      { Person_system_id: 'TP004', First_Name: 'Jennifer Tan', Email: 'jennifer.tan@gmail.com', Employee: '0165432109', Status: 'Interview Scheduled', Source: 'xRAF', Location: 'Cyberjaya', F_Nationality: 'Malaysian', CreatedDate: d(15), UpdatedDate: d(1) },

      // Probation / Hired
      { Person_system_id: 'TP005', First_Name: 'Michael Wong', Email: 'michael.wong@outlook.com', Employee: '0154321098', Status: 'New Starter (Hired)', Source: 'xRAF', Location: 'Kuala Lumpur', F_Nationality: 'Malaysian', CreatedDate: d(45), UpdatedDate: d(30) },
      { Person_system_id: 'TP006', First_Name: 'Lisa Chen', Email: 'lisa.chen@gmail.com', Employee: '0143210987', Status: 'Onboarding Started', Source: 'xRAF', Location: 'Petaling Jaya', F_Nationality: 'Chinese', CreatedDate: d(60), UpdatedDate: d(50) },

      // Confirmed
      { Person_system_id: 'TP007', First_Name: 'David Lim', Email: 'david.lim@gmail.com', Employee: '0132109876', Status: 'Graduate', Source: 'xRAF', Location: 'Kuala Lumpur', F_Nationality: 'Malaysian', CreatedDate: d(120), UpdatedDate: d(95) },
      { Person_system_id: 'TP008', First_Name: 'Emily Ooi', Email: 'emily.ooi@yahoo.com', Employee: '0121098765', Status: 'New Starter (Hired)', Source: 'xRAF', Location: 'Penang', F_Nationality: 'Malaysian', CreatedDate: d(150), UpdatedDate: d(100) },

      // Previously applied (no payment)
      { Person_system_id: 'TP009', First_Name: 'Jason Ng', Email: 'jason.ng@gmail.com', Employee: '0110987654', Status: 'Interview Complete / Offer Requested', Source: 'External Portal', Location: 'Shah Alam', F_Nationality: 'Malaysian', CreatedDate: d(20), UpdatedDate: d(10) },
      { Person_system_id: 'TP010', First_Name: 'Rachel Yap', Email: 'rachel.yap@hotmail.com', Employee: '0109876543', Status: 'Screened', Source: 'Internal Portal', Location: 'Subang Jaya', F_Nationality: 'Malaysian', CreatedDate: d(25), UpdatedDate: d(15) },

      // Not selected
      { Person_system_id: 'TP011', First_Name: 'Steven Toh', Email: 'steven.toh@gmail.com', Employee: '0198765432', Status: 'Eliminated - Assessment Results Did Not Meet Criteria', Source: 'xRAF', Location: 'Ipoh', F_Nationality: 'Malaysian', CreatedDate: d(30), UpdatedDate: d(20) },
      { Person_system_id: 'TP012', First_Name: 'Angela Low', Email: 'angela.low@yahoo.com', Employee: '0187654321', Status: 'Withdrew - Other Job Offer', Source: 'xRAF', Location: 'Melaka', F_Nationality: 'Malaysian', CreatedDate: d(35), UpdatedDate: d(25) },
    ];
  }

  // =============================
  // Process API response
  // =============================
  function processReferrals(apiData) {
    if (!Array.isArray(apiData)) return [];

    const uniqueReferrals = new Map();

    apiData.forEach((item) => {
      const email = (item.Email || item.email || '').toLowerCase().trim();
      const name = (item.First_Name || item.name || 'Unknown').trim();
      const phone = (item.Employee || item.phone || '').trim();

      const key = email ? `${email}_${name}` : `${phone}_${name}`;

      if (uniqueReferrals.has(key)) {
        const existing = uniqueReferrals.get(key);
        const existingDate = new Date(existing.UpdatedDate || existing.updatedDate || 0);
        const currentDate = new Date(item.UpdatedDate || item.updatedDate || 0);
        if (currentDate <= existingDate) return;
      }

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

      const rawStatus = (item.Status || item.status || 'Application Received').trim();
      const source = (item.Source || item.source || item.SourceName || '').trim();
      const isXRAF = source.toLowerCase().trim() === 'xraf';

      const assessment = item.assessment || null;

      let mappedStatus = (window.StatusMapping?.mapStatusToGroup)
        ? StatusMapping.mapStatusToGroup(rawStatus, assessment, source, daysInStage)
        : rawStatus;

      if (mappedStatus === 'Hired (Probation)' && daysSinceCreation >= 90) {
        mappedStatus = 'Hired (Confirmed)';
      }

      const statusType = (window.StatusMapping?.getSimplifiedStatusType)
        ? StatusMapping.getSimplifiedStatusType(rawStatus, assessment, source, daysInStage)
        : 'info';

      const stage = (window.StatusMapping?.determineStage)
        ? StatusMapping.determineStage(rawStatus, assessment, source, daysInStage)
        : mappedStatus;

      const needsAction = mappedStatus === 'Application Received';

      uniqueReferrals.set(key, {
        id: item.Person_system_id || item.personId || item.ID || key,
        personId: item.Person_system_id || item.personId || item.ID,
        uniqueKey: key,
        name,
        email,
        phone,
        status: rawStatus,
        mappedStatus,
        statusType,
        stage,
        source,
        isXRAF,
        isPreviousCandidate: !isXRAF && source !== '',
        assessment,
        hasPassedAssessment: assessment && assessment.score >= 70,
        assessmentScore: assessment ? assessment.score : null,
        assessmentDate: assessment ? assessment.date : null,
        location: item.Location || item.location || '',
        nationality: item.F_Nationality || item.nationality || '',
        createdDate,
        updatedDate,
        daysInStage,
        daysSinceCreation,
        needsAction,
        isEligibleForAssessmentPayment:
          isXRAF &&
          (mappedStatus === 'Assessment Stage' ||
            mappedStatus === 'Hired (Probation)' ||
            mappedStatus === 'Hired (Confirmed)') &&
          (!assessment || assessment.score >= 70),
        isEligibleForProbationPayment: isXRAF && mappedStatus === 'Hired (Confirmed)',
        _original: item,
      });
    });

    return Array.from(uniqueReferrals.values()).sort((a, b) => b.createdDate - a.createdDate);
  }

  // =============================
  // Validation
  // =============================
  function validateInputs(phone, email) {
    let isValid = true;

    const phoneEl = document.getElementById('dashboard-phone');
    const emailEl = document.getElementById('dashboard-email');

    if (!/^01\d{8,9}$/.test(phone)) {
      showError(phoneEl, T().phoneError || 'Invalid phone number.');
      isValid = false;
    } else {
      clearError(phoneEl);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError(emailEl, T().emailError || 'Invalid email address.');
      isValid = false;
    } else {
      clearError(emailEl);
    }

    return isValid;
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
    const btn = document.getElementById('dashboard-submit');
    if (!btn) return;
    btn.disabled = isLoading;
    const t = T();
    btn.innerHTML = isLoading
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
      showReferralResults(AppState.currentReferralsData);
    }
  }

  // =============================
  // Results view
  // =============================
  function showReferralResults(referrals) {
    const auth = document.getElementById('auth-step');
    const results = document.getElementById('results-step');
    if (auth) auth.style.display = 'none';
    if (results) {
      results.style.display = 'block';
      results.innerHTML = createResultsContent(referrals);
    }

    updateChart(referrals);
    updateEarningsTable(referrals);
    updateReminderSection(referrals);
    updateReferralList(referrals);
    updateStatusGuide();
    updateTranslations();

    // Failsafe for .progress on stats card
    fixProgressCardClasses();

    // Watch for dynamic inserts (if any) and re-fix
    if (results && 'MutationObserver' in window) {
      const mo = new MutationObserver(() => fixProgressCardClasses());
      mo.observe(results, { childList: true, subtree: true });
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
      console.log('Referral Status Summary:', referrals.map(r => ({ name: r.name, status: r.status, mapped: r.mappedStatus })));
      console.log('In Progress Count:', inProgressCount, 'Hired Count:', hiredCount);
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
    phone?.focus();
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

    if (AppState.statusChart) {
      AppState.statusChart.destroy();
    }

    const order = DISPLAY_ORDER();
    const counts = {};
    order.forEach((s) => (counts[s] = 0));
    referrals.forEach((r) => {
      if (r && counts[r.mappedStatus] !== undefined) counts[r.mappedStatus]++;
    });

    const colors = ['#0087FF', '#00d769', '#f5d200', '#84c98b', '#676767', '#dc3545'];

    AppState.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: order.map((status) => {
          const key = `status${status.replace(/[\s()]/g, '')}`;
          return T()[key] || status;
        }),
        datasets: [
          {
            data: order.map((s) => counts[s] || 0),
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
    const body = document.getElementById('earnings-body');
    if (!body) return;

    const assessmentPassed = referrals.filter((r) => r.isEligibleForAssessmentPayment).length;
    const probationCompleted = referrals.filter((r) => r.isEligibleForProbationPayment).length;

    const assessmentEarnings = assessmentPassed * 50;
    const probationEarnings = probationCompleted * 750;
    const totalEarnings = assessmentEarnings + probationEarnings;

    body.innerHTML = `
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

    container.innerHTML = '';

    const order = DISPLAY_ORDER();
    const sorted = [...referrals].sort((a, b) => order.indexOf(a.mappedStatus) - order.indexOf(b.mappedStatus));

    sorted.forEach((ref) => {
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
                <span class="badge bg-${ref.statusType} status-badge">${ref.mappedStatus}</span>
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
                  ? `<button class="btn btn-sm btn-success w-100 remind-btn" data-name="${ref.name}" data-phone="${ref.phone}">
                      <i class="fab fa-whatsapp me-2"></i>
                      <span data-translate="remindBtn">Remind</span>
                    </button>`
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
  // Status guide (EXAMPLES + PAYMENT CONDITIONS with reliable fallbacks)
  // =============================
  function updateStatusGuide() {
    const container = document.getElementById('status-guide-content');
    if (!container) return;

    const t = T();

    const examplesList = STATUS_EXAMPLES();
    const examplesHtml = examplesList
      .map((example) => {
        let statusType = (window.StatusMapping?.getSimplifiedStatusType)
          ? StatusMapping.getSimplifiedStatusType(example.status)
          : 'info';
        if (example.status === 'Hired (Confirmed)') statusType = 'passed';
        if (example.status === 'Previously Applied (No Payment)') statusType = 'previously-applied';

        const label = t[`status${example.status.replace(/[\s()]/g, '')}`] || example.status;

        return `
          <div class="status-example">
            <div class="d-flex justify-content-between align-items-center">
              <strong>${label}</strong>
              <span class="badge bg-${statusType}">${example.status}</span>
            </div>
            <p class="mb-1 mt-2 small">${example.description}</p>
            <small class="text-muted">${example.action}</small>
          </div>
        `;
      })
      .join('');

    const structure = EARNINGS_STRUCTURE();
    const paymentRowsHtml = Object.values(structure)
      .map((v) => `
        <tr>
          <td>${v.label}</td>
          <td>${v.condition}</td>
          <td><strong>${v.payment}</strong></td>
        </tr>
      `)
      .join('');

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
    const t = T();

    document.querySelectorAll('[data-translate]').forEach((el) => {
      const key = el.getAttribute('data-translate');
      if (t[key]) el.textContent = t[key];
    });

    document.querySelectorAll('[data-translate-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-translate-placeholder');
      if (t[key]) el.placeholder = t[key];
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
      const el = document.getElementById(alertId);
      if (el) {
        el.classList.remove('show');
        setTimeout(() => el.remove(), 150);
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

  // Expose some for debugging (optional)
  window.AppState = AppState;
  window.handleBackButton = handleBackButton;
});
