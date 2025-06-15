import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { AuthSyncProvider } from './contexts/AuthSyncContext'
import { ProductCountProvider } from './contexts/ProductCountContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthSyncProvider>
          <AuthProvider>
            <ProductCountProvider>
              <TooltipProvider>
                <App />
                <Toaster />
                <Sonner />
              </TooltipProvider>
            </ProductCountProvider>
          </AuthProvider>
        </AuthSyncProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
