import { useEffect, useCallback } from 'react';

export const useDashboardSync = (onUpdate?: () => void) => {
  const handleProductChange = useCallback((event: CustomEvent) => {
    console.log('Dashboard sync: Product change detected', event.detail);
    if (onUpdate) {
      onUpdate();
    }
  }, [onUpdate]);

  useEffect(() => {
    // Listen for product changes
    window.addEventListener('product-change', handleProductChange as EventListener);
    
    return () => {
      window.removeEventListener('product-change', handleProductChange as EventListener);
    };
  }, [handleProductChange]);

  // Manual trigger for dashboard refresh
  const triggerDashboardUpdate = useCallback(() => {
    if (onUpdate) {
      onUpdate();
    }
  }, [onUpdate]);

  return { triggerDashboardUpdate };
};