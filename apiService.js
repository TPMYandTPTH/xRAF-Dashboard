// API Service Module - Power Automate Integration
const ApiService = (function() {
    // Power Automate Configuration
    const POWERAUTOMATE_CONFIG = {
        // Replace this with your actual Power Automate HTTP trigger URL
        flowUrl: 'https://YOUR-FLOW-URL-HERE.logic.azure.com/workflows/...',
        timeout: 30000 // 30 seconds timeout
    };

    // Main function to fetch referrals
    async function fetchReferrals(phone, email) {
        console.log('=== Starting fetchReferrals (Power Automate) ===');
        console.log('Phone:', phone);
        console.log('Email:', email);
        
        try {
            // Call Power Automate flow
            const response = await fetch(POWERAUTOMATE_CONFIG.flowUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phone: phone,
                    email: email
                }),
                signal: AbortSignal.timeout(POWERAUTOMATE_CONFIG.timeout)
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Raw response:', data);
            
            // Handle different response formats from Power Automate
            let referrals = [];
            
            if (Array.isArray(data)) {
                // Direct array response
                referrals = data;
            } else if (data.referrals && Array.isArray(data.referrals)) {
                // Wrapped in referrals property
                referrals = data.referrals;
            } else if (data.value && Array.isArray(data.value)) {
                // SharePoint-style response
                referrals = data.value;
            }
            
            console.log(`Found ${referrals.length} referrals`);
            
            // Transform data to match expected format
            return referrals.map(item => transformReferralData(item));
            
        } catch (error) {
            console.error('=== fetchReferrals Error ===');
            console.error('Error details:', error.message);
            
            if (error.name === 'AbortError') {
                console.error('Request timed out');
            }
            
            // Return empty array instead of throwing
            return [];
        }
    }

    // Transform Power Automate data to match UI expectations
    function transformReferralData(item) {
        // Handle both SharePoint field names and simplified names
        const getField = (fieldName, alternativeName) => {
            return item[fieldName] || item[alternativeName] || '';
        };
        
        // Get status - check multiple possible field names
        const status = getField('Recent_x0020_Status', 'Status') || 
                      getField('Recent_Status', 'CurrentStatus') || 
                      'Application Received';
        
        // Calculate days in stage
        const lastUpdate = getField('Modified', 'UpdatedDate') || 
                          getField('Created', 'CreatedDate') || 
                          new Date().toISOString();
        const updatedDate = new Date(lastUpdate);
        const today = new Date();
        const daysInStage = Math.floor((today - updatedDate) / (1000 * 60 * 60 * 24));
        
        // Check if xRAF referral
        const source = getField('Source_x0020_Name', 'Source') || 
                      getField('Source_Name', 'SourceName') || '';
        const isXRAF = source === 'xRAF' || source === 'Employee Referral';
        const isPreviousCandidate = status === 'Previously Applied (No Payment)' || !isXRAF;
        
        // Return transformed object
        return {
            // IDs
            Person_system_id: getField('ID', 'PersonId') || getField('Id', 'SystemId') || '',
            personId: getField('ID', 'PersonId') || getField('Id', 'SystemId') || '',
            
            // Names and contact
            First_Name: getField('Person_x0020_Full_x0020_Name', 'FullName') || 
                       getField('Person_Full_Name', 'Name') || 
                       getField('Title', 'CandidateName') || 
                       'Unknown',
            name: getField('Person_x0020_Full_x0020_Name', 'FullName') || 
                  getField('Person_Full_Name', 'Name') || 
                  getField('Title', 'CandidateName') || 
                  'Unknown',
            
            // Email
            Email: getField('Person_x0020_Email', 'Email') || 
                   getField('Person_Email', 'CandidateEmail') || '',
            email: getField('Person_x0020_Email', 'Email') || 
                   getField('Person_Email', 'CandidateEmail') || '',
            
            // Phone
            Employee: getField('Default_x0020_Phone', 'Phone') || 
                     getField('Default_Phone', 'EmployeePhone') || '',
            employee: getField('Default_x0020_Phone', 'Phone') || 
                     getField('Default_Phone', 'EmployeePhone') || '',
            
            // Status and stage
            Status: status,
            status: status,
            statusType: StatusMapping ? StatusMapping.getSimplifiedStatusType(status) : 'received',
            stage: StatusMapping ? StatusMapping.determineStage(StatusMapping.mapStatusToGroup(status)) : 'Application',
            
            // Location and nationality
            Location: getField('Location', 'Office') || '',
            location: getField('Location', 'Office') || '',
            F_Nationality: getField('Nationality', 'Country') || '',
            nationality: getField('Nationality', 'Country') || '',
            
            // Source
            Source: source,
            source: source,
            SourceName: source,
            sourceName: source,
            
            // Dates
            CreatedDate: getField('Created', 'CreatedDate') || new Date().toISOString(),
            createdDate: getField('Created', 'CreatedDate') || new Date().toISOString(),
            UpdatedDate: lastUpdate,
            updatedDate: lastUpdate,
            applicationDate: getField('Created', 'CreatedDate') || new Date().toISOString(),
            
            // Calculated fields
            daysInStage: daysInStage,
            isPreviousCandidate: isPreviousCandidate,
            needsAction: ['Assessment Stage', 'Interview Stage'].includes(status) && 
                        daysInStage > 3 && !isPreviousCandidate,
            
            // Assessment data (if provided by Power Automate)
            assessmentScore: getField('AssessmentScore', 'Score') || null,
            assessmentCEFR: getField('AssessmentCEFR', 'CEFR') || null,
            assessmentLanguage: getField('AssessmentLanguage', 'Language') || null,
            assessmentDate: getField('AssessmentDate', 'AssessmentModified') || null
        };
    }

    // Test Power Automate connectivity
    async function testSharePointConnection() {
        console.log('=== Testing Power Automate Connection ===');
        
        try {
            // Test with dummy data
            const response = await fetch(POWERAUTOMATE_CONFIG.flowUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phone: 'test',
                    email: 'test@test.com'
                }),
                signal: AbortSignal.timeout(10000) // 10 second timeout for test
            });
            
            console.log('Test response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✓ Power Automate connection successful');
                console.log('Response structure:', Object.keys(data));
                return { success: true, data: data };
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
            
        } catch (error) {
            console.error('✗ Power Automate connection failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Debug function
    async function debugListFields(listType) {
        console.log(`=== Debug Information ===`);
        console.log('Using Power Automate integration');
        console.log('Flow URL:', POWERAUTOMATE_CONFIG.flowUrl);
        console.log('To debug:');
        console.log('1. Check Power Automate run history');
        console.log('2. Ensure flow is turned on');
        console.log('3. Verify HTTP trigger is configured correctly');
        console.log('4. Check flow outputs match expected format');
    }

    // Update configuration
    function updateApiConfig(config) {
        if (config.flowUrl) {
            POWERAUTOMATE_CONFIG.flowUrl = config.flowUrl;
            console.log('Updated Power Automate URL:', config.flowUrl);
        }
        if (config.timeout) {
            POWERAUTOMATE_CONFIG.timeout = config.timeout;
        }
    }

    // Public API
    return {
        fetchReferrals: fetchReferrals,
        testSharePointConnection: testSharePointConnection,
        debugListFields: debugListFields,
        updateApiConfig: updateApiConfig
    };
})();
