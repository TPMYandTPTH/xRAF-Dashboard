// Status mapping configuration - Comprehensive System
const statusMapping = {
    "statusGroups": {
        // Status 1: Application Received
        "Application Received": [
            "Application Received",
            "TextApply",
            "External Portal",
            "Internal Portal",
            "Recruiter Submitted",
            "Agency Submissions",
            "Employee Referral",
            "Contact Attempt 1",
            "Contact Attempt 2",
            "Contact Attempt 3"
        ],
        
        // Status 2: Assessment Stage
        "Assessment Stage": [
            "Assessment Stage",
            "SHL Assessment: Conversational Multichat ENG",
            "SHL Assessment: Sales Competency ENG",
            "SHL Assessment: System Diagnostic ENG",
            "SHL Assessment: Typing ENG",
            "SHL Assessment: WriteX E-mail ENG"
        ],
        
        // Status 3: Interview Stage
        "Interview Stage": [
            "Interview Stage",
            "Interview Scheduled",
            "Interview Complete / Offer Requested",
            "Second Interview Scheduled",
            "Second Interview Complete / Offer Requested",
            "Third Interview Scheduled",
            "Third Interview Complete / Offer Requested"
        ],
        
        // Status 4: Final Review
        "Final Review": [
            "Final Review",
            "Ready to Offer",
            "Job Offer Presented",
            "Onboarding Started",
            "Cleared to Start"
        ],
        
        // Status 5: Hired (Probation)
        "Hired (Probation)": [
            "Hired (Probation)",
            "New Starter (Hired)"
        ],
        
        // Status 6: Hired (Confirmed)
        "Hired (Confirmed)": [
            "Hired (Confirmed)",
            "Graduate"
        ],
        
        // Status 7: Previously Applied (No Payment)
        "Previously Applied (No Payment)": [
            "Previously Applied (No Payment)"
        ],
        
        // Status 8: Not Selected
        "Not Selected": [
            // Assessment/Process Failures
            "Eliminated - Assessment Results Did Not Meet Criteria",
            "Eliminated - Did not start Assessment",
            "Eliminated - Incomplete Assessment",
            
            // All Eliminated reasons
            "Eliminated - Age",
            "Eliminated - Availability",
            "Eliminated - CV/Resume Analysis",
            "Eliminated - Language",
            "Eliminated - Location/Country",
            "Eliminated - No Hire List/Not Rehireable",
            "Eliminated - Processed on another Requisition",
            "Eliminated - Unprocessed Candidate",
            "Eliminated - Unreachable/Unresponsive",
            "Eliminated - WAH - Connectivity Requirements",
            "Eliminated - WAH - Technical Requirements",
            "Eliminated - No Show",
            "Eliminated - No Show (Interview 1)",
            "Eliminated - No Show (Interview 2)",
            "Eliminated - No Show (Interview 3)",
            "Eliminated - Interview 1 Complete (Reject)",
            "Eliminated - Interview 2 Complete (Reject)",
            "Eliminated - Interview 3 Complete (Reject)",
            "Eliminated - Availability (Interview 1)",
            "Eliminated - Age (Pre-Offer)",
            "Eliminated - Age (Post Offer)",
            "Eliminated - Employment Eligibility Verification",
            "Eliminated - Falsified Application",
            "Eliminated - Ineligible (Background)",
            "Eliminated - Ineligible (Drug Test)",
            "Eliminated - Offer Rescinded (Pre-Offer)",
            "Eliminated - Offer Rescinded (Post Offer)",
            "Eliminated - Unreachable/Unresponsive (Pre-Offer)",
            "Eliminated - Unreachable/Unresponsive (Post Offer)",
            
            // All Withdrew reasons
            "Withdrew - Country",
            "Withdrew - Location",
            "Withdrew - Long-Term Commitment",
            "Withdrew - No Reason Given",
            "Withdrew - Other Job Offer",
            "Withdrew - Salary",
            "Withdrew - Schedule",
            "Withdrew - Job Fit (Interview 1)",
            "Withdrew - Job Fit (Interview 2)",
            "Withdrew - Job Fit (Interview 3)",
            "Withdrew - Other Job Offer (Interview 1)",
            "Withdrew - Other Job Offer (Interview 2)",
            "Withdrew - Other Job Offer (Interview 3)",
            "Withdrew - Personal/Family (Interview 1)",
            "Withdrew - Personal/Family (Interview 2)",
            "Withdrew - Personal/Family (Interview 3)",
            "Withdrew - Salary (Interview 1)",
            "Withdrew - Salary (Interview 2)",
            "Withdrew - Salary (Interview 3)",
            "Withdrew - Schedule (Interview 1)",
            "Withdrew - Schedule (Interview 2)",
            "Withdrew - Schedule (Interview 3)",
            "Withdrew - Medical (Pre-Offer)",
            "Withdrew - Medical (Post Offer)",
            "Withdrew - Offer Declined/Rejected",
            "Withdrew - Onboarding Incomplete",
            "Withdrew - Other Job Offer (Pre-Offer)",
            "Withdrew - Other Job Offer (Post Offer)",
            "Withdrew - Personal/Family (Pre-Offer)",
            "Withdrew - Personal/Family (Post Offer)",
            "Withdrew - Role (Pre-Offer)",
            "Withdrew - Role (Post Offer)",
            "Withdrew - Salary (Pre-Offer)",
            "Withdrew - Salary (Post Offer)",
            "Withdrew - Schedule (Pre-Offer)",
            "Withdrew - Schedule (Post Offer)",
            
            // Legacy statuses
            "Legacy - Age",
            "Legacy - Anonymous by GDPR",
            "Legacy - Availability",
            "Legacy - Behavior",
            "Legacy - Communication Skills",
            "Legacy - Criminal Record",
            "Legacy - CV Analysis",
            "Legacy - Education",
            "Legacy - Falsified Application",
            "Legacy - Invalid Phone Number",
            "Legacy - Language",
            "Legacy - Long-term Commitment",
            "Legacy - Motivation",
            "Legacy - No Hire List",
            "Legacy - No Show",
            "Legacy - Not Re-hirable",
            "Legacy - Recording Denied",
            "Legacy - Reference Check",
            "Legacy - Salary Expectation",
            "Legacy - Soft Skills",
            "Legacy - Unreachable",
            "Legacy - WAH - Connectivity Requirements",
            "Legacy - WAH - Contract",
            "Legacy - WAH - Technical Requirements",
            "Legacy - Work Permit",
            "Legacy - Country",
            "Legacy - Did Not Apply",
            "Legacy - Incomplete Assessment",
            "Legacy - Location",
            "Legacy - Medical",
            "Legacy - Negative Review of TP",
            "Legacy - No Reason Given",
            "Legacy - Other Job Offer",
            "Legacy - Personal/Family",
            "Legacy - Project",
            "Legacy - Role",
            "Legacy - Salary Conditions",
            "Legacy - Schedule",
            "Legacy - Security Condition",
            
            // Self withdrew
            "Self-Withdrew (Recruiter)",
            "Self-Withdrew (Portal)"
        ]
    },
    
    // Display order for charts and lists
    "displayOrder": [
        "Application Received",
        "Assessment Stage", 
        "Interview Stage",
        "Final Review",
        "Hired (Probation)",
        "Hired (Confirmed)",
        "Previously Applied (No Payment)",
        "Not Selected"
    ],
    
    // Payment milestones
    "paymentMilestones": {
        "Assessment Stage": {
            amount: 50,
            condition: "Candidate passes AI Interview assessment"
        },
        "Interview Stage": {
            amount: 50,
            condition: "Candidate passes AI Interview assessment"
        },
        "Final Review": {
            amount: 50,
            condition: "Candidate passes AI Interview assessment"
        },
        "Hired (Probation)": {
            amount: 50,
            condition: "Candidate passes AI Interview assessment"
        },
        "Hired (Confirmed)": {
            amount: 750,
            condition: "Candidate completes 90 days probation"
        }
    }
};

