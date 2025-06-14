
import React, { Suspense, useMemo } from 'react';
import { Product } from '@/services/productService';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import InfiniteScroll from './InfiniteScroll';

interface OptimizedProductGridProps {
  products: Product[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onAddToFavorites: (product: Product) => void;
  onContact: (product: Product) => void;
  onDelete?: (productId: string) => void;
  showDeleteButton?: boolean;
}

const MemoizedProductCard = React.memo(ProductCard);

const OptimizedProductGrid = React.memo(({ 
  products, 
  loading, 
  hasMore, 
  onLoadMore,
  onAddToFavorites,
  onContact,
  onDelete,
  showDeleteButton = true
}: OptimizedProductGridProps) => {
  const memoizedProducts = useMemo(() => products, [products]);

  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    }>
      <InfiniteScroll
        hasMore={hasMore}
        loading={loading}
        onLoadMore={onLoadMore}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memoizedProducts.map((product, index) => (
            <MemoizedProductCard
              key={product.id}
              product={product}
              onAddToFavorites={onAddToFavorites}
              onContact={onContact}
              onDelete={onDelete}
              showDeleteButton={showDeleteButton}
              priority={index < 6}
            />
          ))}
        </div>
      </InfiniteScroll>

      {loading && memoizedProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <ProductCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      )}
    </Suspense>
  );
});

OptimizedProductGrid.displayName = 'OptimizedProductGrid';

export default OptimizedProductGrid;
