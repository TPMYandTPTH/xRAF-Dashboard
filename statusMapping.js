// Status mapping configuration
const statusMapping = {
    "statusGroups": {
        "Hired (Confirmed)": ["Hired (Confirmed)", "New Starter (Hired)", "Graduate"],
        "Hired (Probation)": ["Hired (Probation)"],
        "Previously Applied (No Payment)": ["Previously Applied (No Payment)"],
        "Final Review": ["Final Review", "Ready to Offer", "Job Offer Presented", "Onboarding Started", "Cleared to Start"],
        "Interview Stage": ["Interview Stage", "Interview Scheduled", "Interview Complete / Offer Requested", "Second Interview Scheduled", "Second Interview Complete / Offer Requested", "Third Interview Scheduled", "Third Interview Complete / Offer Requested"],
        "Assessment Stage": ["Assessment Stage", "SHL Assessment: Conversational Multichat ENG", "SHL Assessment: Sales Competency ENG", "SHL Assessment: System Diagnostic ENG", "SHL Assessment: Typing ENG", "SHL Assessment: WriteX E-mail ENG", "Contact Attempt 1", "Contact Attempt 2", "Contact Attempt 3"],
        "Application Received": ["Application Received", "TextApply", "External Portal", "Internal Portal", "Recruiter Submitted", "Agency Submissions", "Employee Referral"],
        "Not Selected": [
            "Eliminated - Age", "Eliminated - Availability", "Eliminated - CV/Resume Analysis", "Eliminated - Did not start Assessment", 
            "Eliminated - Incomplete Assessment", "Eliminated - Language", "Eliminated - Location/Country", "Eliminated - No Hire List/Not Rehireable", 
            "Eliminated - Processed on another Requisition", "Eliminated - Unprocessed Candidate", "Eliminated - Unreachable/Unresponsive", 
            "Eliminated - WAH - Connectivity Requirements", "Eliminated - WAH - Technical Requirements", "Eliminated - Assessment Results Did Not Meet Criteria",
            "Eliminated - No Show", "Eliminated - No Show (Interview 1)", "Eliminated - No Show (Interview 2)", "Eliminated - No Show (Interview 3)",
            "Eliminated - Interview 1 Complete (Reject)", "Eliminated - Interview 2 Complete (Reject)", "Eliminated - Interview 3 Complete (Reject)",
            "Eliminated - Availability (Interview 1)", "Eliminated - Age (Pre-Offer)", "Eliminated - Age (Post Offer)", 
            "Eliminated - Employment Eligibility Verification", "Eliminated - Falsified Application", "Eliminated - Ineligible (Background)", 
            "Eliminated - Ineligible (Drug Test)", "Eliminated - Offer Rescinded (Pre-Offer)", "Eliminated - Offer Rescinded (Post Offer)", 
            "Eliminated - Unreachable/Unresponsive (Pre-Offer)", "Eliminated - Unreachable/Unresponsive (Post Offer)",
            "Withdrew - Country", "Withdrew - Location", "Withdrew - Long-Term Commitment", "Withdrew - No Reason Given", 
            "Withdrew - Other Job Offer", "Withdrew - Salary", "Withdrew - Schedule", "Withdrew - Job Fit (Interview 1)", 
            "Withdrew - Job Fit (Interview 2)", "Withdrew - Job Fit (Interview 3)", "Withdrew - Other Job Offer (Interview 1)", 
            "Withdrew - Other Job Offer (Interview 2)", "Withdrew - Other Job Offer (Interview 3)", "Withdrew - Personal/Family (Interview 1)",
            "Withdrew - Personal/Family (Interview 2)", "Withdrew - Personal/Family (Interview 3)", "Withdrew - Salary (Interview 1)",
            "Withdrew - Salary (Interview 2)", "Withdrew - Salary (Interview 3)", "Withdrew - Schedule (Interview 1)",
            "Withdrew - Schedule (Interview 2)", "Withdrew - Schedule (Interview 3)", "Withdrew - Medical (Pre-Offer)",
            "Withdrew - Medical (Post Offer)", "Withdrew - Offer Declined/Rejected", "Withdrew - Onboarding Incomplete",
            "Withdrew - Other Job Offer (Pre-Offer)", "Withdrew - Other Job Offer (Post Offer)", "Withdrew - Personal/Family (Pre-Offer)",
            "Withdrew - Personal/Family (Post Offer)", "Withdrew - Role (Pre-Offer)", "Withdrew - Role (Post Offer)",
            "Withdrew - Salary (Pre-Offer)", "Withdrew - Salary (Post Offer)", "Withdrew - Schedule (Pre-Offer)",
            "Withdrew - Schedule (Post Offer)", "Legacy - Age", "Legacy - Anonymous by GDPR", "Legacy - Availability",
            "Legacy - Behavior", "Legacy - Communication Skills", "Legacy - Criminal Record", "Legacy - CV Analysis",
            "Legacy - Education", "Legacy - Falsified Application", "Legacy - Invalid Phone Number", "Legacy - Language",
            "Legacy - Long-term Commitment", "Legacy - Motivation", "Legacy - No Hire List", "Legacy - No Show",
            "Legacy - Not Re-hirable", "Legacy - Recording Denied", "Legacy - Reference Check", "Legacy - Salary Expectation",
            "Legacy - Soft Skills", "Legacy - Unreachable", "Legacy - WAH - Connectivity Requirements", "Legacy - WAH - Contract",
            "Legacy - WAH - Technical Requirements", "Legacy - Work Permit", "Legacy - Country", "Legacy - Did Not Apply",
            "Legacy - Incomplete Assessment", "Legacy - Location", "Legacy - Medical", "Legacy - Negative Review of TP",
            "Legacy - No Reason Given", "Legacy - Other Job Offer", "Legacy - Personal/Family", "Legacy - Project",
            "Legacy - Role", "Legacy - Salary Conditions", "Legacy - Schedule", "Legacy - Security Condition",
            "Self-Withdrew (Recruiter)", "Self-Withdrew (Portal)"
        ]
    },
    "displayOrder": [
        "Hired (Confirmed)",
        "Hired (Probation)",
        "Previously Applied (No Payment)",
        "Final Review",
        "Interview Stage",
        "Assessment Stage",
        "Application Received",
        "Not Selected"
    ]
};

// Earnings structure
const earningsStructure = {
    assessment: {
        amount: 50,
        label: "Pass Assessment",
        description: "Paid when candidate passes assessment"
    },
    probation: { 
        amount: 750, 
        label: "Pass Probation (90 days)",
        description: "Paid only for new candidates who complete 90 days"
    }
};
