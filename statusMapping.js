const StatusMapping = {
    // Map status to simplified group based on rules
    mapStatusToGroup: function (status, assessmentResult) {
        if (!status) return 'Application Received';

        const statusStr = status.toLowerCase();

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

        // Previously Applied (No Payment) - ex-TP or re-applied candidates
        if (statusStr.includes('previously applied') || statusStr.includes('ex-tp')) {
            return 'Previously Applied (No Payment)';
        }

        // Default status - application received
        return 'Application Received';
    },

    // Get simplified status type for styling
    getSimplifiedStatusType: function (status, assessmentResult) {
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

    // Determine stage for display
    determineStage: function (status, assessmentResult) {
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
    ],

    // Status colors for display
    statusColors: {
        'Application Received': '#0087FF',  // Blue
        'Assessment Stage': '#00d769',  // Green Flash
        'Hired (Probation)': '#f5d200',  // Yellow
        'Hired (Confirmed)': '#84c98b',  // Green Light
        'Previously Applied (No Payment)': '#676767',  // Grey
        'Not Selected': '#dc3545'  // Red
    },

    // Earnings structure with conditions for payments
    earningsStructure: {
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
    }
};

// Example usage to map a status:
const exampleStatus = "Hired (Confirmed)";
console.log(StatusMapping.mapStatusToGroup(exampleStatus)); // Expected: "Hired (Confirmed)"
console.log(StatusMapping.getSimplifiedStatusType(exampleStatus)); // Expected: "passed"
