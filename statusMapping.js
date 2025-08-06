const StatusMapping = {
    mapStatusToGroup: function(status) {
        if (!status) return 'Application Received';
        
        const statusStr = status.toLowerCase();
        
        // Hired (Confirmed)
        if (statusStr.includes('confirmed') || statusStr.includes('graduate')) {
            return 'Hired (Confirmed)';
        }
        
        // Hired (Probation)
        if (statusStr.includes('probation') || statusStr.includes('new starter')) {
            return 'Hired (Probation)';
        }
        
        // Previously Applied (No Payment)
        if (statusStr.includes('previously applied') || statusStr.includes('no payment')) {
            return 'Previously Applied (No Payment)';
        }
        
        // Final Review
        if (statusStr.includes('final review') || statusStr.includes('ready to offer') || 
            statusStr.includes('onboarding') || statusStr.includes('cleared to start')) {
            return 'Final Review';
        }
        
        // Interview Stage
        if (statusStr.includes('interview') || statusStr.includes('offer requested')) {
            return 'Interview Stage';
        }
        
        // Assessment Stage
        if (statusStr.includes('assessment') || statusStr.includes('shl') || 
            statusStr.includes('external portal')) {
            return 'Assessment Stage';
        }
        
        // Application Received
        if (statusStr.includes('application received') || statusStr.includes('contact attempt')) {
            return 'Application Received';
        }
        
        // Not Selected
        return 'Not Selected';
    },

    getSimplifiedStatusType: function(status) {
        const group = this.mapStatusToGroup(status);
        switch (group) {
            case 'Hired (Confirmed)': return 'passed';
            case 'Hired (Probation)': return 'probation';
            case 'Previously Applied (No Payment)': return 'previously-applied';
            case 'Final Review': return 'operations';
            case 'Interview Stage': return 'talent';
            case 'Assessment Stage': return 'assessment';
            case 'Application Received': return 'received';
            case 'Not Selected': return 'failed';
            default: return 'received';
        }
    },
    
    determineStage: function(status) {
        return this.mapStatusToGroup(status);
    },
    
    displayOrder: [
        'Application Received',
        'Assessment Stage',
        'Interview Stage',
        'Final Review',
        'Hired (Probation)',
        'Hired (Confirmed)',
        'Previously Applied (No Payment)',
        'Not Selected'
    ]
};

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
