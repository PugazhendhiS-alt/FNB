async function sendOtpSms(phone, otp, username) {
  const config = {
    provider: process.env.SMS_PROVIDER || 'log',
    apiKey: process.env.SMS_API_KEY || '',
    senderId: process.env.SMS_SENDER_ID || 'POSAPP',
  };

  if (config.provider === 'twilio') {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (accountSid && authToken) {
      try {
        const twilio = require('twilio');
        const client = twilio(accountSid, authToken);
        await client.messages.create({
          body: `Your POS System OTP is: ${otp}. Valid for 10 minutes.`,
          from: process.env.TWILIO_PHONE || config.senderId,
          to: phone,
        });
        return;
      } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
          console.log('[SMS] Twilio package not installed. Install with: npm install twilio');
        } else {
          console.error('[SMS] Twilio send failed:', err.message);
        }
      }
    }
  }

  if (config.provider === 'log' || !config.apiKey) {
    if (!process.env.SMTP_HOST && !process.env.TWILIO_ACCOUNT_SID) {
      console.log(`[SMS] To: ${phone}, OTP: ${otp}, User: ${username} (no SMS provider configured - logged to console)`);
    }
  }
}

module.exports = { sendOtpSms };