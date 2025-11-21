import { apiRequest } from "./queryClient";

export interface EmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await apiRequest("POST", "/api/email/send", {
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html
    });
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
}

export async function sendReferralInvitation(email: string, referralCode: string, referrerName: string): Promise<boolean> {
  const referralLink = window.location.origin + "/register?referralCode=" + referralCode;
  
  return sendEmail({
    to: email,
    subject: `${referrerName} invited you to join TaxStats Refer2Earn`,
    text: `Hello,\n\n${referrerName} has invited you to join TaxStats Refer2Earn. Use this referral link to sign up: ${referralLink}\n\nThanks,\nTaxStats Refer2Earn Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3B82F6; padding: 20px; text-align: center; color: white;">
          <h2>TaxStats Refer2Earn - Referral Invitation</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Hello,</p>
          <p><strong>${referrerName}</strong> has invited you to join TaxStats Refer2Earn!</p>
          <p>Use the button below to register with their referral link:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${referralLink}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600;">
              Join TaxStats Refer2Earn
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all;">
            ${referralLink}
          </p>
          <p>Thanks,<br>TaxStats Refer2Earn Support Team<br>support@taxstatsrefer2earn.com</p>
        </div>
      </div>
    `
  });
}

export async function sendReferralNotification(email: string, referrerName: string, refereeName: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `${refereeName} signed up using your referral code!`,
    text: `Hello ${referrerName},\n\n${refereeName} has signed up using your referral code. You'll receive rewards when they complete the required actions.\n\nThanks,\nTaxStats Refer2Earn Support Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3B82F6; padding: 20px; text-align: center; color: white;">
          <h2>Good News! 🎉</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Hello ${referrerName},</p>
          <p><strong>${refereeName}</strong> has signed up using your referral code!</p>
          <p>You'll receive rewards when they complete the required actions. Check your dashboard for updates on your referral status.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/dashboard" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600;">
              View Dashboard
            </a>
          </div>
          <p>Thanks,<br>TaxStats Refer2Earn Support Team<br>support@taxstatsrefer2earn.com</p>
        </div>
      </div>
    `
  });
}

export async function sendRewardNotification(email: string, userName: string, amount: number): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `You've earned a $${amount} reward! 🎊`,
    text: `Hello ${userName},\n\nCongratulations! You've earned a $${amount} reward from your referrals. Visit your dashboard to see details.\n\nThanks,\nTaxStats Refer2Earn Support Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3B82F6; padding: 20px; text-align: center; color: white;">
          <h2>You've Earned a Reward! 🎊</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Hello ${userName},</p>
          <p>Congratulations! You've earned a <strong>$${amount}</strong> reward from your referrals.</p>
          <p>Visit your dashboard to see details and track your earnings.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/rewards" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600;">
              View Rewards
            </a>
          </div>
          <p>Thanks,<br>TaxStats Refer2Earn Support Team<br>support@taxstatsrefer2earn.com</p>
        </div>
      </div>
    `
  });
}
