const nodemailer = require('nodemailer');

/**
 * Reusable helper to send emails via Gmail SMTP.
 * Reads credentials dynamically from process.env.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[Email Notice (Log Mode)] To: ${to} | Subject: ${subject}`);
    console.log(`Content:\n${text || html}\n`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Rentica Moderation" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${to}:`, error.message);
  }
};

/**
 * Sends notification when a listing goes into Awaiting Review / High Risk queue
 */
const sendUnderReviewEmail = async (userEmail, userName, listingTitle, reasons = []) => {
  const reasonText = reasons.length > 0 ? reasons.map(r => `• ${r}`).join('\n') : '• Pending standard automated verification review.';
  
  const subject = `[Rentica] Your listing "${listingTitle}" is currently under review`;
  const text = `Hi ${userName},\n\nThank you for creating a vehicle listing for "${listingTitle}" on Rentica.\n\nYour listing is currently under moderation review by our team and has not been published to the public marketplace yet.\n\nReasons for review:\n${reasonText}\n\nOur moderation team will review your vehicle details shortly. You will receive an email update once the review is complete.\n\nBest regards,\nRentica Moderation Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; rounded: 10px;">
      <h2 style="color: #4f46e5;">Rentica Vehicle Listing Under Review</h2>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Thank you for listing <strong>${listingTitle}</strong> on Rentica.</p>
      <p>Your listing is currently in our <strong>Awaiting Review</strong> queue and has not been published to the public marketplace yet.</p>
      <div style="background-color: #fff8e1; border-left: 4px solid #ffa000; padding: 12px; margin: 15px 0;">
        <strong>Moderation Notes:</strong>
        <p style="margin: 5px 0 0 0;">${reasons.length > 0 ? reasons.join('<br>• ') : 'Pending automated security verification.'}</p>
      </div>
      <p>Our team will review your submission shortly. You will receive an update as soon as moderation is complete.</p>
      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777777;">Rentica Automated Moderation System</p>
    </div>
  `;

  await sendEmail({ to: userEmail, subject, text, html });
};

/**
 * Sends notification when an Admin rejects a listing
 */
const sendListingRejectedEmail = async (userEmail, userName, listingTitle, rejectionReason) => {
  const reasonStr = rejectionReason || 'Listing did not meet Rentica verification guidelines.';

  const subject = `[Rentica] Action Required: Your listing "${listingTitle}" was rejected`;
  const text = `Hi ${userName},\n\nWe are writing to inform you that your listing for "${listingTitle}" was not approved for publication on Rentica.\n\nReason for Rejection:\n"${reasonStr}"\n\nYou can update your listing details or upload proper documents from your Owner Dashboard to resubmit for review.\n\nBest regards,\nRentica Moderation Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; rounded: 10px;">
      <h2 style="color: #dc2626;">Listing Moderation Update</h2>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Your listing for <strong>${listingTitle}</strong> was not approved for publication on Rentica.</p>
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 15px 0; color: #991b1b;">
        <strong>Reason for Rejection:</strong>
        <p style="margin: 5px 0 0 0;">${reasonStr}</p>
      </div>
      <p>You can edit your listing details or upload clear photos from your Owner Dashboard to resubmit for review.</p>
      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777777;">Rentica Moderation Team</p>
    </div>
  `;

  await sendEmail({ to: userEmail, subject, text, html });
};

/**
 * Sends notification when an Admin approves a listing
 */
const sendListingApprovedEmail = async (userEmail, userName, listingTitle) => {
  const subject = `[Rentica] Great news! Your listing "${listingTitle}" is live`;
  const text = `Hi ${userName},\n\nGreat news! Your vehicle listing for "${listingTitle}" has been approved and is now live on the Rentica marketplace.\n\nBest regards,\nRentica Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; rounded: 10px;">
      <h2 style="color: #16a34a;">Your Listing is Live!</h2>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Great news! Your vehicle listing for <strong>${listingTitle}</strong> has passed moderation and is now <strong>LIVE</strong> on the Rentica marketplace.</p>
      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777777;">Rentica Marketplace Team</p>
    </div>
  `;

  await sendEmail({ to: userEmail, subject, text, html });
};

module.exports = {
  sendEmail,
  sendUnderReviewEmail,
  sendListingRejectedEmail,
  sendListingApprovedEmail
};

