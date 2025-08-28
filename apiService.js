// API Service Module - Power Automate Integration
const ApiService = (function() {
    const POWER_AUTOMATE_URL = 'https://prod-64.southeastasia.logic.azure.com:443/workflows/e1583b4aa1f140df8402c75d18538409/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=B88bcWT3wuQyxyEyMr8uYhIqTzJmq6t3rHsvsSJ32YY';

    // Field mappings for SharePoint data
    const FIELD_MAPPINGS = {
        id: ['ID', 'Id', 'PersonId', 'Person_system_id'],
        name: ['Person_x0020_Full_x0020_Name', 'Person_Full_Name', 'FullName', 'First_Name', 'Name', 'Title'],
        email: ['Person_x0020_Email', 'Person_Email', 'Email', 'CandidateEmail'],
        phone: ['Default_x0020_Phone', 'Default_Phone', 'Phone', 'Employee', 'EmployeePhone'],
        status: ['Recent_x0020_Status', 'Recent_Status', 'Status', 'CurrentStatus'],
        location: ['Location', 'Office', 'Site'],
        nationality: ['Nationality', 'F_Nationality', 'Country'],
        source: ['Source_x0020_Name', 'Source_Name', 'Source', 'SourceName'],
        referrerPhone: ['Referrer_x0020_Phone', 'Referrer_Phone', 'ReferrerPhone'],
        referrerEmail: ['Referrer_x0020_Email', 'Referrer_Email', 'ReferrerEmail'],
        created: ['Created', 'CreatedDate', 'ApplicationDate'],
        modified: ['Modified', 'UpdatedDate', 'LastModified']
    };

    // --- DEMO DATA SWITCH (use these credentials to load mock data) ---
    const DEMO_PHONE = '0123456789';
    const DEMO_EMAIL = 'amr@tp.com';

    // Build mock referrals (2 per display group)
    function getMockReferrals() {
      // NOTE: Provide SharePoint-like field names so FIELD_MAPPINGS can pick them up
      // Dates are ISO strings; today is assumed ~2025-08-28 for "90-day" logic
      return [
        // -----------------------------
        // 1) Application Received (x2)
        // -----------------------------
        {
          ID: 1001,
          Person_x0020_Full_x0020_Name: 'Tarek Ezz',
          Person_x0020_Email: 'tarek@tp.com',
          Default_x0020_Phone: '0182708243',
          Recent_x0020_Status: 'Application Received',
          Source_x0020_Name: 'xRAF',              // accepted source
          Location: 'Kuala Lumpur',
          F_Nationality: 'Malaysia',
          Created: '2025-08-18T09:00:00Z',
          Modified: '2025-08-25T09:00:00Z'
        },
        {
          ID: 1002,
          Person_x0020_Full_x0020_Name: 'Loai',
          Person_x0020_Email: 'loai@tp.com',
          Default_x0020_Phone: '0174669871',
          Recent_x0020_Status: 'SHL Assessment: Typing ENG', // sits under Application Received per your table
          Source_x0020_Name: 'xRAF', // accepted source
          Location: 'Penang',
          F_Nationality: 'Malaysia',
          Created: '2025-08-12T09:00:00Z',
          Modified: '2025-08-20T09:00:00Z'
        },

        // -----------------------------
        // 2) Assessment Stage (x2)
        // -----------------------------
        {
          ID: 1003,
          Person_x0020_Full_x0020_Name: 'Micole Barrientos',
          Person_x0020_Email: 'miki@tp.com',
          Default_x0020_Phone: '0177862292',
          Recent_x0020_Status: 'Interview Scheduled',
          Source_x0020_Name: 'xRAF',
          Location: 'Kuala Lumpur',
          F_Nationality: 'Malaysia',
          Created: '2025-08-10T09:00:00Z',
          Modified: '2025-08-26T09:00:00Z'
        },
        {
          ID: 1004,
          Person_x0020_Full_x0020_Name: 'Pourya Tohidi',
          Person_x0020_Email: 'pourya@tp.com',
          Default_x0020_Phone: '0198899001',
          Recent_x0020_Status: 'Screened: Green Candidate',
          Source_x0020_Name: 'xRAF',
          Location: 'Johor Bahru',
          F_Nationality: 'Malaysia',
          Created: '2025-08-01T09:00:00Z',
          Modified: '2025-08-21T09:00:00Z'
        },

        // -----------------------------
        // 3) Hired (Probation) (x2) — < 90 days
        // -----------------------------
        {
          ID: 1005,
          Person_x0020_Full_x0020_Name: 'Melaine Sua',
          Person_x0020_Email: 'melaine@tp.com',
          Default_x0020_Phone: '0109988776',
          Recent_x0020_Status: 'Onboarding Started',
          Source_x0020_Name: 'xRAF',
          Location: 'Kuala Lumpur',
          F_Nationality: 'Malaysia',
          Created: '2025-08-05T09:00:00Z',
          Modified: '2025-08-15T09:00:00Z' // < 90 days in stage
        },
        {
          ID: 1006,
          Person_x0020_Full_x0020_Name: 'Anna Saw Yee Lin',
          Person_x0020_Email: 'anna@tp.com',
          Default_x0020_Phone: '0185566778',
          Recent_x0020_Status: 'Contract Presented',
          Source_x0020_Name: 'xRAF',
          Location: 'Cyberjaya',
          F_Nationality: 'Malaysia',
          Created: '2025-07-20T09:00:00Z',
          Modified: '2025-08-10T09:00:00Z' // < 90 days in stage
        },

        // -----------------------------
        // 4) Hired (Confirmed) (x2) — ≥ 90 days
        // -----------------------------
        {
          ID: 1007,
          Person_x0020_Full_x0020_Name: 'Maho Yoriguchi',
          Person_x0020_Email: 'maho@tp.com',
          Default_x0020_Phone: '0161122334',
          Recent_x0020_Status: 'New Starter (Hired)',
          Source_x0020_Name: 'xRAF',
          Location: 'Kuala Lumpur',
          F_Nationality: 'Malaysia',
          Created: '2025-04-10T09:00:00Z', // > 90 days ago
          Modified: '2025-04-20T09:00:00Z'  // daysInStage >= 90 ensures Confirmed
        },
        {
          ID: 1008,
          Person_x0020_Full_x0020_Name: 'Sieon Lee',
          Person_x0020_Email: 'maya@tp.com',
          Default_x0020_Phone: '0136677889',
          Recent_x0020_Status: 'Cleared to Start',
          Source_x0020_Name: 'xRAF',
          Location: 'Penang',
          F_Nationality: 'Malaysia',
          Created: '2025-05-01T09:00:00Z',
          Modified: '2025-05-15T09:00:00Z'  // daysInStage >= 90
        },

        // -----------------------------
        // 5) Previously Applied (No Payment) (x2) — non-xRAF source
        // -----------------------------
        {
          ID: 1009,
          Person_x0020_Full_x0020_Name: 'David Ong',
          Person_x0020_Email: 'david@tp.com',
          Default_x0020_Phone: '0114455667',
          Recent_x0020_Status: 'Application Received',
          Source_x0020_Name: 'LinkedIn',       // NOT accepted => Previously Applied
          Location: 'Kuching',
          F_Nationality: 'Malaysia',
          Created: '2025-08-17T09:00:00Z',
          Modified: '2025-08-22T09:00:00Z'
        },
        {
          ID: 1010,
          Person_x0020_Full_x0020_Name: 'Chloe',
          Person_x0020_Email: 'chloe@tp.com',
          Default_x0020_Phone: '0173344556',
          Recent_x0020_Status: 'Screened',
          Source_x0020_Name: 'JobStreet',      // NOT accepted => Previously Applied
          Location: 'Kota Kinabalu',
          F_Nationality: 'Malaysia',
          Created: '2025-08-02T09:00:00Z',
          Modified: '2025-08-19T09:00:00Z'
        },

        // -----------------------------
        // 6) Not Selected (x2)
        // -----------------------------
        {
          ID: 1011,
          Person_x0020_Full_x0020_Name: 'Nurul Lydia Adini',
          Person_x0020_Email: 'lydia@tp.com',
          Default_x0020_Phone: '0125566778',
          Recent_x0020_Status: 'Eliminated - Incomplete Assessment',
          Source_x0020_Name: 'xRAF',
          Location: 'Kuala Lumpur',
          F_Nationality: 'Malaysia',
          Created: '2025-08-10T09:00:00Z',
          Modified: '2025-08-16T09:00:00Z'
        },
        {
          ID: 1012,
          Person_x0020_Full_x0020_Name: 'Hanna Wong',
          Person_x0020_Email: 'hanna@tp.com',
          Default_x0020_Phone: '0197788990',
          Recent_x0020_Status: 'Withdrew - Salary (Post Offer)',
          Source_x0020_Name: 'xRAF',
          Location: 'Ipoh',
          F_Nationality: 'Malaysia',
          Created: '2025-06-15T09:00:00Z',
          Modified: '2025-07-01T09:00:00Z'
        }
      ];
    }

    // --- Helpers for demo matching ---
    function normalizeEmail(e) {
      return (e || '').toString().trim().toLowerCase();
    }
    function normalizePhoneLocal(p) {
      // Keep only digits; allow "0123456789" or "60123456789" to match the same local number
      const digits = (p || '').toString().replace(/\D+/g, '');
      if (!digits) return '';
      // If it starts with 60, strip it for comparison to local format
      if (digits.startsWith('60')) return digits.slice(2);
      return digits;
    }

    // Utility function to extract field value with multiple possible names
    function getFieldValue(item, fieldMappings) {
        for (const fieldName of fieldMappings) {
            if (item[fieldName] !== undefined && item[fieldName] !== null && item[fieldName] !== '') {
                return item[fieldName];
            }
        }
        return '';
    }

    // Process individual referral data
    function processReferralData(item) {
        // Extract all fields using mappings
        const id = getFieldValue(item, FIELD_MAPPINGS.id);
        const name = getFieldValue(item, FIELD_MAPPINGS.name) || 'Unknown';
        const email = getFieldValue(item, FIELD_MAPPINGS.email);
        const phone = getFieldValue(item, FIELD_MAPPINGS.phone);
        const status = getFieldValue(item, FIELD_MAPPINGS.status) || 'Application Received';
        const location = getFieldValue(item, FIELD_MAPPINGS.location);
        const nationality = getFieldValue(item, FIELD_MAPPINGS.nationality);
        const source = getFieldValue(item, FIELD_MAPPINGS.source) || '';
        const referrerPhone = getFieldValue(item, FIELD_MAPPINGS.referrerPhone);
        const referrerEmail = getFieldValue(item, FIELD_MAPPINGS.referrerEmail);
        const created = getFieldValue(item, FIELD_MAPPINGS.created) || new Date().toISOString();
        const modified = getFieldValue(item, FIELD_MAPPINGS.modified) || created;

        // Return standardized referral object
        return {
            // IDs
            Person_system_id: id.toString(),
            personId: id.toString(),

            // Names and contact
            First_Name: name,
            name: name,
            Email: email,
            email: email,
            Employee: phone,
            employee: phone,
            phone: phone,

            // Status fields
            Status: status,
            status: status,

            // Location fields
            Location: location,
            location: location,
            F_Nationality: nationality,
            nationality: nationality,

            // Source fields - CRITICAL for payment eligibility
            Source: source,
            source: source,
            SourceName: source,
            sourceName: source,

            // Referrer fields
            referrerPhone: referrerPhone,
            referrerEmail: referrerEmail,

            // Date fields
            CreatedDate: created,
            createdDate: created,
            UpdatedDate: modified,
            updatedDate: modified,
            applicationDate: created,

            // Assessment data - will be null unless added from SharePoint
            assessment: null,

            // Keep original item data for debugging
            _original: item
        };
    }

    // Extract referrals from various possible response formats
    function extractReferralsFromResponse(data) {
        // Direct array
        if (Array.isArray(data)) {
            console.log('Response is direct array');
            return data;
        }

        // Wrapped in 'referrals' property
        if (data.referrals && Array.isArray(data.referrals)) {
            console.log('Response has referrals property');
            return data.referrals;
        }

        // SharePoint style 'value' property
        if (data.value && Array.isArray(data.value)) {
            console.log('Response has value property (SharePoint style)');
            return data.value;
        }

        // SharePoint style 'd.results' property
        if (data.d && data.d.results && Array.isArray(data.d.results)) {
            console.log('Response has d.results property (SharePoint odata style)');
            return data.d.results;
        }

        // Single object - wrap in array
        if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
            console.log('Response is single object, wrapping in array');
            return [data];
        }

        console.log('Could not extract referrals from response format');
        return [];
    }

    // Main function to fetch referrals
    async function fetchReferrals(phone, email) {
        // DEMO: return mock referrals if the demo login is used (robust normalization)
        const phoneNorm = normalizePhoneLocal(phone);
        const emailNorm = normalizeEmail(email);
        const demoPhoneNorm = normalizePhoneLocal(DEMO_PHONE);
        const demoEmailNorm = normalizeEmail(DEMO_EMAIL);

        console.log('[DEMO CHECK] phoneNorm:', phoneNorm, 'emailNorm:', emailNorm);

        if (phoneNorm === demoPhoneNorm && emailNorm === demoEmailNorm) {
            console.log('DEMO DATA ACTIVE — returning mock referrals');
            const mock = getMockReferrals().map(processReferralData);
            console.log('DEMO records:', mock.length);
            return mock;
        }

        console.log('=== Starting fetchReferrals (LIVE) ===');
        console.log('Phone (raw):', phone);
        console.log('Email (raw):', email);

        try {
            const response = await fetch(POWER_AUTOMATE_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ phone, email })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Power Automate Error: ${response.status} - ${errorText}`);
                throw new Error(`Power Automate Error: ${response.status} - ${errorText}`);
            }

            // Parse response
            const responseText = await response.text();
            console.log('Raw response:', responseText.substring(0, 200) + '...');

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse JSON:', parseError);
                throw new Error('Invalid JSON response from Power Automate');
            }

            // Extract referrals from response
            let referrals = extractReferralsFromResponse(data);
            console.log(`Found ${referrals.length} referrals`);

            // Process each referral and add assessment results
            const processedReferrals = referrals.map((item, index) => {
                console.log(`Processing referral ${index + 1}:`, item);
                return processReferralData(item);
            });

            console.log('Processing complete. Returning referrals.');
            return processedReferrals;

        } catch (error) {
            console.error('Error fetching referrals:', error);
            // Return empty array instead of throwing
            return [];
        }
    }

    // Test connectivity
    async function testConnection() {
        console.log('=== Testing Power Automate Connection ===');
        console.log('URL:', POWER_AUTOMATE_URL);

        try {
            const testData = {
                phone: 'test',
                email: 'test@test.com'
            };

            console.log('Sending test request with:', testData);

            const response = await fetch(POWER_AUTOMATE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(testData)
            });

            console.log('Test response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('✓ Power Automate connection successful');
            console.log('Response structure:', data);

            return { success: true, data: data };

        } catch (error) {
            console.error('✗ Power Automate connection failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Public API
    return { 
        fetchReferrals,
        testConnection
    };
})();
