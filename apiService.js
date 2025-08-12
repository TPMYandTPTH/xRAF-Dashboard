const ApiService = (function () {
    const POWER_AUTOMATE_URL = 'https://prod-77.southeastasia.logic.azure.com:443/workflows/3dcf20be6af641a4b49eb48727473a47/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=uVigg-lTLRaUgLgUdGUnqCt9-TWJC7E7c8ryTjLC0Hw';

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
            id: id.toString(),
            name: name,
            email: email,
            phone: phone,
            status: status,
            location: location,
            nationality: nationality,
            source: source,
            referrerPhone: referrerPhone,
            referrerEmail: referrerEmail,
            createdDate: created,
            updatedDate: modified,
            _original: item // Keep original item data for debugging
        };
    }

    // Extract referrals from various possible response formats
    function extractReferralsFromResponse(data) {
        if (Array.isArray(data)) {
            console.log('Response is direct array');
            return data;
        }

        if (data.referrals && Array.isArray(data.referrals)) {
            console.log('Response has referrals property');
            return data.referrals;
        }

        if (data.value && Array.isArray(data.value)) {
            console.log('Response has value property (SharePoint style)');
            return data.value;
        }

        if (data.d && data.d.results && Array.isArray(data.d.results)) {
            console.log('Response has d.results property (SharePoint odata style)');
            return data.d.results;
        }

        if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
            console.log('Response is single object, wrapping in array');
            return [data];
        }

        console.log('Could not extract referrals from response format');
        return [];
    }

    // Main function to fetch referrals
    async function fetchReferrals(phone, email) {
        console.log('=== Starting fetchReferrals ===');
        console.log('Phone:', phone);
        console.log('Email:', email);

        try {
            const response = await fetch(POWER_AUTOMATE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ phone, email })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Power Automate Error: ${response.status} - ${errorText}`);
                throw new Error(`Power Automate Error: ${response.status} - ${errorText}`);
            }

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

            // Process each referral
            return referrals.map((item, index) => processReferralData(item));
        } catch (error) {
            console.error('Error fetching referrals:', error);
            return [];
        }
    }

    // Test connectivity
    async function testConnection() {
        console.log('=== Testing Power Automate Connection ===');

        try {
            const response = await fetch(POWER_AUTOMATE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: 'test', email: 'test@test.com' })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Test connection failed:', errorText);
                throw new Error('Connection failed');
            }

            const data = await response.json();
            console.log('Connection successful:', data);
            return { success: true, data: data };
        } catch (error) {
            console.error('Test connection error:', error);
            return { success: false, error: error.message };
        }
    }

    // Public API
    return {
        fetchReferrals,
        testConnection
    };
})();
