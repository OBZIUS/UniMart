import React, { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import FloatingIcons from '../components/FloatingIcons';
import CursorPanda from '../components/CursorPanda';
import StaticPageHeader from '../components/StaticPageHeader';
import StaticSearchBar from '../components/StaticSearchBar';
import OptimizedProductGrid from '../components/OptimizedProductGrid';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { useOptimizedProductsWithCache } from '../hooks/useOptimizedProductsWithCache';
import { Product } from '../services/productService';

const Beauty = React.memo(() => {
  const navigate = useNavigate();
  const { addToFavorites } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    products, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refresh 
  } = useOptimizedProductsWithCache('Beauty & Personal Care');

  const filteredProducts = React.useMemo(() => 
    products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.seller_name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [products, searchTerm]
  );

  const handleAddToFavorites = React.useCallback((product: Product) => {
    addToFavorites(product);
    toast({
      title: "Added to Favorites",
      description: `${product.name} has been added to your favorites.`,
    });
  }, [addToFavorites, toast]);

  const handleContact = React.useCallback((product: Product) => {
    toast({
      title: "Contact Seller",
      description: `Contact ${product.seller_name} at room ${product.seller_room_number}`,
    });
  }, [toast]);

  const handleProductDeleted = React.useCallback((productId: string) => {
    refresh();
    toast({
      title: "Success",
      description: "Product deleted successfully",
    });
  }, [refresh, toast]);

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load products</p>
          <button onClick={refresh} className="bg-unigreen text-white px-4 py-2 rounded">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Navigate to no-products page if no products found and not loading
  if (products.length === 0 && !loading) {
    navigate('/no-products');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden font-inter">
      <FloatingIcons />
      <CursorPanda />
      
      <StaticPageHeader title="Beauty & Personal Care" emoji="💄" showUserIcon={false} />
      <StaticSearchBar 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        placeholder="Search beauty products..." 
      />

      <div className="container mx-auto px-6 pb-20 relative z-10">
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          }>
            <OptimizedProductGrid
              products={filteredProducts}
              loading={loading}
              hasMore={hasMore && !searchTerm}
              onLoadMore={loadMore}
              onAddToFavorites={handleAddToFavorites}
              onContact={handleContact}
              onDelete={handleProductDeleted}
            />
          </Suspense>
        )}

        {searchTerm && filteredProducts.length === 0 && products.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No beauty products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
});

Beauty.displayName = 'Beauty';

export default Beauty;