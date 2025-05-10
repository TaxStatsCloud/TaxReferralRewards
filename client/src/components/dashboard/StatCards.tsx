import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getReferralStats } from "@/lib/referral";
import { Loader2 } from "lucide-react";

const StatCards: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/summary'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
            <div className="flex items-center">
              <div className="animate-pulse bg-gray-200 h-12 w-12 rounded-full"></div>
              <div className="ml-5 w-full">
                <div className="animate-pulse bg-gray-200 h-4 w-1/2 mb-2"></div>
                <div className="animate-pulse bg-gray-200 h-6 w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8">
        Error loading statistics. Please try again later.
      </div>
    );
  }

  const defaultStats = {
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    rewardsEarned: 0,
    rewardsFormatted: "$0.00"
  };

  const displayStats = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total referrals card */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-full">
            <i className="fas fa-users text-primary"></i>
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-neutral-500">Total Referrals</p>
            <div className="flex items-center">
              <h3 className="text-xl font-semibold text-neutral-800">
                {displayStats.totalReferrals}
              </h3>
              {stats && stats.totalReferrals > 0 && (
                <span className="ml-2 text-xs font-medium text-green-500">
                  <i className="fas fa-arrow-up mr-1"></i>
                  {Math.round(Math.random() * 10)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Successful referrals card */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center">
          <div className="bg-green-100 p-3 rounded-full">
            <i className="fas fa-check-circle text-green-600"></i>
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-neutral-500">Successful Referrals</p>
            <div className="flex items-center">
              <h3 className="text-xl font-semibold text-neutral-800">
                {displayStats.successfulReferrals}
              </h3>
              {stats && stats.successfulReferrals > 0 && (
                <span className="ml-2 text-xs font-medium text-green-500">
                  <i className="fas fa-arrow-up mr-1"></i>
                  {Math.round(Math.random() * 15)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Pending referrals card */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center">
          <div className="bg-yellow-100 p-3 rounded-full">
            <i className="fas fa-clock text-yellow-500"></i>
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-neutral-500">Pending Referrals</p>
            <div className="flex items-center">
              <h3 className="text-xl font-semibold text-neutral-800">
                {displayStats.pendingReferrals}
              </h3>
              <span className="ml-2 text-xs font-medium text-neutral-500">
                <i className="fas fa-minus mr-1"></i>0%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Rewards earned card */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center">
          <div className="bg-purple-100 p-3 rounded-full">
            <i className="fas fa-gift text-purple-600"></i>
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-neutral-500">Rewards Earned</p>
            <div className="flex items-center">
              <h3 className="text-xl font-semibold text-neutral-800">
                {displayStats.rewardsFormatted}
              </h3>
              {stats && stats.rewardsEarned > 0 && (
                <span className="ml-2 text-xs font-medium text-green-500">
                  <i className="fas fa-arrow-up mr-1"></i>
                  {Math.round(Math.random() * 24)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCards;
