
import { useState, useEffect } from 'react';
import { getUserPurchasedCount, getUserSoldCount } from '@/services/notificationService';

export const useUserStats = () => {
  const [purchasedCount, setPurchasedCount] = useState<number>(0);
  const [soldCount, setSoldCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserStats = async () => {
    try {
      setIsLoading(true);
      const [purchased, sold] = await Promise.all([
        getUserPurchasedCount(),
        getUserSoldCount()
      ]);
      setPurchasedCount(purchased);
      setSoldCount(sold);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserStats();
  }, []);

  const refreshStats = () => {
    loadUserStats();
  };

  return {
    purchasedCount,
    soldCount,
    isLoading,
    refreshStats
  };
};
