document.addEventListener('DOMContentLoaded', function() {
    // Set current year
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    let currentLanguage = 'en';
    let statusChart = null;
    
    // User database (mock data)
    const userDatabase = {
        "0123456789:amr@tp.com": {
            fullName: "Amr EzZ",
            email: "amr@tp.com",
            phone: "0123456789"
        },
        "0174669871:loai@example.com": {
            fullName: "Loai Doe",
            email: "loai@example.com",
            phone: "0174669871"
        },
        "0182708243:tarek@example.com": {
            fullName: "Tarek Smith",
            email: "tarek@example.com",
            phone: "0182708243"
        },
        "0173890590:pourya@example.com": {
            fullName: "Pourya Johnson",
            email: "pourya@example.com",
            phone: "0173890590"
        }
    };

    // Sample data with all status examples
    const sampleData = {
        "0123456789:amr@tp.com": [
            {
                name: "John Smith (Passed Probation)",
                email: "john.smith@example.com",
                stage: "Hired",
                status: "Successfully passed probation",
                statusType: "passed",
                applicationDate: "2023-11-15",
                hireDate: "2023-11-20",
                daysInStage: 95,
                category: "Customer Service",
                source: "Employee Referral",
                needsAction: false,
                phone: "0112345678",
                isPreviousCandidate: false
            },
            {
                name: "Sarah Johnson (In Probation)",
                email: "sarah.j@example.com",
                stage: "Hired",
                status: "In probation period",
                statusType: "probation",
                applicationDate: "2023-12-10",
                hireDate: "2023-12-15",
                daysInStage: 45,
                category: "Technical Support",
                source: "Employee Referral",
                needsAction: false,
                phone: "0112345679",
                isPreviousCandidate: false
            },
            {
                name: "Michael Brown (Operations Review)",
                email: "michael.b@example.com",
                stage: "Operations",
                status: "Final review by operations",
                statusType: "operations",
                applicationDate: "2024-01-05",
                hireDate: "",
                daysInStage: 10,
                category: "Sales",
                source: "Employee Referral",
                needsAction: false,
                phone: "0112345680",
                isPreviousCandidate: false
            },
            {
                name: "Loai (Interview Stage)",
                email: "loai.d@example.com",
                stage: "Talent",
                status: "Interview scheduled",
                statusType: "talent",
                applicationDate: "2024-01-15",
                hireDate: "",
                daysInStage: 5,
                category: "Customer Service",
                source: "Employee Referral",
                needsAction: false,
                phone: "0174669871",
                isPreviousCandidate: false
            },
            {
                name: "Tarek (Assessment)",
                email: "tarek@example.com",
                stage: "Assessment",
                status: "Assessment in progress",
                statusType: "assessment",
                applicationDate: "2024-01-20",
                hireDate: "",
                daysInStage: 2,
                category: "Technical Support",
                source: "Employee Referral",
                needsAction: true,
                phone: "0182708243",
                isPreviousCandidate: false
            },
            {
                name: "Pourya (Assessment)",
                email: "Pourya@example.com",
                stage: "Assessment",
                status: "Assessment in progress",
                statusType: "assessment",
                applicationDate: "2024-01-20",
                hireDate: "",
                daysInStage: 2,
                category: "Technical Support",
                source: "Employee Referral",
                needsAction: true,
                phone: "0173890590",
                isPreviousCandidate: false
            },
            {
                name: "Lisa Miller (Application Received)",
                email: "lisa.m@example.com",
                stage: "Application",
                status: "Application received",
                statusType: "received",
                applicationDate: "2024-01-25",
                hireDate: "",
                daysInStage: 1,
                category: "Sales",
                source: "Employee Referral",
                needsAction: false,
                phone: "0112345683",
                isPreviousCandidate: false
            },
            {
                name: "Robert Taylor (Not Selected)",
                email: "robert.t@example.com",
                stage: "Hired",
                status: "Terminated during probation",
                statusType: "failed",
                applicationDate: "2023-10-01",
                hireDate: "2023-10-10",
                daysInStage: 45,
                category: "Customer Service",
                source: "Employee Referral",
                needsAction: false,
                phone: "0112345684",
                isPreviousCandidate: false
            },
            {
                name: "Previous Candidate (No Payment)",
                email: "previous@example.com",
                stage: "Application",
                status: "Applied to TP before",
                statusType: "previouslyApplied",
                applicationDate: "2023-01-10",
                hireDate: "",
                daysInStage: 400,
                category: "Customer Service",
                source: "Employee Referral",
                needsAction: false,
                phone: "0112345685",
                isPreviousCandidate: true
            }
        ],
        "0174669871:loai@example.com": [
            {
                name: "Jane Doe (Assessment)",
                email: "jane.doe@example.com",
                stage: "Assessment",
                status: "Assessment in progress",
                statusType: "assessment",
                applicationDate: "2024-01-18",
                hireDate: "",
                daysInStage: 3,
                category: "Customer Service",
                source: "Employee Referral",
                needsAction: true,
                phone: "0112345686",
                isPreviousCandidate: false
            }
        ],
        "0182708243:tarek@example.com": [
            {
                name: "Mike Johnson (Probation)",
                email: "mike.j@example.com",
                stage: "Hired",
                status: "In probation period",
                statusType: "probation",
                applicationDate: "2023-12-05",
                hireDate: "2023-12-10",
                daysInStage: 60,
                category: "Technical Support",
                source: "Employee Referral",
                needsAction: false,
                phone: "0112345687",
                isPreviousCandidate: false
            }
        ],
        "0173890590:pourya@example.com": [
            {
                name: "Sarah Williams (Operations)",
                email: "sarah.w@example.com",
                stage: "Operations",
                status: "Final review by operations",
                statusType: "operations",
                applicationDate: "2024-01-10",
                hireDate: "",
                daysInStage: 15,
                category: "Sales",
                source: "Employee Referral",
                needsAction: false,
                phone: "0112345688",
                isPreviousCandidate: false
            }
        ]
    };

    // Function to map a status to its simplified group
    function mapStatusToGroup(status) {
        if (!statusMapping.statusGroups) return status;
        
        for (const [group, statuses] of Object.entries(statusMapping.statusGroups)) {
            if (statuses.includes(status)) {
                return group;
            }
        }
        
        // If not found in any group, check if it starts with "Eliminated" or "Withdrew"
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
            case "Final Review":
                return "operations";
            case "Interview Stage":
                return "talent";
            case "Assessment Stage":
                return "assessment";
            case "Application Received":
                return "received";
            case "Not Selected":
                return "failed";
            default:
                return "received";
        }
    }

    // Update translations
    function updateTranslations() {
        const translation = translations[currentLanguage] || translations.en;
        
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
    
    // Language change handler
    document.getElementById('lang-select').addEventListener('change', function() {
        currentLanguage = this.value;
        updateTranslations();
        
        // Refresh chart if it exists
        if (statusChart) {
            const referrals = getCurrentReferrals();
            if (referrals) {
                updateChart(referrals);
                updateEarningsTable(referrals);
                updateReminderSection(referrals);
                updateReferralList(referrals);
            }
        }
    });
    
    // Validate phone number
    function validatePhone(phone) {
        const regex = /^01\d{8,9}$/;
        return regex.test(phone);
    }
    
    // Validate email (case insensitive)
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
    
    // Get referrals for current user
    function getReferrals(phone, email) {
        const key = `${phone}:${email.toLowerCase()}`; // Case insensitive email matching
        return sampleData[key] || null;
    }
    
    // Get current referrals (for chart refresh)
    function getCurrentReferrals() {
        const phone = document.getElementById('dashboard-phone').value.trim();
        const email = document.getElementById('dashboard-email').value.trim();
        return getReferrals(phone, email);
    }
    
    // Get user info
    function getUserInfo(phone, email) {
        const key = `${phone}:${email.toLowerCase()}`;
        return userDatabase[key] || null;
    }
    
    // Get status badge color with payment eligibility check
    function getStatusBadgeColor(statusType, daysInStage = 0, isPreviousCandidate = false) {
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
    
    // Update earnings table
    function updateEarningsTable(referrals) {
        const earningsBody = document.getElementById('earnings-body');
        earningsBody.innerHTML = '';
        
        let totalEarnings = 0;
        
        // Calculate assessment passes (not previously applied)
        const assessmentPasses = referrals.filter(r => 
            r.statusType === 'passed' && 
            !r.isPreviousCandidate
        );
        
        // Calculate probation completions (not previously applied)
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
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${earning.label}</td>
                <td>RM ${earning.amount}</td>
                <td>${count}</td>
                <td>RM ${total}</td>
            `;
            earningsBody.appendChild(row);
        });
        
        // Update total earnings
        document.getElementById('total-earnings').textContent = `RM ${totalEarnings}`;
    }
    
    // Update reminder section - ONLY FOR ASSESSMENT STAGE
    function updateReminderSection(referrals) {
        const friendsToRemind = document.getElementById('friends-to-remind');
        friendsToRemind.innerHTML = '';
        
        // Filter for Assessment Stage only
        const friendsNeedingReminder = referrals
            .filter(r => r.statusType === 'assessment' && !r.isPreviousCandidate)
            .sort((a, b) => b.daysInStage - a.daysInStage);
        
        if (friendsNeedingReminder.length === 0) {
            friendsToRemind.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-success fade-in-up">
                        <i class="fas fa-check-circle me-2"></i>
                        <span data-translate="noRemindersNeeded">${translations[currentLanguage].noRemindersNeeded}</span>
                    </div>
                </div>
            `;
            updateTranslations();
            return;
        }
        
        friendsNeedingReminder.forEach((friend, index) => {
            const col = document.createElement('div');
            col.className = 'col-md-6 mb-3';
            
            const statusTranslation = translations[currentLanguage].statusAssessment || 'Assessment Stage';
            
            col.innerHTML = `
                <div class="friend-to-remind status-${friend.statusType} fade-in-up" style="animation-delay: ${index * 0.1}s">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5><i class="fas fa-user me-2"></i>${friend.name}</h5>
                        <span class="badge status-badge bg-${getStatusBadgeColor(friend.statusType)}">
                            ${statusTranslation}
                        </span>
                    </div>
                    <p class="small text-muted mb-2">
                        <i class="fas fa-envelope me-1"></i>${friend.email}
                    </p>
                    <p class="small mb-2">
                        <strong><i class="fas fa-calendar-alt me-1"></i><span data-translate="referralDays">${translations[currentLanguage].referralDays}:</span></strong> ${friend.daysInStage}
                    </p>
                    <button class="btn btn-sm btn-success w-100 remind-btn" 
                            data-name="${friend.name}" 
                            data-phone="${friend.phone}" 
                            data-translate="remindBtn">
                        <i class="fab fa-whatsapp me-2"></i>${translations[currentLanguage].remindBtn}
                    </button>
                </div>
            `;
            
            friendsToRemind.appendChild(col);
        });
        
        updateTranslations();
    }
    
    // Form submission with enhanced loading state
    document.getElementById('dashboard-submit').addEventListener('click', function() {
        const phone = document.getElementById('dashboard-phone').value.trim();
        const email = document.getElementById('dashboard-email').value.trim();
        let isValid = true;
        
        const button = this;
        const originalText = button.innerHTML;
        
        // Validate phone
        if (!phone) {
            showError(document.getElementById('dashboard-phone'), 
                     translations[currentLanguage].phoneError);
            isValid = false;
        } else if (!validatePhone(phone)) {
            showError(document.getElementById('dashboard-phone'), 
                     translations[currentLanguage].phoneError);
            isValid = false;
        } else {
            clearError(document.getElementById('dashboard-phone'));
        }
        
        // Validate email
        if (!email) {
            showError(document.getElementById('dashboard-email'), 
                     translations[currentLanguage].emailError);
            isValid = false;
        } else if (!validateEmail(email)) {
            showError(document.getElementById('dashboard-email'), 
                     translations[currentLanguage].emailError);
            isValid = false;
        } else {
            clearError(document.getElementById('dashboard-email'));
        }
        
        if (!isValid) return;
        
        // Show loading state
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
        button.disabled = true;
        
        // Simulate API call delay
        setTimeout(() => {
            // Get referrals
            const referrals = getReferrals(phone, email);
            
            // Reset button
            button.innerHTML = originalText;
            button.disabled = false;
            
            if (!referrals) {
                // Show user not found modal
                const userNotFoundModal = new bootstrap.Modal(document.getElementById('userNotFoundModal'));
                userNotFoundModal.show();
                return;
            }
            
            // Show results
            showReferralResults(referrals, phone, email);
        }, 800);
    });
    
    // Show referral results
    function showReferralResults(referrals, phone, email) {
        document.getElementById('auth-step').style.display = 'none';
        document.getElementById('results-step').style.display = 'block';
        
        // Get user info
        const userInfo = getUserInfo(phone, email);
        const translation = translations[currentLanguage] || translations.en;
        
        // Create results content
        const resultsContent = `
            <div class="d-flex justify-content-between align-items-start mb-4 fade-in-up">
                <div>
                    ${userInfo ? `<h3 class="user-name-display"><i class="fas fa-user-tie me-2"></i>${userInfo.fullName}</h3>` : ''}
                    <h4 data-translate="yourReferralsTitle"><i class="fas fa-users me-2"></i>${translation.yourReferralsTitle}</h4>
                </div>
                <button id="dashboard-back" class="btn btn-outline-secondary" data-translate="backBtn">
                    <i class="fas fa-arrow-left me-2"></i> ${translation.backBtn}
                </button>
            </div>
            
            <div id="referral-stats" class="row mb-4">
                <div class="col-md-4 mb-3">
                    <div class="stats-card fade-in-up" style="animation-delay: 0.1s">
                        <h3 id="total-referrals">${referrals.length}</h3>
                        <h5 data-translate="totalReferrals"><i class="fas fa-users me-2"></i>${translation.totalReferrals}</h5>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="stats-card fade-in-up" style="animation-delay: 0.2s">
                        <h3 class="text-success" id="hired-referrals">${referrals.filter(r => r.stage === 'Hired').length}</h3>
                        <h5 data-translate="hiredReferrals"><i class="fas fa-check-circle me-2"></i>${translation.hiredReferrals}</h5>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="stats-card fade-in-up" style="animation-delay: 0.3s">
                        <h3 class="text-warning" id="progress-referrals">${referrals.filter(r => r.stage !== 'Hired').length}</h3>
                        <h5 data-translate="inProgress"><i class="fas fa-clock me-2"></i>${translation.inProgress}</h5>
                    </div>
                </div>
            </div>
            
            <div class="card mb-3 fade-in-up" style="animation-delay: 0.4s">
                <div class="card-body">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="filteredViewToggle">
                        <label class="form-check-label" for="filteredViewToggle" data-translate="filteredViewLabel">
                            <i class="fas fa-filter me-2"></i>${translation.filteredViewLabel}
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="card mb-4 fade-in-up" style="animation-delay: 0.5s">
                <div class="card-body">
                    <h5 class="card-title text-center mb-3" data-translate="statusDistribution">
                        <i class="fas fa-chart-pie me-2"></i>${translation.statusDistribution}
                    </h5>
                    <div class="chart-container">
                        <canvas id="statusChart"></canvas>
                        <img src="TPLogo11.png" class="chart-logo" alt="TP Logo">
                    </div>
                    <div class="chart-legend text-center mt-3" id="chartLegend"></div>
                </div>
            </div>

            <div class="card mb-4 fade-in-up" style="animation-delay: 0.6s">
                <div class="card-body">
                    <h5 class="card-title text-center mb-3" data-translate="earningsTitle">
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
                        <button type="button" class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#tngModal" data-translate="paymentNote">
                            <i class="fas fa-info-circle me-2"></i>${translation.paymentNote}
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="reminder-section" class="card mb-4 fade-in-up" style="animation-delay: 0.7s">
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
            <div class="card mb-4 status-examples fade-in-up" style="animation-delay: 0.8s">
                <div class="card-body">
                    <h5 class="card-title text-center mb-4">
                        <i class="fas fa-info-circle me-2"></i>Status Examples
                    </h5>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="status-example status-passed">
                                <h5><i class="fas fa-check-circle me-2 text-success"></i>Passed Probation</h5>
                                <p>Candidate completed 90+ days</p>
                                <span class="badge bg-success">${translation.statusPassed}</span>
                            </div>
                            <div class="status-example status-probation">
                                <h5><i class="fas fa-clock me-2 text-warning"></i>In Probation</h5>
                                <p>Candidate hired but under 90 days</p>
                                <span class="badge bg-warning text-dark">${translation.statusProbation}</span>
                            </div>
                            <div class="status-example status-operations">
                                <h5><i class="fas fa-cogs me-2 text-warning"></i>Final Review</h5>
                                <p>Operations team finalizing</p>
                                <span class="badge bg-warning text-dark">${translation.statusOperations}</span>
                            </div>
                            <div class="status-example status-talent">
                                <h5><i class="fas fa-users me-2 text-info"></i>Interview Stage</h5>
                                <p>Candidate in interview process</p>
                                <span class="badge bg-info">${translation.statusTalent}</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="status-example status-previouslyApplied">
                                <h5><i class="fas fa-ban me-2 text-secondary"></i>Previously Applied</h5>
                                <p>No payment will be made</p>
                                <span class="badge bg-previously-applied">${translation.statusPreviouslyApplied}</span>
                            </div>
                            <div class="status-example status-assessment">
                                <h5><i class="fas fa-clipboard-check me-2 text-primary"></i>Assessment Stage</h5>
                                <p>Candidate completing assessments</p>
                                <span class="badge bg-primary">${translation.statusAssessment}</span>
                            </div>
                            <div class="status-example status-received">
                                <h5><i class="fas fa-file-alt me-2 text-secondary"></i>Application Received</h5>
                                <p>Initial application stage</p>
                                <span class="badge bg-secondary">${translation.statusReceived}</span>
                            </div>
                            <div class="status-example status-failed">
                                <h5><i class="fas fa-times-circle me-2 text-danger"></i>Not Selected</h5>
                                <p>Candidate not hired</p>
                                <span class="badge bg-danger">${translation.statusFailed}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Social Media -->
            <div class="mt-4 fade-in-up" style="animation-delay: 0.9s">
                <div class="row text-center">
                    <!-- TP Global -->
                    <div class="col-md-4 mb-3">
                        <h5 data-translate="tpGlobal">${translation.tpGlobal}</h5>
                        <div class="d-flex justify-content-center gap-3">
                            <a href="https://www.linkedin.com/company/teleperformance" class="social-icon" target="_blank"><i class="fab fa-linkedin"></i></a>
                            <a href="https://www.youtube.com/@TeleperformanceGroup" class="social-icon" target="_blank"><i class="fab fa-youtube"></i></a>
                            <a href="https://www.tiktok.com/@teleperformance_group" class="social-icon" target="_blank"><i class="fab fa-tiktok"></i></a>
                        </div>
                    </div>
                    <!-- TP Malaysia -->
                    <div class="col-md-4 mb-3">
                        <h5 data-translate="followMalaysia">${translation.followMalaysia}</h5>
                        <div class="d-flex justify-content-center gap-3">
                            <a href="https://www.facebook.com/TPinMalaysia/" class="social-icon" target="_blank"><i class="fab fa-facebook-f"></i></a>
                            <a href="http://www.instagram.com/tp_malaysia/" class="social-icon" target="_blank"><i class="fab fa-instagram"></i></a>
                        </div>
                    </div>
                    <!-- TP Thailand -->
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
        
        // Update chart
        updateChart(referrals);
        
        // Update earnings table
        updateEarningsTable(referrals);
        
        // Update reminder section
        updateReminderSection(referrals);
        
        // Update referral list
        updateReferralList(referrals);
        
        // Re-attach back button event
        document.getElementById('dashboard-back').addEventListener('click', function() {
            document.getElementById('auth-step').style.display = 'block';
            document.getElementById('results-step').style.display = 'none';
            
            // Destroy chart when going back
            if (statusChart) {
                statusChart.destroy();
                statusChart = null;
            }
        });
        
        // Add event listener for filtered view toggle
        document.getElementById('filteredViewToggle').addEventListener('change', function() {
            updateChart(referrals);
            updateReferralList(referrals);
        });
        
        // Update translations
        updateTranslations();
    }
    
    // Update referral list
    function updateReferralList(referrals) {
        const referralList = document.getElementById('referral-list');
        referralList.innerHTML = '';
        
        if (referrals.length === 0) {
            referralList.innerHTML = `
                <div class="card fade-in-up">
                    <div class="card-body text-center">
                        <i class="fas fa-user-slash fa-3x text-muted mb-3"></i>
                        <h5 data-translate="noReferrals">${translations[currentLanguage].noReferrals}</h5>
                    </div>
                </div>
            `;
            updateTranslations();
            return;
        }
        
        // Check if filtered view is enabled
        const filteredView = document.getElementById('filteredViewToggle')?.checked || false;
        
        // Process referrals based on view mode
        const processedReferrals = referrals.map(r => {
            if (filteredView) {
                return {
                    ...r,
                    status: mapStatusToGroup(r.status),
                    statusType: getSimplifiedStatusType(r.status)
                };
            }
            return r;
        });
        
        // Sort referrals with new status
        const statusOrder = filteredView ? 
            statusMapping.displayOrder || ['passed', 'probation', 'previouslyApplied', 'operations', 'talent', 'assessment', 'received', 'failed'] :
            ['passed', 'probation', 'previouslyApplied', 'operations', 'talent', 'assessment', 'received', 'failed'];
            
        const sortedReferrals = [...processedReferrals].sort((a, b) => {
            return statusOrder.indexOf(a.statusType) - statusOrder.indexOf(b.statusType);
        });
        
        // Create referral list card
        const referralListCard = document.createElement('div');
        referralListCard.className = 'card mb-4 fade-in-up';
        referralListCard.style.animationDelay = '1s';
        referralListCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title text-center mb-3">
                    <i class="fas fa-list me-2"></i>
                    <span data-translate="yourReferralsTitle">${translations[currentLanguage].yourReferralsTitle}</span>
                </h5>
                <div id="referral-items"></div>
            </div>
        `;
        
        referralList.appendChild(referralListCard);
        
        const referralItems = document.getElementById('referral-items');
        
        sortedReferrals.forEach((referral, index) => {
            const item = document.createElement('div');
            const statusKey = `status${referral.statusType.charAt(0).toUpperCase() + referral.statusType.slice(1)}`;
            const statusTranslation = translations[currentLanguage][statusKey] || referral.status;
            
            // Determine if payment is eligible
            const isPaymentEligible = referral.statusType === 'passed' && 
                                      referral.daysInStage >= 90 && 
                                      !referral.isPreviousCandidate;
            
            item.className = `card mb-3 status-${referral.statusType} ${isPaymentEligible ? 'payment-eligible' : ''} slide-in`;
            item.style.animationDelay = `${1.1 + (index * 0.1)}s`;
            
            // Only show WhatsApp button for Assessment Stage
            const showRemindButton = referral.statusType === 'assessment' && !referral.isPreviousCandidate;
            
            item.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="mb-1">
                                <i class="fas fa-user me-2"></i>${referral.name}
                            </h6>
                            <p class="mb-1 text-muted small">
                                <i class="fas fa-envelope me-1"></i>${referral.email}
                            </p>
                        </div>
                        <span class="badge status-badge bg-${getStatusBadgeColor(referral.statusType, referral.daysInStage, referral.isPreviousCandidate)}">
                            ${statusTranslation}
                        </span>
                    </div>
                    <div class="row">
                        <div class="col-md-3 mb-2">
                            <small class="text-muted d-block">
                                <i class="fas fa-layer-group me-1"></i>
                                <span data-translate="referralStage">${translations[currentLanguage].referralStage}</span>
                            </small>
                            <span class="fw-bold">${referral.stage}</span>
                        </div>
                        <div class="col-md-3 mb-2">
                            <small class="text-muted d-block">
                                <i class="fas fa-calendar-alt me-1"></i>
                                <span data-translate="referralDate">${translations[currentLanguage].referralDate}</span>
                            </small>
                            <span class="fw-bold">${new Date(referral.applicationDate).toLocaleDateString()}</span>
                        </div>
                        <div class="col-md-3 mb-2">
                            <small class="text-muted d-block">
                                <i class="fas fa-clock me-1"></i>
                                <span data-translate="referralDays">${translations[currentLanguage].referralDays}</span>
                            </small>
                            <span class="fw-bold">${referral.daysInStage}</span>
                        </div>
                        <div class="col-md-3 mb-2">
                            ${showRemindButton ? `
                            <button class="btn btn-sm btn-success w-100 remind-btn" 
                                    data-name="${referral.name}" 
                                    data-phone="${referral.phone}" 
                                    data-translate="remindBtn">
                                <i class="fab fa-whatsapp me-2"></i>${translations[currentLanguage].remindBtn}
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            referralItems.appendChild(item);
        });
        
        // Update translations for dynamic content
        updateTranslations();
    }
    
    // Update chart with referral data
    function updateChart(referrals) {
        const ctx = document.getElementById('statusChart').getContext('2d');
        const translation = translations[currentLanguage] || translations.en;
        
        // Check if filtered view is enabled
        const filteredView = document.getElementById('filteredViewToggle')?.checked || false;
        
        // Count statuses
        let statusCounts = {};
        
        if (filteredView) {
            // Use the simplified status groups
            statusMapping.displayOrder.forEach(group => {
                statusCounts[group] = referrals.filter(r => mapStatusToGroup(r.status) === group).length;
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
        
        // Chart data - different setup for filtered vs unfiltered
        const data = filteredView ? {
            labels: statusMapping.displayOrder.map(group => {
                // Try to find a translation, fallback to group name
                const translationKey = `status${group.replace(/\s+/g, '').replace(/[()]/g, '')}`;
                return translation[translationKey] || group;
            }),
            datasets: [{
                data: statusMapping.displayOrder.map(group => statusCounts[group]),
                backgroundColor: [
                    '#28a745', // Hired (Confirmed) - green
                    '#ffc107', // Hired (Probation) - yellow
                    '#6c757d', // Previously Applied - gray
                    '#fd7e14', // Final Review - orange
                    '#17a2b8', // Interview Stage - teal
                    '#007bff', // Assessment Stage - blue
                    '#6c757d', // Application Received - gray
                    '#dc3545'  // Not Selected - red
                ],
                borderWidth: 2,
                borderColor: '#fff',
                hoverOffset: 8
            }]
        } : {
            // Original chart data setup
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
                data: [
                    statusCounts.passed,
                    statusCounts.probation,
                    statusCounts.previouslyApplied,
                    statusCounts.operations,
                    statusCounts.talent,
                    statusCounts.assessment,
                    statusCounts.received,
                    statusCounts.failed
                ],
                backgroundColor: [
                    '#28a745', // Passed - green
                    '#ffc107', // Probation - yellow
                    '#6c757d', // Previously applied - gray
                    '#fd7e14', // Operations - orange
                    '#17a2b8', // Talent - teal
                    '#007bff', // Assessment - blue
                    '#6c757d', // Received - gray
                    '#dc3545'  // Failed - red
                ],
                borderWidth: 2,
                borderColor: '#fff',
                hoverOffset: 8
            }]
        };

        // Destroy previous chart if exists
        if (statusChart) {
            statusChart.destroy();
        }

        // Create new chart with enhanced styling
        statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        display: false // We'll create custom legend below
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#fff',
                        borderWidth: 1,
                        cornerRadius: 4,
                        padding: 10,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 800,
                    easing: 'easeOutQuart'
                }
            }
        });

        // Create custom legend below chart
        const legendContainer = document.getElementById('chartLegend');
        legendContainer.innerHTML = '';
        
        data.labels.forEach((label, i) => {
            const legendItem = document.createElement('span');
            legendItem.innerHTML = `<span style="background-color: ${data.datasets[0].backgroundColor[i]}"></span>${label}`;
            legendContainer.appendChild(legendItem);
        });
    }

    // Handle remind button clicks - opens WhatsApp with template message
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remind-btn') || e.target.closest('.remind-btn')) {
            const button = e.target.classList.contains('remind-btn') ? e.target : e.target.closest('.remind-btn');
            const name = button.dataset.name;
            const phone = button.dataset.phone;
            
            const message = `Hi ${name}, this is a friendly reminder to complete your TP assessment. ` +
                           `We're excited about your application! Please complete it at your earliest convenience. Thank you!`;
            window.open(`https://wa.me/+6${phone}?text=${encodeURIComponent(message)}`, '_blank');
        }
    });

    // Initialize translations
    updateTranslations();
    
    // Auto-focus phone input
    document.getElementById('dashboard-phone').focus();
    
    // Phone number validation - only numbers
    document.getElementById('dashboard-phone').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    // Initialize modals
    const tngModal = new bootstrap.Modal(document.getElementById('tngModal'));
    const userNotFoundModal = new bootstrap.Modal(document.getElementById('userNotFoundModal'));
    
    // Enhanced form interactions
    const formInputs = document.querySelectorAll('.form-control, .form-select');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
    
    // Enhanced scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    document.querySelectorAll('.card, .stats-card').forEach(el => {
        observer.observe(el);
    });
    
    // Mobile optimizations
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
    
    // Preload images for better performance
    const imagesToPreload = ['TPLogo11.png'];
    imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
    });
    
    // Initialize app
    console.log('xRAF Dashboard initialized successfully');
});
