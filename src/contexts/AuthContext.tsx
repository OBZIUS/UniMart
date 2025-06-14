
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Product } from '@/services/productService';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  room_number?: string;
  academic_year?: string;
  upi_id?: string;
  phone_number?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    phone: string,
    roomNumber: string,
    academicYear: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  addToFavorites: (product: Product) => void;
  addToPurchased: (product: Product) => void;
  cart: Product[];
  cartItems: Product[];
  favorites: Product[];
  favoriteItems: Product[];
  purchasedItems: Product[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<Product[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('AuthContext: Auth state change', event, session?.user?.id);
        
        if (session?.user) {
          setUser(session.user);
          // Defer profile fetch to avoid blocking auth state changes
          setTimeout(() => {
            if (mounted && session.user) {
              fetchUserProfile(session.user.id);
            }
          }, 100);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    // Get initial session with mounted check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) return { error: error.message };
      
      setUser(data.user);
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    roomNumber: string,
    academicYear: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            room_number: roomNumber,
            academic_year: academicYear,
          }
        }
      });
      
      if (error) return { error: error.message };
      
      setUser(data.user);
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Starting secure signOut process');
      
      // Clear local state first
      setUser(null);
      setUserProfile(null);
      setCart([]);
      setCartItems([]);
      setFavorites([]);
      setFavoriteItems([]);
      setPurchasedItems([]);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthContext: Supabase signOut error:', error);
        throw error;
      }
      
      // Clear any cached session data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      console.log('AuthContext: Secure signOut completed successfully');
    } catch (error) {
      console.error('AuthContext: signOut error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut();
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) return { error: error.message };

      await fetchUserProfile(user.id);
      return {};
    } catch (error) {
      return { error: 'Failed to update profile' };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => [...prev, product]);
    setCartItems(prev => [...prev, product]);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCartItems([]);
  };

  const addToFavorites = (product: Product) => {
    setFavorites(prev => [...prev, product]);
    setFavoriteItems(prev => [...prev, product]);
  };

  const addToPurchased = (product: Product) => {
    setPurchasedItems(prev => [...prev, product]);
  };

  const value = {
    user,
    userProfile,
    isAuthenticated: !!user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
    logout: signOut, // Use the enhanced signOut
    addToCart,
    removeFromCart,
    clearCart,
    addToFavorites,
    addToPurchased,
    cart,
    cartItems,
    favorites,
    favoriteItems,
    purchasedItems,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
