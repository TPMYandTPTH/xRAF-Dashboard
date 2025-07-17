// Direct SharePoint API Service - Uses actual SharePoint URLs, no mock data
// This connects directly to your SharePoint lists

const API_CONFIG = {
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
        
        // Get authentication context
        const formDigest = await getSharePointContext(siteUrl);
        
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
        
        // Make the request
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                ...API_CONFIG.headers,
                'X-RequestDigest': formDigest
            },
            credentials: 'include'
        });
        
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

// Main function to fetch referrals - NO MOCK DATA
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
            API_CONFIG.candidateEndpoint, 
            API_CONFIG.candidateBaseUrl, 
            candidateOptions
        );
        
        console.log(`Found ${candidateData.length} candidate records`);
        
        // Step 2: Fetch assessment data from Hallo AI list
        console.log('\n--- Fetching Assessment Data ---');
        const assessmentOptions = {
            select: 'ID,Title,Email,First_x0020_Name,Last_x0020_Name,Language,Score,English,CEFR,Created,Modified',
            top: 5000  // Get more assessment records to match
        };
        
        const assessmentData = await fetchSharePointData(
            API_CONFIG.assessmentEndpoint, 
            API_CONFIG.assessmentBaseUrl, 
            assessmentOptions
        );
        
        console.log(`Found ${assessmentData.length} assessment records`);
        
        // Step 3: Process and match the data
        console.log('\n--- Processing Data ---');
        const referrals = processReferralData(candidateData, assessmentData, phone, email);
        
        console.log(`Processed ${referrals.length} referrals`);
        
        // Step 4: Return the results
        return {
            success: true,
            data: {
                referrer: {
                    phone: phone,
                    email: email,
                    fullName: referrals.length > 0 ? 'Referrer' : 'New User'
                },
                referrals: referrals
            }
        };
        
    } catch (error) {
        console.error('=== fetchReferrals Error ===');
        console.error('Error details:', error.message);
        console.error('Stack trace:', error.stack);
        
        // Return error without falling back to mock data
        return {
            success: false,
            error: error.message,
            details: error.toString()
        };
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
                created: assessment.Created
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
        let status = 'Application Received';
        let stage = 'Application';
        
        // Use recent status if available
        if (candidate.Recent_x0020_Status) {
            status = candidate.Recent_x0020_Status;
            stage = mapStatusToStage(status);
            console.log(`  - Status from list: ${status}`);
        } else if (assessment && assessment.cefr) {
            // Determine status based on CEFR score
            const cefr = assessment.cefr;
            if (['C2', 'C1', 'B2'].includes(cefr)) {
                status = 'Passed Assessment';
                stage = 'Assessment';
                console.log(`  - Status from CEFR (${cefr}): ${status}`);
            } else if (['B1', 'A2', 'A1'].includes(cefr)) {
                status = 'Not Selected';
                stage = 'Eliminated';
                console.log(`  - Status from CEFR (${cefr}): ${status}`);
            }
        }
        
        // Calculate days since application
        const applicationDate = new Date(candidate.Created);
        const today = new Date();
        const daysInStage = Math.floor((today - applicationDate) / (1000 * 60 * 60 * 24));
        
        // Check if this is an xRAF referral
        const isXRAF = candidate.Source_x0020_Name === 'xRAF';
        const isPreviousCandidate = !isXRAF;
        
        console.log(`  - Source: ${candidate.Source_x0020_Name}, xRAF: ${isXRAF}`);
        console.log(`  - Days in stage: ${daysInStage}`);
        
        // Create referral object
        const referral = {
            candidateName: candidate.Person_x0020_Full_x0020_Name || candidate.Title || 'Unknown',
            candidateEmail: candidateEmail,
            candidatePhone: candidate.Default_x0020_Phone || '',
            stage: stage,
            status: status,
            currentStatus: status,
            applicationDate: applicationDate.toISOString().split('T')[0],
            hireDate: status.includes('Hired') ? new Date(candidate.Modified).toISOString().split('T')[0] : null,
            daysInStage: daysInStage,
            category: 'External',
            source: candidate.Source_x0020_Name || 'Unknown',
            isPreviousCandidate: isPreviousCandidate,
            needsAction: status === 'Application Received' && !isPreviousCandidate,
            
            // Additional fields
            systemId: candidate.ID,
            nationality: candidate.Nationality || '',
            location: candidate.Location || '',
            recentStatus: candidate.Recent_x0020_Status || '',
            
            // Assessment data
            assessmentScore: assessment?.score || null,
            assessmentCEFR: assessment?.cefr || null,
            assessmentLanguage: assessment?.language || null
        };
        
        referrals.push(referral);
        console.log(`  - Added referral: ${referral.candidateName}`);
    });
    
    console.log(`Total referrals processed: ${referrals.length}`);
    return referrals;
}

// Map status to stage
function mapStatusToStage(status) {
    if (status.includes('Hired')) return 'Hired';
    if (status.includes('Assessment')) return 'Assessment';
    if (status.includes('Interview')) return 'Interview';
    if (status.includes('Final Review')) return 'Final Review';
    if (status.includes('Eliminated') || status.includes('Withdrew')) return 'Eliminated';
    return 'Application';
}

// Test SharePoint connectivity
async function testSharePointConnection() {
    console.log('=== Testing SharePoint Connection ===');
    
    try {
        // Test candidate list
        console.log('\n--- Testing Candidate List ---');
        const candidateTest = await fetchSharePointData(
            API_CONFIG.candidateEndpoint, 
            API_CONFIG.candidateBaseUrl, 
            { top: 1 }
        );
        console.log('✓ Candidate list accessible');
        
        // Test assessment list  
        console.log('\n--- Testing Assessment List ---');
        const assessmentTest = await fetchSharePointData(
            API_CONFIG.assessmentEndpoint, 
            API_CONFIG.assessmentBaseUrl, 
            { top: 1 }
        );
        console.log('✓ Assessment list accessible');
        
        console.log('\n✓ All SharePoint connections successful!');
        return { success: true };
        
    } catch (error) {
        console.error('✗ SharePoint connection failed:', error);
        return { success: false, error: error.message };
    }
}

// Debug function to inspect list fields
async function debugListFields(listType = 'candidate') {
    const endpoint = listType === 'candidate' ? API_CONFIG.candidateEndpoint : API_CONFIG.assessmentEndpoint;
    const baseUrl = listType === 'candidate' ? API_CONFIG.candidateBaseUrl : API_CONFIG.assessmentBaseUrl;
    
    console.log(`=== Debugging ${listType} List Fields ===`);
    
    try {
        // Get list fields
        const fieldsUrl = endpoint.replace('/items', '/fields?$select=Title,InternalName,TypeAsString');
        const fieldsResponse = await fetch(fieldsUrl, {
            headers: API_CONFIG.headers,
            credentials: 'include'
        });
        
        if (fieldsResponse.ok) {
            const fieldsData = await fieldsResponse.json();
            console.log('\nAvailable Fields:');
            fieldsData.d.results.forEach(field => {
                console.log(`  ${field.Title} -> ${field.InternalName} (${field.TypeAsString})`);
            });
        }
        
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

// Export functions for use in main script
window.fetchReferrals = fetchReferrals;
window.testSharePointConnection = testSharePointConnection;
window.debugListFields = debugListFields;

// NO MOCK DATA FUNCTION - Remove any fallback
// If SharePoint fails, the application should show the error

console.log('Direct SharePoint API Service loaded - No mock data fallback');
