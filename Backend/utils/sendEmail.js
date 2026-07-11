const axios = require("axios");

/**
 * Sends a transactional email using Brevo (Sendinblue) REST API.
 * Docs: https://developers.brevo.com/reference/sendtransacemail
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: process.env.SENDER_NAME || "Local Shops Finder",
          email: process.env.SENDER_EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return true;
  } catch (err) {
    console.error("Brevo email error:", err.response?.data || err.message);
    throw new Error("Failed to send email");
  }
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const otpEmailTemplate = (name, otp, purpose) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border:1px solid #e5e5e5; border-radius:10px; overflow:hidden;">
    <div style="background:#146356; padding:20px; text-align:center;">
      <h2 style="color:#fff; margin:0;">Local Shops Finder</h2>
    </div>
    <div style="padding:24px; color:#222;">
      <p>Hi ${name || "there"},</p>
      <p>${purpose}</p>
      <div style="text-align:center; margin:24px 0;">
        <span style="font-size:32px; letter-spacing:8px; font-weight:bold; color:#146356;">${otp}</span>
      </div>
      <p>This code will expire in ${process.env.OTP_EXPIRES_MINUTES || 10} minutes. If you didn't request this, you can safely ignore this email.</p>
      <p style="margin-top:32px; color:#888; font-size:12px;">— Local Shops Finder Team</p>
    </div>
  </div>
`;

module.exports = { sendEmail, generateOtp, otpEmailTemplate };
