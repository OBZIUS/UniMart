
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchOptimizedDashboardData, OptimizedDashboardData } from '../services/optimizedDashboardService';

export const useOptimizedDashboard = () => {
  const { user, favorites } = useAuth();
  const [dashboardData, setDashboardData] = useState<OptimizedDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchOptimizedDashboardData(user.id);
      
      // Add favorites count from localStorage/context
      const optimizedData = {
        ...data,
        stats: {
          ...data.stats,
          totalFavorites: favorites.length
        }
      };
      
      setDashboardData(optimizedData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user, favorites.length]);

  const refresh = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    refresh
  };
};
