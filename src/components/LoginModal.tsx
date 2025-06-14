
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEmailChange = (value: string) => {
    // Email format validation (allow basic email characters)
    const filteredValue = value.replace(/[^a-zA-Z0-9@._-]/g, '');
    setEmail(filteredValue);
  };

  const handlePasswordChange = (value: string) => {
    // Allow all characters for password
    setPassword(value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // Validate email domain
    if (!email.endsWith('@sst.scaler.com')) {
      toast({
        title: "Invalid Email Domain",
        description: "Only @sst.scaler.com email addresses are allowed.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      onClose();
      navigate('/categories');
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md font-inter bg-white/95 backdrop-blur-md border border-white/60 shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-recoleta text-2xl text-center">Welcome Back</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your @sst.scaler.com email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-unigreen hover:bg-unigreen/90 text-white hover:scale-105 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
