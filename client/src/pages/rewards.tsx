import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ChevronDown } from "lucide-react";

const RewardStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: { [key: string]: { bg: string; text: string; label: string } } = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
    approved: { bg: "bg-green-100", text: "text-green-800", label: "Approved" },
    rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
    paid: { bg: "bg-blue-100", text: "text-blue-800", label: "Paid" },
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

const Rewards: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: rewards, isLoading, error } = useQuery({
    queryKey: ['/api/rewards/me'],
  });
  
  const { data: stats } = useQuery({
    queryKey: ['/api/analytics/summary'],
  });
  
  // Calculate totals
  const totalRewards = rewards?.length || 0;
  const pendingRewards = rewards?.filter((r: any) => r.status === "pending").length || 0;
  const approvedRewards = rewards?.filter((r: any) => r.status === "approved").length || 0;
  const paidRewards = rewards?.filter((r: any) => r.status === "paid").length || 0;
  
  const totalAmount = rewards?.reduce((sum: number, r: any) => sum + (r.amount || 0), 0) || 0;
  const pendingAmount = rewards?.filter((r: any) => r.status === "pending")
    .reduce((sum: number, r: any) => sum + (r.amount || 0), 0) || 0;
  const availableAmount = rewards?.filter((r: any) => r.status === "approved")
    .reduce((sum: number, r: any) => sum + (r.amount || 0), 0) || 0;
  const paidAmount = rewards?.filter((r: any) => r.status === "paid")
    .reduce((sum: number, r: any) => sum + (r.amount || 0), 0) || 0;
  
  // Calculate milestones (next reward tier)
  const currentLevel = Math.floor(totalAmount / 100);
  const nextLevelThreshold = (currentLevel + 1) * 100;
  const progressToNextLevel = (totalAmount % 100) / 100 * 100;
  
  return (
    <Layout>
      <PageHeader title="Rewards">
        <Button variant="outline" className="px-4 py-2">
          <i className="fas fa-history mr-2"></i>
          History
        </Button>
        {availableAmount > 0 && (
          <Button className="px-4 py-2">
            <i className="fas fa-credit-card mr-2"></i>
            Request Payout
          </Button>
        )}
      </PageHeader>
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Rewards Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Earnings</CardDescription>
              <CardTitle className="text-3xl">${totalAmount.toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-neutral-500">Lifetime earnings from referrals</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl">${pendingAmount.toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-neutral-500">{pendingRewards} pending rewards</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Available</CardDescription>
              <CardTitle className="text-3xl">${availableAmount.toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-neutral-500">Ready for payout</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Paid</CardDescription>
              <CardTitle className="text-3xl">${paidAmount.toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-neutral-500">{paidRewards} completed payouts</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Next Reward Milestone */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Reward Milestones</CardTitle>
            <CardDescription>
              Reach the next level to unlock special bonuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex justify-between items-center">
              <span className="text-sm font-medium text-neutral-700">
                Level {currentLevel} 
                <span className="text-neutral-500"> → Level {currentLevel + 1}</span>
              </span>
              <span className="text-sm text-neutral-500">
                ${totalAmount.toFixed(2)} / ${nextLevelThreshold.toFixed(2)}
              </span>
            </div>
            <Progress value={progressToNextLevel} className="h-2" />
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">Level {currentLevel}</div>
                <div className="text-sm text-neutral-500">Current Level</div>
                <div className="mt-2 text-sm">Standard rewards</div>
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">Level {currentLevel + 1}</div>
                <div className="text-sm text-neutral-500">Next Level</div>
                <div className="mt-2 text-sm">+5% bonus on all referrals</div>
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">Level {currentLevel + 2}</div>
                <div className="text-sm text-neutral-500">Future Goal</div>
                <div className="mt-2 text-sm">+10% bonus and priority support</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Rewards Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>All Rewards</CardTitle>
                <CardDescription>
                  Complete history of your referral rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-red-500 text-center py-4">
                    Error loading rewards. Please try again.
                  </div>
                ) : rewards?.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <i className="fas fa-gift text-3xl mb-2 text-neutral-300"></i>
                    <p>You haven't earned any rewards yet.</p>
                    <p className="text-sm mt-1">Share your referral link to start earning!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Referral</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rewards.map((reward: any) => (
                          <TableRow key={reward.id}>
                            <TableCell className="font-medium">
                              Referral #{reward.referralId}
                            </TableCell>
                            <TableCell>${reward.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              {format(new Date(reward.createdAt), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>
                              <RewardStatusBadge status={reward.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Rewards</CardTitle>
                <CardDescription>
                  Rewards waiting for approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : pendingRewards === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <i className="fas fa-hourglass-half text-3xl mb-2 text-neutral-300"></i>
                    <p>No pending rewards at the moment.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Referral</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rewards?.filter((r: any) => r.status === "pending").map((reward: any) => (
                          <TableRow key={reward.id}>
                            <TableCell className="font-medium">
                              Referral #{reward.referralId}
                            </TableCell>
                            <TableCell>${reward.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              {format(new Date(reward.createdAt), "MMM dd, yyyy")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Rewards</CardTitle>
                <CardDescription>
                  Ready for payout
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : approvedRewards === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <i className="fas fa-check-circle text-3xl mb-2 text-neutral-300"></i>
                    <p>No approved rewards waiting for payout.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Referral</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rewards?.filter((r: any) => r.status === "approved").map((reward: any) => (
                            <TableRow key={reward.id}>
                              <TableCell className="font-medium">
                                Referral #{reward.referralId}
                              </TableCell>
                              <TableCell>${reward.amount.toFixed(2)}</TableCell>
                              <TableCell>
                                {format(new Date(reward.createdAt), "MMM dd, yyyy")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button className="px-4 py-2">
                        <i className="fas fa-credit-card mr-2"></i>
                        Request Payout (${availableAmount.toFixed(2)})
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="paid">
            <Card>
              <CardHeader>
                <CardTitle>Paid Rewards</CardTitle>
                <CardDescription>
                  Your payment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : paidRewards === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <i className="fas fa-coins text-3xl mb-2 text-neutral-300"></i>
                    <p>No payments have been processed yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Referral</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date Paid</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rewards?.filter((r: any) => r.status === "paid").map((reward: any) => (
                          <TableRow key={reward.id}>
                            <TableCell className="font-medium">
                              Referral #{reward.referralId}
                            </TableCell>
                            <TableCell>${reward.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              {format(new Date(reward.paidAt || reward.createdAt), "MMM dd, yyyy")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* How It Works */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium text-neutral-800 mb-4">How Rewards Work</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-primary mr-3">
                  <i className="fas fa-link"></i>
                </div>
                <h3 className="font-medium">Step 1: Share Your Link</h3>
              </div>
              <p className="text-sm text-neutral-600">
                Share your unique referral link with friends, colleagues, or on social media.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-primary mr-3">
                  <i className="fas fa-user-plus"></i>
                </div>
                <h3 className="font-medium">Step 2: They Sign Up</h3>
              </div>
              <p className="text-sm text-neutral-600">
                When someone uses your link to create an account, they're added as your referral.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-primary mr-3">
                  <i className="fas fa-gift"></i>
                </div>
                <h3 className="font-medium">Step 3: Earn Rewards</h3>
              </div>
              <p className="text-sm text-neutral-600">
                You earn $50 for each referral who completes the conversion requirements.
              </p>
            </div>
          </div>
          
          <div className="mt-4 bg-blue-50 text-blue-700 p-4 rounded-md text-sm">
            <strong>Pro Tip:</strong> The more quality referrals you bring, the higher your reward tier becomes!
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Rewards;
