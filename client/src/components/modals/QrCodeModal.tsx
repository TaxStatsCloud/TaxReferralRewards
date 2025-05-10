import React from "react";
import { Button } from "@/components/ui/button";

interface QrCodeModalProps {
  open: boolean;
  onClose: () => void;
  referralLink: string;
  qrCodeUrl: string;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ open, onClose, referralLink, qrCodeUrl }) => {
  if (!open) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'referral-qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="qr-code-modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-neutral-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-neutral-900" id="qr-code-modal-title">
                  Your Referral QR Code
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-neutral-500">
                    Share this QR code to let others scan and sign up through your referral link.
                  </p>
                  
                  <div className="mt-4 flex justify-center">
                    <div className="w-64 h-64 bg-white flex items-center justify-center border border-neutral-200">
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code for referral" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-xs text-neutral-500 break-all">
                      {referralLink}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              onClick={handleDownload}
              className="w-full inline-flex justify-center sm:ml-3 sm:w-auto sm:text-sm"
            >
              Download QR Code
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodeModal;
