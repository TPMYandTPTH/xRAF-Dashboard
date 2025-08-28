// Fixed Status Mapping with Proper Source Check
const StatusMapping = {
    // Map status to simplified group based on rules
    mapStatusToGroup: function(status, assessment, source, daysInStage) {
        if (!status) return 'Application Received';
        
        const statusStr = status.toLowerCase();
        const sourceStr = (source || '').toLowerCase();
        
        // FIRST CHECK: Source - if not xRAF, it's previously applied
        const isXRAF = sourceStr.includes('xraf') || 
                       sourceStr.includes('employee referral') || 
                       sourceStr.includes('employee_referral') ||
                       sourceStr.includes('raf') ||
                       sourceStr === '';  // Empty source might be xRAF
        
        if (!isXRAF && sourceStr !== '') {
            return 'Previously Applied (No Payment)';
        }
        
        // Not Selected - if rejected, eliminated, withdrew
        if (statusStr.includes('rejected') || 
            statusStr.includes('eliminated') || 
            statusStr.includes('withdrew') || 
            statusStr.includes('withdraw') ||
            statusStr.includes('not selected') ||
            statusStr.includes('not suitable') ||
            statusStr.includes('not qualified') ||
            statusStr.includes('failed') ||
            statusStr.includes('legacy')) {
            return 'Not Selected';
        }
        
        // Hired statuses - check days for confirmation
        if (statusStr.includes('hired') || 
            statusStr.includes('graduate') ||
            statusStr.includes('started') ||
            statusStr.includes('onboarded') ||
            statusStr.includes('confirmed')) {
            // If days is provided and >= 90, they're confirmed
            if (daysInStage !== undefined && daysInStage >= 90) {
                return 'Hired (Confirmed)';
            }
            return 'Hired (Probation)';
        }
        
        // Interview/Final Review/Offer stages - candidate has progressed past assessment
        if (statusStr.includes('interview') || 
            statusStr.includes('final review') ||
            statusStr.includes('ready to offer') ||
            statusStr.includes('job offer') ||
            statusStr.includes('offer') ||
            statusStr.includes('onboarding') ||
            statusStr.includes('pre-boarding') ||
            statusStr.includes('cleared to start') ||
            statusStr.includes('pending start') ||
            statusStr.includes('scheduled')) {
            return 'Assessment Stage';
        }
        
        // Assessment/SHL stages
        if (statusStr.includes('assessment') || 
            statusStr.includes('shl') ||
            statusStr.includes('test') ||
            statusStr.includes('evaluation') ||
            statusStr.includes('screening')) {
            // Check if they passed assessment
            if (assessment && assessment.score >= 70) {
                return 'Assessment Stage';
            }
            // Still in assessment process
            return 'Assessment Stage';
        }
        
        // Application/Review stages
        if (statusStr.includes('review') ||
            statusStr.includes('processing') ||
            statusStr.includes('pending') ||
            statusStr.includes('received') ||
            statusStr.includes('submitted') ||
            statusStr.includes('application')) {
            return 'Application Received';
        }
        
        // Default status - application received
        return 'Application Received';
    },
    
    // Get simplified status type for styling
    getSimplifiedStatusType: function(status, assessment, source, daysInStage) {
        const group = this.mapStatusToGroup(status, assessment, source, daysInStage);
        switch (group) {
            case 'Hired (Confirmed)': 
                return 'passed';
            case 'Hired (Probation)': 
                return 'probation';
            case 'Previously Applied (No Payment)': 
                return 'previously-applied';
            case 'Assessment Stage': 
                return 'assessment';
            case 'Not Selected': 
                return 'failed';
            case 'Application Received':
            default: 
                return 'received';
        }
    },
    
    // Determine stage for display - with proper source check
    determineStage: function(status, assessment, source, daysInStage) {
        return this.mapStatusToGroup(status, assessment, source, daysInStage);
    },
    
    // Display order for charts and lists
    displayOrder: [
        'Application Received',
        'Assessment Stage',
        'Hired (Probation)',
        'Hired (Confirmed)',
        'Previously Applied (No Payment)',
        'Not Selected'
    ]
};

// Earnings structure with conditions
const earningsStructure = {
    assessment: {
        amount: 50,
        label: "Assessment Passed",
        condition: "Candidate passes assessment with score ≥ 70%",
        payment: "RM50"
    },
    probation: { 
        amount: 750, 
        label: "Probation Completed",
        condition: "Candidate completes 90-day probation period",
        payment: "RM750"
    }
};

// Status examples for guide
const statusExamples = [
    {
        status: "Application Received",
        description: "Candidate has applied but not completed assessment",
        action: "Send WhatsApp reminder"
    },
    {
        status: "Assessment Stage",
        description: "Candidate in assessment/interview process",
        action: "RM50 payment eligible if score ≥ 70%"
    },
    {
        status: "Hired (Probation)",
        description: "Candidate hired but in probation period (<90 days)",
        action: "Monitor progress"
    },
    {
        status: "Hired (Confirmed)",
        description: "Candidate completed 90-day probation",
        action: "RM750 payment eligible"
    },
    {
        status: "Previously Applied (No Payment)",
        description: "Candidate applied through other sources",
        action: "No payment eligible"
    },
    {
        status: "Not Selected",
        description: "Candidate rejected or withdrew application",
        action: "No further action needed"
    }
];
