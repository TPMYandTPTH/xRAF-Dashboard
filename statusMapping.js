// Simplified Status Mapping with New Rules
const StatusMapping = {
    mapStatusToGroup: function(status, assessmentResult) {
        if (!status) return 'Application Received';
        
        const statusStr = status.toLowerCase();
        
        // Previously Applied (No Payment) - if source is not xRAF
        if (!statusStr.includes('xraf')) {
            return 'Previously Applied (No Payment)';
        }
        
        // Not Selected - if rejected
        if (statusStr.includes('rejected') || statusStr.includes('eliminated') || 
            statusStr.includes('withdrew') || statusStr.includes('not selected')) {
            return 'Not Selected';
        }
        
        // Hired (Confirmed) - 90+ days
        if (statusStr.includes('hired') && assessmentResult && assessmentResult.days >= 90) {
            return 'Hired (Confirmed)';
        }
        
        // Hired (Probation) - <90 days
        if (statusStr.includes('hired')) {
            return 'Hired (Probation)';
        }
        
        // Assessment Stage - if assessment exists and is good
        if (assessmentResult && assessmentResult.score >= 70) {
            return 'Assessment Stage';
        }
        
        // Default status
        return 'Application Received';
    },

    getSimplifiedStatusType: function(status, assessmentResult) {
        const group = this.mapStatusToGroup(status, assessmentResult);
        switch (group) {
            case 'Hired (Confirmed)': return 'passed';
            case 'Hired (Probation)': return 'probation';
            case 'Previously Applied (No Payment)': return 'previously-applied';
            case 'Assessment Stage': return 'assessment';
            case 'Not Selected': return 'failed';
            default: return 'received';
        }
    },
    
    determineStage: function(status, assessmentResult) {
        return this.mapStatusToGroup(status, assessmentResult);
    },
    
    displayOrder: [
        'Application Received',
        'Assessment Stage',
        'Hired (Probation)',
        'Hired (Confirmed)',
        'Previously Applied (No Payment)',
        'Not Selected'
    ]
};

// Earnings structure
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

// Status examples
const statusExamples = [
    {
        status: "Application Received",
        description: "Candidate has applied but not completed assessment",
        action: "Send WhatsApp reminder"
    },
    {
        status: "Assessment Stage",
        description: "Candidate passed assessment (score ≥ 70%)",
        action: "RM50 payment eligible"
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
        description: "Candidate applied before referral program",
        action: "No payment eligible"
    },
    {
        status: "Not Selected",
        description: "Candidate rejected or withdrew application",
        action: "No further action needed"
    }
];
