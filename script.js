document.addEventListener('DOMContentLoaded', function() {
    const AppState = {
        currentLanguage: 'en',
        statusChart: null,
        currentReferralsData: [],
        isLoading: false
    };
    
    // Initialize application
    function initializeApp() {
        document.getElementById('current-year').textContent = new Date().getFullYear();
        updateTranslations();
        setupEventListeners();
        document.getElementById('dashboard-phone').focus();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        document.getElementById('lang-select').addEventListener('change', handleLanguageChange);
        document.getElementById('dashboard-submit').addEventListener('click', handleFormSubmit);
        
        document.getElementById('dashboard-phone').addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
        
        document.addEventListener('click', function(e) {
            if (e.target.closest('.remind-btn')) {
                handleReminderClick(e);
            }
            if (e.target.id === 'dashboard-back') {
                handleBackButton();
            }
        });
        
        document.getElementById('dashboard-form').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleFormSubmit();
            }
        });
    }
    
    // Handle form submission
    async function handleFormSubmit() {
        const phone = document.getElementById('dashboard-phone').value.trim();
        const email = document.getElementById('dashboard-email').value.trim();
        
        if (!validateInputs(phone, email)) return;
        
        setLoadingState(true);
        
        try {
            const apiData = await ApiService.fetchReferrals(phone, email);
            AppState.currentReferralsData = processReferrals(apiData);
            showReferralResults(AppState.currentReferralsData);
        } catch (error) {
            console.error('Error:', error);
            showNonBlockingError(translations[AppState.currentLanguage].errorMessage);
        } finally {
            setLoadingState(false);
        }
    }
    
    // Process API response into standardized format
    function processReferrals(apiData) {
        return apiData.map(item => {
            // Parse dates (handle MM/DD/YYYY format)
            const parseDate = (dateStr) => {
                if (!dateStr) return new Date();
                const [datePart, timePart] = dateStr.split(' ');
                const [month, day, year] = datePart.split('/').map(Number);
                return new Date(year, month - 1, day);
            };
            
            const updatedDate = parseDate(item.UpdatedDate);
            const daysInStage = Math.floor((new Date() - updatedDate) / (86400000));
            
            // Get assessment result if available (this would come from a separate API call)
            // For now, we'll simulate it - in real implementation, this would come from SharePoint
            const assessmentResult = item.AssessmentResult || null;
            
            // Get status (trim whitespace)
            const rawStatus = (item.Status || '').trim();
            const mappedStatus = StatusMapping.mapStatusToGroup(rawStatus, assessmentResult);
            const statusType = StatusMapping.getSimplifiedStatusType(rawStatus, assessmentResult);
            const stage = StatusMapping.determineStage(rawStatus, assessmentResult);
            
            // Check if this is an xRAF referral
            const isXRAF = (item.Source || '').toLowerCase().includes('xraf') || 
                           (item.Source || '').toLowerCase().includes('employee referral');
            const isPreviousCandidate = mappedStatus === 'Previously Applied (No Payment)' || !isXRAF;
            
            return {
                id: item.Person_system_id,
                name: item.First_Name,
                email: item.Email,
                phone: item.Employee,
                status: rawStatus,
                source: item.Source,
                location: item.Location,
                nationality: item.F_Nationality,
                updatedDate,
                daysInStage,
                mappedStatus,
                statusType,
                stage,
                isPreviousCandidate,
                needsAction: mappedStatus === 'Application Received' && item.Employee
            };
        });
    }
    
    
    // Validate form inputs
    function validateInputs(phone, email) {
        let isValid = true;
        
        if (!validatePhone(phone)) {
            showError(document.getElementById('dashboard-phone'), 
                     translations[AppState.currentLanguage].phoneError);
            isValid = false;
        } else {
            clearError(document.getElementById('dashboard-phone'));
        }
        
        if (!validateEmail(email)) {
            showError(document.getElementById('dashboard-email'), 
                     translations[AppState.currentLanguage].emailError);
            isValid = false;
        } else {
            clearError(document.getElementById('dashboard-email'));
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
        const formControl = input.closest('.mb-3');
        const error = formControl.querySelector('.invalid-feedback');
        error.textContent = message;
        input.classList.add('is-invalid');
    }
    
    function clearError(input) {
        input.classList.remove('is-invalid');
    }
    
    // Set loading state
    function setLoadingState(isLoading) {
        const submitBtn = document.getElementById('dashboard-submit');
        submitBtn.disabled = isLoading;
        submitBtn.innerHTML = isLoading ? 
            `<span class="spinner-border spinner-border-sm me-2"></span>${translations[AppState.currentLanguage].connectingMessage}` :
            translations[AppState.currentLanguage].viewStatusBtn;
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
        
        // Create results content
        resultsStep.innerHTML = createResultsContent(referrals);
        
        // Initialize dashboard components
        updateChart(referrals);
        updateEarningsTable(referrals);
        updateReminderSection(referrals);
        updateReferralList(referrals);
        updateTranslations();
    }
    
    // Create results HTML
    function createResultsContent(referrals) {
        const hiredCount = referrals.filter(r => r.stage.includes('Hired')).length;
        const inProgressCount = referrals.filter(r => 
            !r.stage.includes('Hired') && 
            !r.stage.includes('Not Selected') && 
            !r.stage.includes('Previously Applied')
        ).length;
        
        return `
            <div class="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h3>${document.getElementById('dashboard-email').value.split('@')[0]}</h3>
                    <h4 data-translate="yourReferralsTitle">Your Referrals</h4>
                </div>
                <button id="dashboard-back" class="btn btn-outline-secondary" data-translate="backBtn">
                    <i class="fas fa-arrow-left me-2"></i> Back
                </button>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <h5 class="card-title" data-translate="totalReferrals">Total Referrals</h5>
                            <h3 class="text-primary">${referrals.length}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <h5 class="card-title" data-translate="hiredReferrals">Hired</h5>
                            <h3 class="text-success">${hiredCount}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
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
                    <div class="chart-container" style="height: 300px;">
                        <canvas id="statusChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-3" data-translate="earningsTitle">Your Earnings</h5>
                    <div class="table-responsive">
                        <table class="table">
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
                                    <th data-translate="earningsTotal">Total Earnings</th>
                                    <th colspan="3" id="total-earnings" class="text-end">RM 0</th>
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
            
            <div id="referral-list"></div>
        `;
    }
    
    // Handle back button
    function handleBackButton() {
        document.getElementById('auth-step').style.display = 'block';
        document.getElementById('results-step').style.display = 'none';
        document.getElementById('dashboard-phone').value = '';
        document.getElementById('dashboard-email').value = '';
        document.getElementById('dashboard-phone').focus();
    }
    
    // Handle WhatsApp reminders
    function handleReminderClick(e) {
        const button = e.target.closest('.remind-btn');
        if (!button) return;
        
        const name = button.dataset.name;
        const phone = button.dataset.phone;
        if (!phone) return;
        
        const formattedPhone = phone.startsWith('0') ? '6' + phone : phone;
        const message = `Hi ${name}, this is a reminder to complete your TP assessment.`;
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
    
    // Update status chart
    function updateChart(referrals) {
        const ctx = document.getElementById('statusChart')?.getContext('2d');
        if (!ctx) return;
        
        // Destroy previous chart
        if (AppState.statusChart) AppState.statusChart.destroy();
        
        // Count statuses
        const counts = {};
        StatusMapping.displayOrder.forEach(group => {
            counts[group] = referrals.filter(r => r.mappedStatus === group).length;
        });
        
        // Create new chart
        AppState.statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: StatusMapping.displayOrder.map(group => 
                    translations[AppState.currentLanguage][`status${group.replace(/\s|\(|\)/g, '')}`] || group),
                datasets: [{
                    data: StatusMapping.displayOrder.map(group => counts[group]),
                    backgroundColor: [
                        '#0087FF', '#00d769', '#ffc107', '#fd7e14',
                        '#f5d200', '#84c98b', '#6c757d', '#dc3545'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
            }
        });
    }
    
    // Update earnings table
    function updateEarningsTable(referrals) {
        const earningsBody = document.getElementById('earnings-body');
        if (!earningsBody) return;
        
        // Calculate eligible candidates
        const passedAssessment = referrals.filter(r => 
            (r.statusType === 'assessment' || r.statusType === 'talent' || 
             r.statusType === 'operations' || r.statusType === 'probation' || 
             r.statusType === 'passed') && 
            !r.isPreviousCandidate
        ).length;
        
        const passedProbation = referrals.filter(r => 
            r.statusType === 'passed' && r.daysInStage >= 90 && !r.isPreviousCandidate
        ).length;
        
        // Add rows
        const assessmentEarnings = passedAssessment * 50;
        const probationEarnings = passedProbation * 750;
        const totalEarnings = assessmentEarnings + probationEarnings;
        
        earningsBody.innerHTML = `
            <tr>
                <td data-translate="statusAssessmentPassed">Assessment Passed</td>
                <td>RM 50</td>
                <td>${passedAssessment}</td>
                <td>RM ${assessmentEarnings}</td>
            </tr>
            <tr>
                <td data-translate="statusProbationPassed">Probation Completed</td>
                <td>RM 750</td>
                <td>${passedProbation}</td>
                <td>RM ${probationEarnings}</td>
            </tr>
        `;
        
        const totalEarningsEl = document.getElementById('total-earnings');
        if (totalEarningsEl) totalEarningsEl.textContent = `RM ${totalEarnings}`;
    }
    
    function updateReminderSection(referrals) {
        const container = document.getElementById('friends-to-remind');
        if (!container) return;
        
        // Filter ONLY Application Received status with phone
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
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <h5>${friend.name}</h5>
                                <span class="badge bg-${friend.statusType}">${friend.mappedStatus}</span>
                            </div>
                            <p class="small">${friend.email}</p>
                            <p class="small" data-translate="referralDays">Days in Stage: ${friend.daysInStage}</p>
                            <button class="btn btn-primary w-100 remind-btn" 
                                data-name="${friend.name}" 
                                data-phone="${friend.phone}">
                                <i class="fab fa-whatsapp me-2"></i>
                                <span data-translate="remindBtn">Send Reminder</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    // Create results HTML with new status guide section
    function createResultsContent(referrals) {
        const hiredCount = referrals.filter(r => r.mappedStatus.includes('Hired')).length;
        const inProgressCount = referrals.filter(r => 
            !r.mappedStatus.includes('Hired') && 
            !r.mappedStatus.includes('Not Selected') && 
            !r.mappedStatus.includes('Previously Applied')
        ).length;
        
        return `
            <div class="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h3>${document.getElementById('dashboard-email').value.split('@')[0]}</h3>
                    <h4 data-translate="yourReferralsTitle">Your Referrals</h4>
                </div>
                <button id="dashboard-back" class="btn btn-outline-secondary" data-translate="backBtn">
                    <i class="fas fa-arrow-left me-2"></i> Back
                </button>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <h5 class="card-title" data-translate="totalReferrals">Total Referrals</h5>
                            <h3 class="text-primary">${referrals.length}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <h5 class="card-title" data-translate="hiredReferrals">Hired</h5>
                            <h3 class="text-success">${hiredCount}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
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
                    <div class="chart-container" style="height: 300px;">
                        <canvas id="statusChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-3" data-translate="earningsTitle">Your Earnings</h5>
                    <div class="table-responsive">
                        <table class="table">
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
                                    <th data-translate="earningsTotal">Total Earnings</th>
                                    <th colspan="3" id="total-earnings" class="text-end">RM 0</th>
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
            
            <div id="referral-list"></div>
            
            <!-- New Status Guide & Payment Info Section -->
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-4">Status Guide & Payment Information</h5>
                    
                    <div class="row">
                        <!-- Status Examples -->
                        <div class="col-md-6">
                            <h6 class="mb-3">Status Examples</h6>
                            <div class="status-examples">
                                ${statusExamples.map(example => `
                                    <div class="status-example mb-3 p-3 rounded bg-light">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <strong>${example.status}</strong>
                                            <span class="badge bg-${StatusMapping.getSimplifiedStatusType(example.status)}">
                                                ${example.status}
                                            </span>
                                        </div>
                                        <p class="mb-1 mt-2">${example.description}</p>
                                        <small class="text-muted">${example.action}</small>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Payment Conditions -->
                        <div class="col-md-6">
                            <h6 class="mb-3">Payment Conditions</h6>
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Stage</th>
                                            <th>Condition</th>
                                            <th>Payment</th>
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
                                            <td>Candidate applied before referral</td>
                                            <td><strong>No Payment</strong></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="payment-notes mt-3">
                                <p class="small mb-1"><i class="fas fa-info-circle me-2"></i>All payments are made via Touch 'n Go eWallet</p>
                                <p class="small mb-1"><i class="fas fa-info-circle me-2"></i>Payments processed within 30 days after verification</p>
                                <p class="small"><i class="fas fa-info-circle me-2"></i>Referrer must be active TP employee at payment time</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
      
    // Update referral list
    function updateReferralList(referrals) {
        const container = document.getElementById('referral-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (referrals.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <div class="card-body text-center py-5">
                        <i class="fas fa-users fa-3x text-muted mb-3"></i>
                        <h5 data-translate="noReferrals">No referrals found yet</h5>
                        <p data-translate="startReferring">Start referring friends to see them here</p>
                        <a href="https://tpmyandtpth.github.io/xRAF/" class="btn btn-primary mt-3" data-translate="referFriend">
                            <i class="fas fa-user-plus me-2"></i>Refer a Friend
                        </a>
                    </div>
                </div>
            `;
            return;
        }
        
        referrals.forEach(ref => {
            container.innerHTML += `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5>${ref.name}</h5>
                                <p class="small text-muted">${ref.email}</p>
                            </div>
                            <span class="badge bg-${ref.statusType}">${ref.mappedStatus}</span>
                        </div>
                        
                        <div class="row mt-3">
                            <div class="col-md-3">
                                <small class="text-muted" data-translate="referralStage">Stage</small>
                                <p>${ref.stage}</p>
                            </div>
                            <div class="col-md-3">
                                <small class="text-muted">Location</small>
                                <p>${ref.location || 'N/A'}</p>
                            </div>
                            <div class="col-md-3">
                                <small class="text-muted" data-translate="referralDays">Days in Stage</small>
                                <p>${ref.daysInStage}</p>
                            </div>
                            <div class="col-md-3">
                                ${ref.needsAction && ref.phone ? `
                                <button class="btn btn-sm btn-primary w-100 remind-btn" 
                                    data-name="${ref.name}" 
                                    data-phone="${ref.phone}">
                                    <i class="fab fa-whatsapp me-2"></i>
                                    <span data-translate="remindBtn">Remind</span>
                                </button>
                                ` : ''}
                            </div>
                        </div>
                        <div class="mt-2">
                            <small class="text-muted">Status Details: ${ref.status}</small>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    // Update translations
    function updateTranslations() {
        const lang = AppState.currentLanguage;
        const t = translations[lang] || translations.en;
        
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (t[key]) el.textContent = t[key];
        });
        
        document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
            const key = el.getAttribute('data-translate-placeholder');
            if (t[key]) el.placeholder = t[key];
        });
    }
    
    // Show non-blocking error
    function showNonBlockingError(message) {
        const container = document.getElementById('error-alert-container');
        const alert = document.createElement('div');
        alert.className = 'alert alert-warning alert-dismissible fade show';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        container.appendChild(alert);
        
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 150);
        }, 5000);
    }
    
    // Initialize the app
    initializeApp();
});
