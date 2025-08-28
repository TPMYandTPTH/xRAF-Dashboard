// Main Application Script (xRAF Dashboard)
// Fixes: add statusExamples + earningsStructure, set <html data-lang>, safer translations, keep demo + WhatsApp logic
document.addEventListener('DOMContentLoaded', function () {
  // -----------------------------
  // Globals used by the Status Guide (these were missing and caused a crash)
  // -----------------------------
  const earningsStructure = {
    assessment: {
      label: 'Assessment Passed',
      // <- your requested wording
      condition: 'RM50 payment eligible if the candidate pass the AI assessment',
      payment: 'RM 50'
    },
    probation: {
      label: 'Probation Completed',
      condition: 'Candidate employed for at least 90 days',
      payment: 'RM 750'
    }
  };

  const statusExamples = [
    {
      status: 'Application Received',
      description: 'We’ve received the application or the candidate is doing SHL assessments.',
      action: 'Encourage them to complete the assessment promptly.'
    },
    {
      status: 'Assessment Stage',
      description: 'Screening/interviews/offers in progress.',
      action: 'Remind them to attend interviews and check email for instructions.'
    },
    {
      status: 'Hired (Probation)',
      description: 'Candidate hired and within first 90 days.',
      action: 'No action — payment for RM750 is after 90 days.'
    },
    {
      status: 'Hired (Confirmed)',
      description: 'Hired and ≥ 90 days in stage.',
      action: 'Eligible for RM750 payment.'
    },
    {
      status: 'Previously Applied (No Payment)',
      description: 'Source is not xRAF (e.g., LinkedIn/JobStreet).',
      action: 'No payment, but you can still support their process.'
    },
    {
      status: 'Not Selected',
      description: 'Candidate withdrew or was eliminated.',
      action: 'Invite them to try again after improving fit or requirements.'
    }
  ];

  // -----------------------------
  // Application State
  // -----------------------------
  const AppState = {
    currentLanguage: 'en',
    statusChart: null,
    currentReferralsData: [],
    isLoading: false,
    debugMode: false
  };

  // -----------------------------
  // Initialization
  // -----------------------------
  function initializeApp() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    updateTranslations();           // set initial texts
    setupEventListeners();
    const phoneEl = document.getElementById('dashboard-phone');
    if (phoneEl) phoneEl.focus();

    if (AppState.debugMode && window.ApiService && typeof ApiService.testConnection === 'function') {
      ApiService.testConnection();
    }
  }

  // -----------------------------
  // Event Listeners
  // -----------------------------
  function setupEventListeners() {
    const langSel = document.getElementById('lang-select');
    if (langSel) langSel.addEventListener('change', handleLanguageChange);

    const submitBtn = document.getElementById('dashboard-submit');
    if (submitBtn) submitBtn.addEventListener('click', handleFormSubmit);

    const phoneInput = document.getElementById('dashboard-phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
      });
    }

    // Delegate for dynamic content
    document.addEventListener('click', function (e) {
      if (e.target.closest('.remind-btn')) handleReminderClick(e);
      if (e.target.id === 'dashboard-back') handleBackButton();
      if (e.target.id === 'wa-open') scrollToReminderSection();
    });

    // Enter key submits
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

  // -----------------------------
  // Language
  // -----------------------------
  function handleLanguageChange(e) {
    AppState.currentLanguage = e.target.value;
    updateTranslations();
    const resultsShown = document.getElementById('results-step') && document.getElementById('results-step').style.display !== 'none';
    if (resultsShown) showReferralResults(AppState.currentReferralsData);
  }

  function getTranslations(lang) {
    if (window.translations && window.translations[lang]) return window.translations[lang];
    if (window.translations && window.translations.en) return window.translations.en;
    return {};
  }

  function updateTranslations() {
    const lang = AppState.currentLanguage;
    // Make CSS language rules work:
    document.documentElement.setAttribute('data-lang', lang);

    const t = getTranslations(lang);

    // Text nodes
    document.querySelectorAll('[data-translate]').forEach(el => {
      const key = el.getAttribute('data-translate');
      if (t[key]) el.textContent = t[key];
    });
    // Placeholders
    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
      const key = el.getAttribute('data-translate-placeholder');
      if (t[key]) el.setAttribute('placeholder', t[key]);
    });
  }

  // -----------------------------
  // Form Submit
  // -----------------------------
  async function handleFormSubmit() {
    const phone = (document.getElementById('dashboard-phone')?.value || '').trim();
    const email = (document.getElementById('dashboard-email')?.value || '').trim();

    if (!validateInputs(phone, email)) return;

    setLoadingState(true);
    try {
      const apiData = await ApiService.fetchReferrals(phone, email);
      AppState.currentReferralsData = processReferrals(apiData);
      showReferralResults(AppState.currentReferralsData);
    } catch (err) {
      console.error('Error fetching/processing referrals:', err);
      AppState.currentReferralsData = [];
      showReferralResults([]);
      const t = getTranslations(AppState.currentLanguage);
      showNonBlockingError(t.connectingMessage || 'Connection issue.');
    } finally {
      setLoadingState(false);
    }
  }

  function validateInputs(phone, email) {
    let ok = true;
    const t = getTranslations(AppState.currentLanguage);

    if (!/^01\d{8,9}$/.test(phone)) {
      showError(document.getElementById('dashboard-phone'), t.phoneError || 'Invalid phone.');
      ok = false;
    } else clearError(document.getElementById('dashboard-phone'));

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError(document.getElementById('dashboard-email'), t.emailError || 'Invalid email.');
      ok = false;
    } else clearError(document.getElementById('dashboard-email'));

    return ok;
  }

  function showError(input, message) {
    if (!input) return;
    const wrap = input.closest('.mb-3');
    const err = wrap && wrap.querySelector('.invalid-feedback');
    if (err) err.textContent = message;
    input.classList.add('is-invalid');
  }

  function clearError(input) { if (input) input.classList.remove('is-invalid'); }

  function setLoadingState(isLoading) {
    const btn = document.getElementById('dashboard-submit');
    if (!btn) return;
    const t = getTranslations(AppState.currentLanguage);
    btn.disabled = isLoading;
    btn.innerHTML = isLoading
      ? `<span class="spinner-border spinner-border-sm me-2"></span>${t.connectingMessage || 'Connecting...'}`
      : (t.viewStatusBtn || 'View Referral Status');
  }

  // -----------------------------
  // Data Processing
  // -----------------------------
  function processReferrals(apiData) {
    if (!Array.isArray(apiData)) return [];

    const parseDate = (dateStr) => {
      if (!dateStr) return new Date();
      if (typeof dateStr !== 'string') return new Date(dateStr);
      if (dateStr.includes('/')) {
        const [month, day, year] = dateStr.split(/[\/\s]/).filter(Boolean).map(Number);
        return new Date(year, month - 1, day);
      }
      return new Date(dateStr);
    };

    const unique = new Map();

    apiData.forEach(item => {
      const email = (item.Email || item.email || '').toLowerCase().trim();
      const name = (item.First_Name || item.name || 'Unknown').trim();
      const phone = (item.Employee || item.phone || '').trim();
      const key = email ? `${email}_${name}` : `${phone}_${name}`;

      // keep most recent
      if (unique.has(key)) {
        const existing = unique.get(key);
        const existUpdated = new Date(existing.updatedDate || 0);
        const currUpdated = parseDate(item.UpdatedDate || item.updatedDate);
        if (currUpdated <= existUpdated) return;
      }

      const createdDate = parseDate(item.CreatedDate || item.createdDate);
      const updatedDate = parseDate(item.UpdatedDate || item.updatedDate);
      const now = new Date();

      const daysInStage = Math.max(0, Math.floor((now - updatedDate) / 86400000));
      const daysSinceCreation = Math.max(0, Math.floor((now - createdDate) / 86400000));

      const rawStatus = String(item.Status || item.status || 'Application Received').trim();
      const source = (item.Source || item.source || item.SourceName || '').trim();

      const assessment = item.assessment || null;

      // Map to display group
      let mappedStatus = StatusMapping.mapStatusToGroup(rawStatus, assessment, source, daysInStage);

      // Formal Employee override (if you ever receive this)
      const isFormalEmployee = /formal\s*employee/i.test(rawStatus);
      if (isFormalEmployee) {
        mappedStatus = daysInStage >= 90 ? 'Hired (Confirmed)' : 'Hired (Probation)';
      }
      if (mappedStatus === 'Hired (Probation)' && daysSinceCreation >= 90) {
        mappedStatus = 'Hired (Confirmed)';
      }

      const statusType = StatusMapping.getSimplifiedStatusType(rawStatus, assessment, source, daysInStage);
      const stage = StatusMapping.determineStage(rawStatus, assessment, source, daysInStage);

      // Assessment pass: score >= 70 OR inferred from status progression
      const hasPassedAssessment = (assessment && Number(assessment.score) >= 70) || StatusMapping.hasPassedAIAssessment(rawStatus, assessment);

      // Only xRAF is accepted (matches statusMapping.js rule)
      const isXRAF = StatusMapping._isXRafSource(source);

      const needsAction = StatusMapping.isReminderEligible(mappedStatus);

      // Payment eligibility aligned with your wording
      const isEligibleForAssessmentPayment = isXRAF && hasPassedAssessment;
      const isEligibleForProbationPayment = isXRAF && (mappedStatus === 'Hired (Confirmed)');

      unique.set(key, {
        id: item.Person_system_id || item.personId || item.ID || key,
        personId: item.Person_system_id || item.personId || item.ID || '',
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
        hasPassedAssessment,
        assessmentScore: assessment ? Number(assessment.score) : (hasPassedAssessment ? 70 : null),
        assessmentDate: assessment ? assessment.date : null,

        location: item.Location || item.location || '',
        nationality: item.F_Nationality || item.nationality || '',

        createdDate,
        updatedDate,
        daysInStage,
        daysSinceCreation,

        needsAction,

        isEligibleForAssessmentPayment,
        isEligibleForProbationPayment,

        _original: item
      });
    });

    return Array.from(unique.values()).sort((a, b) => b.createdDate - a.createdDate);
  }

  // -----------------------------
  // UI: Results & Sections
  // -----------------------------
  function showReferralResults(referrals) {
    const auth = document.getElementById('auth-step');
    const resultsStep = document.getElementById('results-step');
    if (!resultsStep) return;

    if (auth) auth.style.display = 'none';
    resultsStep.style.display = 'block';
    resultsStep.innerHTML = createResultsContent(referrals);

    updateWhatsAppBanner(referrals);
    updateChart(referrals);
    updateEarningsTable(referrals);
    updateReminderSection(referrals);
    updateReferralList(referrals);
    updateStatusGuide();
    updateTranslations(); // re-apply current language to freshly injected nodes
  }

  function createResultsContent(referrals) {
    const hiredCount = referrals.filter(r =>
      r.mappedStatus === 'Hired (Confirmed)' || r.mappedStatus === 'Hired (Probation)'
    ).length;

    const inProgressCount = referrals.filter(r =>
      r.mappedStatus === 'Application Received' || r.mappedStatus === 'Assessment Stage'
    ).length;

    const emailVal = document.getElementById('dashboard-email')?.value || '';
    const userName = emailVal.split('@')[0] || 'You';

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

      <div id="whatsapp-banner" class="alert alert-success d-flex align-items-center justify-content-between" role="alert" style="display:none;">
        <div>
          <i class="fab fa-whatsapp me-2"></i>
          <strong>WhatsApp Reminders:</strong>
          <span id="wa-count">0</span> candidate(s) ready
        </div>
        <button id="wa-open" class="btn btn-success btn-sm">Open List</button>
      </div>

      <div class="row mb-4">
        <div class="col-md-4 mb-3">
          <div class="card stats-card">
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

      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title text-center mb-3" data-translate="statusDistribution">Status Distribution</h5>
          <div class="chart-container">
            <canvas id="statusChart"></canvas>
            <img src="TPLogo11.png" class="chart-logo" alt="TP Logo">
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title text-center mb-3" data-translate="earningsTitle">Your Earnings</h5>
          <div class="table-responsive">
            <table class="earnings-table">
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

      <div class="card mb-4" id="wa-section">
        <div class="card-body">
          <h5 class="card-title text-center mb-3" data-translate="remindFriendsTitle">Remind Your Friends</h5>
          <p class="text-center" data-translate="remindFriendsText">Help your friends complete their assessments to join TP!</p>
          <div id="friends-to-remind" class="row"></div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-body">
          <h5 class="mb-3">All Referrals</h5>
          <div id="referral-list"></div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title text-center mb-4" data-translate="statusGuideTitle">Status Guide & Payment Information</h5>
          <div id="status-guide-content"></div>
        </div>
      </div>
    `;
  }

  function handleBackButton() {
    const auth = document.getElementById('auth-step');
    const resultsStep = document.getElementById('results-step');
    if (auth) auth.style.display = 'block';
    if (resultsStep) resultsStep.style.display = 'none';
    const phone = document.getElementById('dashboard-phone');
    const email = document.getElementById('dashboard-email');
    if (phone) phone.value = '';
    if (email) email.value = '';
    if (phone) phone.focus();
    AppState.currentReferralsData = [];
  }

  // -----------------------------
  // WhatsApp Banner + Reminders
  // -----------------------------
  function updateWhatsAppBanner(referrals) {
    const banner = document.getElementById('whatsapp-banner');
    const countEl = document.getElementById('wa-count');
    if (!banner || !countEl) return;

    const eligible = referrals.filter(r =>
      (r.mappedStatus === 'Application Received' || r.mappedStatus === 'Assessment Stage') && r.phone
    );

    countEl.textContent = String(eligible.length);
    banner.style.display = eligible.length > 0 ? 'flex' : 'none';
  }

  function scrollToReminderSection() {
    const sec = document.getElementById('wa-section');
    if (!sec) return;
    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleReminderClick(e) {
    const button = e.target.closest('.remind-btn');
    if (!button) return;

    const name = button.dataset.name || '';
    const phone = button.dataset.phone || '';
    const lang = button.dataset.lang || AppState.currentLanguage;

    const msisdn = toWhatsAppMsisdn(phone);
    if (!msisdn) return;

    const messages = {
      en: `Hello ${name},\n\nThis is a friendly reminder about your Teleperformance application.\n\nPlease complete your assessment (check your email for the link). Completing it is an important step in your application.\n\nIf you need any help, just reply here.\n\nBest regards,\nTP Recruitment Team`,
      ja: `${name}様\n\nテレパフォーマンスへのご応募に関するリマインダーです。\n\nメールで送信されたリンクからアセスメントのご完了をお願いいたします。ご不明点がございましたらご連絡ください。\n\nよろしくお願いいたします。\nTP採用チーム`,
      ko: `안녕하세요 ${name}님,\n\n텔레퍼포먼스 지원과 관련한 안내입니다.\n\n이메일로 발송된 링크를 통해 평가(assessment)를 완료해 주세요. 도움이 필요하시면 회신해 주세요.\n\n감사합니다.\nTP 채용팀`,
      "zh-CN": `${name} 您好，\n\n这是关于您申请Teleperformance的提醒。\n\n请查看邮箱并完成评估。需要帮助请直接回复。\n\n谢谢！\nTP招聘团队`,
      "zh-HK": `${name} 您好，\n\n這是關於您申請Teleperformance的提醒。\n\n請查看電郵並完成評估。如需協助可直接回覆。\n\n謝謝！\nTP招聘團隊`
    };
    const msg = messages[lang] || messages.en;

    window.open(`https://wa.me/${msisdn}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  function toWhatsAppMsisdn(raw) {
    if (!raw) return '';
    const digits = String(raw).replace(/[^\d+]/g, '');
    if (digits.startsWith('+60')) return digits.replace('+', '');
    if (digits.startsWith('60')) return digits;
    if (digits.startsWith('0')) return '60' + digits.slice(1);
    return digits.replace(/^\+/, '');
  }

  // -----------------------------
  // Chart
  // -----------------------------
  function updateChart(referrals) {
    const canvas = document.getElementById('statusChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (AppState.statusChart) AppState.statusChart.destroy();

    const counts = {};
    StatusMapping.displayOrder.forEach(s => counts[s] = 0);
    referrals.forEach(r => {
      if (counts.hasOwnProperty(r.mappedStatus)) counts[r.mappedStatus]++;
    });

    const labels = StatusMapping.displayOrder.map(status =>
      (getTranslations(AppState.currentLanguage))[`status${status.replace(/[\s()]/g, '')}`] || status
    );

    const colors = [
      '#0087FF',  // Application Received
      '#00d769',  // Assessment Stage
      '#f5d200',  // Hired (Probation)
      '#84c98b',  // Hired (Confirmed)
      '#676767',  // Previously Applied (No Payment)
      '#dc3545'   // Not Selected
    ];

    AppState.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: StatusMapping.displayOrder.map(s => counts[s] || 0),
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
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
                if (!data.labels.length || !data.datasets.length) return [];
                return data.labels.map((label, i) => ({
                  text: `${label} (${data.datasets[0].data[i]})`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                }));
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                const label = ctx.label || '';
                const value = ctx.raw || 0;
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return `${label}: ${value} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  // -----------------------------
  // Earnings
  // -----------------------------
  function updateEarningsTable(referrals) {
    const body = document.getElementById('earnings-body');
    const totalEl = document.getElementById('total-earnings');
    if (!body || !totalEl) return;

    const assessmentPassedCount = referrals.filter(r => r.isEligibleForAssessmentPayment).length;
    const probationCompletedCount = referrals.filter(r => r.isEligibleForProbationPayment).length;

    const assessmentRM = assessmentPassedCount * 50;
    const probationRM = probationCompletedCount * 750;
    const total = assessmentRM + probationRM;

    body.innerHTML = `
      <tr>
        <td>Assessment Passed</td>
        <td>RM 50</td>
        <td>${assessmentPassedCount}</td>
        <td>RM ${assessmentRM}</td>
      </tr>
      <tr>
        <td>Probation Completed (90 days)</td>
        <td>RM 750</td>
        <td>${probationCompletedCount}</td>
        <td>RM ${probationRM}</td>
      </tr>
    `;
    totalEl.textContent = `RM ${total}`;
  }

  // -----------------------------
  // Reminders Section
  // -----------------------------
  function updateReminderSection(referrals) {
    const container = document.getElementById('friends-to-remind');
    if (!container) return;

    const list = referrals.filter(r =>
      (r.mappedStatus === 'Application Received' || r.mappedStatus === 'Assessment Stage') && r.phone
    );

    if (!list.length) {
      container.innerHTML = `
        <div class="col-12 text-center">
          <p class="text-muted" data-translate="noRemindersNeeded">All your friends are on track!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    list.forEach(friend => {
      container.innerHTML += `
        <div class="col-md-6 mb-3">
          <div class="friend-to-remind">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5>${friend.name}</h5>
              <span class="badge bg-${friend.statusType}">${friend.mappedStatus}</span>
            </div>
            <p class="small mb-1">${friend.email || ''}</p>
            <p class="small mb-2"><span data-translate="referralDays">Days in Stage</span>: ${friend.daysInStage}</p>
            <button class="btn btn-primary w-100 remind-btn"
              data-name="${friend.name}"
              data-phone="${friend.phone}"
              data-lang="${AppState.currentLanguage}">
              <i class="fab fa-whatsapp me-2"></i>
              <span data-translate="remindBtn">Send WhatsApp Reminder</span>
            </button>
          </div>
        </div>
      `;
    });
  }

  // -----------------------------
  // Referrals list
  // -----------------------------
  function updateReferralList(referrals) {
    const container = document.getElementById('referral-list');
    if (!container) return;

    if (!referrals.length) {
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

    container.innerHTML = '<h5 class="mb-3">All Referrals</h5>';

    const sorted = [...referrals].sort((a, b) => {
      const ai = StatusMapping.displayOrder.indexOf(a.mappedStatus);
      const bi = StatusMapping.displayOrder.indexOf(b.mappedStatus);
      return ai - bi;
    });

    sorted.forEach(ref => {
      const scoreHtml = ref.assessment
        ? `<span class="assessment-score ${Number(ref.assessmentScore) < 70 ? 'low' : ''}">
            Score: ${Number(ref.assessmentScore)}%
           </span>`
        : (ref.hasPassedAssessment ? `<span class="assessment-score">Score: 70%</span>` : '');

      container.innerHTML += `
        <div class="card referral-card status-${ref.statusType} mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h5>${ref.name}</h5>
                <p class="small text-muted mb-1">${ref.email || ''}</p>
                ${ref.personId ? `<p class="small text-muted">ID: ${ref.personId}</p>` : ''}
              </div>
              <div class="text-end">
                <span class="badge bg-${ref.statusType} status-badge">${ref.mappedStatus}</span>
                ${scoreHtml}
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
                ${(ref.needsAction && ref.phone) ? `
                  <button class="btn btn-sm btn-success w-100 remind-btn"
                    data-name="${ref.name}"
                    data-phone="${ref.phone}"
                    data-lang="${AppState.currentLanguage}">
                    <i class="fab fa-whatsapp me-2"></i>
                    <span data-translate="remindBtn">Remind</span>
                  </button>` : ``}
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

  // -----------------------------
  // Status Guide
  // -----------------------------
  function updateStatusGuide() {
    const container = document.getElementById('status-guide-content');
    if (!container) return;

    const t = getTranslations(AppState.currentLanguage);

    container.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <h6 class="mb-3" data-translate="statusExamples">Status Examples</h6>
          <div class="status-examples">
            ${statusExamples.map(example => {
              let type = StatusMapping.getSimplifiedStatusType(example.status);
              if (example.status === "Hired (Confirmed)") type = 'passed';
              if (example.status === "Previously Applied (No Payment)") type = 'previously-applied';
              return `
                <div class="status-example">
                  <div class="d-flex justify-content-between align-items-center">
                    <strong>${t[\`status${example.status.replace(/[\s()]/g, '')}\`] || example.status}</strong>
                    <span class="badge bg-${type}">${example.status}</span>
                  </div>
                  <p class="mb-1 mt-2 small">${example.description}</p>
                  <small class="text-muted">${example.action}</small>
                </div>
              `;
            }).join('')}
          </div>
        </div>

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
                ${Object.values(earningsStructure).map(v => `
                  <tr>
                    <td>${v.label}</td>
                    <td>${v.condition}</td>
                    <td><strong>${v.payment}</strong></td>
                  </tr>
                `).join('')}
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

  // -----------------------------
  // Alerts
  // -----------------------------
  function showNonBlockingError(message) {
    const container = document.getElementById('alert-container');
    if (!container) return;
    const id = 'alert-' + Date.now();
    const el = document.createElement('div');
    el.id = id;
    el.className = 'alert alert-warning alert-dismissible fade show';
    el.setAttribute('role', 'alert');
    el.innerHTML = `
      <i class="fas fa-exclamation-triangle me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    container.appendChild(el);
    setTimeout(() => {
      const a = document.getElementById(id);
      if (!a) return;
      a.classList.remove('show');
      setTimeout(() => a.remove(), 150);
    }, 5000);
  }

  // -----------------------------
  // Kick off
  // -----------------------------
  initializeApp();

  // Expose for debugging
  window.AppState = AppState;
});
