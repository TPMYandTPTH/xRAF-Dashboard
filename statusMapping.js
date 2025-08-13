// Simplified Status Mapping with Comprehensive Status Lists - WORKING VERSION
const StatusMapping = {
    // Map status to simplified group based on rules
    mapStatusToGroup: function(status, assessmentResult) {
        if (!status) return 'Application Received';
        
        const statusStr = status.toLowerCase();
        
        // Check comprehensive status lists
        
        // Application Received statuses
        const applicationReceived = [
            "application received", "textapply", "external portal", "internal portal",
            "recruiter submitted", "agency submissions", "employee referral",
            "contact attempt 1", "contact attempt 2", "contact attempt 3"
        ];
        
        // Assessment Stage statuses (RM50 eligible)
        const assessmentStage = [
            "assessment stage", "shl assessment: conversational multichat eng",
            "shl assessment: sales competency eng", "shl assessment: system diagnostic eng",
            "shl assessment: typing eng", "shl assessment: writex e-mail eng",
            "interview stage", "interview scheduled", "interview complete / offer requested",
            "second interview scheduled", "second interview complete / offer requested",
            "third interview scheduled", "third interview complete / offer requested",
            "final review", "ready to offer", "job offer presented", "onboarding started", "cleared to start"
        ];
        
        // Hired (Probation) statuses
        const hiredProbation = ["hired (probation)", "new starter (hired)"];
        
        // Hired (Confirmed) statuses (RM750 eligible)
        const hiredConfirmed = ["hired (confirmed)", "graduate"];
        
        // Not Selected statuses (comprehensive list)
        const notSelected = [
            // All Eliminated statuses
            "eliminated - age", "eliminated - availability", "eliminated - cv/resume analysis",
            "eliminated - did not start assessment", "eliminated - incomplete assessment", "eliminated - language",
            "eliminated - location/country", "eliminated - no hire list/not rehireable", "eliminated - processed on another requisition",
            "eliminated - unprocessed candidate", "eliminated - unreachable/unresponsive", "eliminated - wah - connectivity requirements",
            "eliminated - wah - technical requirements", "eliminated - assessment results did not meet criteria",
            "eliminated - no show", "eliminated - no show (interview 1)", "eliminated - no show (interview 2)", "eliminated - no show (interview 3)",
            "eliminated - interview 1 complete (reject)", "eliminated - interview 2 complete (reject)", "eliminated - interview 3 complete (reject)",
            "eliminated - availability (interview 1)", "eliminated - age (pre-offer)", "eliminated - age (post offer)",
            "eliminated - employment eligibility verification", "eliminated - falsified application", "eliminated - ineligible (background)",
            "eliminated - ineligible (drug test)", "eliminated - offer rescinded (pre-offer)", "eliminated - offer rescinded (post offer)",
            "eliminated - unreachable/unresponsive (pre-offer)", "eliminated - unreachable/unresponsive (post offer)",
            
            // All Withdrew statuses
            "withdrew - country", "withdrew - location", "withdrew - long-term commitment", "withdrew - no reason given",
            "withdrew - other job offer", "withdrew - salary", "withdrew - schedule", "withdrew - job fit (interview 1)",
            "withdrew - job fit (interview 2)", "withdrew - job fit (interview 3)", "withdrew - other job offer (interview 1)",
            "withdrew - other job offer (interview 2)", "withdrew - other job offer (interview 3)", "withdrew - personal/family (interview 1)",
            "withdrew - personal/family (interview 2)", "withdrew - personal/family (interview 3)", "withdrew - salary (interview 1)",
            "withdrew - salary (interview 2)", "withdrew - salary (interview 3)", "withdrew - schedule (interview 1)",
            "withdrew - schedule (interview 2)", "withdrew - schedule (interview 3)", "withdrew - medical (pre-offer)",
            "withdrew - medical (post offer)", "withdrew - offer declined/rejected", "withdrew - onboarding incomplete",
            "withdrew - other job offer (pre-offer)", "withdrew - other job offer (post offer)", "withdrew - personal/family (pre-offer)",
            "withdrew - personal/family (post offer)", "withdrew - role (pre-offer)", "withdrew - role (post offer)",
            "withdrew - salary (pre-offer)", "withdrew - salary (post offer)", "withdrew - schedule (pre-offer)", "withdrew - schedule (post offer)",
            
            // All Legacy statuses
            "legacy - age", "legacy - anonymous by gdpr", "legacy - availability", "legacy - behavior", "legacy - communication skills",
            "legacy - criminal record", "legacy - cv analysis", "legacy - education", "legacy - falsified application", "legacy - invalid phone number",
            "legacy - language", "legacy - long-term commitment", "legacy - motivation", "legacy - no hire list", "legacy - no show",
            "legacy - not re-hirable", "legacy - recording denied", "legacy - reference check", "legacy - salary expectation", "legacy - soft skills",
            "legacy - unreachable", "legacy - wah - connectivity requirements", "legacy - wah - contract", "legacy - wah - technical requirements",
            "legacy - work permit", "legacy - country", "legacy - did not apply", "legacy - incomplete assessment", "legacy - location",
            "legacy - medical", "legacy - negative review of tp", "legacy - no reason given", "legacy - other job offer", "legacy - personal/family",
            "legacy - project", "legacy - role", "legacy - salary conditions", "legacy - schedule", "legacy - security condition",
            
            // Self withdrew
            "self-withdrew (recruiter)", "self-withdrew (portal)"
        ];
        
        // Check which category the status belongs to
        if (hiredConfirmed.includes(statusStr)) {
            return 'Hired (Confirmed)';
        }
        if (hiredProbation.includes(statusStr)) {
            return 'Hired (Probation)';
        }
        if (assessmentStage.includes(statusStr)) {
            return 'Assessment Stage';
        }
        if (notSelected.includes(statusStr)) {
            return 'Not Selected';
        }
        if (applicationReceived.includes(statusStr)) {
            return 'Application Received';
        }
        
        // Default fallback
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
