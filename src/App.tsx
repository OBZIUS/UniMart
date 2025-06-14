
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthSyncProvider } from "./contexts/AuthSyncContext";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import Electronics from "./pages/Electronics";
import Stationary from "./pages/Stationary";
import FruitsVeggies from "./pages/FruitsVeggies";
import Munchies from "./pages/Munchies";
import Beauty from "./pages/Beauty";
import OtherProducts from "./pages/OtherProducts";
import Dashboard from "./pages/Dashboard";
import SignUp from "./pages/SignUp";
import ProductDetails from "./pages/ProductDetails";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import ErrorPage from "./pages/ErrorPage";
import NoProducts from "./pages/NoProducts";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSyncProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/electronics" element={<Electronics />} />
              <Route path="/stationary" element={<Stationary />} />
              <Route path="/fruits-veggies" element={<FruitsVeggies />} />
              <Route path="/munchies" element={<Munchies />} />
              <Route path="/beauty" element={<Beauty />} />
              <Route path="/other-products" element={<OtherProducts />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="/no-products" element={<NoProducts />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </AuthSyncProvider>
    </QueryClientProvider>
  );
}

export default App;
