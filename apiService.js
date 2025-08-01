// API Service Module - SharePoint Integration
const ApiService = (function() {
    // SharePoint Configuration
    const SHAREPOINT_CONFIG = {
        // Your actual SharePoint list URLs converted to REST API endpoints
        candidateEndpoint: 'https://teleperformance.sharepoint.com/sites/TPMYHRRecruitment/_api/web/lists/getbytitle(\'ExRAF\')/items',
        assessmentEndpoint: 'https://teleperformance.sharepoint.com/sites/TAteamautomations/_api/web/lists/getbytitle(\'Hallo%20AI\')/items',
        
        // Base URLs for context
        candidateBaseUrl: 'https://teleperformance.sharepoint.com/sites/TPMYHRRecruitment',
        assessmentBaseUrl: 'https://teleperformance.sharepoint.com/sites/TAteamautomations',
        
        // Headers for SharePoint REST API
        headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose'
        }
    };

    // Get SharePoint context info for authentication
    async function getSharePointContext(siteUrl) {
        try {
            console.log('Getting SharePoint context for:', siteUrl);
            
            const response = await fetch(`${siteUrl}/_api/contextinfo`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose'
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`Context info failed: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.d.GetContextWebInformation.FormDigestValue;
            
        } catch (error) {
            console.error('Error getting SharePoint context:', error);
            throw error;
        }
    }

    // Fetch data from SharePoint REST API
    async function fetchSharePointData(endpoint, siteUrl, options = {}) {
        try {
            console.log(`Fetching from: ${endpoint}`);
            
            // Try without authentication first (for anonymous access)
            let useAuth = false;
            let formDigest = null;
            
            // Build query parameters
            const queryParams = [];
            if (options.select) queryParams.push(`$select=${encodeURIComponent(options.select)}`);
            if (options.filter) queryParams.push(`$filter=${encodeURIComponent(options.filter)}`);
            if (options.orderby) queryParams.push(`$orderby=${encodeURIComponent(options.orderby)}`);
            if (options.top) queryParams.push(`$top=${options.top}`);
            if (options.expand) queryParams.push(`$expand=${encodeURIComponent(options.expand)}`);
            
            const queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';
            const fullUrl = endpoint + queryString;
            
            console.log(`Full URL: ${fullUrl}`);
            
            // First attempt without authentication
            let response = await fetch(fullUrl, {
                method: 'GET',
                headers: SHAREPOINT_CONFIG.headers,
                credentials: 'include'
            });
            
            // If unauthorized, try with authentication
            if (response.status === 401 || response.status === 403) {
                console.log('Attempting authenticated request...');
                useAuth = true;
                formDigest = await getSharePointContext(siteUrl);
                
                response = await fetch(fullUrl, {
                    method: 'GET',
                    headers: {
                        ...SHAREPOINT_CONFIG.headers,
                        'X-RequestDigest': formDigest
                    },
                    credentials: 'include'
                });
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`SharePoint API Error: ${response.status} ${response.statusText}\nDetails: ${errorText}`);
            }
            
            const data = await response.json();
            console.log(`Retrieved ${data.d.results.length} items`);
            return data.d.results;
            
        } catch (error) {
            console.error('Error fetching SharePoint data:', error);
            throw error;
        }
    }

    // Main function to fetch referrals
    async function fetchReferrals(phone, email) {
        console.log('=== Starting fetchReferrals ===');
        console.log('Phone:', phone);
        console.log('Email:', email);
        
        try {
            // Step 1: Fetch candidate data from ExRAF list
            console.log('\n--- Fetching Candidate Data ---');
            const candidateOptions = {
                select: 'ID,Title,Person_x0020_Full_x0020_Name,Person_x0020_Email,Default_x0020_Phone,Source_x0020_Name,Recent_x0020_Status,Created,Modified,Referrer_x0020_Phone,Referrer_x0020_Email,Nationality,Location',
                filter: `(Referrer_x0020_Phone eq '${phone}' or Referrer_x0020_Email eq '${email}')`,
                orderby: 'Created desc',
                top: 1000
            };
            
            const candidateData = await fetchSharePointData(
                SHAREPOINT_CONFIG.candidateEndpoint, 
                SHAREPOINT_CONFIG.candidateBaseUrl, 
                candidateOptions
            );
            
            console.log(`Found ${candidateData.length} candidate records`);
            
            if (candidateData.length === 0) {
                console.log('No candidates found for this referrer');
                return [];
            }
            
            // Step 2: Fetch assessment data from Hallo AI list
            console.log('\n--- Fetching Assessment Data ---');
            const assessmentOptions = {
                select: 'ID,Title,Email,First_x0020_Name,Last_x0020_Name,Language,Score,English,CEFR,Created,Modified',
                top: 5000
            };
            
            const assessmentData = await fetchSharePointData(
                SHAREPOINT_CONFIG.assessmentEndpoint, 
                SHAREPOINT_CONFIG.assessmentBaseUrl, 
                assessmentOptions
            );
            
            console.log(`Found ${assessmentData.length} assessment records`);
            
            // Step 3: Process and match the data
            console.log('\n--- Processing Data ---');
            const referrals = processReferralData(candidateData, assessmentData, phone, email);
            
            console.log(`Processed ${referrals.length} referrals`);
            
            return referrals;
            
        } catch (error) {
            console.error('=== fetchReferrals Error ===');
            console.error('Error details:', error.message);
            console.error('Stack trace:', error.stack);
            throw error;
        }
    }

    // Process the data from both lists
    function processReferralData(candidateData, assessmentData, referrerPhone, referrerEmail) {
        console.log('Processing referral data...');
        
        // Create assessment lookup map by email
        const assessmentMap = new Map();
        assessmentData.forEach(assessment => {
            if (assessment.Email) {
                assessmentMap.set(assessment.Email.toLowerCase(), {
                    firstName: assessment.First_x0020_Name,
                    lastName: assessment.Last_x0020_Name,
                    email: assessment.Email,
                    language: assessment.Language,
                    score: assessment.Score,
                    english: assessment.English,
                    cefr: assessment.CEFR,
                    created: assessment.Created,
                    modified: assessment.Modified
                });
            }
        });
        
        console.log(`Created assessment lookup map with ${assessmentMap.size} entries`);
        
        // Process each candidate
        const referrals = [];
        
        candidateData.forEach((candidate, index) => {
            console.log(`Processing candidate ${index + 1}:`, candidate.Person_x0020_Full_x0020_Name);
            
            const candidateEmail = candidate.Person_x0020_Email;
            if (!candidateEmail) {
                console.log('  - Skipping: No email address');
                return;
            }
            
            // Find matching assessment
            const assessment = assessmentMap.get(candidateEmail.toLowerCase());
            console.log(`  - Assessment found: ${assessment ? 'Yes' : 'No'}`);
            
            // Determine status and stage
            let status = candidate.Recent_x0020_Status || 'Application Received';
            
            // Override status based on assessment if no recent status
            if (!candidate.Recent_x0020_Status && assessment && assessment.cefr) {
                const cefr = assessment.cefr;
                if (['C2', 'C1', 'B2'].includes(cefr)) {
                    status = 'Assessment Stage';
                } else if (['B1', 'A2', 'A1'].includes(cefr)) {
                    status = 'Eliminated - Assessment Results Did Not Meet Criteria';
                }
            }
            
            // Calculate days since last update
            const lastUpdate = candidate.Modified || candidate.Created;
            const updatedDate = new Date(lastUpdate);
            const today = new Date();
            const daysInStage = Math.floor((today - updatedDate) / (1000 * 60 * 60 * 24));
            
            // Check if this is an xRAF referral
            const isXRAF = candidate.Source_x0020_Name === 'xRAF' || candidate.Source_x0020_Name === 'Employee Referral';
            const isPreviousCandidate = status === 'Previously Applied (No Payment)' || !isXRAF;
            
            // Create referral object
            const referral = {
                // SharePoint fields
                Person_system_id: candidate.ID?.toString() || '',
                First_Name: candidate.Person_x0020_Full_x0020_Name || candidate.Title || 'Unknown',
                Employee: candidate.Default_x0020_Phone || '',
                Email: candidateEmail,
                Source: candidate.Source_x0020_Name || 'Unknown',
                Status: status,
                Location: candidate.Location || '',
                F_Nationality: candidate.Nationality || '',
                CreatedDate: candidate.Created,
                UpdatedDate: lastUpdate,
                SourceName: candidate.Source_x0020_Name || 'Unknown',
                
                // Additional fields for UI
                personId: candidate.ID?.toString() || '',
                name: candidate.Person_x0020_Full_x0020_Name || candidate.Title || 'Unknown',
                email: candidateEmail,
                employee: candidate.Default_x0020_Phone || '',
                status: status,
                location: candidate.Location || '',
                nationality: candidate.Nationality || '',
                source: candidate.Source_x0020_Name || 'Unknown',
                sourceName: candidate.Source_x0020_Name || 'Unknown',
                createdDate: candidate.Created,
                updatedDate: lastUpdate,
                daysInStage: daysInStage,
                isPreviousCandidate: isPreviousCandidate,
                applicationDate: candidate.Created,
                
                // Assessment data
                assessmentScore: assessment?.score || null,
                assessmentCEFR: assessment?.cefr || null,
                assessmentLanguage: assessment?.language || null,
                assessmentDate: assessment?.modified || null
            };
            
            referrals.push(referral);
            console.log(`  - Added referral: ${referral.name}`);
        });
        
        console.log(`Total referrals processed: ${referrals.length}`);
        return referrals;
    }

    // Test SharePoint connectivity
    async function testSharePointConnection() {
        console.log('=== Testing SharePoint Connection ===');
        
        try {
            // Test candidate list
            console.log('\n--- Testing Candidate List ---');
            const candidateTest = await fetchSharePointData(
                SHAREPOINT_CONFIG.candidateEndpoint, 
                SHAREPOINT_CONFIG.candidateBaseUrl, 
                { top: 1 }
            );
            console.log('✓ Candidate list accessible');
            console.log('Sample candidate:', candidateTest[0]);
            
            // Test assessment list  
            console.log('\n--- Testing Assessment List ---');
            const assessmentTest = await fetchSharePointData(
                SHAREPOINT_CONFIG.assessmentEndpoint, 
                SHAREPOINT_CONFIG.assessmentBaseUrl, 
                { top: 1 }
            );
            console.log('✓ Assessment list accessible');
            console.log('Sample assessment:', assessmentTest[0]);
            
            console.log('\n✓ All SharePoint connections successful!');
            return { success: true };
            
        } catch (error) {
            console.error('✗ SharePoint connection failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Debug function to inspect list fields
    async function debugListFields(listType = 'candidate') {
        const endpoint = listType === 'candidate' ? SHAREPOINT_CONFIG.candidateEndpoint : SHAREPOINT_CONFIG.assessmentEndpoint;
        const baseUrl = listType === 'candidate' ? SHAREPOINT_CONFIG.candidateBaseUrl : SHAREPOINT_CONFIG.assessmentBaseUrl;
        
        console.log(`=== Debugging ${listType} List Fields ===`);
        
        try {
            // Get sample data
            const sampleData = await fetchSharePointData(endpoint, baseUrl, { top: 1 });
            if (sampleData.length > 0) {
                console.log('\nSample Item Fields:');
                Object.keys(sampleData[0]).forEach(key => {
                    console.log(`  ${key}: ${sampleData[0][key]}`);
                });
            }
            
        } catch (error) {
            console.error('Error debugging fields:', error);
        }
    }

    // Public API
    return {
        fetchReferrals: fetchReferrals,
        testSharePointConnection: testSharePointConnection,
        debugListFields: debugListFields,
        updateApiConfig: function(config) {
            Object.assign(SHAREPOINT_CONFIG, config);
        }
    };
})();
