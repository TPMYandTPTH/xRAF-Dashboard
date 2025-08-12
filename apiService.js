// API Service Module - Power Automate Integration
const ApiService = (function() {
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
        
        return {
            Person_system_id: id.toString(),
            personId: id.toString(),
            First_Name: name,
            name: name,
            Email: email,
            email: email,
            Employee: phone,
            employee: phone,
            phone: phone,
            Status: status,
            status: status,
            Location: location,
            location: location,
            F_Nationality: nationality,
            nationality: nationality,
            Source: source,
            source: source,
            SourceName: source,
            sourceName: source,
            referrerPhone: referrerPhone,
            referrerEmail: referrerEmail,
            CreatedDate: created,
            createdDate: created,
            UpdatedDate: modified,
            updatedDate: modified,
            applicationDate: created,
            assessment: null,
            _original: item
        };
    }

    // Extract referrals from various possible response formats
    function extractReferralsFromResponse(data) {
        if (Array.isArray(data)) {
            return data;
        }
        if (data.referrals && Array.isArray(data.referrals)) {
            return data.referrals;
        }
        if (data.value && Array.isArray(data.value)) {
            return data.value;
        }
        if (data.d && data.d.results && Array.isArray(data.d.results)) {
            return data.d.results;
        }
        if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
            return [data];
        }
        return [];
    }

    // Main function to fetch referrals
    async function fetchReferrals(phone, email) {
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
                throw new Error(`Power Automate Error: ${response.status}`);
            }

            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('Invalid JSON response from Power Automate');
            }

            let referrals = extractReferralsFromResponse(data);
            const processedReferrals = referrals.map((item, index) => processReferralData(item));

            return processedReferrals;
        } catch (error) {
            return [];
        }
    }

    return { 
        fetchReferrals
    };
})();
