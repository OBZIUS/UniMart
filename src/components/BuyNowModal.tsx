import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from '@/services/productService';
import { createDealNotification } from '@/services/notificationService';
import { useIsMobile } from '@/hooks/use-mobile';
import { ShoppingCart, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface BuyNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onDealMarked: () => void;
  onDealCompleted?: () => void;
}

const BuyNowModal: React.FC<BuyNowModalProps> = ({ 
  isOpen, 
  onClose, 
  product, 
  onDealMarked,
  onDealCompleted 
}) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isDealMarked, setIsDealMarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dealCanceled, setDealCanceled] = useState(false);
  const [currentNotificationId, setCurrentNotificationId] = useState<string | null>(null);
  const [sellerPhoneNumber, setSellerPhoneNumber] = useState<string | null>(null);

  // useEffect hooks for fetching seller phone and checking existing notification
  useEffect(() => {
    if (isOpen && product.user_id) {
      fetchSellerPhoneNumber();
    }
  }, [isOpen, product.user_id]);

  useEffect(() => {
    if (isOpen && user) {
      checkExistingNotification();
    }
  }, [isOpen, user, product.id]);

  const fetchSellerPhoneNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('phone_number, phone')
        .eq('id', product.user_id)
        .single();

      if (error) {
        console.error('Error fetching seller phone:', error);
        return;
      }

      if (data) {
        setSellerPhoneNumber(data.phone_number || data.phone);
      }
    } catch (error) {
      console.error('Error fetching seller phone:', error);
    }
  };

  const checkExistingNotification = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('product_id', product.id)
        .eq('buyer_id', user?.id)
        .eq('seller_id', product.user_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking existing notification:', error);
        return;
      }

      if (data) {
        console.log('Found existing notification:', data);
        setCurrentNotificationId(data.id);
        
        if (data.status === 'cancelled') {
          setDealCanceled(true);
          setIsDealMarked(false);
        } else if (data.buyer_marked) {
          setIsDealMarked(true);
          setDealCanceled(false);
        }
      }
    } catch (error) {
      console.error('Error checking existing notification:', error);
    }
  };

  const handleMarkDeal = async () => {
    setIsLoading(true);
    try {
      const newNotification = await createDealNotification(product.id, product.user_id);
      setCurrentNotificationId(newNotification.id);
      setIsDealMarked(true);
      setDealCanceled(false);
      
      // Call the parent callback but don't let it close the modal
      onDealMarked();
      
      // Show sonner toast at the top with 8 second duration and larger size
      toast("Deal Marked Successfully! 🎉", {
        description: "The seller has been informed and the call seller button is now unlocked. You can call the seller and get your product.",
        position: "top-center",
        action: {
          label: "Got it",
          onClick: () => console.log("User acknowledged the message")
        },
        duration: 8000,
        className: "w-96 max-w-md p-4 text-base",
      });
      
    } catch (error) {
      console.error('Error marking deal:', error);
      // Show error toast
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to mark deal",
        position: "top-center",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // handleCallSeller, handleClose functions and return JSX
  const handleCallSeller = () => {
    if (!sellerPhoneNumber) {
      toast("Phone not available", {
        description: "Seller's phone number is not available.",
        position: "top-center",
        duration: 3000,
      });
      return;
    }

    // Open phone dialer
    window.location.href = `tel:${sellerPhoneNumber}`;
  };

  const handleClose = () => {
    setIsDealMarked(false);
    setDealCanceled(false);
    setCurrentNotificationId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Do you want to buy this product?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-600">{product.description}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-500 line-through">₹{product.market_price}</span>
              <span className="text-unigreen font-bold text-xl">₹{product.selling_price}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>Seller: {product.seller_name}</p>
              <p>Room: {product.seller_room_number}</p>
              <p>Contact: {product.seller_email}</p>
              {product.seller_phone_number && (
                <p>Phone: {product.seller_phone_number}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleMarkDeal}
              disabled={isDealMarked || isLoading || dealCanceled}
              className={`${
                isDealMarked 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-unigreen hover:bg-unigreen/90 text-white'
              }`}
            >
              {isLoading ? 'Marking Deal...' : isDealMarked ? '✅ Deal Marked' : dealCanceled ? '❌ Deal Canceled' : '✅ Mark the Deal'}
            </Button>

            <Button 
              onClick={handleCallSeller}
              disabled={!isDealMarked || dealCanceled || !sellerPhoneNumber}
              className={`flex items-center gap-2 ${
                isDealMarked && !dealCanceled && sellerPhoneNumber
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              <Phone className="w-4 h-4" />
              Call Seller
            </Button>
          </div>

          {isDealMarked && !dealCanceled && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <p className="text-sm text-green-700">
                The seller has been informed and the call seller button is now unlocked. You can call the seller and get your product.
              </p>
            </div>
          )}

          {dealCanceled && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-sm text-red-700">
                This deal has been canceled by the seller. You can try contacting them directly or look for other products.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyNowModal;