import React, { useState } from "react";
import { Link } from "wouter";
import { getUserReferrals } from "@/lib/referral";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

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
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

const ReferralActivity: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  
  const { data: referrals, isLoading, error } = useQuery({
    queryKey: ['/api/referrals/me'],
  });
  
  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-neutral-800">Recent Referral Activity</h2>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-neutral-800">Recent Referral Activity</h2>
        </div>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Error loading referrals. Please try again later.
        </div>
      </div>
    );
  }
  
  // Calculate pagination info
  const totalReferrals = referrals?.length || 0;
  const totalPages = Math.ceil(totalReferrals / itemsPerPage);
  const currentReferrals = referrals?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-neutral-800">Recent Referral Activity</h2>
        <Link href="/referrals" className="text-sm font-medium text-primary hover:text-primary-dark">
          View All
        </Link>
      </div>
      
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Referral Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Reward
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {currentReferrals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-neutral-500">
                    No referrals yet. Share your referral link to get started!
                  </td>
                </tr>
              ) : (
                currentReferrals.map((referral: any) => (
                  <tr key={referral.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-neutral-500">
                            {referral.refereeEmail.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">
                            {referral.refereeName || "Invited User"}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {referral.refereeType || "Candidate"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-500">{referral.refereeEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-500">
                        {format(new Date(referral.createdAt), "MMM dd, yyyy")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={referral.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">
                        {referral.status === "converted" 
                          ? `$${referral.rewardAmount?.toFixed(2) || "50.00"}` 
                          : "--"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/referrals/${referral.id}`} 
                        className="text-primary hover:text-primary-dark"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalReferrals > 0 && (
          <div className="bg-white px-4 py-3 border-t border-neutral-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white ${
                    currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-neutral-700">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalReferrals)}
                    </span>{" "}
                    of <span className="font-medium">{totalReferrals}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 ${
                        currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <i className="fas fa-chevron-left text-xs"></i>
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-white text-sm font-medium ${
                          currentPage === i + 1
                            ? "text-primary"
                            : "text-neutral-500 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 ${
                        currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <i className="fas fa-chevron-right text-xs"></i>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralActivity;
