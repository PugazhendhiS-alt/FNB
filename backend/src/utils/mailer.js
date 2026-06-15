const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendOtpEmail(email, otp, username) {
  const transport = getTransporter();
  if (transport) {
    await transport.sendMail({
      from: process.env.SMTP_FROM || '"POS System" <noreply@pos-system.com>',
      to: email,
      subject: 'Your OTP Code - POS System',
      html: `
        <div style="font-family: Arial; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #2563eb;">POS System</h2>
          <p>Hello ${username},</p>
          <p>Your one-time password (OTP) for login is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; 
                      background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            ${otp}
          </div>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p style="color: #6b7280; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });
  }
  console.log(`[OTP] Email: ${email}, Code: ${otp} (SMTP not configured - logged to console)`);
}

module.exports = { sendOtpEmail };