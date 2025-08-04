// API Service Module - SharePoint Integration
const ApiService = (function() {
  
  // Add authentication headers
  headers: {
    'Accept': 'application/json;odata=verbose',
    'Content-Type': 'application/json;odata=verbose',
    'Authorization': `Bearer ${getAccessToken()}`
  }
};

// Add this function to get access token
function getAccessToken() {
  // This requires Azure AD app registration
  return localStorage.getItem('sharepoint_access_token') || '';
}

async function fetchReferrals(phone, email) {
  console.log('Triggering Power Automate flow...');
  const powerAutomateUrl = 'https://prod-77.southeastasia.logic.azure.com:443/workflows/3dcf20be6af641a4b49eb48727473a47/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=uVigg-lTLRaUgLgUdGUnqCt9-TWJC7E7c8ryTjLC0Hw';

  try {
    const response = await fetch(powerAutomateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: phone,
        email: email
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Power Automate Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Data from Power Automate:', data);
    return data.referrals || [];
    
  } catch (error) {
    console.error('Power Automate request failed:', error);
    return [];
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
            
            let candidateData = [];
            let assessmentData = [];
            
            try {
                candidateData = await fetchSharePointData(
                    SHAREPOINT_CONFIG.candidateEndpoint, 
                    SHAREPOINT_CONFIG.candidateBaseUrl, 
                    candidateOptions
                );
                console.log(`Found ${candidateData.length} candidate records`);
            } catch (candidateError) {
                console.error('Error fetching candidates:', candidateError);
                // Continue anyway - we'll return empty array
            }
            
            if (candidateData.length === 0) {
                console.log('No candidates found for this referrer');
                return []; // Return empty array, not null
            }
            
            // Step 2: Try to fetch assessment data (but don't fail if it errors)
            console.log('\n--- Fetching Assessment Data ---');
            const assessmentOptions = {
                select: 'ID,Title,Email,First_x0020_Name,Last_x0020_Name,Language,Score,English,CEFR,Created,Modified',
                top: 5000
            };
            
            try {
                assessmentData = await fetchSharePointData(
                    SHAREPOINT_CONFIG.assessmentEndpoint, 
                    SHAREPOINT_CONFIG.assessmentBaseUrl, 
                    assessmentOptions
                );
                console.log(`Found ${assessmentData.length} assessment records`);
            } catch (assessmentError) {
                console.warn('Could not fetch assessment data:', assessmentError);
                // Continue with empty assessment data
            }
            
            // Step 3: Process and match the data
            console.log('\n--- Processing Data ---');
            const referrals = processReferralData(candidateData, assessmentData, phone, email);
            
            console.log(`Processed ${referrals.length} referrals`);
            
            return referrals; // Always return array
            
        } catch (error) {
            console.error('=== fetchReferrals Error ===');
            console.error('Error details:', error.message);
            console.error('Stack trace:', error.stack);
            
            // Don't throw - return empty array
            return [];
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
