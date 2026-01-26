/**
 * authService.js - OTP Authentication Service
 * Updated: January 2026 - Email-only authentication
 */

const AuthService = {
    
    state: {
        currentOTP: null,
        otpExpiry: null,
        email: null
    },
    
    config: {
        otpLength: 6,
        expiryMinutes: 5,
        debugMode: true,
        webhookUrl: "https://23a7afdc1481eef092e7eca1366142.95.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/e1583b4aa1f140df8402c75d18538409/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Ez5KgWgv8BE8tsS1YC0vCBa6BEOuB7cN2bN0lg0ddC0"
    },
    
    generateOTP() {
        let otp = '';
        for (let i = 0; i < this.config.otpLength; i++) {
            otp += Math.floor(Math.random() * 10);
        }
        return otp;
    },
    
    async requestOTP(email) {
        this.state.email = email;
        
        // Demo mode: use fixed OTP "123456" for amr@tp.com
        if (email.toLowerCase() === 'amr@tp.com') {
            this.state.currentOTP = '123456';
        } else {
            this.state.currentOTP = this.generateOTP();
        }
        
        const now = new Date();
        this.state.otpExpiry = new Date(now.getTime() + this.config.expiryMinutes * 60000);
        
        return await this.sendOTPEmail(email, this.state.currentOTP);
    },
    
    verifyOTP(inputOTP) {
        if (!this.state.currentOTP) {
            return { success: false, message: 'No OTP requested. Please try again.' };
        }
        
        const now = new Date();
        if (now > this.state.otpExpiry) {
            return { success: false, message: 'OTP has expired. Please request a new one.' };
        }
        
        if (inputOTP === this.state.currentOTP) {
            this.state.currentOTP = null;
            return { success: true, message: 'Verification successful' };
        }
        
        return { success: false, message: 'Invalid OTP. Please try again.' };
    },
    
    async sendOTPEmail(email, otp) {
        if (this.config.debugMode) {
            console.log(`[DEV] Webhook would send to: ${this.config.webhookUrl}`);
            console.log(`[DEV] Email: ${email}, OTP: ${otp}`);
        }
        
        if (!this.config.webhookUrl || this.config.webhookUrl.includes('...')) {
            console.warn('⚠️ Power Automate URL not configured.');
            return true;
        }
        
        try {
            const response = await fetch(this.config.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    otp: otp
                })
            });
            
            if (!response.ok) {
                console.error('Power Automate Error:', response.statusText);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Network Error:', error);
            return false;
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}
