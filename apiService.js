// API Service for xRAF Dashboard
// Handles fetching and processing candidate and assessment data

const API_CONFIG = {
    candidateEndpoint: 'https://teleperformance.sharepoint.com/sites/TPMYHRRecruitment/Lists/ExRAF/AllItems.aspx', // Replace with actual endpoint
    assessmentEndpoint: 'https://teleperformance.sharepoint.com/sites/TAteamautomations/Lists/Hallo%20AI/AllItems.aspx', // Replace with actual endpoint
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN' // Replace with actual token
    }
};

// Process and combine data from both sources
async function fetchReferrals(phone, email) {
    try {
        console.log('Fetching data for:', { phone, email });
        
        // Fetch both datasets in parallel
        const [candidatesResponse, assessmentResponse] = await Promise.all([
            fetch(API_CONFIG.candidateEndpoint, {
                method: 'GET',
                headers: API_CONFIG.headers
            }),
            fetch(API_CONFIG.assessmentEndpoint, {
                method: 'GET',
                headers: API_CONFIG.headers
            })
        ]);
        
        if (!candidatesResponse.ok || !assessmentResponse.ok) {
            throw new Error('Failed to fetch data');
        }
        
        const candidateData = await candidatesResponse.json();
        const assessmentData = await assessmentResponse.json();
        
        console.log('Candidate data count:', candidateData.length);
        console.log('Assessment data count:', assessmentData.length);
        
        // Filter assessment data to only needed columns and create email map
        const assessmentMap = new Map();
        assessmentData.forEach(assessment => {
            if (assessment.Email) {
                assessmentMap.set(assessment.Email.toLowerCase(), {
                    firstName: assessment['First Name'],
                    lastName: assessment['Last Name'],
                    email: assessment.Email,
                    language: assessment.Language,
                    score: assessment.Score,
                    english: assessment.English,
                    cefr: assessment.CEFR
                });
            }
        });
        
        // Process candidate data
        const emailCandidateMap = new Map();
        
        // Group candidates by email and handle duplicates
        candidateData.forEach(candidate => {
            if (!candidate.Person_Email) return;
            
            const candidateEmail = candidate.Person_Email.toLowerCase();
            const candidateDate = new Date(candidate.updated_date || candidate['Updated Date']);
            const isXRAF = candidate.source_name === 'xRAF' || candidate['Source Name'] === 'xRAF';
            
            const candidateInfo = {
                systemId: candidate.system_ID || candidate['System ID'],
                fullName: candidate['Person Full Name'] || `${candidate['First Name'] || ''} ${candidate['Last Name'] || ''}`.trim(),
                email: candidate.Person_Email || candidate['Person Email'],
                phone: candidate.default_phone || candidate['Default Phone'] || phone,
                nationality: candidate.nationality || candidate.Nationality || '',
                source: candidate.source || candidate.Source || '',
                sourceName: candidate.source_name || candidate['Source Name'] || '',
                updatedDate: candidateDate,
                applicationDate: candidateDate, // Track individual application date
                location: candidate.location || candidate.Location || '',
                recentStatus: candidate.recent_status || candidate['Recent Status'] || '',
                isXRAF: isXRAF
            };
            
            const existing = emailCandidateMap.get(candidateEmail);
            
            if (!existing) {
                // First entry for this email
                emailCandidateMap.set(candidateEmail, candidateInfo);
            } else {
                // Handle duplicates based on rules
                const existingDate = new Date(existing.updatedDate);
                
                // Always keep the earliest application date
                if (candidateDate < existing.applicationDate) {
                    existing.applicationDate = candidateDate;
                }
                
                // If current is xRAF and existing is not, replace
                if (isXRAF && !existing.isXRAF) {
                    candidateInfo.applicationDate = existing.applicationDate; // Keep earliest date
                    emailCandidateMap.set(candidateEmail, candidateInfo);
                }
                // If both are xRAF, keep the newer one but preserve earliest application date
                else if (isXRAF && existing.isXRAF && candidateDate > existingDate) {
                    candidateInfo.applicationDate = existing.applicationDate; // Keep earliest date
                    emailCandidateMap.set(candidateEmail, candidateInfo);
                }
                // If neither is xRAF, keep the newer one but preserve earliest application date
                else if (!isXRAF && !existing.isXRAF && candidateDate > existingDate) {
                    candidateInfo.applicationDate = existing.applicationDate; // Keep earliest date
                    emailCandidateMap.set(candidateEmail, candidateInfo);
                }
                // If existing is xRAF and current is not, mark as previously applied
                else if (!isXRAF && existing.isXRAF) {
                    candidateInfo.isPreviouslyApplied = true;
                }
            }
        });
        
        // Build referrals array with status determination
        const referrals = [];
        const referrerEmail = email.toLowerCase();
        
        emailCandidateMap.forEach((candidate, candidateEmail) => {
            // Only include referrals for the logged-in referrer
            if (!candidate.isXRAF) {
                // Skip non-xRAF candidates for this referrer
                return;
            }
            
            const assessment = assessmentMap.get(candidateEmail);
            let status = 'Application Received';
            let stage = 'Application';
            
            // Determine status based on rules
            if (!candidate.isXRAF) {
                status = 'Previously Applied (No Payment)';
                stage = 'Previously Applied';
            } else if (!assessment) {
                // No assessment found, status remains Application Received
                status = 'Application Received';
                stage = 'Application';
            } else {
                // Check CEFR score
                const cefr = assessment.cefr;
                if (['C2', 'C1', 'B2'].includes(cefr)) {
                    status = 'Passed Assessment';
                    stage = 'Assessment';
                } else if (['B1', 'A2', 'A1'].includes(cefr)) {
                    status = 'Not Selected';
                    stage = 'Eliminated';
                } else {
                    // Unknown CEFR or no CEFR
                    status = 'Application Received';
                    stage = 'Application';
                }
            }
            
            // Calculate days since application
            const applicationDate = new Date(candidate.applicationDate); // Use the earliest application date
            const today = new Date();
            const daysInStage = Math.floor((today - applicationDate) / (1000 * 60 * 60 * 24));
            
            referrals.push({
                // Required fields for dashboard
                candidateName: candidate.fullName,
                candidateEmail: candidate.email,
                candidatePhone: candidate.phone,
                stage: stage,
                status: status,
                currentStatus: status,
                applicationDate: applicationDate.toISOString().split('T')[0], // Use earliest date
                hireDate: status === 'Hired' ? candidate.updatedDate.toISOString().split('T')[0] : null,
                daysInStage: daysInStage,
                category: candidate.source,
                source: candidate.sourceName,
                isPreviousCandidate: !candidate.isXRAF,
                needsAction: status === 'Application Received',
                
                // Additional fields
                systemId: candidate.systemId,
                nationality: candidate.nationality,
                location: candidate.location,
                recentStatus: candidate.recentStatus,
                
                // Assessment data if available
                assessmentScore: assessment?.score || null,
                assessmentCEFR: assessment?.cefr || null,
                assessmentLanguage: assessment?.language || null
            });
        });
        
        // Sort referrals by application date (newest first)
        referrals.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));
        
        // Get referrer info
        const referrerInfo = {
            phone: phone,
            email: email,
            fullName: referrals.length > 0 ? 'Referrer' : 'New User'
        };
        
        console.log('Processed referrals:', referrals.length);
        
        return {
            success: true,
            data: {
                referrer: referrerInfo,
                referrals: referrals
            }
        };
        
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            data: null,
            error: error.message
        };
    }
}

// Export for use in script.js
window.fetchReferrals = fetchReferrals;
window.getMockData = getMockData;
