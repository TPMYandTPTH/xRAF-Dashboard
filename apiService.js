/**
 * apiService.js - Dashboard API Service
 * Handles SharePoint connection, data fetching, and mock data for testing
 * Updated: December 2024 - 18 mock records (6 statuses × 3 payment tiers)
 */

const ApiService = {
    
    // ==================== CONFIGURATION ====================
    config: {
        siteUrl: 'https://teleaborations.sharepoint.com/sites/TP-MY_Recruitment_Selection',
        listName: 'XRAF_Referrals',
        timeout: 30000,
        retryAttempts: 3
    },

    // ==================== DEMO/MOCK MODE ====================
    
    /**
     * Check if demo mode is enabled
     * Enable via: ?demo=1 URL parameter or demo credentials
     */
    isDemoMode() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('demo') === '1' || urlParams.get('demo') === 'true';
    },

    /**
     * Check demo credentials
     * Demo login: 0123456789 / amr@tp.com
     */
    isDemoCredentials(phone, email) {
        return phone === '0123456789' && email.toLowerCase() === 'amr@tp.com';
    },

    /**
     * Get mock referral data for testing
     * 18 records total: 6 statuses × 3 payment tiers (Johor, Standard, Interpreter)
     * 
     * Payment Tiers:
     * - Johor (RM500): Mandarin speakers in Johor location
     * - Standard (RM800): Other locations (KL, Penang, Cyberjaya, etc.)
     * - Interpreter (RM3000): Work From Home Interpreter positions
     */
    getMockReferrals() {
        const today = new Date();
        
        // Helper to create dates
        const daysAgo = (days) => {
            const date = new Date(today);
            date.setDate(date.getDate() - days);
            return date.toISOString();
        };

        return [
            // ==================== APPLICATION RECEIVED (Status 1) ====================
            // 3 records: 1 Johor, 1 Standard, 1 Interpreter
            {
                ID: 1001,
                Person_x0020_Full_x0020_Name: 'Tarek Ezz',
                Person_x0020_Email: 'tarek.ezz@email.com',
                Default_x0020_Phone: '0182708243',
                Recent_x0020_Status: 'Application Received',
                Source_x0020_Name: 'xRAF',
                Location: 'Johor Bahru',
                Position: 'Mandarin Customer Service',
                F_Nationality: 'Egypt',
                Created: daysAgo(3),
                Modified: daysAgo(1),
                PaymentTier: 'johor'  // RM500
            },
            {
                ID: 1002,
                Person_x0020_Full_x0020_Name: 'Loai',
                Person_x0020_Email: 'loai@email.com',
                Default_x0020_Phone: '0174669871',
                Recent_x0020_Status: 'Application Received',
                Source_x0020_Name: 'xRAF',
                Location: 'Kuala Lumpur',
                Position: 'Japanese Customer Support',
                F_Nationality: 'Yemen',
                Created: daysAgo(5),
                Modified: daysAgo(2),
                PaymentTier: 'standard'  // RM800
            },
            {
                ID: 1003,
                Person_x0020_Full_x0020_Name: 'Amr',
                Person_x0020_Email: 'amr@email.com',
                Default_x0020_Phone: '0183931348',
                Recent_x0020_Status: 'Application Received',
                Source_x0020_Name: 'xRAF',
                Location: 'Work From Home',
                Position: 'Mandarin Interpreter',
                F_Nationality: 'Egypt',
                Created: daysAgo(2),
                Modified: daysAgo(1),
                PaymentTier: 'interpreter'  // RM3000
            },

            // ==================== ASSESSMENT STAGE (Status 2) ====================
            // 3 records: 1 Johor, 1 Standard, 1 Interpreter
            {
                ID: 1004,
                Person_x0020_Full_x0020_Name: 'Micole Barrientos',
                Person_x0020_Email: 'user@email.com',
                Default_x0020_Phone: '0123456789',
                Recent_x0020_Status: 'Assessment - Loss Ops',
                Source_x0020_Name: 'xRAF',
                Location: 'Johor Bahru',
                Position: 'Mandarin Technical Support',
                F_Nationality: 'Philippines',
                Created: daysAgo(14),
                Modified: daysAgo(7),
                PaymentTier: 'johor'  // RM500
            },
            {
                ID: 1005,
                Person_x0020_Full_x0020_Name: 'Pourya Tohidi',
                Person_x0020_Email: 'user@email.com',
                Default_x0020_Phone: '0123456789',
                Recent_x0020_Status: 'Assessment - Pass Talent',
                Source_x0020_Name: 'xRAF',
                Location: 'Penang',
                Position: 'Korean Customer Service',
                F_Nationality: 'Iran',
                Created: daysAgo(21),
                Modified: daysAgo(10),
                PaymentTier: 'standard'  // RM800
            },
            {
                ID: 1006,
                Person_x0020_Full_x0020_Name: 'Jocelyn Soh',
                Person_x0020_Email: 'user@email.com',
                Default_x0020_Phone: '0123456789',
                Recent_x0020_Status: 'Assessment - Pass Ops',
                Source_x0020_Name: 'xRAF',
                Location: 'Work From Home',
                Position: 'Japanese Interpreter',
                F_Nationality: 'Malaysia',
                Created: daysAgo(18),
                Modified: daysAgo(8),
                PaymentTier: 'interpreter'  // RM3000
            },

            // ==================== HIRED - PROBATION (Status 3) ====================
            // 3 records: 1 Johor, 1 Standard, 1 Interpreter (all <90 days)
            {
                ID: 1007,
                Person_x0020_Full_x0020_Name: 'Melaine Sua',
                Person_x0020_Email: 'user@email.com',
                Default_x0020_Phone: '0123456789',
                Recent_x0020_Status: 'Hired',
                Source_x0020_Name: 'xRAF',
                Location: 'Johor Bahru',
                Position: 'Mandarin Sales Support',
                F_Nationality: 'Malaysia',
                Created: daysAgo(60),
                Modified: daysAgo(45),
                HireDate: daysAgo(45),  // 45 days in probation
                PaymentTier: 'johor'  // RM500 when confirmed
            },
            {
                ID: 1008,
                Person_x0020_Full_x0020_Name: 'Anna Saw Yee Lin',
                Person_x0020_Email: 'user@email.com',
                Default_x0020_Phone: '0123456789',
                Recent_x0020_Status: 'Hired',
                Source_x0020_Name: 'xRAF',
                Location: 'Cyberjaya',
                Position: 'Japanese Customer Support',
                F_Nationality: 'Malaysia',
                Created: daysAgo(75),
                Modified: daysAgo(60),
                HireDate: daysAgo(60),  // 60 days in probation
                PaymentTier: 'standard'  // RM800 when confirmed
            },
            {
                ID: 1009,
                Person_x0020_Full_x0020_Name: 'Koji Yamamoto',
                Person_x0020_Email: 'user@email.com',
                Default_x0020_Phone: '0123456789',
                Recent_x0020_Status: 'Hired',
                Source_x0020_Name: 'xRAF',
                Location: 'Work From Home',
                Position: 'Korean Interpreter',
                F_Nationality: 'Japan',
                Created: daysAgo(50),
                Modified: daysAgo(30),
                HireDate: daysAgo(30),  // 30 days in probation
                PaymentTier: 'interpreter'  // RM3000 when confirmed
            },

            // ==================== HIRED - CONFIRMED (Status 4) ====================
            // 3 records: 1 Johor, 1 Standard, 1 Interpreter (all 90+ days) - PAYMENT ELIGIBLE
            {
                ID: 1010,
                Person_x0020_Full_x0020_Name: 'Maho Yoriguchi',
                Person_x0020_Email: 'user@email.com',
                Default_x0020_Phone: '0123456789',
                Recent_x0020_Status: 'Hired',
                Source_x0020_Name: 'xRAF',
                Location: 'Johor Bahru',
                Position: 'Mandarin Customer Service',
                F_Nationality: 'Japan',
                Created: daysAgo(150),
                Modified: daysAgo(95),
                HireDate: daysAgo(95),  // 95 days - CONFIRMED
                PaymentTier: 'johor'  // RM500 ELIGIBLE
            },
            {
                ID: 1011,
                Person_x0020_Full_x0020_Name: 'Sieon Lee',
                Person_x0020_Email: 'user@email.com',
                Default_x0020_Phone: '0123456789',
                Recent_x0020_Status: 'Hired',
                Source_x0020_Name: 'xRAF',
                Location: 'Shah Alam',
                Position: 'Korean Technical Support',
                F_Nationality: 'Korea',
                Created: daysAgo(180),
                Modified: daysAgo(120),
                HireDate: daysAgo(120),  // 120 days - CONFIRMED
                PaymentTier: 'standard'  // RM800 ELIGIBLE
            },
            {
                ID: 1012,
                Person_x0020_Full_x0020_Name: 'Liu Mei Hua',
                Person_x0020_Email: 'user@email.com',
                Default_x0020_Phone: '0123456789',
                Recent_x0020_Status: 'Hired',
                Source_x0020_Name: 'xRAF',
                Location: 'Work From Home',
                Position: 'Mandarin Interpreter',
                F_Nationality: 'Malaysia',
                Created: daysAgo(200),
                Modified: daysAgo(100),
                HireDate: daysAgo(100),  // 100 days - CONFIRMED
                PaymentTier: 'interpreter'  // RM3000 ELIGIBLE
            },

            // ==================== PREVIOUSLY APPLIED - NO PAYMENT (Status 5) ====================
            // 3 records: Different non-xRAF sources (LinkedIn, JobStreet, Walk-in)
            {
                ID: 1013,
                Person_x0020_Full_x0020_Name: 'David Ong',
                Person_x0020_Email: 'user@email.com',
                Default_x0020_Phone: '0123456789',
                Recent_x0020_Status: 'Hired',
                Source_x0020_Name: 'LinkedIn',  // NOT xRAF
                Location: 'Johor Bahru',
                Position: 'Mandarin Customer Service',
                F_Nationality: 'Malaysia',
                Created: daysAgo(200),
                Modified: daysAgo(100),
                HireDate: daysAgo(100),
                PaymentTier: 'johor'  // Would be RM500 but NOT ELIGIBLE (not xRAF)
            },
            {
                ID: 1014,
                Person_x0020_Full_x0020_Name: 'Chloe Tan',
                Person_x0020_Email: 'user@email.com',
                Default_x0020_Phone: '0123456789',
                Recent_x0020_Status: 'Hired',
                Source_x0020_Name: 'JobStreet',  // NOT xRAF
                Location: 'Kuala Lumpur',
                Position: 'Japanese Customer Service',
                F_Nationality: 'Malaysia',
                Created: daysAgo(150),
                Modified: daysAgo(95),
                HireDate: daysAgo(95),
                PaymentTier: 'standard'  // Would be RM800 but NOT ELIGIBLE (not xRAF)
            },
            {
                ID: 1015,
                Person_x0020_Full_x0020_Name: 'Ahmad Razak',
                Person_x0020_Email: 'user@email.com',
                Default_x0020_Phone: '0123456789',
                Recent_x0020_Status: 'Hired',
                Source_x0020_Name: 'Walk-in',  // NOT xRAF
                Location: 'Work From Home',
                Position: 'Korean Interpreter',
                F_Nationality: 'Malaysia',
                Created: daysAgo(180),
                Modified: daysAgo(110),
                HireDate: daysAgo(110),
                PaymentTier: 'interpreter'  // Would be RM3000 but NOT ELIGIBLE (not xRAF)
            },

            // ==================== NOT SELECTED (Status 6) ====================
            // 3 records: 1 Johor, 1 Standard, 1 Interpreter (eliminated/withdrew)
            {
                ID: 1016,
                Person_x0020_Full_x0020_Name: 'Nurul Lydia Adini',
                Person_x0020_Email: 'user@email.com',
                Default_x0020_Phone: '0123456789',
                Recent_x0020_Status: 'Eliminated - Failed Assessment',
                Source_x0020_Name: 'xRAF',
                Location: 'Johor Bahru',
                Position: 'Mandarin Customer Service',
                F_Nationality: 'Malaysia',
                Created: daysAgo(30),
                Modified: daysAgo(20),
                PaymentTier: 'johor'  // Would be RM500 but NOT ELIGIBLE (eliminated)
            },
            {
                ID: 1017,
                Person_x0020_Full_x0020_Name: 'Hanna Wong',
                Person_x0020_Email: 'user@email.com',
                Default_x0020_Phone: '0123456789',
                Recent_x0020_Status: 'Withdrew - Personal Reasons',
                Source_x0020_Name: 'xRAF',
                Location: 'Penang',
                Position: 'Japanese Customer Service',
                F_Nationality: 'Malaysia',
                Created: daysAgo(45),
                Modified: daysAgo(25),
                PaymentTier: 'standard'  // Would be RM800 but NOT ELIGIBLE (withdrew)
            },
            {
                ID: 1018,
                Person_x0020_Full_x0020_Name: 'Park Min Jun',
                Person_x0020_Email: 'user@email.com',
                Default_x0020_Phone: '0123456789',
                Recent_x0020_Status: 'Eliminated - No Show',
                Source_x0020_Name: 'xRAF',
                Location: 'Work From Home',
                Position: 'Korean Interpreter',
                F_Nationality: 'Korea',
                Created: daysAgo(35),
                Modified: daysAgo(28),
                PaymentTier: 'interpreter'  // Would be RM3000 but NOT ELIGIBLE (eliminated)
            }
        ];
    },

    // ==================== AUTHENTICATION ====================
    
    /**
     * Validate user credentials
     * @param {string} phone - User phone number
     * @param {string} email - User email address
     * @returns {Promise<object>} Authentication result
     */
    async validateCredentials(phone, email) {
        // Check demo mode first
        if (this.isDemoMode() || this.isDemoCredentials(phone, email)) {
            console.log('🎭 Demo mode activated');
            return {
                success: true,
                isDemo: true,
                user: {
                    phone: phone,
                    email: email,
                    name: 'Demo User (Amr)'
                }
            };
        }

        try {
            // Real SharePoint validation would go here
            // For now, simulate API call
            await this.simulateDelay(1000);
            
            return {
                success: true,
                isDemo: false,
                user: {
                    phone: phone,
                    email: email
                }
            };
        } catch (error) {
            console.error('Authentication error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // ==================== DATA FETCHING ====================
    
    /**
     * Fetch referrals for a user
     * @param {string} phone - Referrer phone number
     * @param {string} email - Referrer email address
     * @returns {Promise<array>} Array of referral objects
     */
    async fetchReferrals(phone, email) {
        // Demo mode returns mock data
        if (this.isDemoMode() || this.isDemoCredentials(phone, email)) {
            console.log('📦 Loading mock data (18 records)...');
            await this.simulateDelay(800);
            return this.getMockReferrals();
        }

        try {
            // Real SharePoint API call would go here
            const response = await this.makeSharePointRequest(phone, email);
            return response;
        } catch (error) {
            console.error('Fetch error:', error);
            throw new Error('Failed to fetch referrals. Please try again.');
        }
    },

    /**
     * Make actual SharePoint REST API request
     * @param {string} phone - Referrer phone
     * @param {string} email - Referrer email
     * @returns {Promise<array>} SharePoint list items
     */
    async makeSharePointRequest(phone, email) {
        const filterQuery = `$filter=(Referrer_x0020_Phone eq '${phone}') or (Referrer_x0020_Email eq '${email}')`;
        const selectQuery = `$select=ID,Person_x0020_Full_x0020_Name,Person_x0020_Email,Default_x0020_Phone,Recent_x0020_Status,Source_x0020_Name,Location,Position,F_Nationality,Created,Modified,HireDate`;
        
        const apiUrl = `${this.config.siteUrl}/_api/web/lists/getbytitle('${this.config.listName}')/items?${filterQuery}&${selectQuery}`;
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`SharePoint API error: ${response.status}`);
        }

        const data = await response.json();
        return data.d.results || [];
    },

    // ==================== UTILITY FUNCTIONS ====================
    
    /**
     * Simulate network delay for demo mode
     * @param {number} ms - Milliseconds to delay
     */
    simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    /**
     * Calculate days since a date
     * @param {string} dateString - ISO date string
     * @returns {number} Days elapsed
     */
    daysSince(dateString) {
        if (!dateString) return 0;
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today - date);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    /**
     * Get payment tier info
     * @param {object} referral - Referral object
     * @returns {object} Payment tier details
     */
    getPaymentTier(referral) {
        const tiers = {
            johor: { amount: 500, label: 'Mandarin - Johor', color: '#ff5c00' },
            standard: { amount: 800, label: 'Standard Roles', color: '#000000' },
            interpreter: { amount: 3000, label: 'WFH Interpreter', color: '#00af9b' }
        };
        
        // Use explicit PaymentTier if available (mock data)
        if (referral.PaymentTier && tiers[referral.PaymentTier]) {
            return tiers[referral.PaymentTier];
        }
        
        // Auto-detect from position/location
        const position = (referral.Position || '').toLowerCase();
        const location = (referral.Location || '').toLowerCase();
        
        if (position.includes('interpreter')) {
            return tiers.interpreter;
        }
        if (location.includes('johor')) {
            return tiers.johor;
        }
        return tiers.standard;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}
