

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
  
        webhookUrl: "https://d8855a0b6453e4089c94add3719cb2.9c.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c30686246ea248f8b2e47e50e030f615/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=9UqQ_qRyKs4cYJgmAnZ-RrUNp12iP29c9uBLgfJQbpQ"
    },

    
    generateOTP() {
        let otp = '';
        for (let i = 0; i < this.config.otpLength; i++) {
            otp += Math.floor(Math.random() * 10);
        }
        return otp;
    },

    /**
     * Request an OTP for a specific email
     * @param {string} email 
     * @returns {Promise<boolean>} success
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
     * @param {string} inputOTP 
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
            // clear OTP after success
            this.state.currentOTP = null;
            return { success: true, message: 'Verification successful' };
        }

        return { success: false, message: 'Invalid OTP. Please try again.' };
    },

    /**
     * Send OTP via Power Automate Webhook
     */
    async sendOTPEmail(email, otp) {
        if (this.config.debugMode) {
            console.log(`[DEV] Webhook would send to: ${this.config.webhookUrl}`);
            console.log(`[DEV] Email: ${email}, OTP: ${otp}`);
        }


        if (!this.config.webhookUrl || this.config.webhookUrl.includes('...')) {
            console.warn('⚠️ Power Automate URL not configured. Check authService.js');

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
