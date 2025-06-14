
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
      <div className="aspect-square overflow-hidden relative">
        <Skeleton className="w-full h-full" />
      </div>
      
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
          
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        
        <div className="flex space-x-2 pt-2">
          <Skeleton className="h-9 flex-1 rounded-full" />
          <Skeleton className="h-9 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
