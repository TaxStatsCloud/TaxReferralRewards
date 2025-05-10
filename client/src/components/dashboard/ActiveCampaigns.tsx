import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";

const ActiveCampaigns: React.FC = () => {
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['/api/campaigns/active'],
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Error loading campaigns. Please try again later.
      </div>
    );
  }

  // If no active campaigns, show placeholder
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="space-y-4">
        <div className="border border-neutral-200 rounded-lg p-8 text-center">
          <h3 className="font-medium text-neutral-800 mb-2">No Active Campaigns</h3>
          <p className="text-sm text-neutral-500 mb-4">
            Check back soon for special referral promotions and earn extra rewards!
          </p>
        </div>
        
        {/* Default campaigns for visualization */}
        <div className="border border-neutral-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-neutral-800">Standard Referral Program</h3>
              <p className="text-sm text-neutral-500 mt-1">Earn $50 for each successful referral</p>
            </div>
            <span className="px-2 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              Active
            </span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-neutral-500">Progress</span>
              <span className="text-neutral-700 font-medium">
                {campaigns?.length === 0 ? '0' : '0'} referrals
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: "0%" }}></div>
            </div>
          </div>
          <div className="mt-3 text-xs text-neutral-500">
            Ongoing program
          </div>
        </div>
        
        <Link href="/referrals" className="block text-center text-sm font-medium text-primary hover:text-primary-dark mt-2">
          Start Referring Friends <i className="fas fa-arrow-right ml-1"></i>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign: any) => {
        // Calculate campaign progress percentage
        const startDate = new Date(campaign.startDate);
        const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
        const now = new Date();
        
        let progressPercentage = 0;
        if (endDate) {
          const totalDuration = endDate.getTime() - startDate.getTime();
          const elapsed = now.getTime() - startDate.getTime();
          progressPercentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        } else {
          // For ongoing campaigns, show a fixed progress
          progressPercentage = 65;
        }
        
        // Calculate days remaining
        let daysRemaining = 0;
        if (endDate) {
          const msPerDay = 24 * 60 * 60 * 1000;
          daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / msPerDay));
        }
        
        return (
          <div key={campaign.id} className="border border-neutral-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-neutral-800">{campaign.name}</h3>
                <p className="text-sm text-neutral-500 mt-1">{campaign.description}</p>
              </div>
              <span className="px-2 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-500">Progress</span>
                <span className="text-neutral-700 font-medium">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="mt-3 text-xs text-neutral-500">
              {endDate ? (
                <>Ends in: <span className="font-medium">{daysRemaining} days</span></>
              ) : (
                "Ongoing campaign"
              )}
            </div>
          </div>
        );
      })}
      
      <Link href="/campaigns" className="block text-center text-sm font-medium text-primary hover:text-primary-dark mt-2">
        View All Campaigns <i className="fas fa-arrow-right ml-1"></i>
      </Link>
    </div>
  );
};

export default ActiveCampaigns;
