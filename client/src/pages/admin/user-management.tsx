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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, MoreHorizontal, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  
  // Handle role filter change
  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value === "all" ? null : value);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // Filter and paginate users
  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    
    return users.filter((user: any) => {
      const matchesSearch = 
        searchTerm === "" ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRole = 
        roleFilter === null || 
        user.role === roleFilter;
        
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);
  
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleMakeAdmin = (userId: number) => {
    toast({
      title: "Not implemented",
      description: "This functionality would update user privileges in a real application.",
    });
  };
  
  const handleViewReferrals = (userId: number) => {
    toast({
      title: "Not implemented",
      description: "This would show all referrals by this user in a real application.",
    });
  };
  
  return (
    <Layout>
      <PageHeader title="User Management">
        <Button variant="outline" className="px-4 py-2">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button className="px-4 py-2">
          <i className="fas fa-user-plus mr-2"></i>
          Add User
        </Button>
      </PageHeader>
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden mb-8">
          <div className="p-4 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select onValueChange={handleRoleFilterChange} defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="candidate">Candidates</SelectItem>
                  <SelectItem value="recruiter">Recruiters</SelectItem>
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
              <p>Error loading users. Please try again later.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Referral Code</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-neutral-500">
                          {searchTerm || roleFilter 
                            ? "No users match your search criteria." 
                            : "No users found."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedUsers.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                                <span className="text-xs font-medium">
                                  {user.displayName 
                                    ? user.displayName.substring(0, 2) 
                                    : user.username.substring(0, 2)}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium">
                                  {user.displayName || user.username}
                                </div>
                                {user.isAdmin && (
                                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={`${
                              user.role === 'recruiter' 
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role === 'recruiter' ? 'Recruiter' : 'Candidate'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(user.createdAt), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            <code className="bg-neutral-100 px-2 py-1 rounded text-xs">
                              {user.referralCode}
                            </code>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewReferrals(user.id)}>
                                  <i className="fas fa-link mr-2"></i> View Referrals
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <i className="fas fa-edit mr-2"></i> Edit User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {!user.isAdmin && (
                                  <DropdownMenuItem onClick={() => handleMakeAdmin(user.id)}>
                                    <i className="fas fa-user-shield mr-2"></i> Make Admin
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-red-500">
                                  <i className="fas fa-trash-alt mr-2"></i> Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {filteredUsers.length > 0 && (
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
                          {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                        </span>{" "}
                        of <span className="font-medium">{filteredUsers.length}</span> users
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

export default UserManagement;
