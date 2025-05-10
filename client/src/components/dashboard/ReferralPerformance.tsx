import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getReferralStats } from "@/lib/referral";
import { Loader2 } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

// Simulated chart data
const generateChartData = (totalReferrals: number, successfulReferrals: number) => {
  const currentMonth = new Date().getMonth();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Starting with a base rate, gradually build up to current totals
  const baseSignups = Math.max(1, Math.floor(totalReferrals * 0.2));
  const baseConversions = Math.max(0, Math.floor(successfulReferrals * 0.1));
  const baseRewards = Math.max(0, Math.floor(successfulReferrals * 5));
  
  return months.slice(0, currentMonth + 1).map((month, index) => {
    const progress = index / currentMonth || 0;
    
    // More recent months have more activity
    const factor = 0.2 + 0.8 * progress;
    
    // Random fluctuation for natural looking graph
    const randomFactor = 0.7 + Math.random() * 0.6;
    
    const signups = Math.floor(baseSignups * factor * randomFactor);
    
    // Conversions are a percentage of signups
    const conversionRate = 0.15 + 0.2 * progress; // Conversion rate improves over time
    const conversions = Math.floor(signups * conversionRate * randomFactor);
    
    // Each conversion is worth a fixed amount
    const rewardPerConversion = 50;
    const rewards = conversions * rewardPerConversion;
    
    return {
      name: month,
      Signups: signups,
      Conversions: conversions,
      Rewards: rewards
    };
  });
};

const ReferralPerformance: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/summary'],
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
      <div className="bg-red-50 text-red-600 p-4 rounded-lg h-64 flex items-center justify-center">
        <p>Error loading performance data. Please try again later.</p>
      </div>
    );
  }
  
  const chartData = generateChartData(
    stats?.totalReferrals || 0,
    stats?.successfulReferrals || 0
  );

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="Signups"
            stroke="#3B82F6"
            activeDot={{ r: 8 }}
          />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="Conversions" 
            stroke="#10B981" 
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="Rewards" 
            stroke="#8B5CF6" 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReferralPerformance;
