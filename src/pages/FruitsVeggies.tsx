
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import FloatingCart from '../components/FloatingCart';
import FloatingIcons from '../components/FloatingIcons';
import CursorPanda from '../components/CursorPanda';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import InfiniteScroll from '../components/InfiniteScroll';
import { useOptimizedProducts } from '../hooks/useOptimizedProducts';
import { Product } from '../services/productService';

const FruitsVeggies = () => {
  const navigate = useNavigate();
  const { addToFavorites, addToCart } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    products, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refresh 
  } = useOptimizedProducts('Fruits & Veggies');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToFavorites = (product: Product) => {
    addToFavorites(product);
    toast({
      title: "Added to Favorites",
      description: `${product.name} has been added to your favorites.`,
    });
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleContact = (product: Product) => {
    toast({
      title: "Contact Seller",
      description: `Contact ${product.seller_name} at room ${product.seller_room_number}`,
    });
  };

  const handleProductDeleted = (productId: string) => {
    refresh();
    toast({
      title: "Success",
      description: "Product deleted successfully",
    });
  };

  const handleBackClick = () => {
    navigate('/categories');
  };

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load products</p>
          <Button onClick={refresh} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 relative overflow-hidden font-inter">
        <FloatingIcons />
        <CursorPanda />
        
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <Button 
            onClick={handleBackClick}
            variant="ghost" 
            className="flex items-center space-x-2 rounded-full hover:bg-white/80 hover:scale-105 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
          >
            <span>←</span>
          </Button>
        </div>

        {/* Header */}
        <header className="flex items-center justify-center pt-12 pb-8 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-unigreen to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <h1 className="text-2xl font-recoleta font-semibold text-gray-800">Fruits & Veggies 🥦</h1>
          </div>
        </header>

        {/* Search Bar */}
        <div className="container mx-auto px-6 mb-8 relative z-10">
          <div className="max-w-md mx-auto relative">
            <div className="relative bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-white/60">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search fruits & veggies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 rounded-full border-0 bg-transparent focus:ring-2 focus:ring-unigreen/20 text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Skeleton Grid */}
        <div className="container mx-auto px-6 pb-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
        
        <FloatingCart />
      </div>
    );
  }

  if (products.length === 0 && !loading) {
    navigate('/no-products');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden font-inter">
      <FloatingIcons />
      <CursorPanda />
      
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Button 
          onClick={handleBackClick}
          variant="ghost" 
          className="flex items-center space-x-2 rounded-full hover:bg-white/80 hover:scale-105 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
        >
          <span>←</span>
        </Button>
      </div>

      {/* Header */}
      <header className="flex items-center justify-center pt-12 pb-8 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-unigreen to-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">U</span>
          </div>
          <h1 className="text-2xl font-recoleta font-semibold text-gray-800">Fruits & Veggies 🥦</h1>
        </div>
      </header>

      {/* Enhanced Search Bar */}
      <div className="container mx-auto px-6 mb-8 relative z-10">
        <div className="max-w-md mx-auto relative">
          <div className="relative bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-white/60">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search fruits & veggies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-full border-0 bg-transparent focus:ring-2 focus:ring-unigreen/20 text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Products Grid with Infinite Scroll */}
      <div className="container mx-auto px-6 pb-20 relative z-10">
        <InfiniteScroll
          hasMore={hasMore && !searchTerm}
          loading={loading}
          onLoadMore={loadMore}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToFavorites={handleAddToFavorites}
                onContact={handleContact}
                onDelete={handleProductDeleted}
                priority={index < 6} // Prioritize first 6 images
              />
            ))}
          </div>
        </InfiniteScroll>

        {/* Show skeletons while loading more */}
        {loading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <ProductCardSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        )}

        {/* Search Results */}
        {searchTerm && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No fruits & veggies found matching your search.</p>
          </div>
        )}
      </div>
      
      <FloatingCart />
    </div>
  );
};

export default FruitsVeggies;
