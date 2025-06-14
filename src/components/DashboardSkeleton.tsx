
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = () => {
  return (
    <div className="container mx-auto px-6 py-8 relative z-10 max-w-4xl">
      <div className="text-center mb-8">
        <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
        <Skeleton className="h-8 w-80 mx-auto mb-2" />
        <Skeleton className="h-4 w-96 mx-auto" />
        <Skeleton className="h-12 w-12 rounded-full mx-auto mt-4" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Section Skeleton */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="absolute ml-12 mt-12 w-6 h-6 rounded-full" />
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Skeleton className="h-10 w-32 rounded-full" />
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>
          </div>

          {/* Statistics Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 text-center shadow-lg">
                <Skeleton className="h-8 w-8 rounded mx-auto mb-2" />
                <Skeleton className="h-8 w-12 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
