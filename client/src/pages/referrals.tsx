import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUserReferrals } from "@/lib/referral";
import ReferralLinkGenerator from "@/components/dashboard/ReferralLinkGenerator";
import { Loader2, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: { [key: string]: { bg: string; text: string; label: string } } = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
    signed_up: { bg: "bg-blue-100", text: "text-blue-800", label: "Signed Up" },
    converted: { bg: "bg-green-100", text: "text-green-800", label: "Converted" },
    cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

const Referrals: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { data: referrals, isLoading, error } = useQuery({
    queryKey: ['/api/referrals/me'],
  });
  
  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? null : value);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Filter and paginate referrals
  const filteredReferrals = React.useMemo(() => {
    if (!referrals) return [];
    
    return referrals.filter((referral: any) => {
      const matchesSearch = 
        searchTerm === "" ||
        referral.refereeEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === null || 
        referral.status === statusFilter;
        
      return matchesSearch && matchesStatus;
    });
  }, [referrals, searchTerm, statusFilter]);
  
  const totalPages = Math.ceil(filteredReferrals.length / itemsPerPage);
  const paginatedReferrals = filteredReferrals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  return (
    <Layout>
      <PageHeader title="My Referrals">
        <Button variant="outline" className="px-4 py-2">
          <i className="fas fa-filter mr-2"></i>
          Filter
        </Button>
        <Button className="px-4 py-2">
          <i className="fas fa-user-plus mr-2"></i>
          Invite Friends
        </Button>
      </PageHeader>
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Referral Link Generator */}
        <ReferralLinkGenerator />
        
        {/* Referrals Table */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden mb-8">
          <div className="p-4 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search by email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select onValueChange={handleStatusFilterChange} defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="signed_up">Signed Up</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              <p>Error loading referrals. Please try again later.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Email</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReferrals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-neutral-500">
                          {searchTerm || statusFilter 
                            ? "No referrals match your search criteria." 
                            : "No referrals yet. Share your referral link to get started!"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedReferrals.map((referral: any) => (
                        <TableRow key={referral.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center mr-3">
                                <span className="text-xs font-medium text-neutral-500">
                                  {referral.refereeEmail.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              {referral.refereeEmail}
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(referral.createdAt), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={referral.status} />
                          </TableCell>
                          <TableCell>
                            {referral.status === "converted" 
                              ? `$${referral.rewardAmount?.toFixed(2) || "50.00"}` 
                              : "--"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {filteredReferrals.length > 0 && (
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
                          {Math.min(currentPage * itemsPerPage, filteredReferrals.length)}
                        </span>{" "}
                        of <span className="font-medium">{filteredReferrals.length}</span> results
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
        </div>
      </div>
    </Layout>
  );
};

export default Referrals;
