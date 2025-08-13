// API Service Module - Power Automate Integration (Simplified)
const ApiService = (function() {
    const POWER_AUTOMATE_URL = 'https://prod-77.southeastasia.logic.azure.com:443/workflows/3dcf20be6af641a4b49eb48727473a47/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=uVigg-lTLRaUgLgUdGUnqCt9-TWJC7E7c8ryTjLC0Hw';

    // Main function to fetch referrals
    async function fetchReferrals(phone, email) {
        try {
            const response = await fetch(POWER_AUTOMATE_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone, email })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Handle different response formats
            let referrals = [];
            if (Array.isArray(data)) {
                referrals = data;
            } else if (data.referrals && Array.isArray(data.referrals)) {
                referrals = data.referrals;
            } else if (data.value && Array.isArray(data.value)) {
                referrals = data.value;
            }
            
            return referrals;
            
        } catch (error) {
            console.error('Error fetching referrals:', error);
            return [];
        }
    }

    // Test connectivity
    async function testConnection() {
        try {
            const response = await fetch(POWER_AUTOMATE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone: 'test', email: 'test@test.com' })
            });
            
            console.log('Test response status:', response.status);
            
            if (response.ok) {
                console.log('✓ Connection successful');
                return { success: true };
            } else {
                console.log('✗ Connection failed');
                return { success: false, error: `HTTP ${response.status}` };
            }
            
        } catch (error) {
            console.error('✗ Connection failed:', error);
            return { success: false, error: error.message };
        }
    }

    return { 
        fetchReferrals,
        testConnection
    };
})();
