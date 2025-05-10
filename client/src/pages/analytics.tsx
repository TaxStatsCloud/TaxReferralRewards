import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Generate mock data for demonstration purposes
const generateMonthlyData = (totalReferrals: number) => {
  const currentMonth = new Date().getMonth();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.slice(0, currentMonth + 1).map((month, index) => {
    const referrals = Math.floor(totalReferrals * (0.2 + 0.8 * (index / Math.max(1, currentMonth))) * (0.7 + Math.random() * 0.6) / (currentMonth + 1));
    
    return {
      name: month,
      Referrals: referrals,
      Rewards: referrals * 0.3 * 50, // 30% conversion rate * $50 reward
    };
  });
};

const generateStatusData = (totalReferrals: number, successfulReferrals: number, pendingReferrals: number) => {
  const cancelledReferrals = Math.max(0, totalReferrals - successfulReferrals - pendingReferrals);
  
  return [
    { name: 'Pending', value: pendingReferrals, color: '#FBBF24' },
    { name: 'Successful', value: successfulReferrals, color: '#10B981' },
    { name: 'Cancelled', value: cancelledReferrals, color: '#EF4444' },
  ];
};

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState("monthly");
  
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/summary'],
  });
  
  if (isLoading) {
    return (
      <Layout>
        <PageHeader title="Analytics">
          <Button variant="outline" className="px-4 py-2">
            <i className="fas fa-calendar-alt mr-2"></i>
            This Month
          </Button>
          <Button className="px-4 py-2">
            <i className="fas fa-download mr-2"></i>
            Export
          </Button>
        </PageHeader>
        
        <div className="py-6 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <PageHeader title="Analytics">
          <Button variant="outline" className="px-4 py-2">
            <i className="fas fa-calendar-alt mr-2"></i>
            This Month
          </Button>
          <Button className="px-4 py-2">
            <i className="fas fa-download mr-2"></i>
            Export
          </Button>
        </PageHeader>
        
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            Error loading analytics data. Please try again later.
          </div>
        </div>
      </Layout>
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
  
  const monthlyData = generateMonthlyData(displayStats.totalReferrals);
  
  const statusData = generateStatusData(
    displayStats.totalReferrals,
    displayStats.successfulReferrals,
    displayStats.pendingReferrals
  );
  
  return (
    <Layout>
      <PageHeader title="Analytics">
        <Button variant="outline" className="px-4 py-2">
          <i className="fas fa-calendar-alt mr-2"></i>
          This Month
        </Button>
        <Button className="px-4 py-2">
          <i className="fas fa-download mr-2"></i>
          Export
        </Button>
      </PageHeader>
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Referrals</CardDescription>
              <CardTitle className="text-3xl">{displayStats.totalReferrals}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-neutral-500">
                <span className="text-green-500">
                  <i className="fas fa-arrow-up mr-1"></i>
                  {Math.round(Math.random() * 10)}%
                </span> from last month
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Successful Referrals</CardDescription>
              <CardTitle className="text-3xl">{displayStats.successfulReferrals}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-neutral-500">
                <span className="text-green-500">
                  <i className="fas fa-arrow-up mr-1"></i>
                  {Math.round(Math.random() * 15)}%
                </span> conversion rate
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Referrals</CardDescription>
              <CardTitle className="text-3xl">{displayStats.pendingReferrals}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-neutral-500">
                {displayStats.pendingReferrals > 0 
                  ? "Potential rewards coming soon" 
                  : "No pending referrals"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Rewards Earned</CardDescription>
              <CardTitle className="text-3xl">{displayStats.rewardsFormatted}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-neutral-500">
                <span className="text-green-500">
                  <i className="fas fa-arrow-up mr-1"></i>
                  {Math.round(Math.random() * 25)}%
                </span> from last month
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Section */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trend Chart */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
                <h2 className="text-lg font-medium text-neutral-800 mb-4">Referral and Reward Trends</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="Referrals"
                        stroke="#3B82F6"
                        activeDot={{ r: 8 }}
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
              </div>
              
              {/* Status Distribution */}
              <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
                <h2 className="text-lg font-medium text-neutral-800 mb-4">Referral Status</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="referrals">
            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
              <h2 className="text-lg font-medium text-neutral-800 mb-4">Monthly Referrals</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Referrals" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="rewards">
            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
              <h2 className="text-lg font-medium text-neutral-800 mb-4">Monthly Rewards</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Rewards" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Performance Insights */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium text-neutral-800 mb-4">Performance Insights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {displayStats.totalReferrals > 0 
                    ? Math.round((displayStats.successfulReferrals / displayStats.totalReferrals) * 100)
                    : 0}%
                </div>
                <p className="text-sm text-neutral-500 mt-2">
                  {displayStats.totalReferrals > 0 && displayStats.successfulReferrals > 0
                    ? "Great job! Your conversion rate is above average."
                    : "Start referring people to see your conversion rate."}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Reward</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  ${displayStats.successfulReferrals > 0 
                    ? (displayStats.rewardsEarned / displayStats.successfulReferrals).toFixed(2)
                    : "0.00"}
                </div>
                <p className="text-sm text-neutral-500 mt-2">
                  {displayStats.successfulReferrals > 0
                    ? "Per successful referral"
                    : "You haven't earned rewards yet."}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best Performing Month</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <>
                    <div className="text-3xl font-bold text-primary">
                      {monthlyData.reduce((max, item) => item.Referrals > max.Referrals ? item : max, { name: 'None', Referrals: 0 }).name}
                    </div>
                    <p className="text-sm text-neutral-500 mt-2">
                      With {monthlyData.reduce((max, item) => item.Referrals > max.Referrals ? item : max, { name: 'None', Referrals: 0 }).Referrals} referrals
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-neutral-400">N/A</div>
                    <p className="text-sm text-neutral-500 mt-2">
                      Not enough data yet
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
