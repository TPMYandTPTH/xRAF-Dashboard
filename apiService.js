const ApiService = (function() {
    const POWER_AUTOMATE_URL = 'https://prod-77.southeastasia.logic.azure.com:443/workflows/3dcf20be6af641a4b49eb48727473a47/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=uVigg-lTLRaUgLgUdGUnqCt9-TWJC7E7c8ryTjLC0Hw';

    async function fetchReferrals(phone, email) {
        try {
            const response = await fetch(POWER_AUTOMATE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, email })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Power Automate Error: ${response.status} - ${errorText}`);
            }

            return await response.json();
            
        } catch (error) {
            console.error('Error fetching referrals:', error);
            return [];
        }
    }

    return { fetchReferrals };
})();
