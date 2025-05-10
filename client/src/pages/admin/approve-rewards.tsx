import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Search, MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Reward {
  id: number;
  userId: number;
  referralId: number;
  amount: number;
  status: string;
  approvedAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
}

const ApproveRewards: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("pending");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [rewardAction, setRewardAction] = useState<'approve' | 'reject' | 'pay' | null>(null);
  
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch rewards
  const { data: rewards, isLoading, error } = useQuery({
    queryKey: ['/api/rewards'],
  });
  
  // Fetch users for displaying user info
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Update reward status mutation
  const updateRewardStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest("PATCH", `/api/rewards/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rewards'] });
      setDialogOpen(false);
      toast({
        title: "Success!",
        description: `Reward has been ${rewardAction}ed.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${rewardAction} reward. Please try again.`,
        variant: "destructive",
      });
      console.error("Error updating reward status:", error);
    }
  });
  
  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  
  // Get user info by userId
  const getUserInfo = (userId: number): User | undefined => {
    return users?.find((user: User) => user.id === userId);
  };
  
  // Filter rewards based on search and status
  const filteredRewards = React.useMemo(() => {
    if (!rewards) return [];
    
    return rewards.filter((reward: Reward) => {
      const user = getUserInfo(reward.userId);
      const matchesSearch = 
        searchTerm === "" ||
        reward.id.toString().includes(searchTerm) ||
        reward.referralId.toString().includes(searchTerm) ||
        reward.amount.toString().includes(searchTerm) ||
        (user?.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user?.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = activeTab === "all" || reward.status === activeTab;
      
      return matchesSearch && matchesStatus;
    });
  }, [rewards, users, searchTerm, activeTab]);
  
  const totalPages = Math.ceil(filteredRewards.length / itemsPerPage);
  const paginatedRewards = filteredRewards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle reward action (approve, reject, pay)
  const handleRewardAction = (reward: Reward, action: 'approve' | 'reject' | 'pay') => {
    setSelectedReward(reward);
    setRewardAction(action);
    setDialogOpen(true);
  };
  
  // Confirm reward action
  const confirmRewardAction = () => {
    if (!selectedReward || !rewardAction) return;
    
    let newStatus = '';
    switch (rewardAction) {
      case 'approve':
        newStatus = 'approved';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'pay':
        newStatus = 'paid';
        break;
    }
    
    updateRewardStatusMutation.mutate({ 
      id: selectedReward.id, 
      status: newStatus 
    });
  };
  
  // Get reward count by status
  const getPendingCount = () => rewards?.filter((r: Reward) => r.status === 'pending').length || 0;
  const getApprovedCount = () => rewards?.filter((r: Reward) => r.status === 'approved').length || 0;
  const getPaidCount = () => rewards?.filter((r: Reward) => r.status === 'paid').length || 0;
  const getRejectedCount = () => rewards?.filter((r: Reward) => r.status === 'rejected').length || 0;
  
  // Get total amount by status
  const getPendingAmount = () => rewards?.filter((r: Reward) => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0) || 0;
  const getApprovedAmount = () => rewards?.filter((r: Reward) => r.status === 'approved')
    .reduce((sum, r) => sum + r.amount, 0) || 0;
  const getPaidAmount = () => rewards?.filter((r: Reward) => r.status === 'paid')
    .reduce((sum, r) => sum + r.amount, 0) || 0;
  
  return (
    <Layout>
      <PageHeader title="Approve Rewards">
        <Button variant="outline" className="px-4 py-2">
          <i className="fas fa-download mr-2"></i>
          Export
        </Button>
        {getPendingCount() > 0 && (
          <Button className="px-4 py-2">
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve All Pending
          </Button>
        )}
      </PageHeader>
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">${getPendingAmount().toFixed(2)}</div>
              <div className="text-sm text-neutral-500 mt-1">{getPendingCount()} rewards</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">${getApprovedAmount().toFixed(2)}</div>
              <div className="text-sm text-neutral-500 mt-1">{getApprovedCount()} rewards</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">${getPaidAmount().toFixed(2)}</div>
              <div className="text-sm text-neutral-500 mt-1">{getPaidCount()} rewards</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{getRejectedCount()}</div>
              <div className="text-sm text-neutral-500 mt-1">{getRejectedCount()} rewards</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Rewards Table */}
        <Card className="shadow-sm">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <TabsList>
                <TabsTrigger value="pending">
                  Pending
                  {getPendingCount() > 0 && (
                    <Badge variant="secondary" className="ml-2">{getPendingCount()}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search rewards..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-9"
                />
              </div>
            </div>
            
            <TabsContent value={activeTab} className="m-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">
                  <p>Error loading rewards. Please try again later.</p>
                </div>
              ) : filteredRewards.length === 0 ? (
                <div className="p-6 text-center text-neutral-500">
                  <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-gift text-neutral-400 text-xl"></i>
                  </div>
                  {searchTerm ? (
                    <h3 className="text-lg font-medium text-neutral-800 mb-1">No rewards match your search</h3>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium text-neutral-800 mb-1">No {activeTab} rewards</h3>
                      <p>There are no rewards in the {activeTab} status</p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Referral ID</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedRewards.map((reward: Reward) => {
                          const user = getUserInfo(reward.userId);
                          
                          return (
                            <TableRow key={reward.id}>
                              <TableCell>#{reward.id}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                                    <span className="text-xs font-medium">
                                      {user?.displayName 
                                        ? user.displayName.substring(0, 2) 
                                        : user?.username.substring(0, 2) || "U"}
                                    </span>
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium">{user?.displayName || user?.username || "Unknown User"}</div>
                                    <div className="text-xs text-neutral-500">{user?.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>#{reward.referralId}</TableCell>
                              <TableCell className="font-medium">${reward.amount.toFixed(2)}</TableCell>
                              <TableCell>{format(new Date(reward.createdAt), "MMM dd, yyyy")}</TableCell>
                              <TableCell>
                                <Badge className={`
                                  ${reward.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                  ${reward.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                                  ${reward.status === 'paid' ? 'bg-blue-100 text-blue-800' : ''}
                                  ${reward.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                                `}>
                                  {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {reward.status === 'pending' && (
                                  <div className="flex justify-end space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-green-600 border-green-200 hover:bg-green-50"
                                      onClick={() => handleRewardAction(reward, 'approve')}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                      onClick={() => handleRewardAction(reward, 'reject')}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                )}
                                {reward.status === 'approved' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                    onClick={() => handleRewardAction(reward, 'pay')}
                                  >
                                    <i className="fas fa-credit-card mr-1"></i>
                                    Mark as Paid
                                  </Button>
                                )}
                                {(reward.status === 'paid' || reward.status === 'rejected') && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => {
                                        toast({
                                          title: "View Details",
                                          description: `Viewing details for reward #${reward.id}`,
                                        });
                                      }}>
                                        <i className="fas fa-eye mr-2"></i> View Details
                                      </DropdownMenuItem>
                                      {reward.status === 'rejected' && (
                                        <DropdownMenuItem onClick={() => handleRewardAction(reward, 'approve')}>
                                          <CheckCircle className="h-4 w-4 mr-2" /> Change to Approved
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Pagination */}
                  {filteredRewards.length > itemsPerPage && (
                    <div className="px-4 py-3 flex items-center justify-between border-t border-neutral-200">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-neutral-700">
                            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                            <span className="font-medium">
                              {Math.min(currentPage * itemsPerPage, filteredRewards.length)}
                            </span>{" "}
                            of <span className="font-medium">{filteredRewards.length}</span> rewards
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-l-md"
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                            >
                              <i className="fas fa-chevron-left text-xs"></i>
                            </Button>
                            
                            {Array.from({ length: totalPages }).map((_, index) => (
                              <Button
                                key={index + 1}
                                variant={currentPage === index + 1 ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(index + 1)}
                                className="rounded-none"
                              >
                                {index + 1}
                              </Button>
                            ))}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-r-md"
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                            >
                              <i className="fas fa-chevron-right text-xs"></i>
                            </Button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      {/* Confirm Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {rewardAction === 'approve' && "Approve Reward"}
              {rewardAction === 'reject' && "Reject Reward"}
              {rewardAction === 'pay' && "Mark Reward as Paid"}
            </DialogTitle>
            <DialogDescription>
              {rewardAction === 'approve' && "Are you sure you want to approve this reward? This will mark it as eligible for payment."}
              {rewardAction === 'reject' && "Are you sure you want to reject this reward? This action cannot be easily undone."}
              {rewardAction === 'pay' && "Are you sure you want to mark this reward as paid? This indicates that payment has been processed."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReward && (
            <div className="py-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Reward ID:</span>
                <span>#{selectedReward.id}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Amount:</span>
                <span className="font-bold">${selectedReward.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Referral ID:</span>
                <span>#{selectedReward.referralId}</span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmRewardAction}
              disabled={updateRewardStatusMutation.isPending}
              className={`
                ${rewardAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                ${rewardAction === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
                ${rewardAction === 'pay' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              `}
            >
              {updateRewardStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {rewardAction === 'approve' && "Approve Reward"}
                  {rewardAction === 'reject' && "Reject Reward"}
                  {rewardAction === 'pay' && "Mark as Paid"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ApproveRewards;
