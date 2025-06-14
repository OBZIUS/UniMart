
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Product } from '@/services/productService';
import { useAuth } from '@/contexts/AuthContext';
import { deleteProduct } from '@/services/productDeletionService';
import DeleteProductDialog from './DeleteProductDialog';
import BuyNowModal from './BuyNowModal';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { X, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToFavorites?: (product: Product) => void;
  onContact?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  showDeleteButton?: boolean;
  priority?: boolean;
}

const ProductCard = React.memo(({ 
  product, 
  onAddToFavorites, 
  onContact, 
  onDelete,
  showDeleteButton = true,
  priority = false 
}: ProductCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Debug logging for the entire product object
  React.useEffect(() => {
    console.log(`ProductCard DEBUG for ${product.name}:`, product);
    console.log(`Seller email specifically:`, product.seller_email);
  }, [product]);

  const discountPercent = React.useMemo(() => 
    Math.round(((product.market_price - product.selling_price) / product.market_price) * 100),
    [product.market_price, product.selling_price]
  );

  const isOwner = user?.id === product.user_id;

  const handleAddToFavorites = React.useCallback(() => {
    onAddToFavorites?.(product);
  }, [onAddToFavorites, product]);

  const handleCallSeller = React.useCallback((phoneNumber: string) => {
    const isMobileDevice = /Mobi|Android/i.test(navigator.userAgent);
    if (isMobileDevice) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      alert("Calling is only supported on mobile devices.");
    }
  }, []);

  const handleContact = React.useCallback(() => {
    if (product.seller_phone_number) {
      handleCallSeller(product.seller_phone_number);
    } else {
      toast({
        title: "Phone not available",
        description: "Phone number not provided by seller.",
        variant: "destructive"
      });
    }
  }, [product.seller_phone_number, handleCallSeller, toast]);

  const handleBuyNow = React.useCallback(() => {
    setShowBuyNowModal(true);
  }, []);

  const handleDealMarked = React.useCallback(() => {
    // Close the modal after deal is marked
    setShowBuyNowModal(false);
    console.log('Deal marked for product:', product.id);
    
    toast({
      title: "Deal Processing",
      description: "Your deal has been marked. You can now contact the seller.",
    });
  }, [product.id, toast]);

  const handleDeleteClick = React.useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!isOwner) return;

    setIsDeleting(true);
    try {
      await deleteProduct(product.id, product.image_url);
      
      // Call the onDelete callback to update parent state
      onDelete?.(product.id);
      
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  }, [isOwner, product.id, product.image_url, onDelete, toast]);

  const handleImageLoad = React.useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = React.useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative">
        <div className="aspect-square overflow-hidden relative bg-gray-100">
          {product.image_url && !imageError ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                </div>
              )}
              <img 
                src={product.image_url} 
                alt={product.name}
                className={`w-full h-full object-cover hover:scale-105 transition-transform duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                  transition: 'opacity 0.3s ease'
                }}
              />
            </>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>
          )}
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              {discountPercent}% OFF
            </div>
          )}
          {showDeleteButton && isOwner && (
            <div className="absolute top-2 right-2 z-10">
              <Button
                onClick={handleDeleteClick}
                variant="destructive"
                size="sm"
                className="w-8 h-8 rounded-full p-0 bg-red-500 hover:bg-red-600 text-white shadow-lg border-2 border-white"
                title="Delete product"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-2 flex-1">{product.name}</h3>
          </div>
          
          {product.description && (
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
          )}
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 line-through text-sm">₹{product.market_price}</span>
              <span className="text-unigreen font-bold text-xl">₹{product.selling_price}</span>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Seller: {product.seller_name}</p>
              <p>Room: {product.seller_room_number}</p>
              <p className="break-all">Email: {product.seller_email}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {!isOwner ? (
              <Button 
                onClick={handleBuyNow}
                className="flex-1 bg-unigreen hover:bg-unigreen/90 text-white rounded-full text-sm flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy Now
              </Button>
            ) : (
              <Button 
                onClick={handleContact}
                className="flex-1 bg-unigreen hover:bg-unigreen/90 text-white rounded-full text-sm"
              >
                📞 Call Seller
              </Button>
            )}
            <Button 
              onClick={handleAddToFavorites}
              variant="outline"
              className="w-10 h-10 rounded-full p-0"
            >
              ❤️
            </Button>
          </div>
        </div>
      </div>

      <DeleteProductDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        product={product}
        isDeleting={isDeleting}
      />

      <BuyNowModal
        isOpen={showBuyNowModal}
        onClose={() => setShowBuyNowModal(false)}
        product={product}
        onDealMarked={handleDealMarked}
      />
    </>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
