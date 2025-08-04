// Main Application Script - Fixed Version
document.addEventListener('DOMContentLoaded', function() {
    // Application State
    const AppState = {
        currentLanguage: 'en',
        statusChart: null,
        currentReferralsData: null,
        isLoading: false,
        debugMode: false // Set to true to see detailed logs
    };
    
    // Initialize the application
    initializeApp();
    
    function initializeApp() {
        // Set current year
        document.getElementById('current-year').textContent = new Date().getFullYear();
        
        // Initialize translations
        updateTranslations();
        
        // Set up event listeners
        setupEventListeners();
        
        // Auto-focus phone input
        document.getElementById('dashboard-phone').focus();
        
        // Test SharePoint connection on load (optional)
        if (AppState.debugMode) {
            testConnection();
        }
    }
    
    function setupEventListeners() {
        // Language change handler
        document.getElementById('lang-select').addEventListener('change', handleLanguageChange);
        
        // Form submission
        document.getElementById('dashboard-submit').addEventListener('click', handleFormSubmit);
        
        // Phone number validation - only numbers
        document.getElementById('dashboard-phone').addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
        
        // Handle remind button clicks
        document.addEventListener('click', handleReminderClick);
        
        // Add Enter key support for form
        document.getElementById('dashboard-form').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleFormSubmit();
            }
        });
    }
    
    async function testConnection() {
        console.log('Testing SharePoint connection...');
        try {
            if (typeof ApiService !== 'undefined' && typeof ApiService.testSharePointConnection === 'function') {
                const result = await ApiService.testSharePointConnection();
                if (result.success) {
                    console.log('✓ SharePoint connection successful');
                } else {
                    console.error('✗ SharePoint connection failed:', result.error);
                }
            } else {
                console.warn('ApiService not available');
            }
        } catch (error) {
            console.error('Connection test error:', error);
        }
    }
    
    function handleLanguageChange(e) {
        AppState.currentLanguage = e.target.value;
        updateTranslations();
        
        // Refresh UI components if data is loaded
        if (AppState.currentReferralsData) {
            updateChart(AppState.currentReferralsData);
            updateEarningsTable(AppState.currentReferralsData);
            updateReminderSection(AppState.currentReferralsData);
            updateReferralList(AppState.currentReferralsData);
        }
    }
    
async function handleFormSubmit() {
  const phone = document.getElementById('dashboard-phone').value.trim();
  const email = document.getElementById('dashboard-email').value.trim();
  
  if (!validateInputs(phone, email)) {
    return;
  }

  setLoadingState(true);

  try {
    // This will trigger the Power Automate flow
    const referrals = await ApiService.fetchReferrals(phone, email);
    AppState.currentReferralsData = processReferrals(referrals);
    showReferralResults(AppState.currentReferralsData, phone, email);
    
  } catch (error) {
    console.error('Error:', error);
    showErrorModal(translations[AppState.currentLanguage].errorMessage);
  } finally {
    setLoadingState(false);
  }
}
    
    function processReferrals(referrals) {
        return referrals.map(referral => {
            // Get status from either field name
            const status = referral.status || referral.Status || 'Unknown';
            
            // Use StatusMapping to get the mapped status and type
            const mappedStatus = StatusMapping.mapStatusToGroup(status);
            const statusType = StatusMapping.getSimplifiedStatusType(status);
            const stage = StatusMapping.determineStage(mappedStatus);
            
            // Calculate days in stage if not provided
            const daysInStage = referral.daysInStage || calculateDaysInStage(referral.UpdatedDate || referral.updatedDate);
            
            // Determine if action is needed
            const needsAction = referral.needsAction !== undefined ? referral.needsAction : 
                               (['assessment', 'talent'].includes(statusType) && daysInStage > 3 && !referral.isPreviousCandidate);
            
            return {
                ...referral,
                // Ensure consistent field names
                personId: referral.personId || referral.Person_system_id || '',
                name: referral.name || referral.First_Name || 'Unknown',
                email: referral.email || referral.Email || '',
                status: status,
                location: referral.location || referral.Location || '',
                nationality: referral.nationality || referral.F_Nationality || '',
                source: referral.source || referral.Source || '',
                sourceName: referral.sourceName || referral.SourceName || '',
                employee: referral.employee || referral.Employee || '',
                // Processed fields
                mappedStatus,
                statusType,
                stage,
                daysInStage,
                isPreviousCandidate: referral.isPreviousCandidate || false,
                needsAction,
                // Display fields
                displayStatus: status,
                displayStatusType: statusType
            };
        });
    }
    
    function calculateDaysInStage(dateString) {
        if (!dateString) return 0;
        const date = new Date(dateString);
        const today = new Date();
        return Math.floor((today - date) / (1000 * 60 * 60 * 24));
    }
    
    function validateInputs(phone, email) {
        let isValid = true;
        
        // Validate phone
        if (!phone) {
            showError(document.getElementById('dashboard-phone'), 
                     translations[AppState.currentLanguage].phoneError);
            isValid = false;
        } else if (!validatePhone(phone)) {
            showError(document.getElementById('dashboard-phone'), 
                     translations[AppState.currentLanguage].phoneError);
            isValid = false;
        } else {
            clearError(document.getElementById('dashboard-phone'));
        }
        
        // Validate email
        if (!email) {
            showError(document.getElementById('dashboard-email'), 
                     translations[AppState.currentLanguage].emailError);
            isValid = false;
        } else if (!validateEmail(email)) {
            showError(document.getElementById('dashboard-email'), 
                     translations[AppState.currentLanguage].emailError);
            isValid = false;
        } else {
            clearError(document.getElementById('dashboard-email'));
        }
        
        return isValid;
    }
    
    function validatePhone(phone) {
        const regex = /^01\d{8,9}$/;
        return regex.test(phone);
    }
    
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
        return regex.test(email) && email.length <= 254;
    }
    
    function showError(input, message) {
        const formControl = input.closest('.mb-3');
        const error = formControl.querySelector('.invalid-feedback');
        
        formControl.classList.add('was-validated');
        error.textContent = message;
        error.style.display = 'block';
        input.classList.add('is-invalid');
    }
    
    function clearError(input) {
        const formControl = input.closest('.mb-3');
        const error = formControl.querySelector('.invalid-feedback');
        
        formControl.classList.remove('was-validated');
        error.style.display = 'none';
        input.classList.remove('is-invalid');
    }
    