// Main Status Mapping Object (for backward compatibility)
const StatusMapping = {
    // Map status to simplified group based on comprehensive rules
    mapStatusToGroup: function(status, assessmentResult) {
        if (!status) return 'Application Received';
        
        // Search through all status groups to find a match
        for (const [groupName, statusList] of Object.entries(statusMapping.statusGroups)) {
            if (statusList.includes(status)) {
                return groupName;
            }
        }
        
        // Default fallback
        console.log('Status not found in mapping:', status);
        return 'Application Received';
    },
    
    // Get simplified status type for styling
    getSimplifiedStatusType: function(status, assessmentResult) {
        const group = this.mapStatusToGroup(status, assessmentResult);
        switch (group) {
            case 'Hired (Confirmed)': return 'confirmed';
            case 'Hired (Probation)': return 'probation';
            case 'Previously Applied (No Payment)': return 'previous';
            case 'Final Review': return 'assessment';
            case 'Interview Stage': return 'assessment';
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
    displayOrder: statusMapping.displayOrder
};

// Earnings structure with updated conditions
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

// Status examples for guide with correct colors
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
        status: "Interview Stage",
        description: "Candidate in interview process",
        action: "RM50 payment eligible",
        color: "#00d769"
    },
    {
        status: "Final Review",
        description: "Candidate in final review stage",
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
