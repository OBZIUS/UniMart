import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getUserNotifications, markDealComplete, cancelDeal, type Notification } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface NotificationBellProps {
  onDealCompleted?: () => void;
  onCounterRefresh?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onDealCompleted, onCounterRefresh }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadNotifications();
      
      // Set up real-time subscription for notifications
      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications'
          },
          () => {
            console.log('Notification change detected, reloading...');
            loadNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await getUserNotifications();
      setNotifications(data);
      console.log('Loaded notifications:', data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleMarkDeal = async (notificationId: string) => {
    setIsLoading(true);
    try {
      const result = await markDealComplete(notificationId);
      
      if (result.deal_completed) {
        toast({
          title: "Deal Completed! 🎉",
          description: "The product has been sold and counters updated.",
        });
        
        // Remove the notification from local state since it's been deleted
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        // Trigger all the refresh callbacks
        onDealCompleted?.();
        onCounterRefresh?.();
        
        // Dispatch custom events for counter refresh
        console.log('Dispatching deal completion events...');
        window.dispatchEvent(new CustomEvent('dealCompleted'));
        
        // Also trigger a delayed refresh to ensure database consistency
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('dealCompleted'));
          onCounterRefresh?.();
        }, 2000);
        
      } else {
        toast({
          title: "Deal Marked",
          description: "Waiting for the other party to confirm.",
        });
        // Reload notifications to get updated state
        await loadNotifications();
      }
    } catch (error) {
      console.error('Error marking deal:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mark deal",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDeal = async (notificationId: string) => {
    setCancelingId(notificationId);
    try {
      await cancelDeal(notificationId);
      
      toast({
        title: "Deal Canceled",
        description: "The deal has been canceled and the buyer has been notified.",
      });
      
      // Remove the notification from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
    } catch (error) {
      console.error('Error canceling deal:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel deal",
        variant: "destructive"
      });
    } finally {
      setCancelingId(null);
    }
  };

  // Filter notifications to show only to sellers who need to respond
  const relevantNotifications = notifications.filter(n => {
    if (!user) return false;
    
    const isSeller = n.seller_id === user.id;
    
    // Only show notifications to sellers who haven't marked yet
    return isSeller && !n.seller_marked;
  });

  const unreadCount = relevantNotifications.length;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(true)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {relevantNotifications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No notifications</p>
            ) : (
              relevantNotifications.map((notification) => (
                <div key={notification.id} className="border rounded-lg p-4 space-y-3">
                  <div className="text-sm">
                    <p className="font-medium">{notification.buyer_name} wants to buy your product!</p>
                    <p className="text-gray-600">Product: {notification.product_name}</p>
                    <p className="text-green-600 text-xs">✅ Buyer has confirmed their intent</p>
                  </div>

                  <p className="text-sm text-gray-600">
                    Only press "Mark Deal" once you receive the payment.
                  </p>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleMarkDeal(notification.id)}
                      disabled={isLoading}
                      size="sm"
                      className="bg-unigreen hover:bg-unigreen/90"
                    >
                      {isLoading ? 'Processing...' : 'Mark Deal'}
                    </Button>
                    <Button
                      onClick={() => handleCancelDeal(notification.id)}
                      disabled={cancelingId === notification.id}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      {cancelingId === notification.id ? 'Canceling...' : 'Cancel Deal'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationBell;