function setLoadingState(isLoading) {
  const submitBtn = document.getElementById('dashboard-submit');
  
  if (isLoading) {
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>' + 
                         translations[AppState.currentLanguage].connectingMessage;
    submitBtn.disabled = true;
  } else {
    submitBtn.innerHTML = translations[AppState.currentLanguage].viewStatusBtn;
    submitBtn.disabled = false;
  }
}
    
    function showUserNotFoundModal() {
        const modal = new bootstrap.Modal(document.getElementById('userNotFoundModal'));
        modal.show();
    }
    
    function showErrorModal(message) {
        document.getElementById('error-message').textContent = message;
        const modal = new bootstrap.Modal(document.getElementById('errorModal'));
        modal.show();
    }
    
    function showReferralResults(referrals, phone, email) {
        document.getElementById('auth-step').style.display = 'none';
        document.getElementById('results-step').style.display = 'block';
        
        // Extract user name from first referral or use email
        const userName = referrals[0]?.employee || referrals[0]?.name || email.split('@')[0];
        
        // Create results content
        const resultsContent = createResultsContent(userName, referrals);
        document.getElementById('results-step').innerHTML = resultsContent;
        
        // Update all components
        updateChart(referrals);
        updateEarningsTable(referrals);
        updateReminderSection(referrals);
        updateReferralList(referrals);
        
        // Re-attach event listeners
        document.getElementById('dashboard-back').addEventListener('click', handleBackButton);
        document.getElementById('filteredViewToggle').addEventListener('change', handleFilterToggle);
        
        // Add debug button if in debug mode
        if (AppState.debugMode) {
            addDebugButton();
        }
        
        // Update translations
        updateTranslations();
    }
    
    function createResultsContent(userName, referrals) {
        const hiredCount = referrals.filter(r => r.stage === 'Hired').length;
        const inProgressCount = referrals.filter(r => 
            r.stage !== 'Hired' && 
            r.stage !== 'Not Selected' && 
            r.stage !== 'Eliminated'
        ).length;
        
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
            
            <div id="referral-stats" class="row mb-4">
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <h5 class="card-title" data-translate="totalReferrals">Total Referrals</h5>
                            <h3 class="text-primary" id="total-referrals">${referrals.length}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <h5 class="card-title" data-translate="hiredReferrals">Hired</h5>
                            <h3 class="text-success" id="hired-referrals">${hiredCount}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <h5 class="card-title" data-translate="inProgress">In Progress</h5>
                            <h3 class="text-warning" id="progress-referrals">${inProgressCount}</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card mb-3">
                <div class="card-body">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="filteredViewToggle">
                        <label class="form-check-label" for="filteredViewToggle" data-translate="filteredViewLabel">Simplified Status View</label>
                    </div>
                </div>
            </div>
            
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-3" data-translate="statusDistribution">Status Distribution</h5>
                    <div class="chart-container" style="height: 300px; width: 100%; margin: 0 auto;">
                        <canvas id="statusChart"></canvas>
                        <img src="TPLogo11.png" class="chart-logo" alt="TP Logo">
                    </div>
                    <div class="chart-legend text-center mt-3" id="chartLegend"></div>
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
                                    <th data-translate="earningsTotal">Total Earnings</th>
                                    <th></th>
                                    <th></th>
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
            
            <div id="reminder-section" class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title text-center mb-3" data-translate="remindFriendsTitle">Remind Your Friends</h5>
                    <p class="text-center" data-translate="remindFriendsText">Help your friends complete their assessments to join TP!</p>
                    <div id="friends-to-remind" class="row"></div>
                </div>
            </div>
            
            <div id="referral-list"></div>
            
            ${AppState.debugMode ? '<div id="debug-section" class="mt-3"></div>' : ''}
            
            <!-- Social Media -->
            <div class="mt-4">
                <div class="row text-center">
                    <!-- TP Global -->
                    <div class="col-md-4 mb-3">
                        <h5 data-translate="tpGlobal">TP Global</h5>
                        <div class="d-flex justify-content-center gap-3">
                            <a href="https://www.linkedin.com/company/teleperformance" class="social-icon" target="_blank"><i class="fab fa-linkedin"></i></a>
                            <a href="https://www.youtube.com/@TeleperformanceGroup" class="social-icon" target="_blank"><i class="fab fa-youtube"></i></a>
                            <a href="https://www.tiktok.com/@teleperformance_group" class="social-icon" target="_blank"><i class="fab fa-tiktok"></i></a>
                        </div>
                    </div>
                    <!-- TP Malaysia -->
                    <div class="col-md-4 mb-3">
                        <h5 data-translate="followMalaysia">TP Malaysia</h5>
                        <div class="d-flex justify-content-center gap-3">
                            <a href="https://www.facebook.com/TPinMalaysia/" class="social-icon" target="_blank"><i class="fab fa-facebook-f"></i></a>
                            <a href="http://www.instagram.com/tp_malaysia/" class="social-icon" target="_blank"><i class="fab fa-instagram"></i></a>
                        </div>
                    </div>
                    <!-- TP Thailand -->
                    <div class="col-md-4 mb-3">
                        <h5 data-translate="followThailand">TP Thailand</h5>
                        <div class="d-flex justify-content-center gap-3">
                            <a href="http://www.facebook.com/TPinThailand/" class="social-icon" target="_blank"><i class="fab fa-facebook-f"></i></a>
                            <a href="http://www.instagram.com/tpinthailand/" class="social-icon" target="_blank"><i class="fab fa-instagram"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function addDebugButton() {
        const debugSection = document.getElementById('debug-section');
        if (debugSection) {
            debugSection.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5>Debug Tools</h5>
                        <button class="btn btn-sm btn-info me-2" onclick="window.ApiService.debugListFields('candidate')">
                            Debug Candidate Fields
                        </button>
                        <button class="btn btn-sm btn-info me-2" onclick="window.ApiService.debugListFields('assessment')">
                            Debug Assessment Fields
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="console.log(window.AppState)">
                            Log App State
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    function handleBackButton() {
        document.getElementById('auth-step').style.display = 'block';
        document.getElementById('results-step').style.display = 'none';
        AppState.currentReferralsData = null;
        
        // Clear form inputs
        document.getElementById('dashboard-phone').value = '';
        document.getElementById('dashboard-email').value = '';
        
        // Focus on phone input
        document.getElementById('dashboard-phone').focus();
    }
    
    function handleFilterToggle() {
        if (AppState.currentReferralsData) {
            updateChart(AppState.currentReferralsData);
            updateReferralList(AppState.currentReferralsData);
        }
    }
    
    function handleReminderClick(e) {
        if (e.target.classList.contains('remind-btn') || e.target.closest('.remind-btn')) {
            const button = e.target.classList.contains('remind-btn') ? e.target : e.target.closest('.remind-btn');
            const name = button.dataset.name;
            let phone = button.dataset.phone;
            
            // Sanitize phone number - remove any stored prefix
            phone = phone.replace(/^6/, '');
            
            // Format phone number for WhatsApp (remove leading 0 and add country code)
            const formattedPhone = phone.startsWith('0') ? '6' + phone : '60' + phone;
            
            const message = `Hi ${name}, this is a reminder to complete your TP assessment. ` +
                           `We're excited about your application! Please complete it at your earliest convenience. ` +
                           `If you need any help, feel free to ask me.`;
            
            window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
        }
    }
    
    function updateChart(referrals) {
        const ctx = document.getElementById('statusChart').getContext('2d');
        const translation = translations[AppState.currentLanguage] || translations.en;
        
        // Check if filtered view is enabled
        const filteredView = document.getElementById('filteredViewToggle')?.checked || false;
        
        // Count statuses
        let statusCounts = {};
        
        if (filteredView) {
            // Use the simplified status groups
            StatusMapping.displayOrder.forEach(group => {
                statusCounts[group] = referrals.filter(r => StatusMapping.mapStatusToGroup(r.status) === group).length;
            });
        } else {
            // Original status counting
            statusCounts = {
                passed: referrals.filter(r => r.statusType === 'passed').length,
                probation: referrals.filter(r => r.statusType === 'probation').length,
                previouslyApplied: referrals.filter(r => r.statusType === 'previouslyApplied').length,
                operations: referrals.filter(r => r.statusType === 'operations').length,
                talent: referrals.filter(r => r.statusType === 'talent').length,
                assessment: referrals.filter(r => r.statusType === 'assessment').length,
                received: referrals.filter(r => r.statusType === 'received').length,
                failed: referrals.filter(r => r.statusType === 'failed').length
            };
        }
        
        // Chart data
        const data = createChartData(statusCounts, filteredView, translation);
        
        // Destroy previous chart if exists
        if (AppState.statusChart) {
            AppState.statusChart.destroy();
        }
        
        // Create new chart
        AppState.statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: getChartOptions()
        });
        
        // Create custom legend
        createChartLegend(data);
    }
    
    function createChartData(statusCounts, filteredView, translation) {
        if (filteredView) {
            return {
                labels: StatusMapping.displayOrder.map(group => {
                    const translationKey = `status${group.replace(/\s+/g, '').replace(/[()]/g, '')}`;
                    return translation[translationKey] || group;
                }),
                datasets: [{
                    data: StatusMapping.displayOrder.map(group => statusCounts[group] || 0),
                    backgroundColor: [
                        '#28a745', '#7cb342', '#6c757d', '#ffc107',
                        '#fd7e14', '#17a2b8', '#6c757d', '#dc3545'
                    ],
                    borderWidth: 1,
                    hoverOffset: 20
                }]
            };
        } else {
            return {
                labels: [
                    translation.statusPassed,
                    translation.statusProbation,
                    translation.statusPreviouslyApplied,
                    translation.statusOperations,
                    translation.statusTalent,
                    translation.statusAssessment,
                    translation.statusReceived,
                    translation.statusFailed
                ],
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: [
                        '#28a745', '#7cb342', '#6c757d', '#ffc107',
                        '#fd7e14', '#17a2b8', '#6c757d', '#dc3545'
                    ],
                    borderWidth: 1,
                    hoverOffset: 20
                }]
            };
        }
    }
    
    function getChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    display: false
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
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        };
    }
    
    function createChartLegend(data) {
        const legendContainer = document.getElementById('chartLegend');
        legendContainer.innerHTML = '';
        
        data.labels.forEach((label, i) => {
            if (data.datasets[0].data[i] > 0) { // Only show legend items with data
                const legendItem = document.createElement('span');
                legendItem.className = 'd-inline-block mx-2 mb-1';
                legendItem.innerHTML = `
                    <span class="d-inline-block me-1" style="width: 12px; height: 12px; background-color: ${data.datasets[0].backgroundColor[i]}; border-radius: 2px;"></span>
                    ${label}
                `;
                legendContainer.appendChild(legendItem);
            }
        });
    }
    
    function updateEarningsTable(referrals) {
        const earningsBody = document.getElementById('earnings-body');
        earningsBody.innerHTML = '';
        
        let totalEarnings = 0;
        
        // Calculate earnings based on status and days
        const assessmentPasses = referrals.filter(r => {
            // Check if passed assessment (hired or in later stages)
            const passedAssessment = ['passed', 'probation', 'operations', 'talent'].includes(r.statusType) ||
                                    r.stage === 'Hired' || 
                                    r.stage === 'Interview' ||
                                    r.stage === 'Final Review';
            return passedAssessment && !r.isPreviousCandidate;
        });
        
        const probationCompletions = referrals.filter(r => 
            r.statusType === 'passed' && 
            r.daysInStage >= 90 && 
            !r.isPreviousCandidate
        );
        
        // Add rows for each earning type
        Object.entries(earningsStructure).forEach(([key, earning]) => {
            const count = key === 'assessment' ? assessmentPasses.length : probationCompletions.length;
            const total = count * earning.amount;
            totalEarnings += total;
            
            const translationKey = key === 'assessment' ? 'statusAssessmentPassed' : 'statusProbationPassed';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${translations[AppState.currentLanguage][translationKey] || earning.label}</td>
                <td>RM ${earning.amount}</td>
                <td>${count}</td>
                <td>RM ${total}</td>
            `;
            earningsBody.appendChild(row);
        });
        
        // Update total earnings
        document.getElementById('total-earnings').textContent = `RM ${totalEarnings}`;
    }
    
    function updateReminderSection(referrals) {
        const friendsToRemind = document.getElementById('friends-to-remind');
        friendsToRemind.innerHTML = '';
        
        // Filter friends needing reminder
        const friendsNeedingReminder = referrals
            .filter(r => r.needsAction && !r.isPreviousCandidate)
            .sort((a, b) => {
                const statusOrder = ['assessment', 'talent', 'operations', 'received'];
                return statusOrder.indexOf(a.statusType) - statusOrder.indexOf(b.statusType);
            });
        
        if (friendsNeedingReminder.length === 0) {
            // Check if there are any referrals at all
            if (referrals.length === 0) {
                friendsToRemind.innerHTML = `
                    <div class="col-12 text-center">
                        <p class="text-muted">No friends to remind yet. Start referring to see reminders here!</p>
                    </div>
                `;
            } else {
                friendsToRemind.innerHTML = `
                    <div class="col-12 text-center">
                        <p class="text-muted" data-translate="noRemindersNeeded">All your friends are on track!</p>
                    </div>
                `;
            }
            updateTranslations();
            return;
        }
        
        friendsNeedingReminder.forEach(friend => {
            const col = document.createElement('div');
            col.className = 'col-md-6 mb-3';
            
            // Extract phone number
            const phoneNumber = friend.employee || friend.Employee || '0123456789';
            
            col.innerHTML = `
                <div class="friend-to-remind status-${friend.statusType}">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5>${friend.name}</h5>
                        <span class="badge status-badge bg-${getStatusBadgeColor(friend.statusType)}">
                            ${translations[AppState.currentLanguage][`status${friend.statusType.charAt(0).toUpperCase() + friend.statusType.slice(1)}`]}
                        </span>
                    </div>
                    <p class="small text-muted mb-2">${friend.email}</p>
                    <p class="small mb-2"><strong>${translations[AppState.currentLanguage].referralDays}:</strong> ${friend.daysInStage}</p>
                    <button class="btn btn-sm btn-primary w-100 remind-btn" 
                            data-name="${friend.name}" 
                            data-phone="${phoneNumber}" 
                            data-translate="remindBtn">
                        <i class="fab fa-whatsapp me-2"></i>${translations[AppState.currentLanguage].remindBtn}
                    </button>
                </div>
            `;
            
            friendsToRemind.appendChild(col);
        });
    }
    
    function updateReferralList(referrals) {
        const referralList = document.getElementById('referral-list');
        referralList.innerHTML = '';
        
        if (referrals.length === 0) {
            referralList.innerHTML = `
                <div class="card">
                    <div class="card-body text-center py-5">
                        <i class="fas fa-users fa-3x text-muted mb-3"></i>
                        <h5 data-translate="noReferrals">No referrals found yet.</h5>
                        <p class="text-muted">Start referring friends to see them appear here!</p>
                        <a href="https://tpmyandtpth.github.io/xRAF/" class="btn btn-primary mt-3">
                            <i class="fas fa-user-plus me-2"></i>Refer a Friend
                        </a>
                    </div>
                </div>
            `;
            updateTranslations();
            return;
        }
        
        // Check if filtered view is enabled
        const filteredView = document.getElementById('filteredViewToggle')?.checked || false;
        
        // Process and sort referrals
        const processedReferrals = processReferralsForDisplay(referrals, filteredView);
        
        processedReferrals.forEach(referral => {
            const item = createReferralListItem(referral);
            referralList.appendChild(item);
        });
        
        updateTranslations();
    }
    
    function processReferralsForDisplay(referrals, filteredView) {
        const processed = referrals.map(r => {
            if (filteredView) {
                return {
                    ...r,
                    displayStatus: StatusMapping.mapStatusToGroup(r.status),
                    displayStatusType: StatusMapping.getSimplifiedStatusType(r.status)
                };
            }
            return {
                ...r,
                displayStatus: r.status,
                displayStatusType: r.statusType
            };
        });
        
        // Sort by status order
        const statusOrder = filteredView ? 
            StatusMapping.displayOrder : 
            ['passed', 'probation', 'previouslyApplied', 'operations', 'talent', 'assessment', 'received', 'failed'];
            
        return processed.sort((a, b) => {
            const aIndex = statusOrder.indexOf(filteredView ? a.displayStatus : a.displayStatusType);
            const bIndex = statusOrder.indexOf(filteredView ? b.displayStatus : b.displayStatusType);
            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        });
    }
    
    function createReferralListItem(referral) {
        const item = document.createElement('div');
        const statusKey = `status${referral.displayStatusType.charAt(0).toUpperCase() + referral.displayStatusType.slice(1)}`;
        const statusTranslation = translations[AppState.currentLanguage][statusKey] || referral.displayStatus;
        
        // Determine if payment is eligible
        const isPaymentEligible = referral.statusType === 'passed' && 
                                  referral.daysInStage >= 90 && 
                                  !referral.isPreviousCandidate;
        
        // Extract phone number if available
        const phoneNumber = referral.employee || referral.Employee || '0123456789';
        
        item.className = `card mb-3 status-${referral.displayStatusType} ${isPaymentEligible ? 'payment-eligible' : ''}`;
        
        // Add assessment info if available
        const assessmentInfo = referral.assessmentCEFR ? 
            `<p class="mb-1 text-muted small">CEFR: ${referral.assessmentCEFR} | Score: ${referral.assessmentScore || 'N/A'}</p>` : '';
        
        item.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h5 class="mb-1">${referral.name}</h5>
                        <p class="mb-1 text-muted small">${referral.email}</p>
                        ${referral.personId ? `<p class="mb-1 text-muted small">ID: ${referral.personId}</p>` : ''}
                        ${assessmentInfo}
                    </div>
                    <span class="badge status-badge bg-${getStatusBadgeColor(referral.displayStatusType, referral.daysInStage, referral.isPreviousCandidate)}">
                        ${statusTranslation}
                    </span>
                </div>
                <div class="row">
                    <div class="col-md-3">
                        <small class="text-muted" data-translate="referralStage">Stage</small>
                        <p>${referral.stage}</p>
                    </div>
                    <div class="col-md-3">
                        <small class="text-muted">Location</small>
                        <p>${referral.location || 'N/A'}</p>
                    </div>
                    <div class="col-md-3">
                        <small class="text-muted" data-translate="referralDays">Days in Stage</small>
                        <p>${referral.daysInStage}</p>
                    </div>
                    <div class="col-md-3">
                        ${referral.needsAction && !referral.isPreviousCandidate ? `
                        <button class="btn btn-sm btn-primary w-100 remind-btn" 
                                data-name="${referral.name}" 
                                data-phone="${phoneNumber}" 
                                data-translate="remindBtn">
                            <i class="fab fa-whatsapp me-2"></i>${translations[AppState.currentLanguage].remindBtn}
                        </button>
                        ` : ''}
                    </div>
                </div>
                ${referral.source || referral.sourceName ? `
                <div class="mt-2">
                    <small class="text-muted">Source: ${referral.sourceName || referral.source}</small>
                </div>
                ` : ''}
            </div>
        `;
        
        return item;
    }
    
    function getErrorMessage(error) {
        if (error.message && error.message.includes('Failed to fetch')) {
            return 'Unable to connect to SharePoint. This could be due to CORS restrictions. Please host this application on SharePoint or contact your administrator.';
        } else if (error.message && error.message.includes('NetworkError')) {
            return 'Network connection error. Please check your internet connection.';
        } else if (error.message && error.message.includes('401')) {
            return 'Authentication required. Please ensure you are logged into SharePoint.';
        } else if (error.message && error.message.includes('403')) {
            return 'Access denied. You may not have permission to access the SharePoint lists.';
        } else if (error.message && error.message.includes('404')) {
            return 'SharePoint lists not found. Please verify the list names and URLs.';
        } else {
            return `Connection error: ${error.message || 'Unknown error'}. The dashboard is showing with no data.`;
        }
    }
    
    function showNonBlockingError(message) {
        // Create a dismissible alert instead of a modal
        const alertHtml = `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                <strong>Notice:</strong> ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        // Add to the top of results
        const resultsStep = document.getElementById('results-step');
        const existingAlert = resultsStep.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        resultsStep.insertAdjacentHTML('afterbegin', alertHtml);
    }
        if (isPreviousCandidate) {
            return 'previously-applied';
        }
        
        switch(statusType) {
            case 'passed':
                return daysInStage >= 90 ? 'success' : 'warning';
            case 'probation':
                return 'warning';
            case 'previouslyApplied':
                return 'previously-applied';
            case 'assessment':
            case 'talent':
            case 'operations':
                return 'warning';
            case 'failed':
                return 'danger';
            default:
                return 'secondary';
        }
    }
    
    function updateTranslations() {
        const translation = translations[AppState.currentLanguage] || translations.en;
        
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
    
    // Make AppState available globally for debugging
    window.AppState = AppState;
});
