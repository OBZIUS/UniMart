
import { useState, useEffect } from 'react';

// Updated function to get deals count without authentication requirement
const getDealsCompletedCount = async (): Promise<number> => {
  try {
    // Import supabase client
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase
      .from('deals_metadata')
      .select('value')
      .eq('key', 'deals_completed')
      .maybeSingle(); // Use maybeSingle instead of single to handle no rows case

    if (error) {
      console.error('Error fetching deals count:', error);
      return 0;
    }

    const count = data?.value || 0;
    console.log('Fetched deals count from database:', count);
    return count;
  } catch (error) {
    console.error('Error in getDealsCompletedCount:', error);
    return 0;
  }
};

export const useDealsCounter = () => {
  const [dealsCompleted, setDealsCompleted] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadDealsCount = async () => {
    try {
      setIsLoading(true);
      const count = await getDealsCompletedCount();
      setDealsCompleted(count);
      console.log('Updated deals counter state to:', count);
    } catch (error) {
      console.error('Error loading deals count:', error);
      setDealsCompleted(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadDealsCount();
    
    // Listen for deal completion events
    const handleDealCompleted = () => {
      console.log('Deal completed event received, refreshing counter...');
      // Add a small delay to ensure the database has been updated
      setTimeout(() => {
        loadDealsCount();
      }, 1000);
    };
    
    // Listen for custom events
    window.addEventListener('dealCompleted', handleDealCompleted);
    
    // Set up real-time subscription for deals_metadata changes
    const setupRealtimeSubscription = async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const channel = supabase
        .channel('deals-counter-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'deals_metadata',
            filter: 'key=eq.deals_completed'
          },
          (payload) => {
            console.log('Real-time deals counter update:', payload);
            loadDealsCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const unsubscribeRealtime = setupRealtimeSubscription();
    
    return () => {
      window.removeEventListener('dealCompleted', handleDealCompleted);
      unsubscribeRealtime.then(unsub => unsub?.());
    };
  }, []);

  const refreshCount = () => {
    console.log('Manual refresh of deals counter requested');
    loadDealsCount();
  };

  return {
    dealsCompleted,
    isLoading,
    refreshCount
  };
};
