import React from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { format, subMonths } from "date-fns";
import { Link } from "wouter";

// Generate sample data for admin dashboard charts
const generateMonthlyData = () => {
  const result = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const month = subMonths(now, i);
    const monthName = format(month, "MMM");
    
    // Create some sample progression with random fluctuation
    const baseReferrals = 30 + (5 - i) * 12;  // Increase over time
    const randomFactor = 0.8 + Math.random() * 0.4; // Random factor between 0.8 and 1.2
    
    const referrals = Math.round(baseReferrals * randomFactor);
    const signups = Math.round(referrals * 0.65 * randomFactor);
    const conversions = Math.round(signups * 0.4 * randomFactor);
    
    result.push({
      name: monthName,
      Referrals: referrals,
      Signups: signups,
      Conversions: conversions
    });
  }
  
  return result;
};

const generateReferralStatusData = () => {
  return [
    { name: 'Pending', value: 35, color: '#FBBF24' },
    { name: 'Signed Up', value: 25, color: '#3B82F6' },
    { name: 'Converted', value: 30, color: '#10B981' },
    { name: 'Cancelled', value: 10, color: '#EF4444' },
  ];
};

const generateUserTypeData = () => {
  return [
    { name: 'Candidates', value: 65, color: '#3B82F6' },
    { name: 'Recruiters', value: 35, color: '#8B5CF6' },
  ];
};

const AdminDashboard: React.FC = () => {
  // Admin analytics query
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/admin'],
  });
  
  const monthlyData = generateMonthlyData();
  const referralStatusData = generateReferralStatusData();
  const userTypeData = generateUserTypeData();
  
  return (
    <Layout>
      <PageHeader title="Admin Dashboard">
        <Button variant="outline" className="px-4 py-2">
          <i className="fas fa-download mr-2"></i>
          Export Reports
        </Button>
        <Button className="px-4 py-2">
          <i className="fas fa-plus mr-2"></i>
          New Campaign
        </Button>
      </PageHeader>
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  analytics?.totalUsers || 0
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-neutral-500">
                <Link href="/admin/user-management" className="text-primary hover:underline">
                  View all users
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Referrals</CardDescription>
              <CardTitle className="text-3xl">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  analytics?.totalReferrals || 0
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-neutral-500">
                <span className="text-green-500">
                  <i className="fas fa-arrow-up mr-1"></i>
                  {Math.round(Math.random() * 15)}%
                </span> from last month
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Conversion Rate</CardDescription>
              <CardTitle className="text-3xl">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  `${(analytics?.conversionRate || 0).toFixed(1)}%`
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-neutral-500">
                Based on successful referrals
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Rewards</CardDescription>
              <CardTitle className="text-3xl">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  `$${(analytics?.totalRewardsAmount || 0).toFixed(2)}`
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-neutral-500">
                <Link href="/admin/approve-rewards" className="text-primary hover:underline">
                  <span className="text-yellow-500 font-medium">
                    ${(analytics?.pendingRewardsAmount || 0).toFixed(2)}
                  </span> pending approval
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Performance Chart */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
                <h2 className="text-lg font-medium text-neutral-800 mb-4">Platform Performance</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="Referrals" 
                        stroke="#3B82F6" 
                        activeDot={{ r: 8 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Signups" 
                        stroke="#10B981" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Conversions" 
                        stroke="#8B5CF6" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* User Distribution */}
              <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
                <h2 className="text-lg font-medium text-neutral-800 mb-4">User Distribution</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {userTypeData.map((entry, index) => (
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
            
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Referral Status Distribution */}
              <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
                <h2 className="text-lg font-medium text-neutral-800 mb-4">Referral Status</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={referralStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {referralStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Recent Activity & Quick Actions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Links */}
                <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
                  <h2 className="text-lg font-medium text-neutral-800 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/admin/user-management">
                      <div className="border rounded-lg p-4 text-center hover:border-primary hover:bg-blue-50 transition-colors">
                        <i className="fas fa-users text-2xl text-blue-500 mb-2"></i>
                        <div className="text-sm font-medium">Manage Users</div>
                      </div>
                    </Link>
                    
                    <Link href="/admin/approve-rewards">
                      <div className="border rounded-lg p-4 text-center hover:border-primary hover:bg-blue-50 transition-colors">
                        <i className="fas fa-check-circle text-2xl text-green-500 mb-2"></i>
                        <div className="text-sm font-medium">Approve Rewards</div>
                      </div>
                    </Link>
                    
                    <Link href="/admin/campaigns">
                      <div className="border rounded-lg p-4 text-center hover:border-primary hover:bg-blue-50 transition-colors">
                        <i className="fas fa-bullhorn text-2xl text-purple-500 mb-2"></i>
                        <div className="text-sm font-medium">Campaigns</div>
                      </div>
                    </Link>
                    
                    <div className="border rounded-lg p-4 text-center hover:border-primary hover:bg-blue-50 transition-colors cursor-pointer">
                      <i className="fas fa-download text-2xl text-neutral-500 mb-2"></i>
                      <div className="text-sm font-medium">Reports</div>
                    </div>
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-neutral-800">Recent Activity</h2>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="mr-4 mt-1">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <i className="fas fa-user-plus text-blue-500"></i>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">New user registered</div>
                        <div className="text-xs text-neutral-500">
                          {format(new Date(), "MMM dd, h:mm a")}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="mr-4 mt-1">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <i className="fas fa-check-circle text-green-500"></i>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Referral converted</div>
                        <div className="text-xs text-neutral-500">
                          {format(subMonths(new Date(), 0), "MMM dd, h:mm a")}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="mr-4 mt-1">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <i className="fas fa-gift text-purple-500"></i>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Reward approved</div>
                        <div className="text-xs text-neutral-500">
                          {format(subMonths(new Date(), 0), "MMM dd, h:mm a")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="referrals">
            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
              <h2 className="text-lg font-medium text-neutral-800 mb-4">Referral Metrics</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Referrals" fill="#3B82F6" />
                    <Bar dataKey="Signups" fill="#10B981" />
                    <Bar dataKey="Conversions" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Average Referrals per User</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {analytics?.totalUsers ? (analytics.totalReferrals / analytics.totalUsers).toFixed(1) : "0.0"}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {(analytics?.conversionRate || 0).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Pending Referrals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {analytics?.pendingReferrals || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
              <h2 className="text-lg font-medium text-neutral-800 mb-4">User Demographics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {userTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex flex-col justify-center">
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-2">User Growth</h3>
                    <div className="text-3xl font-bold text-primary">
                      {analytics?.totalUsers || 0}
                    </div>
                    <div className="text-sm text-neutral-500 mt-1">
                      <span className="text-green-500">
                        <i className="fas fa-arrow-up mr-1"></i>
                        12%
                      </span> from last month
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Top Referrers</h3>
                    <div className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span>Top 10% of users generate</span>
                        <span className="font-medium">72% of referrals</span>
                      </div>
                      
                      <Link href="/admin/user-management" className="text-primary hover:underline text-sm">
                        View detailed user stats →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="rewards">
            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
              <h2 className="text-lg font-medium text-neutral-800 mb-4">Reward Distribution</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Conversions" 
                      stroke="#8B5CF6" 
                      name="Rewards Issued"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Rewards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      ${(analytics?.totalRewardsAmount || 0).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Pending Approval</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-500">
                      ${(analytics?.pendingRewardsAmount || 0).toFixed(2)}
                    </div>
                    <Link href="/admin/approve-rewards" className="text-primary hover:underline text-sm">
                      Review pending rewards →
                    </Link>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Average Reward Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      $50.00
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
