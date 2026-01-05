/**
 * authService.js - OTP Authentication Service
 * Handles OTP generation, validation, and email delivery via Power Automate
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
        // Power Automate webhook URL for sending OTP emails
        webhookUrl: "https://d8855a0b6453e4089c94add3719cb2.9c.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c30686246ea248f8b2e47e50e030f615/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=9UqQ_qRyKs4cYJgmAnZ-RrUNp12iP29c9uBLgfJQbpQ"
    },
    
    /**
     * Generate a random OTP code
     * @returns {string} Generated OTP
     */
    generateOTP() {
        let otp = '';
        for (let i = 0; i < this.config.otpLength; i++) {
            otp += Math.floor(Math.random() * 10);
        }
        return otp;
    },
    
    /**
     * Request an OTP for a specific email
     * @param {string} email - User's email address
     * @returns {Promise<boolean>} Success status
     */
    async requestOTP(email) {
        this.state.email = email;
        this.state.currentOTP = this.generateOTP();
        
        const now = new Date();
        this.state.otpExpiry = new Date(now.getTime() + this.config.expiryMinutes * 60000);
        
        // Send OTP via Power Automate
        return await this.sendOTPEmail(email, this.state.currentOTP);
    },
    
    /**
     * Verify the provided OTP
     * @param {string} inputOTP - OTP entered by user
     * @returns {object} { success: boolean, message: string }
     */
    verifyOTP(inputOTP) {
        if (!this.state.currentOTP) {
            return { success: false, message: 'No OTP requested. Please try again.' };
        }
        
        const now = new Date();
        if (now > this.state.otpExpiry) {
            return { success: false, message: 'OTP has expired. Please request a new one.' };
        }
        
        if (inputOTP === this.state.currentOTP) {
            // Clear OTP after successful verification
            this.state.currentOTP = null;
            return { success: true, message: 'Verification successful' };
        }
        
        return { success: false, message: 'Invalid OTP. Please try again.' };
    },
    
    /**
     * Send OTP via Power Automate Webhook
     * @param {string} email - Recipient email
     * @param {string} otp - Generated OTP code
     * @returns {Promise<boolean>} Success status
     */
    async sendOTPEmail(email, otp) {
        if (this.config.debugMode) {
            console.log(`[DEV] Webhook would send to: ${this.config.webhookUrl}`);
            console.log(`[DEV] Email: ${email}, OTP: ${otp}`);
        }
        
        // Check if webhook URL is configured
        if (!this.config.webhookUrl || this.config.webhookUrl.includes('...')) {
            console.warn('⚠️ Power Automate URL not configured. Check authService.js');
            return true; // Return true in dev mode to allow testing
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}
