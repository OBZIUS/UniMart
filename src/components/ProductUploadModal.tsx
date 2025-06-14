import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { createProduct, VALID_CATEGORIES } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import { useProductCount } from '../hooks/useProductCount';
import { Camera } from 'lucide-react';

interface ProductUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
  onProductCreated: () => void;
}

const STORAGE_KEY = 'product_upload_draft';

const ProductUploadModal: React.FC<ProductUploadModalProps> = ({ 
  isOpen, 
  onClose, 
  category = '', 
  onProductCreated 
}) => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { productCount, isLimitReached, refresh: refreshProductCount } = useProductCount();
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    market_price: '',
    selling_price: '',
    category: category || '',
    image: null as File | null
  });

  // Load draft from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedDraft = localStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);
          setFormData(prev => ({
            ...prev,
            name: parsedDraft.name || '',
            description: parsedDraft.description || '',
            market_price: parsedDraft.market_price || '',
            selling_price: parsedDraft.selling_price || '',
            category: category || parsedDraft.category || ''
          }));
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    }
  }, [isOpen, category]);

  // Set category when modal opens from a specific category page
  useEffect(() => {
    if (category && VALID_CATEGORIES.includes(category)) {
      setFormData(prev => ({ ...prev, category }));
    }
  }, [category]);

  // Refresh product count when modal opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      refreshProductCount();
    }
  }, [isOpen, isAuthenticated, refreshProductCount]);

  // Save draft to localStorage whenever form data changes
  const saveDraft = useCallback((data: typeof formData) => {
    const draftData = {
      name: data.name,
      description: data.description,
      market_price: data.market_price,
      selling_price: data.selling_price,
      category: data.category
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      saveDraft(newData);
      return newData;
    });
  }, [saveDraft]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file",
          description: "Please select an image file.",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (35MB limit before compression)
      if (file.size > 35 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 35MB.",
          variant: "destructive"
        });
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const handleCameraCapture = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use rear camera on mobile
    input.style.display = 'none';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file",
            description: "Please select an image file.",
            variant: "destructive"
          });
          return;
        }

        // Validate file size (35MB limit before compression)
        if (file.size > 35 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please select an image smaller than 35MB.",
            variant: "destructive"
          });
          return;
        }

        setFormData(prev => ({ ...prev, image: file }));
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
      document.body.removeChild(input);
    };
    
    document.body.appendChild(input);
    input.click();
  }, [toast]);

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Product name is required.",
        variant: "destructive"
      });
      return false;
    }

    const marketPrice = parseFloat(formData.market_price);
    const sellingPrice = parseFloat(formData.selling_price);

    if (!formData.market_price || marketPrice <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid market price.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.selling_price || sellingPrice <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid selling price.",
        variant: "destructive"
      });
      return false;
    }

    // Client-side selling price validation
    if (sellingPrice > marketPrice) {
      toast({
        title: "Invalid Pricing",
        description: "Selling price cannot be higher than market price.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.category) {
      toast({
        title: "Missing Category",
        description: "Please select a category.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  }, [formData, toast]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload products.",
        variant: "destructive"
      });
      return;
    }

    // Check product limit
    if (isLimitReached) {
      toast({
        title: "Product Limit Reached",
        description: `You can only upload a maximum of 5 products. You currently have ${productCount} products. Please delete an existing product first.`,
        variant: "destructive"
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    
    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        market_price: parseFloat(formData.market_price),
        selling_price: parseFloat(formData.selling_price),
        category: formData.category,
        image: formData.image
      };

      await createProduct(productData);
      
      toast({
        title: "Success!",
        description: "Product uploaded successfully!",
      });
      
      // Clear draft from localStorage on successful upload
      localStorage.removeItem(STORAGE_KEY);
      resetForm();
      refreshProductCount();
      onProductCreated();
      onClose();
    } catch (error) {
      console.error('Error uploading product:', error);
      
      // Handle specific product limit error
      if (error instanceof Error && error.message.includes('cannot upload more than 5 products')) {
        toast({
          title: "Product Limit Reached",
          description: "You can only upload a maximum of 5 products. Please delete an existing product first.",
          variant: "destructive"
        });
        refreshProductCount(); // Refresh count to sync with server
      } else {
        toast({
          title: "Upload Failed",
          description: error instanceof Error ? error.message : "Failed to upload product. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsUploading(false);
    }
  }, [formData, isAuthenticated, isLimitReached, productCount, validateForm, toast, onProductCreated, onClose, refreshProductCount]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      market_price: '',
      selling_price: '',
      category: category || '',
      image: null
    });
    setImagePreview(null);
    localStorage.removeItem(STORAGE_KEY);
  }, [category]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const calculateSavings = useCallback(() => {
    const market = parseFloat(formData.market_price) || 0;
    const selling = parseFloat(formData.selling_price) || 0;
    if (market > 0 && selling > 0 && selling <= market) {
      const savings = market - selling;
      const percentage = Math.round((savings / market) * 100);
      return { amount: savings, percentage };
    }
    return null;
  }, [formData.market_price, formData.selling_price]);

  const savings = calculateSavings();

  // Check if selling price is higher than market price for real-time warning
  const isPriceInvalid = formData.market_price && formData.selling_price && 
    parseFloat(formData.selling_price) > parseFloat(formData.market_price);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-recoleta text-xl">
            Add Product {formData.category && `to ${formData.category}`}
          </DialogTitle>
        </DialogHeader>
        
        {/* Product limit warning */}
        {isLimitReached && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ Product Limit Reached
            </p>
            <p className="text-sm text-red-600">
              You have reached the maximum limit of 5 products ({productCount}/5). 
              Please delete an existing product before adding a new one.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName" className="text-sm font-medium">Product Name *</Label>
            <Input
              id="productName"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter product name"
              required
              className="rounded-xl"
              disabled={isLimitReached}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
              required
              disabled={isLimitReached}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {VALID_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marketPrice" className="text-sm font-medium">Market Price *</Label>
              <Input
                id="marketPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.market_price}
                onChange={(e) => handleInputChange('market_price', e.target.value)}
                placeholder="₹0"
                required
                className="rounded-xl"
                disabled={isLimitReached}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sellingPrice" className="text-sm font-medium">Your Price *</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.selling_price}
                onChange={(e) => handleInputChange('selling_price', e.target.value)}
                placeholder="₹0"
                required
                className={`rounded-xl ${isPriceInvalid ? 'border-red-500' : ''}`}
                disabled={isLimitReached}
              />
            </div>
          </div>

          {/* Price validation warning */}
          {isPriceInvalid && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-700">
                ⚠️ Selling price cannot be higher than market price
              </p>
            </div>
          )}

          {savings && !isPriceInvalid && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-sm text-green-700">
                💰 Buyers save ₹{savings.amount.toFixed(2)} ({savings.percentage}% off)
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your product (condition, features, etc.)"
              rows={3}
              className="rounded-xl"
              disabled={isLimitReached}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Product Image</Label>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCameraCapture}
                disabled={isLimitReached}
                className="flex items-center gap-2 rounded-xl flex-1"
              >
                <Camera size={16} />
                Take Photo
              </Button>
              
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="rounded-xl flex-1"
                disabled={isLimitReached}
              />
            </div>
            
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              </div>
            )}
            <p className="text-xs text-gray-500">
              Maximum file size: 35MB. Images will be compressed to under 500KB for optimal performance
            </p>
          </div>
          
          <div className="flex space-x-4 pt-4">
            <Button 
              type="submit" 
              disabled={isUploading || isLimitReached || isPriceInvalid}
              className="flex-1 bg-unigreen hover:bg-unigreen/90 text-white rounded-full font-medium disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : isLimitReached ? (
                'Limit Reached'
              ) : (
                'Upload Product'
              )}
            </Button>
            <Button 
              type="button"
              onClick={handleClose} 
              variant="outline" 
              className="flex-1 rounded-full"
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductUploadModal;
