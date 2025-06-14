
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthSyncContextType {
  session: Session | null;
  isLoading: boolean;
  isFetching: boolean;
  setIsFetching: (fetching: boolean) => void;
}

const AuthSyncContext = createContext<AuthSyncContextType | undefined>(undefined);

export const useAuthSync = () => {
  const context = useContext(AuthSyncContext);
  if (!context) {
    throw new Error('useAuthSync must be used within AuthSyncProvider');
  }
  return context;
};

export const AuthSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const initializingRef = useRef(false);
  const mountedRef = useRef(true);

  // BroadcastChannel for cross-tab communication
  const [broadcastChannel] = useState(() => new BroadcastChannel('unimart-auth'));

  const handleAuthChange = useCallback((event: string, session: Session | null) => {
    if (!mountedRef.current) return;
    
    console.log('Auth state change:', event, session?.user?.id);
    setSession(session);
    setIsLoading(false);
    
    // Only broadcast if this is not from another tab
    if (event !== 'INITIAL_SESSION') {
      broadcastChannel.postMessage({
        type: 'auth-change',
        event,
        session: session ? {
          user: { id: session.user.id, email: session.user.email },
          access_token: session.access_token
        } : null,
        timestamp: Date.now()
      });
    }
  }, [broadcastChannel]);

  useEffect(() => {
    mountedRef.current = true;
    
    // Prevent multiple initializations
    if (initializingRef.current) return;
    initializingRef.current = true;

    const initializeAuth = async () => {
      try {
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (mountedRef.current) {
          setSession(session);
          setIsLoading(false);
        }

        return subscription;
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mountedRef.current) {
          setIsLoading(false);
        }
        return null;
      }
    };

    // Listen for cross-tab auth changes
    const handleBroadcastMessage = (event: MessageEvent) => {
      if (!mountedRef.current || event.data?.type !== 'auth-change') return;
      
      console.log('Received auth change from another tab');
      
      // Debounce cross-tab updates to prevent loops
      setTimeout(() => {
        if (mountedRef.current) {
          setSession(event.data.session);
        }
      }, 100);
    };

    broadcastChannel.addEventListener('message', handleBroadcastMessage);
    
    let subscription: any = null;
    initializeAuth().then((sub) => {
      subscription = sub;
    });

    return () => {
      mountedRef.current = false;
      initializingRef.current = false;
      subscription?.unsubscribe();
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    };
  }, [handleAuthChange, broadcastChannel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <AuthSyncContext.Provider 
      value={{ 
        session, 
        isLoading, 
        isFetching, 
        setIsFetching 
      }}
    >
      {children}
    </AuthSyncContext.Provider>
  );
};
