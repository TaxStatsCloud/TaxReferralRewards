import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Calendar, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const campaignFormSchema = z.object({
  name: z.string().min(3, {
    message: "Campaign name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  rewardMultiplier: z.coerce.number().min(1, {
    message: "Reward multiplier must be at least 1.",
  }).max(5, {
    message: "Reward multiplier cannot exceed 5.",
  }),
  startDate: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, {
    message: "Please select a valid start date",
  }),
  endDate: z.string().optional(),
  isActive: z.boolean(),
  rules: z.object({
    minReferrals: z.coerce.number().int().min(1).optional(),
    bonusAmount: z.coerce.number().min(0).optional(),
  }).optional(),
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

interface Campaign {
  id: number;
  name: string;
  description: string;
  rewardMultiplier: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  rules: any;
  createdAt: string;
}

const Campaigns: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch campaigns
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['/api/campaigns'],
  });
  
  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: (data: CampaignFormValues) => 
      apiRequest("POST", "/api/campaigns", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      setIsCreating(false);
      toast({
        title: "Campaign Created",
        description: "Your new campaign has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating campaign:", error);
    }
  });
  
  // Update campaign mutation
  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CampaignFormValues> }) => 
      apiRequest("PATCH", `/api/campaigns/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      setSelectedCampaign(null);
      toast({
        title: "Campaign Updated",
        description: "Campaign has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update campaign. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating campaign:", error);
    }
  });
  
  // Campaign creation form
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: "",
      description: "",
      rewardMultiplier: 1,
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: "",
      isActive: true,
      rules: {
        minReferrals: 1,
        bonusAmount: 10,
      },
    },
  });
  
  // Campaign edit form
  const editForm = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: "",
      description: "",
      rewardMultiplier: 1,
      startDate: "",
      endDate: "",
      isActive: true,
      rules: {
        minReferrals: 1,
        bonusAmount: 10,
      },
    },
  });
  
  // Update edit form when a campaign is selected
  React.useEffect(() => {
    if (selectedCampaign) {
      editForm.reset({
        name: selectedCampaign.name,
        description: selectedCampaign.description,
        rewardMultiplier: selectedCampaign.rewardMultiplier,
        startDate: format(new Date(selectedCampaign.startDate), "yyyy-MM-dd"),
        endDate: selectedCampaign.endDate ? format(new Date(selectedCampaign.endDate), "yyyy-MM-dd") : undefined,
        isActive: selectedCampaign.isActive,
        rules: selectedCampaign.rules || {
          minReferrals: 1,
          bonusAmount: 10,
        },
      });
    }
  }, [selectedCampaign, editForm]);
  
  // Handle form submission
  const onSubmit = (values: CampaignFormValues) => {
    createCampaignMutation.mutate(values);
  };
  
  // Handle edit form submission
  const onEditSubmit = (values: CampaignFormValues) => {
    if (!selectedCampaign) return;
    
    updateCampaignMutation.mutate({
      id: selectedCampaign.id,
      data: values,
    });
  };
  
  // Filter campaigns based on search and status
  const filteredCampaigns = React.useMemo(() => {
    if (!campaigns) return [];
    
    return campaigns.filter((campaign: Campaign) => {
      const matchesSearch = 
        searchTerm === "" ||
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isActiveCampaign = 
        campaign.isActive && 
        (!campaign.endDate || new Date(campaign.endDate) >= new Date());
      
      const matchesStatus = 
        activeTab === "all" || 
        (activeTab === "active" && isActiveCampaign) ||
        (activeTab === "inactive" && !isActiveCampaign);
      
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchTerm, activeTab]);
  
  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle campaign activation toggle
  const handleToggleActivation = (campaign: Campaign) => {
    updateCampaignMutation.mutate({
      id: campaign.id,
      data: { isActive: !campaign.isActive },
    });
  };
  
  return (
    <Layout>
      <PageHeader title="Marketing Campaigns">
        <Button variant="outline" className="px-4 py-2">
          <Calendar className="h-4 w-4 mr-2" />
          View Calendar
        </Button>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="px-4 py-2">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Create a new marketing campaign to boost referrals and rewards.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Referral Promotion" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the campaign details and benefits..." 
                          className="resize-none" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rewardMultiplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reward Multiplier</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="5" step="0.1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Multiply the standard reward by this value
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Make this campaign active immediately
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value || ''} 
                            onChange={(e) => field.onChange(e.target.value || undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Leave empty for ongoing campaigns
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rules.minReferrals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Referrals</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Minimum referrals required
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rules.bonusAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bonus Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormDescription>
                          Additional bonus for qualifying referrals
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createCampaignMutation.isPending}
                  >
                    {createCampaignMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Campaign"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Campaign Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  campaigns?.filter((c: Campaign) => 
                    c.isActive && (!c.endDate || new Date(c.endDate) >= new Date())
                  ).length || 0
                )}
              </div>
              <div className="text-sm text-neutral-500 mt-1">
                Currently running
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  campaigns?.filter((c: Campaign) => 
                    c.isActive && new Date(c.startDate) > new Date()
                  ).length || 0
                )}
              </div>
              <div className="text-sm text-neutral-500 mt-1">
                Scheduled to start soon
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Ended</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-500">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  campaigns?.filter((c: Campaign) => 
                    c.endDate && new Date(c.endDate) < new Date()
                  ).length || 0
                )}
              </div>
              <div className="text-sm text-neutral-500 mt-1">
                Past campaigns
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Avg. Multiplier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  campaigns?.length 
                    ? (campaigns.reduce((sum: number, c: Campaign) => sum + c.rewardMultiplier, 0) / campaigns.length).toFixed(1) + 'x'
                    : "0x"
                )}
              </div>
              <div className="text-sm text-neutral-500 mt-1">
                Average reward multiplier
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Campaign List */}
        <Card className="shadow-sm">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              
              <div className="relative max-w-xs">
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-3"
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
                  <p>Error loading campaigns. Please try again later.</p>
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="p-6 text-center text-neutral-500">
                  <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-bullhorn text-neutral-400 text-xl"></i>
                  </div>
                  {searchTerm ? (
                    <h3 className="text-lg font-medium text-neutral-800 mb-1">No campaigns match your search</h3>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium text-neutral-800 mb-1">No {activeTab} campaigns</h3>
                      <p className="mb-4">Create a new campaign to get started</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreating(true)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Campaign
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Multiplier</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCampaigns.map((campaign: Campaign) => {
                        const now = new Date();
                        const startDate = new Date(campaign.startDate);
                        const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
                        
                        let status = "inactive";
                        if (campaign.isActive) {
                          if (startDate > now) {
                            status = "upcoming";
                          } else if (!endDate || endDate >= now) {
                            status = "active";
                          } else {
                            status = "ended";
                          }
                        }
                        
                        return (
                          <TableRow key={campaign.id}>
                            <TableCell className="font-medium">{campaign.name}</TableCell>
                            <TableCell className="max-w-xs truncate">{campaign.description}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>From: {format(startDate, "MMM dd, yyyy")}</div>
                                {endDate ? (
                                  <div>To: {format(endDate, "MMM dd, yyyy")}</div>
                                ) : (
                                  <div className="text-neutral-500">No end date</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{campaign.rewardMultiplier}x</TableCell>
                            <TableCell>
                              <Badge className={`
                                ${status === 'active' ? 'bg-green-100 text-green-800' : ''}
                                ${status === 'upcoming' ? 'bg-blue-100 text-blue-800' : ''}
                                ${status === 'inactive' ? 'bg-neutral-100 text-neutral-800' : ''}
                                ${status === 'ended' ? 'bg-yellow-100 text-yellow-800' : ''}
                              `}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedCampaign(campaign)}
                                >
                                  <i className="fas fa-edit mr-1"></i>
                                  Edit
                                </Button>
                                <Button 
                                  variant={campaign.isActive ? "outline" : "default"}
                                  size="sm"
                                  onClick={() => handleToggleActivation(campaign)}
                                  className={campaign.isActive ? 'text-red-600 border-red-200 hover:bg-red-50' : 'bg-green-600 hover:bg-green-700'}
                                >
                                  {campaign.isActive ? (
                                    <>
                                      <i className="fas fa-times-circle mr-1"></i>
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-check-circle mr-1"></i>
                                      Activate
                                    </>
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
        
        {/* Featured Campaigns */}
        {!isLoading && campaigns?.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Featured Campaigns</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {campaigns
                .filter((c: Campaign) => c.isActive && (!c.endDate || new Date(c.endDate) >= new Date()))
                .slice(0, 3)
                .map((campaign: Campaign) => (
                  <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{campaign.name}</CardTitle>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-500">Reward Multiplier:</span>
                          <span className="font-medium">{campaign.rewardMultiplier}x</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-500">Start Date:</span>
                          <span>{format(new Date(campaign.startDate), "MMM dd, yyyy")}</span>
                        </div>
                        {campaign.endDate && (
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-500">End Date:</span>
                            <span>{format(new Date(campaign.endDate), "MMM dd, yyyy")}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-500">Min Referrals:</span>
                          <span>{campaign.rules?.minReferrals || "N/A"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-500">Bonus Amount:</span>
                          <span>${campaign.rules?.bonusAmount || "0.00"}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedCampaign(campaign)}
                      >
                        Edit Campaign
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "View Analytics",
                            description: "Campaign analytics feature coming soon.",
                          });
                        }}
                      >
                        <i className="fas fa-chart-line mr-1"></i>
                        Analytics
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Edit Campaign Dialog */}
      <Dialog open={!!selectedCampaign} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>
              Update the campaign details and settings.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="resize-none" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="rewardMultiplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reward Multiplier</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="5" step="0.1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Multiply the standard reward by this value
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Enable or disable this campaign
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value || ''} 
                          onChange={(e) => field.onChange(e.target.value || undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty for ongoing campaigns
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="rules.minReferrals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Referrals</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Minimum referrals required
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="rules.bonusAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bonus Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormDescription>
                        Additional bonus for qualifying referrals
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCampaign(null)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateCampaignMutation.isPending}
                >
                  {updateCampaignMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Campaigns;
