import React from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import StatCards from "@/components/dashboard/StatCards";
import ReferralLinkGenerator from "@/components/dashboard/ReferralLinkGenerator";
import ReferralActivity from "@/components/dashboard/ReferralActivity";
import ReferralPerformance from "@/components/dashboard/ReferralPerformance";
import ActiveCampaigns from "@/components/dashboard/ActiveCampaigns";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  
  const handleShareReferralLink = () => {
    const referralLink = document.getElementById('referral-link') as HTMLInputElement;
    if (referralLink) {
      referralLink.select();
      document.execCommand('copy');
      
      // Scroll to the referral link generator section
      const referralLinkGenerator = document.getElementById('referral-link-generator');
      if (referralLinkGenerator) {
        referralLinkGenerator.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  return (
    <Layout>
      <PageHeader title="Dashboard">
        <Button variant="outline" className="px-4 py-2">
          <i className="fas fa-calendar-alt mr-2"></i>
          This Month
        </Button>
        <Button onClick={handleShareReferralLink} className="px-4 py-2">
          <i className="fas fa-share-alt mr-2"></i>
          Share Referral Link
        </Button>
      </PageHeader>
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Statistics Cards */}
        <StatCards />
        
        {/* Referral Link Generator */}
        <div id="referral-link-generator">
          <ReferralLinkGenerator />
        </div>
        
        {/* Referral Activity */}
        <ReferralActivity />
        
        {/* Performance & Campaigns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
            <h2 className="text-lg font-medium text-neutral-800 mb-4">Referral Performance</h2>
            <ReferralPerformance />
            
            {/* Chart legend */}
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-primary inline-block mr-2"></span>
                <span className="text-sm text-neutral-600">Signups</span>
              </div>
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-green-500 inline-block mr-2"></span>
                <span className="text-sm text-neutral-600">Conversions</span>
              </div>
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-purple-500 inline-block mr-2"></span>
                <span className="text-sm text-neutral-600">Rewards</span>
              </div>
            </div>
          </div>
          
          {/* Active Campaigns */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
            <h2 className="text-lg font-medium text-neutral-800 mb-4">Active Campaigns</h2>
            <ActiveCampaigns />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
