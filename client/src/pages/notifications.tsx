import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const NotificationItem = ({ 
  notification, 
  onMarkAsRead 
}: { 
  notification: any, 
  onMarkAsRead: (id: number) => void 
}) => {
  const getIconByType = (type: string) => {
    switch (type) {
      case 'referral_used':
        return 'fas fa-user-plus text-blue-500';
      case 'reward_earned':
        return 'fas fa-gift text-green-500';
      case 'status_changed':
        return 'fas fa-exchange-alt text-purple-500';
      default:
        return 'fas fa-bell text-yellow-500';
    }
  };
  
  return (
    <div className={`p-4 border-b last:border-b-0 ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}>
      <div className="flex">
        <div className="mr-4 mt-1">
          <i className={`${getIconByType(notification.type)} text-lg`}></i>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div className="font-medium text-sm">
              {notification.type === 'referral_used' && 'New Referral'}
              {notification.type === 'reward_earned' && 'Reward Earned'}
              {notification.type === 'status_changed' && 'Status Update'}
            </div>
            <div className="text-xs text-neutral-500">
              {format(new Date(notification.createdAt), "MMM dd, h:mm a")}
            </div>
          </div>
          <div className="text-sm text-neutral-600">{notification.content}</div>
          
          {!notification.isRead && (
            <div className="mt-2 text-right">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onMarkAsRead(notification.id)}
              >
                Mark as read
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Notifications: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['/api/notifications'],
  });
  
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("PATCH", `/api/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const markAllAsReadMutation = useMutation({
    mutationFn: () => 
      apiRequest("POST", "/api/notifications/read-all", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Success",
        description: "All notifications marked as read.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };
  
  // Count unread notifications
  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;
  
  return (
    <Layout>
      <PageHeader title="Notifications">
        {unreadCount > 0 && (
          <Button 
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="px-4 py-2"
          >
            {markAllAsReadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-check-double mr-2"></i>
                Mark All as Read
              </>
            )}
          </Button>
        )}
      </PageHeader>
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <Card className="shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              <p>Error loading notifications. Please try again later.</p>
            </div>
          ) : notifications?.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-bell text-neutral-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-neutral-800 mb-1">No notifications yet</h3>
              <p className="text-neutral-500">
                We'll notify you when you get referrals or rewards
              </p>
            </div>
          ) : (
            <div>
              {/* Summary header */}
              {unreadCount > 0 && (
                <div className="bg-neutral-50 px-4 py-3 border-b">
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-sm text-neutral-700">
                      You have {unreadCount} unread notification{unreadCount !== 1 && 's'}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Notifications list */}
              <div className="divide-y">
                {notifications.map((notification: any) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </div>
              
              {/* If there are a lot of notifications, add pagination or load more */}
              {notifications.length > 10 && (
                <div className="bg-neutral-50 px-4 py-3 border-t text-center">
                  <Button variant="link" size="sm">
                    View older notifications
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Notifications;
