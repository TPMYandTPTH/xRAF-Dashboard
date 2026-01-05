// Main Application Script
// Updated: January 2026 - Email-only login with OTP verification

document.addEventListener('DOMContentLoaded', function() {
    // Application State
    const AppState = {
        currentLanguage: 'en',
        statusChart: null,
        currentReferralsData: [],
        isLoading: false,
        pendingLogin: { email: null },
        debugMode: false
    };
    
    // Initialize application
    function initializeApp() {
        document.getElementById('current-year').textContent = new Date().getFullYear();
        updateTranslations();
        setupEventListeners();
        document.getElementById('dashboard-email').focus();
        
        // Check for demo mode via URL parameter
        checkForDemoMode();
    }
    
    // Check if demo mode is enabled via URL parameter
    function checkForDemoMode() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('demo') === 'true' || urlParams.get('demo') === '1') {
            document.getElementById('dashboard-email').value = 'amr@tp.com';
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Language change
        document.getElementById('lang-select').addEventListener('change', handleLanguageChange);
        
        // Step 1: Send OTP button
        document.getElementById('send-otp-btn').addEventListener('click', handleSendOTP);
        
        // Step 2: Verify OTP button
        document.getElementById('verify-otp-btn').addEventListener('click', handleVerifyOTP);
        
        // Change email link
        document.getElementById('change-email-btn').addEventListener('click', handleChangeEmail);
        
        // Resend OTP link
        document.getElementById('resend-otp').addEventListener('click', handleResendOTP);
        
        // OTP input - auto enable button when 6 digits entered
        document.getElementById('otp-input').addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
            const btn = document.getElementById('verify-otp-btn');
            btn.disabled = this.value.length !== 6;
            
            // Auto-submit when 6 digits entered
            if (this.value.length === 6) {
                setTimeout(() => btn.click(), 100);
            }
            
            // Clear error on input
            if (this.classList.contains('is-invalid')) {
                this.classList.remove('is-invalid');
            }
        });
        
        // Enter key support for email field
        document.getElementById('dashboard-email').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSendOTP();
            }
        });
        
        // Enter key support for OTP field
        document.getElementById('otp-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.value.length === 6) {
                    handleVerifyOTP();
                }
            }
        });
        
        // Delegate event handling for dynamic content
        document.addEventListener('click', function(e) {
            if (e.target.closest('.remind-btn')) {
                handleReminderClick(e);
            }
            if (e.target.id === 'dashboard-back') {
                handleBackButton();
            }
        });
    }
    
    // Step 1: Handle Send OTP
    async function handleSendOTP() {
        const email = document.getElementById('dashboard-email').value.trim();
        
        // Validate email
        if (!validateEmail(email)) {
            showError(document.getElementById('dashboard-email'), 
                     translations[AppState.currentLanguage].emailError);
            return;
        }
        
        clearError(document.getElementById('dashboard-email'));
        
        // Store email
        AppState.pendingLogin.email = email;
        
        // Show loading state
        const btn = document.getElementById('send-otp-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
        btn.disabled = true;
        
        try {
            // Request OTP
            await AuthService.requestOTP(email);
            
            // Show OTP section, hide email section
            document.getElementById('email-section').style.display = 'none';
            document.getElementById('otp-section').classList.add('show');
            document.getElementById('confirmed-email').textContent = email;
            document.getElementById('otp-input').value = '';
            document.getElementById('otp-input').focus();
            
        } catch (error) {
            console.error('OTP Error:', error);
            showNonBlockingError('Failed to send verification code. Please try again.');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
    
    // Step 2: Handle Verify OTP
    async function handleVerifyOTP() {
        const otpInput = document.getElementById('otp-input');
        const otpValue = otpInput.value;
        const btn = document.getElementById('verify-otp-btn');
        
        // Show loading state
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Verifying...';
        btn.disabled = true;
        otpInput.disabled = true;
        
        // Verify OTP
        const verification = AuthService.verifyOTP(otpValue);
        
        if (verification.success) {
            // Success! Load dashboard
            await loadDashboard();
        } else {
            // Failure - show error
            otpInput.classList.add('is-invalid');
            document.getElementById('otp-error-msg').textContent = verification.message;
            btn.innerHTML = originalText;
            btn.disabled = false;
            otpInput.disabled = false;
            otpInput.focus();
        }
    }
    
    // Handle Change Email (go back to step 1)
    function handleChangeEmail() {
        document.getElementById('otp-section').classList.remove('show');
        document.getElementById('email-section').style.display = 'block';
        document.getElementById('dashboard-email').focus();
        AppState.pendingLogin.email = null;
    }
    
    // Handle Resend OTP
    async function handleResendOTP(e) {
        e.preventDefault();
        const email = AppState.pendingLogin.email;
        if (!email) return;
        
        const link = e.target;
        const originalText = link.textContent;
        link.textContent = 'Sending...';
        link.style.pointerEvents = 'none';
        
        await AuthService.requestOTP(email);
        
        link.textContent = 'Sent!';
        setTimeout(() => {
            link.textContent = originalText;
            link.style.pointerEvents = 'auto';
        }, 3000);
    }
    
    // Load Dashboard after successful OTP verification
    async function loadDashboard() {
        const { email } = AppState.pendingLogin;
        
        try {
            // Fetch referrals from API
            const apiData = await ApiService.fetchReferrals(email);
            
            // Process and store referrals
            AppState.currentReferralsData = processReferrals(apiData);
            
            // Show dashboard
            showReferralResults(AppState.currentReferralsData);
            
        } catch (error) {
            console.error('Error:', error);
            AppState.currentReferralsData = [];
            showReferralResults([]);
            showNonBlockingError(translations[AppState.currentLanguage].errorMessage);
        }
    }
    
    // Process API response with deduplication
    function processReferrals(apiData) {
        if (!Array.isArray(apiData)) return [];
        
        const uniqueReferrals = new Map();
        
        apiData.forEach(item => {
            const email = (item.Person_x0020_Email || item.Email || item.email || '').toLowerCase().trim();
            const name = (item.Person_x0020_Full_x0020_Name || item.First_Name || item.name || 'Unknown').trim();
            const phone = (item.Default_x0020_Phone || item.Employee || item.phone || '').trim();
            
            const uniqueKey = email ? `${email}_${name}` : `${phone}_${name}`;
            
            if (uniqueReferrals.has(uniqueKey)) {
                const existing = uniqueReferrals.get(uniqueKey);
                const existingDate = new Date(existing.UpdatedDate || existing.updatedDate || 0);
                const currentDate = new Date(item.UpdatedDate || item.updatedDate || item.Modified || 0);
                if (currentDate <= existingDate) {
                    return;
                }
            }
            
            const parseDate = (dateStr) => {
                if (!dateStr) return new Date();
                if (dateStr.includes('/')) {
                    const [month, day, year] = dateStr.split(/[\/\s]/).filter(Boolean).map(Number);
                    return new Date(year, month - 1, day);
                }
                return new Date(dateStr);
            };
            
            const updatedDate = parseDate(item.Modified || item.UpdatedDate || item.updatedDate);
            const createdDate = parseDate(item.Created || item.CreatedDate || item.createdDate);
            const hireDate = item.HireDate ? parseDate(item.HireDate) : null;
            const daysInStage = Math.floor((new Date() - updatedDate) / (86400000));
            const daysSinceCreation = Math.floor((new Date() - createdDate) / (86400000));
            const daysSinceHire = hireDate ? Math.floor((new Date() - hireDate) / (86400000)) : 0;
            
            const rawStatus = (item.Recent_x0020_Status || item.Status || item.status || 'Application Received').trim();
            const source = (item.Source_x0020_Name || item.Source || item.source || item.SourceName || '').trim();
            
            const sourceL = source.toLowerCase().trim();
            const isXRAF = sourceL === 'xraf';
            
            let mappedStatus = StatusMapping.mapStatusToGroup(rawStatus, null, source, daysInStage);
            
            if (mappedStatus === 'Hired (Probation)') {
                const daysEmployed = hireDate ? daysSinceHire : daysSinceCreation;
                if (daysEmployed >= 90) {
                    mappedStatus = 'Hired (Confirmed)';
                }
            }
            
            const statusType = StatusMapping.getSimplifiedStatusType(rawStatus, null, source, daysInStage);
            const stage = StatusMapping.determineStage(rawStatus, null, source, daysInStage);
            
            const needsAction = mappedStatus === 'Application Received';
            
            const location = (item.Location || item.location || '').trim();
            const position = (item.Position || item.position || '').trim();
            const paymentTier = item.PaymentTier || null;
            
            const processedReferral = {
                id: item.Person_system_id || item.personId || item.ID || uniqueKey,
                personId: item.Person_system_id || item.personId || item.ID,
                uniqueKey: uniqueKey,
                name: name,
                email: email,
                phone: phone,
                status: rawStatus,
                mappedStatus: mappedStatus,
                statusType: statusType,
                stage: stage,
                source: source,
                isXRAF: isXRAF,
                isPreviousCandidate: !isXRAF && source !== '',
                location: location,
                position: position,
                nationality: item.F_Nationality || item.nationality || '',
                PaymentTier: paymentTier,
                createdDate: createdDate,
                updatedDate: updatedDate,
                daysInStage: daysInStage,
                daysSinceCreation: daysSinceCreation,
                needsAction: needsAction,
                isEligibleForPayment: isXRAF && mappedStatus === 'Hired (Confirmed)',
                _original: item
            };
            
            uniqueReferrals.set(uniqueKey, processedReferral);
        });
        
        return Array.from(uniqueReferrals.values()).sort((a, b) => {
            return b.createdDate - a.createdDate;
        });
    }
    
    // Validate email
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function showError(input, message) {
        const formControl = input.closest('.mb-3');
        const error = formControl.querySelector('.invalid-feedback');
        error.textContent = message;
        input.classList.add('is-invalid');
    }
    
    function clearError(input) {
        input.classList.remove('is-invalid');
    }
    
    // Handle language change
    function handleLanguageChange(e) {
        AppState.currentLanguage = e.target.value;
        updateTranslations();
        if (document.getElementById('results-step').style.display !== 'none') {
            showReferralResults(AppState.currentReferralsData);
        }
    }
    
    // Show results dashboard
    function showReferralResults(referrals) {
        document.getElementById('auth-step').style.display = 'none';
        const resultsStep = document.getElementById('results-step');
        resultsStep.style.display = 'block';
        
        resultsStep.innerHTML = createResultsContent(referrals);
        
        updateChart(referrals);
        updateEarningsTable(referrals);
        updateReminderSection(referrals);
        updateReferralList(referrals);
        updateStatusGuide();
        updateTranslations();
    }
    
    // Create results HTML
    function createResultsContent(referrals) {
        const hiredCount = referrals.filter(r => 
            r.mappedStatus === 'Hired (Confirmed)' || r.mappedStatus === 'Hired (Probation)'
        ).length;
        
        const inProgressCount = referrals.filter(r => 
            r.mappedStatus === 'Application Received' || 
            r.mappedStatus === 'Assessment Stage'
        ).length;
        
        const userName = AppState.pendingLogin.email.split('@')[0];
        
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
            
            <div class="card mb-4">
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
    
    // Handle back button
    function handleBackButton() {
        document.getElementById('auth-step').style.display = 'block';
        document.getElementById('results-step').style.display = 'none';
        
        // Reset form state
        document.getElementById('email-section').style.display = 'block';
        document.getElementById('otp-section').classList.remove('show');
        document.getElementById('dashboard-email').value = '';
        document.getElementById('otp-input').value = '';
        document.getElementById('dashboard-email').focus();
        
        AppState.currentReferralsData = [];
        AppState.pendingLogin.email = null;
    }
    
    // Handle WhatsApp reminders
    function handleReminderClick(e) {
        const button = e.target.closest('.remind-btn');
        if (!button) return;
        
        const name = button.dataset.name;
        const phone = button.dataset.phone;
        const lang = button.dataset.lang || AppState.currentLanguage;
        if (!phone) return;
        
        const formattedPhone = phone.startsWith('0') ? '6' + phone : phone;
        
        const messages = {
            en: `Hello ${name},\n\nThis is a friendly reminder regarding your application to TP.\n\nPlease check your personal email for the assessment link.\n\nBest regards,\nTP Recruitment Team`,
            ja: `${name}様\n\nテレパフォーマンスへのご応募に関するリマインダーです。\n\n個人のメールアドレスに送信されたアセスメントのリンクをご確認ください。\n\nよろしくお願いいたします。\nTP採用チーム`,
            ko: `안녕하세요 ${name}님,\n\n텔레퍼포먼스 지원과 관련하여 안내 드립니다.\n\n개인 이메일로 발송된 평가 링크를 확인해 주시기 바랍니다.\n\n감사합니다.\nTP 채용팀`,
            "zh-CN": `${name} 您好，\n\n这是关于您申请TP的友好提醒。\n\n请查看您的个人邮箱中发送的评估链接。\n\n祝好，\nTP招聘团队`,
            "zh-HK": `${name} 您好，\n\n這是關於您申請TP的友好提醒。\n\n請查看您的個人郵箱中發送的評估鏈接。\n\n祝好，\nTP招聘團隊`
        };
        
        const message = messages[lang] || messages.en;
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
    
    // Update status chart
    function updateChart(referrals) {
        const ctx = document.getElementById('statusChart')?.getContext('2d');
        if (!ctx) return;
        
        if (AppState.statusChart) {
            AppState.statusChart.destroy();
        }
        
        const counts = {};
        StatusMapping.displayOrder.forEach(status => {
            counts[status] = 0;
        });
        
        referrals.forEach(r => {
            if (counts[r.mappedStatus] !== undefined) {
                counts[r.mappedStatus]++;
            }
        });
        
        const colors = [
            '#3047b0',  // Application Received
            '#00d769',  // Assessment Stage
            '#F5D200',  // Hired (Probation)
            '#84c98b',  // Hired (Confirmed)
            '#676767',  // Previously Applied
            '#dc3545'   // Not Selected
        ];
        
        AppState.statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: StatusMapping.displayOrder.map(status => 
                    translations[AppState.currentLanguage][`status${status.replace(/[\s()]/g, '')}`] || status
                ),
                datasets: [{
                    data: StatusMapping.displayOrder.map(status => counts[status] || 0),
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
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        return {
                                            text: `${label} (${value})`,
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Update earnings table
    function updateEarningsTable(referrals) {
        const earningsBody = document.getElementById('earnings-body');
        if (!earningsBody) return;
        
        const eligibleReferrals = referrals.filter(r => r.isEligibleForPayment);
        
        let johorCount = 0;
        let standardCount = 0;
        let interpreterCount = 0;
        
        eligibleReferrals.forEach(r => {
            const tier = r.PaymentTier || detectPaymentTier(r);
            
            if (tier === 'johor') {
                johorCount++;
            } else if (tier === 'interpreter') {
                interpreterCount++;
            } else {
                standardCount++;
            }
        });
        
        const johorEarnings = johorCount * 500;
        const standardEarnings = standardCount * 800;
        const interpreterEarnings = interpreterCount * 3000;
        const totalEarnings = johorEarnings + standardEarnings + interpreterEarnings;
        
        const t = translations[AppState.currentLanguage];
        
        earningsBody.innerHTML = `
            <tr class="tier-johor">
                <td>${t.statusJohorProbation || 'Mandarin - Johor (RM500)'}</td>
                <td>RM 500</td>
                <td>${johorCount}</td>
                <td>RM ${johorEarnings.toLocaleString()}</td>
            </tr>
            <tr class="tier-standard">
                <td>${t.statusStandardProbation || 'Standard Roles (RM800)'}</td>
                <td>RM 800</td>
                <td>${standardCount}</td>
                <td>RM ${standardEarnings.toLocaleString()}</td>
            </tr>
            <tr class="tier-interpreter">
                <td>${t.statusInterpreterProbation || 'Interpreter WFH (RM3,000)'}</td>
                <td>RM 3,000</td>
                <td>${interpreterCount}</td>
                <td>RM ${interpreterEarnings.toLocaleString()}</td>
            </tr>
        `;
        
        document.getElementById('total-earnings').textContent = `RM ${totalEarnings.toLocaleString()}`;
    }
    
    function detectPaymentTier(referral) {
        const position = (referral.position || referral.Position || '').toLowerCase();
        const location = (referral.location || referral.Location || '').toLowerCase();
        
        if (position.includes('interpreter')) {
            return 'interpreter';
        }
        if (location.includes('johor')) {
            return 'johor';
        }
        return 'standard';
    }
    
    // Update reminder section
    function updateReminderSection(referrals) {
        const container = document.getElementById('friends-to-remind');
        if (!container) return;
        
        const friendsToRemind = referrals.filter(r => 
            r.mappedStatus === 'Application Received' && r.phone
        );
        
        if (friendsToRemind.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted" data-translate="noRemindersNeeded">All your friends are on track!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        friendsToRemind.forEach(friend => {
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
    
    // Update referral list
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
        
        const sortedReferrals = [...referrals].sort((a, b) => {
            const aIndex = StatusMapping.displayOrder.indexOf(a.mappedStatus);
            const bIndex = StatusMapping.displayOrder.indexOf(b.mappedStatus);
            return aIndex - bIndex;
        });
        
        sortedReferrals.forEach(ref => {
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
                                ${ref.needsAction && ref.phone ? `
                                <button class="btn btn-sm btn-success w-100 remind-btn" 
                                    data-name="${ref.name}" 
                                    data-phone="${ref.phone}">
                                    <i class="fab fa-whatsapp me-2"></i>
                                    <span data-translate="remindBtn">Remind</span>
                                </button>
                                ` : ''}
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
    
    // Update status guide
    function updateStatusGuide() {
        const container = document.getElementById('status-guide-content');
        if (!container) return;
        
        const t = translations[AppState.currentLanguage];
        
        container.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6 class="mb-3" data-translate="statusExamples">Status Examples</h6>
                    <div class="status-examples">
                        ${statusExamples.map(example => {
                            let statusType = StatusMapping.getSimplifiedStatusType(example.status);
                            if (example.status === "Hired (Confirmed)") statusType = 'passed';
                            if (example.status === "Previously Applied (No Payment)") statusType = 'previously-applied';
                            
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
                                ${Object.entries(earningsStructure).map(([key, value]) => `
                                    <tr>
                                        <td>${value.label}</td>
                                        <td>${value.condition}</td>
                                        <td><strong>${value.payment}</strong></td>
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
                        <p class="small mb-1"><i class="fas fa-info-circle me-2"></i>Payments processed within 30 days after probation</p>
                        <p class="small"><i class="fas fa-info-circle me-2"></i>Only xRAF referrals are eligible for payment</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Update translations
    function updateTranslations() {
        const lang = AppState.currentLanguage;
        const t = translations[lang] || translations.en;
        
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (t[key]) {
                el.textContent = t[key];
            }
        });
        
        document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
            const key = el.getAttribute('data-translate-placeholder');
            if (t[key]) {
                el.placeholder = t[key];
            }
        });
    }
    
    // Show non-blocking error
    function showNonBlockingError(message) {
        const alertContainer = document.getElementById('alert-container');
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
    
    // Initialize
    initializeApp();
    
    // Expose for debugging
    window.AppState = AppState;
});
