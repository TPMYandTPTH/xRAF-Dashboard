document.addEventListener('DOMContentLoaded', function () {
    // Application State
    const AppState = {
        currentLanguage: 'en',
        statusChart: null,
        currentReferralsData: [],
        isLoading: false,
        debugMode: false // Set to true for debugging
    };

    // Initialize application
    function initializeApp() {
        document.getElementById('current-year').textContent = new Date().getFullYear();
        updateTranslations();
        setupEventListeners();
        document.getElementById('dashboard-phone').focus();
        
        // Test connection if in debug mode
        if (AppState.debugMode) {
            ApiService.testConnection();
        }
    }

    // Set up event listeners
    function setupEventListeners() {
        document.getElementById('lang-select').addEventListener('change', handleLanguageChange);
        document.getElementById('dashboard-submit').addEventListener('click', handleFormSubmit);
        
        // Phone number validation - only numbers
        document.getElementById('dashboard-phone').addEventListener('input', function (e) {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
        
        // Delegate event handling for dynamic content
        document.addEventListener('click', function (e) {
            if (e.target.closest('.remind-btn')) {
                handleReminderClick(e);
            }
        });
        
        // Enter key support
        document.getElementById('dashboard-form').addEventListener('keypress', function (e) {
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
            // Fetch referrals from API
            const apiData = await ApiService.fetchReferrals(phone, email);

            // Process and store referrals
            AppState.currentReferralsData = processReferrals(apiData);

            // Always show dashboard
            showReferralResults(AppState.currentReferralsData);

        } catch (error) {
            console.error('Error:', error);
            // Still show dashboard with empty data
            AppState.currentReferralsData = [];
            showReferralResults([]);
            showNonBlockingError('Error fetching referral data.');
        } finally {
            setLoadingState(false);
        }
    }

    // Process API response with new logic
    function processReferrals(apiData) {
        if (!Array.isArray(apiData)) return [];

        const groupedReferrals = {};

        apiData.forEach(item => {
            // Combine referrals by email (if duplicated)
            if (!groupedReferrals[item.email]) {
                groupedReferrals[item.email] = [];
            }
            groupedReferrals[item.email].push(item);
        });

        return Object.values(groupedReferrals).map(group => {
            const firstReferral = group[0]; // Display the first name and other info
            return {
                email: firstReferral.email,
                name: firstReferral.name,
                status: firstReferral.status,
                phone: firstReferral.phone,
                referrals: group // All referrals under this email
            };
        });
    }

    // Validate form inputs
    function validateInputs(phone, email) {
        let isValid = true;

        if (!validatePhone(phone)) {
            showError(document.getElementById('dashboard-phone'), 'Please provide a valid phone number (01XXXXXXXX).');
            isValid = false;
        } else {
            clearError(document.getElementById('dashboard-phone'));
        }

        if (!validateEmail(email)) {
            showError(document.getElementById('dashboard-email'), 'Please provide a valid email address.');
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
        submitBtn.innerHTML = isLoading ? 'Connecting...' : 'View Referral Status';
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
    }

    // Create results HTML with new sections
    function createResultsContent(referrals) {
        return `
            <div class="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h3>${AppState.currentLanguage === 'en' ? 'Your Referrals' : 'あなたの紹介'}</h3>
                </div>
                <button id="dashboard-back" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left me-2"></i> Back
                </button>
            </div>
            <div class="row">
                ${referrals.map(referral => `
                    <div class="col-md-12 mb-3">
                        <div class="card referral-card">
                            <div class="card-body">
                                <h5>${referral.name}</h5>
                                <p>Email: ${referral.email}</p>
                                <p>Status: ${referral.status}</p>
                                <p>Phone: ${referral.phone}</p>
                                ${referral.referrals.length > 1 ? `<p>Multiple Applications</p>` : ''}
                                <button class="btn btn-primary remind-btn" data-phone="${referral.phone}" data-name="${referral.name}">
                                    <i class="fab fa-whatsapp me-2"></i> Send Reminder
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Handle WhatsApp reminder functionality
    function handleReminderClick(e) {
        const button = e.target.closest('.remind-btn');
        const phone = button.dataset.phone;
        const name = button.dataset.name;
        const lang = AppState.currentLanguage;
        const message = `Hi ${name}, please complete your assessment for TP by clicking the link in your email.`;

        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
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

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alertEl = document.getElementById(alertId);
            if (alertEl) {
                alertEl.classList.remove('show');
                setTimeout(() => alertEl.remove(), 150);
            }
        }, 5000);
    }

    // Initialize the app
    initializeApp();
});
