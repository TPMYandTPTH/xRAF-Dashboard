document.addEventListener('DOMContentLoaded', function() {
    // Set current year
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    let currentLanguage = 'en';
    let statusChart = null;
    let currentReferralData = null;
    
    // Make sure all scripts are loaded
    if (typeof translations === 'undefined') {
        console.error('Translations not loaded! Make sure translations.js is included before script.js');
    }
    
    if (typeof statusMapping === 'undefined') {
        console.error('Status mapping not loaded! Make sure statusMapping.js is included before script.js');
    }
    
    if (typeof earningsStructure === 'undefined') {
        console.error('Earnings structure not defined! Adding default...');
        window.earningsStructure = {
            assessment: {
                amount: 50,
                label: "Pass Assessment",
                description: "Paid when candidate passes the assessment"
            },
            probation: { 
                amount: 750, 
                label: "Complete Probation (90 days)",
                description: "Paid only for new candidates who complete 90 days"
            }
        };
    }

    // Function to get translated status
    function getTranslatedStatus(statusType) {
        const translation = translations[currentLanguage] || translations.en;
        
        switch(statusType) {
            case 'passed':
                return translation.statusPassed || 'Hired (Confirmed)';
            case 'passedAssessment':
                return translation.statusAssessmentPassed || 'Passed Assessment';
            case 'probation':
                return translation.statusProbation || 'Hired (Probation)';
            case 'previouslyApplied':
                return translation.statusPreviouslyApplied || 'Previously Applied (No Payment)';
            case 'received':
                return translation.statusReceived || 'Application Received';
            case 'failed':
                return translation.statusFailed || 'Not Selected';
            default:
                return statusType;
        }
    }

    // Function to calculate days between dates
    function calculateDays(startDate, endDate = new Date()) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // Function to process referral data from API
    function processReferralData(apiData) {
        if (!apiData || !apiData.referrals) return [];
        
        return apiData.referrals.map(referral => {
            let daysInStage = 0;
            if (referral.hireDate) {
                daysInStage = calculateDays(referral.hireDate);
            } else {
                daysInStage = calculateDays(referral.applicationDate);
            }
            
            const statusType = getSimplifiedStatusType(referral.currentStatus);
            const needsAction = statusType === 'received' && !referral.isPreviousCandidate;
            
            return {
                name: referral.candidateName,
                email: referral.candidateEmail,
                phone: referral.candidatePhone,
                stage: referral.stage,
                status: referral.currentStatus,
                statusType: statusType,
                applicationDate: referral.applicationDate,
                hireDate: referral.hireDate || '',
                daysInStage: daysInStage,
                category: referral.category,
                source: referral.source,
                needsAction: needsAction,
                isPreviousCandidate: referral.isPreviousCandidate || false
            };
        });
    }

    // Function to map a status to its simplified group
    function mapStatusToGroup(status) {
        if (!statusMapping.statusGroups) return status;
        
        for (const [group, statuses] of Object.entries(statusMapping.statusGroups)) {
            if (statuses.includes(status)) {
                return group;
            }
        }
        
        if (status.startsWith("Eliminated") || status.startsWith("Withdrew") || status.startsWith("Legacy")) {
            return "Not Selected";
        }
        
        return status;
    }

    // Helper function to get simplified status type
    function getSimplifiedStatusType(status) {
        const mappedStatus = mapStatusToGroup(status);
        
        switch(mappedStatus) {
            case "Hired (Confirmed)":
                return "passed";
            case "Hired (Probation)":
                return "probation";
            case "Previously Applied (No Payment)":
                return "previouslyApplied";
            case "Passed Assessment":
                return "passedAssessment";
            case "Application Received":
                return "received";
            case "Not Selected":
                return "failed";
            default:
                if (status.includes("Final Review") || status.includes("Interview")) {
                    return "passedAssessment";
                }
                return "received";
        }
    }

    // Update translations
    function updateTranslations() {
        if (typeof translations === 'undefined') {
            console.error('Translations object not found!');
            return;
        }
        
        const translation = translations[currentLanguage] || translations.en;
        if (!translation) {
            console.error('Translation not found for language:', currentLanguage);
            return;
        }
        
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (translation[key]) {
                el.textContent = translation[key];
            }
        });
        
        document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
            const key = el.getAttribute('data-translate-placeholder');
            if (translation[key]) {
                el.placeholder = translation[key];
            }
        });
    }
    
    // Language flag click handler
    document.querySelectorAll('.lang-flag').forEach(flag => {
        flag.addEventListener('click', function(e) {
            e.preventDefault();
            
            document.querySelectorAll('.lang-flag').forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            
            currentLanguage = this.dataset.lang;
            console.log('Language changed to:', currentLanguage);
            updateTranslations();
            
            if (currentReferralData) {
                const processedReferrals = processReferralData(currentReferralData);
                updateChart(processedReferrals);
                updateEarningsTable(processedReferrals);
                updateReminderSection(processedReferrals);
                updateReferralList(processedReferrals);
            }
        });
    });
    
    // Validate phone number
    function validatePhone(phone) {
        const regex = /^01\d{8,9}$/;
        return regex.test(phone);
    }
    
    // Validate email
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
        return regex.test(email) && email.length <= 254;
    }
    
    // Show error message
    function showError(input, message) {
        const formControl = input.closest('.mb-3');
        const error = formControl.querySelector('.invalid-feedback');
        
        formControl.classList.add('was-validated');
        error.textContent = message;
        error.style.display = 'block';
        input.classList.add('is-invalid');
    }
    
    // Clear error
    function clearError(input) {
        const formControl = input.closest('.mb-3');
        const error = formControl.querySelector('.invalid-feedback');
        
        formControl.classList.remove('was-validated');
        error.style.display = 'none';
        input.classList.remove('is-invalid');
    }
    
    // Get status badge color
    function getStatusBadgeColor(statusType, daysInStage = 0, isPreviousCandidate = false) {
        if (isPreviousCandidate) {
            return 'secondary';
        }
        
        switch(statusType) {
            case 'passed':
                return 'success';
            case 'passedAssessment':
                return 'success';
            case 'probation':
                return 'warning';
            case 'previouslyApplied':
                return 'secondary';
            case 'received':
                return 'primary';
            case 'failed':
                return 'danger';
            default:
                return 'secondary';
        }
    }
    
    // Update earnings table
    function updateEarningsTable(referrals) {
        const earningsBody = document.getElementById('earnings-body');
        if (!earningsBody) return;
        
        earningsBody.innerHTML = '';
        
        let totalEarnings = 0;
        
        const assessmentPasses = referrals.filter(r => 
            (r.statusType === 'passedAssessment' || r.statusType === 'probation' || 
             r.statusType === 'passed') && 
            !r.isPreviousCandidate
        );
        
        const probationCompletions = referrals.filter(r => 
            r.statusType === 'passed' && 
            r.daysInStage >= 90 && 
            !r.isPreviousCandidate
        );
        
        Object.entries(earningsStructure).forEach(([key, earning]) => {
            const count = key === 'assessment' ? assessmentPasses.length : probationCompletions.length;
            const total = count * earning.amount;
            totalEarnings += total;
            
            const row = document.createElement('tr');
            if (count > 0) {
                row.className = 'payment-success';
            }
            row.innerHTML = `
                <td>${earning.label}</td>
                <td style="color: var(--tp-green-flash); font-weight: 700;">RM ${earning.amount}</td>
                <td style="color: var(--tp-dark-gray); font-weight: 600;">${count}</td>
                <td style="color: var(--tp-green-flash); font-weight: 700;"><strong>RM ${total}</strong></td>
            `;
            earningsBody.appendChild(row);
        });
        
        const totalEarningsEl = document.getElementById('total-earnings');
        if (totalEarningsEl) {
            totalEarningsEl.textContent = `RM ${totalEarnings}`;
            totalEarningsEl.style.color = 'var(--tp-green-flash)';
            totalEarningsEl.style.fontWeight = '700';
        }
    }
    
    // Update reminder section
    function updateReminderSection(referrals) {
        const friendsToRemind = document.getElementById('friends-to-remind');
        if (!friendsToRemind) return;
        
        friendsToRemind.innerHTML = '';
        
        const friendsNeedingReminder = referrals
            .filter(r => r.statusType === 'received' && !r.isPreviousCandidate)
            .sort((a, b) => b.daysInStage - a.daysInStage);
        
        if (friendsNeedingReminder.length === 0) {
            const translation = translations[currentLanguage] || translations.en;
            friendsToRemind.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-success">
                        <i class="fas fa-check-circle me-2"></i>
                        <span>${translation.noRemindersNeeded || 'All your friends are on track!'}</span>
                    </div>
                </div>
            `;
            return;
        }
        
        friendsNeedingReminder.forEach((friend, index) => {
            const col = document.createElement('div');
            col.className = 'col-md-6 mb-3';
            
            const translation = translations[currentLanguage] || translations.en;
            const statusTranslation = getTranslatedStatus(friend.statusType);
            
            col.innerHTML = `
                <div class="friend-to-remind status-item status-received">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5><i class="fas fa-user me-2"></i>${friend.name}</h5>
                        <span class="badge status-badge bg-primary">
                            ${statusTranslation}
                        </span>
                    </div>
                    <p class="small text-muted mb-2">
                        <i class="fas fa-envelope me-1"></i>${friend.email}
                    </p>
                    <p class="small mb-2">
                        <strong><i class="fas fa-calendar-alt me-1"></i>${translation.referralDays || 'Days in Stage'}:</strong> ${friend.daysInStage}
                    </p>
                    <button class="btn btn-sm btn-success w-100 remind-btn" 
                            data-name="${friend.name}" 
                            data-phone="${friend.phone}">
                        <i class="fab fa-whatsapp me-2"></i>${translation.remindBtn || 'Send WhatsApp Reminder'}
                    </button>
                </div>
            `;
            
            friendsToRemind.appendChild(col);
        });
    }
    
    // Form submission
    document.getElementById('dashboard-submit').addEventListener('click', async function() {
        const phone = document.getElementById('dashboard-phone').value.trim();
        const email = document.getElementById('dashboard-email').value.trim();
        let isValid = true;
        
        const button = this;
        const originalText = button.innerHTML;
        
        // Validate phone
        if (!phone) {
            showError(document.getElementById('dashboard-phone'), 
                     (translations[currentLanguage] || translations.en).phoneError || 'Please provide a valid phone number');
            isValid = false;
        } else if (!validatePhone(phone)) {
            showError(document.getElementById('dashboard-phone'), 
                     (translations[currentLanguage] || translations.en).phoneError || 'Please provide a valid phone number');
            isValid = false;
        } else {
            clearError(document.getElementById('dashboard-phone'));
        }
        
        // Validate email
        if (!email) {
            showError(document.getElementById('dashboard-email'), 
                     (translations[currentLanguage] || translations.en).emailError || 'Please provide a valid email address');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError(document.getElementById('dashboard-email'), 
                     (translations[currentLanguage] || translations.en).emailError || 'Please provide a valid email address');
            isValid = false;
        } else {
            clearError(document.getElementById('dashboard-email'));
        }
        
        if (!isValid) return;
        
        // Show loading state
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
        button.disabled = true;
        
        try {
            // Try to fetch data from API first
            let apiData = null;
            if (typeof fetchReferrals === 'function') {
                apiData = await fetchReferrals(phone, email);
            }
            
            // If API fails or no data, use mock data
            if (!apiData || !apiData.success) {
                console.log('Using mock data');
                apiData = getMockData(phone, email);
            }
            
            button.innerHTML = originalText;
            button.disabled = false;
            
            if (apiData && apiData.success) {
                currentReferralData = apiData.data;
                const processedReferrals = processReferralData(apiData.data);
                showReferralResults(processedReferrals, apiData.data.referrer);
            } else {
                // Show empty dashboard
                const emptyData = {
                    referrer: {
                        phone: phone,
                        email: email,
                        fullName: "New User"
                    },
                    referrals: []
                };
                
                currentReferralData = emptyData;
                const processedReferrals = processReferralData(emptyData);
                showReferralResults(processedReferrals, emptyData.referrer, true);
            }
            
        } catch (error) {
            console.error('Error fetching referrals:', error);
            button.innerHTML = originalText;
            button.disabled = false;
            
            // Show empty dashboard on error
            const emptyData = {
                referrer: {
                    phone: phone,
                    email: email,
                    fullName: "Guest User"
                },
                referrals: []
            };
            
            currentReferralData = emptyData;
            const processedReferrals = processReferralData(emptyData);
            showReferralResults(processedReferrals, emptyData.referrer, true);
        }
    });
    
    // Show referral results
    function showReferralResults(referrals, referrerInfo, isNewUser = false) {
        document.getElementById('auth-step').style.display = 'none';
        document.getElementById('results-step').style.display = 'block';
        
        const translation = translations[currentLanguage] || translations.en;
        const displayName = isNewUser ? 'Welcome!' : (referrerInfo ? referrerInfo.fullName : 'User');
        
        const resultsContent = `
            <div class="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h3 class="user-name-display"><i class="fas fa-user-tie me-2"></i>${displayName}</h3>
                    <h4 data-translate="yourReferralsTitle"><i class="fas fa-users me-2"></i>${translation.yourReferralsTitle}</h4>
                </div>
                <div>
                    <button id="dashboard-back" class="btn btn-outline-primary" data-translate="backBtn">
                        <i class="fas fa-arrow-left me-2"></i> ${translation.backBtn}
                    </button>
                </div>
            </div>
            
            <div id="referral-stats" class="row mb-4">
                <div class="col-md-4 mb-3">
                    <div class="stats-card">
                        <h3 id="total-referrals" data-target="${referrals.length}">0</h3>
                        <h5 data-translate="totalReferrals"><i class="fas fa-users me-2"></i>${translation.totalReferrals}</h5>
                        <div class="mini-progress">
                            <div class="progress" style="height: 4px;">
                                <div class="progress-bar" style="width: ${Math.min(referrals.length * 10, 100)}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="stats-card">
                        <h3 style="color: var(--tp-green-light);" id="hired-referrals" data-target="${referrals.filter(r => r.statusType === 'passed' || r.statusType === 'probation').length}">0</h3>
                        <h5 data-translate="hiredReferrals"><i class="fas fa-check-circle me-2"></i>${translation.hiredReferrals}</h5>
                        <div class="mini-progress">
                            <div class="progress" style="height: 4px;">
                                <div class="progress-bar" style="width: ${referrals.length > 0 ? (referrals.filter(r => r.statusType === 'passed' || r.statusType === 'probation').length / referrals.length * 100) : 0}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="stats-card">
                        <h3 style="color: var(--tp-yellow);" id="progress-referrals" data-target="${referrals.filter(r => ['received', 'passedAssessment'].includes(r.statusType)).length}">0</h3>
                        <h5 data-translate="inProgress"><i class="fas fa-clock me-2"></i>${translation.inProgress}</h5>
                        <div class="mini-progress">
                            <div class="progress" style="height: 4px;">
                                <div class="progress-bar" style="width: ${referrals.length > 0 ? (referrals.filter(r => ['received', 'passedAssessment'].includes(r.statusType)).length / referrals.length * 100) : 0}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modern-chart-section mb-4">
                <div class="chart-header text-center mb-4">
                    <h5 class="chart-title" data-translate="statusDistribution">
                        <i class="fas fa-chart-pie me-2"></i>${translation.statusDistribution}
                    </h5>
                    <p class="chart-subtitle text-muted">Track your referral progress across all stages</p>
                </div>
                <div class="chart-grid">
                    <div class="chart-canvas-container">
                        <canvas id="statusChart"></canvas>
                        <div class="chart-center-info">
                            <div class="total-count">${referrals.length}</div>
                            <div class="total-label">Total Referrals</div>
                        </div>
                    </div>
                    <div class="chart-legend-modern" id="chartLegend"></div>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-3" data-translate="earningsTitle" style="color: var(--tp-green-flash);">
                        <i class="fas fa-money-bill-wave me-2"></i>${translation.earningsTitle}
                    </h5>
                    <div class="table-responsive">
                        <table class="earnings-table">
                            <thead>
                                <tr>
                                    <th data-translate="earningsStage">${translation.earningsStage}</th>
                                    <th data-translate="earningsAmount">${translation.earningsAmount}</th>
                                    <th data-translate="earningsCount">${translation.earningsCount}</th>
                                    <th data-translate="earningsTotal">${translation.earningsTotal}</th>
                                </tr>
                            </thead>
                            <tbody id="earnings-body"></tbody>
                            <tfoot>
                                <tr>
                                    <th data-translate="earningsTotal">${translation.earningsTotal}</th>
                                    <th></th>
                                    <th></th>
                                    <th id="total-earnings">RM 0</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div class="text-center mt-3">
                        <button type="button" class="btn btn-outline-primary btn-lg" data-bs-toggle="modal" data-bs-target="#tngModal" data-translate="paymentNote">
                            <i class="fas fa-info-circle me-2"></i>${translation.paymentNote || 'View Payment Terms'}
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="reminder-section" class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-3" data-translate="remindFriendsTitle">
                        <i class="fas fa-bell me-2"></i>${translation.remindFriendsTitle}
                    </h5>
                    <p class="text-center text-muted" data-translate="remindFriendsText">
                        ${translation.remindFriendsText}
                    </p>
                    <div id="friends-to-remind" class="row"></div>
                </div>
            </div>
            
            <div id="referral-list"></div>
            
            <!-- Status Examples Section -->
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-4">
                        <i class="fas fa-info-circle me-2"></i>Status Guide - Understand Your Referral Journey
                    </h5>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="status-example status-item status-received">
                                <h6><i class="fas fa-file-alt me-2"></i>Application Received</h6>
                                <p>Your friend's application is in the system. <strong>Remind them to take the assessment!</strong></p>
                                <span class="badge bg-primary">${getTranslatedStatus('received')}</span>
                            </div>
                            <div class="status-example status-item status-passedAssessment">
                                <h6><i class="fas fa-check-circle me-2"></i>Passed Assessment 💵</h6>
                                <p>Great news! Your friend passed the assessment. <strong>You earned RM50!</strong> They're now moving to the next stage.</p>
                                <span class="badge bg-success">${getTranslatedStatus('passedAssessment')}</span>
                            </div>
                            <div class="status-example status-item status-probation">
                                <h6><i class="fas fa-clock me-2"></i>Hired (Probation)</h6>
                                <p>Congratulations! Your friend got hired and is in their probation period. <strong>RM750 pending after 90 days.</strong></p>
                                <span class="badge bg-warning">${getTranslatedStatus('probation')}</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="status-example status-item status-passed">
                                <h6><i class="fas fa-trophy me-2"></i>Hired (Confirmed) 💵</h6>
                                <p>Excellent! Your friend completed 90+ days successfully. <strong>You earned RM750 bonus!</strong> Total: RM800</p>
                                <span class="badge bg-success" style="background-color: var(--tp-green-light) !important;">${getTranslatedStatus('passed')}</span>
                            </div>
                            <div class="status-example status-item status-previouslyApplied">
                                <h6><i class="fas fa-ban me-2"></i>Previously Applied</h6>
                                <p>This person applied to TP before your referral. <strong>No payment will be made</strong> for previous applicants.</p>
                                <span class="badge bg-secondary">${getTranslatedStatus('previouslyApplied')}</span>
                            </div>
                            <div class="status-example status-item status-failed">
                                <h6><i class="fas fa-times-circle me-2"></i>Not Selected</h6>
                                <p>Unfortunately, your friend wasn't selected or withdrew from the process. No payment for this referral.</p>
                                <span class="badge bg-danger">${getTranslatedStatus('failed')}</span>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 p-3 status-item" style="background: rgba(0, 123, 255, 0.1);">
                        <h6><i class="fas fa-lightbulb me-2"></i>Pro Tips:</h6>
                        <ul class="mb-0">
                            <li><strong>Follow up quickly:</strong> Remind friends to complete their assessment within 7 days</li>
                            <li><strong>Earn more:</strong> You can earn up to RM800 per successful referral (RM50 + RM750)</li>
                            <li><strong>Track progress:</strong> Use this dashboard to monitor all your referrals in real-time</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Questions Section -->
            <div class="card mb-4">
                <div class="card-body text-center">
                    <h5 class="card-title mb-3">
                        <i class="fas fa-question-circle me-2"></i>
                        <span data-translate="questionsTitle">Questions?</span>
                    </h5>
                    <p class="mb-0" style="font-size: 1.1rem;">
                        <span data-translate="contactUsText">Email us at:</span><br>
                        <a href="mailto:tpmycareers@teleperformance.com" style="color: var(--tp-light-blue); font-weight: 600; font-size: 1.2rem;">
                            tpmycareers@teleperformance.com
                        </a>
                    </p>
                </div>
            </div>
            
            ${isNewUser || referrals.length === 0 ? `
            <div class="card mb-4 getting-started">
                <div class="card-body text-center">
                    <h5 class="card-title">
                        <i class="fas fa-rocket me-2"></i>Ready to Start Earning?
                    </h5>
                    <p class="mb-3">Start referring friends to TP and track their progress here!</p>
                    <a href="https://tpmyandtpth.github.io/xRAF/" class="btn btn-primary btn-lg">
                        <i class="fas fa-user-plus me-2"></i>Start Referring Now
                    </a>
                </div>
            </div>
            ` : ''}
            
            <div class="mt-4">
                <div class="row text-center">
                    <div class="col-md-4 mb-3">
                        <h5 data-translate="tpGlobal">${translation.tpGlobal}</h5>
                        <div class="d-flex justify-content-center gap-3">
                            <a href="https://www.linkedin.com/company/teleperformance" class="social-icon" target="_blank"><i class="fab fa-linkedin"></i></a>
                            <a href="https://www.youtube.com/@TeleperformanceGroup" class="social-icon" target="_blank"><i class="fab fa-youtube"></i></a>
                            <a href="https://www.tiktok.com/@teleperformance_group" class="social-icon" target="_blank"><i class="fab fa-tiktok"></i></a>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <h5 data-translate="followMalaysia">${translation.followMalaysia}</h5>
                        <div class="d-flex justify-content-center gap-3">
                            <a href="https://www.facebook.com/TPinMalaysia/" class="social-icon" target="_blank"><i class="fab fa-facebook-f"></i></a>
                            <a href="http://www.instagram.com/tp_malaysia/" class="social-icon" target="_blank"><i class="fab fa-instagram"></i></a>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <h5 data-translate="followThailand">${translation.followThailand}</h5>
                        <div class="d-flex justify-content-center gap-3">
                            <a href="http://www.facebook.com/TPinThailand/" class="social-icon" target="_blank"><i class="fab fa-facebook-f"></i></a>
                            <a href="http://www.instagram.com/tpinthailand/" class="social-icon" target="_blank"><i class="fab fa-instagram"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('results-step').innerHTML = resultsContent;
        
        // Update all components
        updateChart(referrals);
        updateEarningsTable(referrals);
        updateReminderSection(referrals);
        updateReferralList(referrals);
        
        // Re-attach back button event
        document.getElementById('dashboard-back').addEventListener('click', function() {
            document.getElementById('auth-step').style.display = 'block';
            document.getElementById('results-step').style.display = 'none';
            
            if (statusChart) {
                statusChart.destroy();
                statusChart = null;
            }
            
            currentReferralData = null;
        });
        
        // Update translations
        updateTranslations();
        
        // Animate numbers
        setTimeout(() => {
            document.querySelectorAll('[data-target]').forEach(el => {
                const target = parseInt(el.getAttribute('data-target'));
                animateNumber(el, target);
            });
        }, 300);
    }
    
    // Update referral list
    function updateReferralList(referrals) {
        const referralList = document.getElementById('referral-list');
        if (!referralList) return;
        
        referralList.innerHTML = '';
        const translation = translations[currentLanguage] || translations.en;
        
        if (referrals.length === 0) {
            referralList.innerHTML = `
                <div class="card">
                    <div class="card-body empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <h4>${translation.noReferrals || 'No referrals yet!'}</h4>
                        <p class="text-muted mb-4">Start referring friends and track their journey here. You can earn up to RM800 per successful referral!</p>
                        <a href="https://tpmyandtpth.github.io/xRAF/" class="btn btn-primary btn-lg">
                            <i class="fas fa-rocket me-2"></i>Start Your First Referral
                        </a>
                    </div>
                </div>
            `;
            return;
        }
        
        const statusOrder = ['passed', 'passedAssessment', 'probation', 'previouslyApplied', 'received', 'failed'];
        const sortedReferrals = [...referrals].sort((a, b) => {
            return statusOrder.indexOf(a.statusType) - statusOrder.indexOf(b.statusType);
        });
        
        const referralListCard = document.createElement('div');
        referralListCard.className = 'card mb-4';
        referralListCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title text-center mb-3">
                    <i class="fas fa-list me-2"></i>
                    <span>${translation.yourReferralsTitle || 'Your Referrals'}</span>
                </h5>
                <div id="referral-items"></div>
            </div>
        `;
        
        referralList.appendChild(referralListCard);
        
        const referralItems = document.getElementById('referral-items');
        
        sortedReferrals.forEach((referral, index) => {
            const item = document.createElement('div');
            
            const statusTranslation = getTranslatedStatus(referral.statusType);
            
            const isPaymentEligible = (referral.statusType === 'passed' || referral.statusType === 'passedAssessment') && 
                                      !referral.isPreviousCandidate;
            
            item.className = `card mb-3 status-item status-${referral.statusType} ${isPaymentEligible ? 'payment-eligible' : ''}`;
            
            const showRemindButton = referral.statusType === 'received' && !referral.isPreviousCandidate;
            
            let progressPercentage = 0;
            switch(referral.statusType) {
                case 'received': progressPercentage = 25; break;
                case 'passedAssessment': progressPercentage = 50; break;
                case 'probation': progressPercentage = 75; break;
                case 'passed': progressPercentage = 100; break;
                case 'previouslyApplied': progressPercentage = 0; break;
                case 'failed': progressPercentage = 0; break;
            }
            
            item.innerHTML = `
                <div class="card-body">
                    <div class="referral-header mb-3">
                        <div class="referral-info">
                            <h6 class="mb-1 referral-name">
                                <i class="fas fa-user me-2"></i>${referral.name}
                                ${isPaymentEligible ? '💵' : ''}
                            </h6>
                            <p class="mb-1 text-muted small referral-email">
                                <i class="fas fa-envelope me-1"></i>${referral.email}
                            </p>
                        </div>
                        <div class="status-badge-wrapper">
                            <span class="badge status-badge bg-${getStatusBadgeColor(referral.statusType, referral.daysInStage, referral.isPreviousCandidate)}">
                                ${statusTranslation}
                            </span>
                        </div>
                    </div>
                    ${referral.statusType !== 'previouslyApplied' && referral.statusType !== 'failed' ? `
                    <div class="status-progress">
                        <div class="status-progress-bar" style="width: ${progressPercentage}%;"></div>
                    </div>
                    ` : ''}
                    <div class="row mt-3">
                        <div class="col-md-3 col-6 mb-2">
                            <small class="text-muted d-block">
                                <i class="fas fa-layer-group me-1"></i>
                                ${translation.referralStage || 'Stage'}
                            </small>
                            <span class="fw-bold">${referral.stage || 'N/A'}</span>
                        </div>
                        <div class="col-md-3 col-6 mb-2">
                            <small class="text-muted d-block">
                                <i class="fas fa-calendar-alt me-1"></i>
                                ${translation.referralDate || 'Application Date'}
                            </small>
                            <span class="fw-bold">${new Date(referral.applicationDate).toLocaleDateString()}</span>
                        </div>
                        <div class="col-md-3 col-6 mb-2">
                            <small class="text-muted d-block">
                                <i class="fas fa-clock me-1"></i>
                                ${translation.referralDays || 'Days in Stage'}
                            </small>
                            <span class="fw-bold">${referral.daysInStage}</span>
                        </div>
                        <div class="col-md-3 col-6 mb-2">
                            ${showRemindButton ? `
                            <button class="btn btn-sm btn-success w-100 remind-btn" 
                                    data-name="${referral.name}" 
                                    data-phone="${referral.phone}">
                                <i class="fab fa-whatsapp me-2"></i>${translation.remindBtn || 'WhatsApp'}
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            referralItems.appendChild(item);
        });
    }
    
    // Update chart
    function updateChart(referrals) {
        const chartCanvas = document.getElementById('statusChart');
        if (!chartCanvas) return;
        
        const ctx = chartCanvas.getContext('2d');
        const translation = translations[currentLanguage] || translations.en;
        
        let statusCounts = {
            received: referrals.filter(r => r.statusType === 'received').length,
            passedAssessment: referrals.filter(r => r.statusType === 'passedAssessment').length,
            probation: referrals.filter(r => r.statusType === 'probation').length,
            passed: referrals.filter(r => r.statusType === 'passed').length,
            previouslyApplied: referrals.filter(r => r.statusType === 'previouslyApplied').length,
            failed: referrals.filter(r => r.statusType === 'failed').length
        };
        
        const hasData = Object.values(statusCounts).some(count => count > 0);
        
        const data = {
            labels: [
                getTranslatedStatus('received'),
                getTranslatedStatus('passedAssessment'),
                getTranslatedStatus('probation'),
                getTranslatedStatus('passed'),
                getTranslatedStatus('previouslyApplied'),
                getTranslatedStatus('failed')
            ],
            datasets: [{
                data: hasData ? [
                    statusCounts.received,
                    statusCounts.passedAssessment,
                    statusCounts.probation,
                    statusCounts.passed,
                    statusCounts.previouslyApplied,
                    statusCounts.failed
                ] : [1, 1, 1, 1, 1, 1],
                backgroundColor: [
                    '#0087FF',  // TP Light Blue
                    '#00d769',  // TP Green Flash
                    '#f5d200',  // TP Yellow
                    '#84c98b',  // TP Green Light
                    '#5f365e',  // TP Burgundy
                    '#ab2c37'   // TP Carmine
                ],
                borderWidth: 0,
                hoverOffset: hasData ? 8 : 0
            }]
        };

        if (statusChart) {
            statusChart.destroy();
        }

        statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: hasData,
                        backgroundColor: 'rgba(65, 65, 65, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#fff',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                if (!hasData) return 'No data yet';
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 1200,
                    easing: 'easeOutQuart'
                }
            }
        });

        // Update legend
        const legendContainer = document.getElementById('chartLegend');
        if (legendContainer) {
            legendContainer.innerHTML = '';
            
            if (!hasData) {
                const noDataMsg = document.createElement('div');
                noDataMsg.className = 'text-muted text-center p-4';
                noDataMsg.innerHTML = '<i class="fas fa-chart-pie me-2"></i>Start referring to see your status distribution!';
                legendContainer.appendChild(noDataMsg);
            } else {
                data.labels.forEach((label, i) => {
                    const count = data.datasets[0].data[i];
                    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    
                    const legendItem = document.createElement('div');
                    legendItem.className = 'legend-item';
                    legendItem.innerHTML = `
                        <div class="legend-color" style="background-color: ${data.datasets[0].backgroundColor[i]};"></div>
                        <div class="legend-info">
                            <div class="legend-label">${label}</div>
                            <div class="legend-count">${count} <span class="legend-percentage">(${percentage}%)</span></div>
                        </div>
                    `;
                    legendContainer.appendChild(legendItem);
                });
            }
        }
    }

    // Handle remind button clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remind-btn') || e.target.closest('.remind-btn')) {
            const button = e.target.classList.contains('remind-btn') ? e.target : e.target.closest('.remind-btn');
            const name = button.dataset.name;
            const phone = button.dataset.phone;
            
            const message = `Hi ${name}, this is a friendly reminder to complete your assessment for TP. ` +
                           `It's quick and easy! Please complete it at your earliest convenience to move forward with your application. Thank you!`;
            window.open(`https://wa.me/+6${phone}?text=${encodeURIComponent(message)}`, '_blank');
        }
    });

    // Initialize app
    updateTranslations();
    
    // Number animation
    function animateNumber(element, target, duration = 1000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }
    
    // Auto-focus phone input
    document.getElementById('dashboard-phone').focus();
    
    // Phone number validation - only numbers
    document.getElementById('dashboard-phone').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    console.log('xRAF Dashboard initialized successfully');
});
