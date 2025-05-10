import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { copyToClipboard, shareToSocialMedia, getQRCodeUrl } from "@/lib/referral";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import QrCodeModal from "@/components/modals/QrCodeModal";

const ReferralLinkGenerator: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [showQrModal, setShowQrModal] = useState(false);
  
  if (!currentUser) {
    return null;
  }
  
  const referralCode = currentUser.referralCode;
  const referralLink = `${window.location.origin}/register?referralCode=${referralCode}`;
  
  const handleCopyLink = async () => {
    const success = await copyToClipboard(referralLink);
    
    if (success) {
      toast({
        title: "Link copied!",
        description: "You can now share it with your network.",
        variant: "default",
      });
    } else {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually.",
        variant: "destructive",
      });
    }
  };
  
  const handleShare = (platform: string) => {
    const message = `Join TaxStats using my referral link and we'll both earn rewards!`;
    shareToSocialMedia(platform, referralLink, message);
  };
  
  return (
    <>
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-medium text-neutral-800 mb-4">Your Referral Link</h2>
        <p className="text-sm text-neutral-600 mb-4">
          Share this unique link with your network to earn rewards when they sign up for TaxStats.
        </p>
        
        <div className="flex items-stretch space-x-2">
          <div className="flex-grow relative">
            <Input 
              id="referral-link" 
              value={referralLink}
              readOnly
              className="pr-10"
            />
            <button 
              id="copy-link-btn" 
              onClick={handleCopyLink}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
            >
              <i className="fas fa-copy"></i>
            </button>
          </div>
          <div className="inline-flex">
            <Button 
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center px-4 py-2"
            >
              <i className="fas fa-qrcode mr-2"></i>
              QR Code
            </Button>
          </div>
        </div>
        
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <button 
            onClick={() => handleShare('facebook')}
            className="inline-flex justify-center items-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <i className="fab fa-facebook text-blue-600 mr-2"></i>
            Facebook
          </button>
          
          <button 
            onClick={() => handleShare('twitter')}
            className="inline-flex justify-center items-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <i className="fab fa-twitter text-blue-400 mr-2"></i>
            Twitter
          </button>
          
          <button 
            onClick={() => handleShare('linkedin')}
            className="inline-flex justify-center items-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <i className="fab fa-linkedin text-blue-700 mr-2"></i>
            LinkedIn
          </button>
          
          <button 
            onClick={() => handleShare('email')}
            className="inline-flex justify-center items-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <i className="fas fa-envelope text-neutral-500 mr-2"></i>
            Email
          </button>
        </div>
      </div>
      
      <QrCodeModal 
        open={showQrModal}
        onClose={() => setShowQrModal(false)}
        referralLink={referralLink}
        qrCodeUrl={getQRCodeUrl(referralLink, 300)}
      />
    </>
  );
};

export default ReferralLinkGenerator;
