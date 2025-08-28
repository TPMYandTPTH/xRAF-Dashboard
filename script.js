// Main Application Script (xRAF Dashboard)
// Visibility fix for WhatsApp reminders + payment logic + Plan B
document.addEventListener('DOMContentLoaded', function () {
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

    updateTranslations();
    setupEventListeners();
    document.getElementById('dashboard-phone')?.focus();

    if (AppState.debugMode && window.ApiService?.testConnection) {
      ApiService.testConnection();
    }
  }

  // -----------------------------
  // Event Listeners
  // -----------------------------
  function setupEventListeners() {
    document.getElementById('lang-select')?.addEventListener('change', handleLanguageChange);
    document.getElementById('dashboard-submit')?.addEventListener('click', handleFormSubmit);

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
    form?.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleFormSubmit();
      }
    });
  }

  // -----------------------------
  // Language
  // -----------------------------
  function handleLanguageChange(e) {
    AppState.currentLanguage = e.target.value;
    updateTranslations();
    const resultsShown = document.getElementById('results-step')?.style.display !== 'none';
    if (resultsShown) showReferralResults(AppState.currentReferralsData);
  }

  function updateTranslations() {
    const lang = AppState.currentLanguage;
    const t = translations?.[lang] || translations?.en || {};
    document.querySelectorAll('[data-translate]').forEach(el => {
      const key = el.getAttribute('data-translate');
      if (t[key]) el.textContent = t[key];
    });
    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
      const key = el.getAttribute('data-translate-placeholder');
      if (t[key]) el.placeholder = t[key];
    });
  }

  // -----------------------------
  // Form Submit
  // -----------------------------
  async function handleFormSubmit() {
    const phone = document.getElementById('dashboard-phone')?.value.trim() || '';
    const email = document.getElementById('dashboard-email')?.value.trim() || '';

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
      showNonBlockingError((translations?.[AppState.currentLanguage] || translations.en).connectingMessage || 'Connection issue.');
    } finally {
      setLoadingState(false);
    }
  }

  function validateInputs(phone, email) {
    let ok = true;
    if (!/^01\d{8,9}$/.test(phone)) {
      showError(document.getElementById('dashboard-phone'), translations[AppState.currentLanguage].phoneError);
      ok = false;
    } else clearError(document.getElementById('dashboard-phone'));

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError(document.getElementById('dashboard-email'), translations[AppState.currentLanguage].emailError);
      ok = false;
    } else clearError(document.getElementById('dashboard-email'));

    return ok;
  }

  function showError(input, message) {
    if (!input) return;
    const wrap = input.closest('.mb-3');
    const err = wrap?.querySelector('.invalid-feedback');
    if (err) err.textContent = message;
    input.classList.add('is-invalid');
  }

  function clearError(input) { input?.classList.remove('is-invalid'); }

  function setLoadingState(isLoading) {
    const btn = document.getElementById('dashboard-submit');
    if (!btn) return;
    btn.disabled = isLoading;
    btn.innerHTML = isLoading
      ? `<span class="spinner-border spinner-border-sm me-2"></span>${(translations?.[AppState.currentLanguage] || translations.en).connectingMessage || 'Connecting...'}`
      : (translations?.[AppState.currentLanguage] || translations.en).viewStatusBtn || 'View Referral Status';
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

      // xRAF detector
      const sourceL = source.toLowerCase();
      const isXRAF = (
        sourceL.includes('xraf') ||
        sourceL.includes('employee referral') ||
        sourceL.includes('employee_referral') ||
        sourceL.includes('raf') ||
        sourceL === '' ||
        source === 'xRAF' || source === 'RAF' || source === 'Employee Referral'
      );

      const assessment = item.assessment || null;

      // Plan B: "Second Interview" etc. ⇒ treat as assessment passed
      const passedByStatus = /(second\s*interview|2nd\s*interview|interview\s*2|round\s*2|stage\s*2)/i.test(rawStatus);

      // Group mapping
      let mappedStatus = StatusMapping.mapStatusToGroup(rawStatus, assessment, source, daysInStage);

      // Formal Employee override
      const isFormalEmployee = /formal\s*employee/i.test(rawStatus);
      if (isFormalEmployee) {
        mappedStatus = daysInStage >= 90 ? 'Hired (Confirmed)' : 'Hired (Probation)';
      }
      if (mappedStatus === 'Hired (Probation)' && daysSinceCreation >= 90) {
        mappedStatus = 'Hired (Confirmed)';
      }

      const statusType = StatusMapping.getSimplifiedStatusType(rawStatus, assessment, source, daysInStage);
      const stage = StatusMapping.determineStage(rawStatus, assessment, source, daysInStage);

      const hasPassedAssessment = passedByStatus || (assessment && Number(assessment.score) >= 70);

      // Eligible for reminders?
      const needsAction = (mappedStatus === 'Application Received' || mappedStatus === 'Assessment Stage');

      // Payment eligibility
      const isEligibleForAssessmentPayment = isXRAF && hasPassedAssessment;
      const isEligibleForProbationPayment =
        isXRAF && (
          (isFormalEmployee && daysInStage >= 90) ||
          mappedStatus === 'Hired (Confirmed)'
        );

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
        assessmentScore: assessment ? Number(assessment.score) : (passedByStatus ? 70 : null),
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

    updateWhatsAppBanner(referrals);   // <— NEW: top banner
    updateChart(referrals);
    updateEarningsTable(referrals);
    updateReminderSection(referrals);
    updateReferralList(referrals);
    updateStatusGuide();
    updateTranslations();
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

      <!-- WhatsApp Banner (always rendered, visibility toggled in JS) -->
      <div id="whatsapp-banner" class="alert alert-success d-flex align-items-center justify-content-between" role="alert" style="display:none;">
        <div>
          <i class="fab fa-whatsapp me-2"></i>
          <strong>WhatsApp Reminders:</strong>
          <span id="wa-count">0</span> candidate(s) ready
        </div>
        <button id="wa-open" class="btn btn-success btn-sm">
          Open List
        </button>
      </div>

      <!-- Stats Cards -->
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

      <!-- Status Distribution Chart -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title text-center mb-3" data-translate="statusDistribution">Status Distribution</h5>
          <div class="chart-container">
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

      <!-- Reminder Section -->
      <div class="card mb-4" id="wa-section">
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

      <!-- Status Guide -->
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
    phone?.focus();
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
      (translations?.[AppState.currentLanguage] || translations.en)[`status${status.replace(/[\s()]/g, '')}`] || status
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
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
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
        <td data-translate="statusAssessmentPassed">Assessment Passed (Score ≥ 70%)</td>
        <td>RM 50</td>
        <td>${assessmentPassedCount}</td>
        <td>RM ${assessmentRM}</td>
      </tr>
      <tr>
        <td data-translate="statusProbationPassed">Probation Completed (90 days)</td>
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
    const t = translations?.[AppState.currentLanguage] || translations.en;

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
                    <strong>${t[`status${example.status.replace(/[\s()]/g, '')}`] || example.status}</strong>
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
                ${Object.entries(earningsStructure).map(([_, v]) => `
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
