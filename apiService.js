// API Service Module - Ultra Simple Version
const ApiService = (function() {
    const POWER_AUTOMATE_URL = 'https://prod-77.southeastasia.logic.azure.com:443/workflows/3dcf20be6af641a4b49eb48727473a47/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=uVigg-lTLRaUgLgUdGUnqCt9-TWJC7E7c8ryTjLC0Hw';

    async function fetchReferrals(phone, email) {
        console.log('🔄 Calling Power Automate...');
        console.log('📞 Phone:', phone);
        console.log('📧 Email:', email);
        console.log('🌐 URL:', POWER_AUTOMATE_URL);
        
        try {
            console.log('⚡ Making fetch request...');
            
            const response = await fetch(POWER_AUTOMATE_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    phone: phone, 
                    email: email 
                })
            });
            
            console.log('📡 Response received');
            console.log('✅ Status:', response.status);
            console.log('✅ Status Text:', response.statusText);
            console.log('✅ Headers:', response.headers);
            
            if (!response.ok) {
                console.error('❌ Response not OK:', response.status, response.statusText);
                return [];
            }
            
            const text = await response.text();
            console.log('📄 Raw response text:', text);
            
            let data;
            try {
                data = JSON.parse(text);
                console.log('✅ Parsed JSON:', data);
            } catch (e) {
                console.error('❌ JSON parse error:', e);
                return [];
            }
            
            // Extract referrals
            let referrals = [];
            if (Array.isArray(data)) {
                referrals = data;
            } else if (data && data.referrals) {
                referrals = data.referrals;
            } else if (data && data.value) {
                referrals = data.value;
            }
            
            console.log('📋 Extracted referrals:', referrals);
            return referrals;
            
        } catch (error) {
            console.error('💥 Fetch error:', error);
            console.error('💥 Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            return [];
        }
    }

    return { fetchReferrals };
})();
