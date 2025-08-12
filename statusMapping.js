// Simplified Status Mapping with New Rules
const StatusMapping = {
    // Map status to simplified group based on rules
    mapStatusToGroup: function(status, assessmentResult) {
        if (!status) return 'Application Received';
        
        const statusStr = status.toLowerCase();
        
        // Check source first - if not xRAF, it's previously applied
        // This should be checked in the main processing logic using the source field
        
        // Not Selected - if rejected, eliminated, withdrew
        if (statusStr.includes('rejected') || 
            statusStr.includes('eliminated') || 
            statusStr.includes('withdrew') || 
            statusStr.includes('not selected') ||
            statusStr.includes('legacy')) {
            return 'Not Selected';
        }
        
        // Hired (Confirmed) - hired status with 90+ days
        if (statusStr.includes('hired') || statusStr.includes('graduate')) {
            // Without assessment data, we can't check days, so default to probation
            return 'Hired (Probation)';
        }
        
        // Interview/Final Review stages - candidate passed assessment
        if (statusStr.includes('interview') || 
            statusStr.includes('final review') ||
            statusStr.includes('ready to offer') ||
            statusStr.includes('job offer') ||
            statusStr.includes('onboarding') ||
            statusStr.includes('cleared to start')) {
            return 'Assessment Stage';
        }
        
        // Assessment/SHL stages
        if (statusStr.includes('assessment') || 
            statusStr.includes('shl')) {
            return 'Assessment Stage';
        }
        
        // Default status - application received
        return 'Application Received';
    },
    
    // Get simplified status type for styling
    getSimplifiedStatusType: function(status, assessmentResult) {
        const group = this.mapStatusToGroup(status, assessmentResult);
        switch (group) {
            case 'Hired (Confirmed)': return 'confirmed';
            case 'Hired (Probation)': return 'probation';
            case 'Previously Applied (No Payment)': return 'previous';
            case 'Assessment Stage': return 'assessment';
            case 'Not Selected': return 'failed';
            default: return 'received';
        }
    },
    
    // Determine stage for display
    determineStage: function(status, assessmentResult) {
        return this.mapStatusToGroup(status, assessmentResult);
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
        condition: "Candidate passes assessment",
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
        action: "Send WhatsApp reminder",
        color: "#0087FF"
    },
    {
        status: "Assessment Stage",
        description: "Candidate passed assessment",
        action: "RM50 payment eligible",
        color: "#00d769"
    },
    {
        status: "Hired (Probation)",
        description: "Candidate hired but in probation period (<90 days)",
        action: "Monitor progress",
        color: "#f5d200"
    },
    {
        status: "Hired (Confirmed)",
        description: "Candidate completed 90-day probation",
        action: "RM750 payment eligible",
        color: "#28a745"
    },
    {
        status: "Previously Applied (No Payment)",
        description: "Candidate applied before referral program",
        action: "No payment eligible",
        color: "#676767"
    },
    {
        status: "Not Selected",
        description: "Candidate rejected or withdrew application",
        action: "No further action needed",
        color: "#dc3545"
    }
];
