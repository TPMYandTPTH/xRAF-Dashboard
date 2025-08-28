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
