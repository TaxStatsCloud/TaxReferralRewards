import { apiRequest } from "./queryClient";

// Generate a unique referral link based on username and some random characters
export function generateReferralLink(username: string, referralCode: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/register?referralCode=${referralCode}`;
}

// Extract referral code from URL
export function extractReferralCodeFromUrl(): string | null {
  const urlSearchParams = new URLSearchParams(window.location.search);
  return urlSearchParams.get('referralCode');
}

// Copy referral link to clipboard
export function copyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => resolve(true))
        .catch((err) => {
          console.error('Could not copy text: ', err);
          resolve(false);
        });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Make the textarea out of viewport
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        resolve(successful);
      } catch (err) {
        console.error('Could not copy text: ', err);
        resolve(false);
      }
      
      document.body.removeChild(textArea);
    }
  });
}

// Share referral link to social media
export function shareToSocialMedia(platform: string, referralLink: string, message: string): void {
  let shareUrl = '';
  
  switch (platform.toLowerCase()) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(message)}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
      break;
    case 'email':
      shareUrl = `mailto:?subject=${encodeURIComponent('Join TaxStats with my referral link')}&body=${encodeURIComponent(message + '\n\n' + referralLink)}`;
      break;
    default:
      console.error('Unsupported platform');
      return;
  }
  
  window.open(shareUrl, '_blank');
}

// Generate QR code for referral link (using a third-party service)
export function getQRCodeUrl(text: string, size: number = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
}

// Register a user via referral
export async function registerViaReferral(referralCode: string, userData: any) {
  try {
    const response = await apiRequest(
      "POST", 
      "/api/register/via-referral", 
      { referralCode, ...userData }
    );
    
    return { success: true, data: await response.json() };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error };
  }
}

// Get referral statistics
export async function getReferralStats() {
  try {
    const response = await apiRequest("GET", "/api/analytics/summary", undefined);
    return await response.json();
  } catch (error) {
    console.error("Could not fetch referral stats:", error);
    throw error;
  }
}

// Get all user referrals
export async function getUserReferrals() {
  try {
    const response = await apiRequest("GET", "/api/referrals/me", undefined);
    return await response.json();
  } catch (error) {
    console.error("Could not fetch referrals:", error);
    throw error;
  }
}

// For admin: get all referrals
export async function getAllReferrals() {
  try {
    const response = await apiRequest("GET", "/api/referrals", undefined);
    return await response.json();
  } catch (error) {
    console.error("Could not fetch all referrals:", error);
    throw error;
  }
}

// Update referral status (admin)
export async function updateReferralStatus(referralId: number, status: string, refereeId?: number) {
  try {
    const response = await apiRequest(
      "PATCH", 
      `/api/referrals/${referralId}/status`, 
      { status, refereeId }
    );
    return await response.json();
  } catch (error) {
    console.error("Could not update referral status:", error);
    throw error;
  }
}
