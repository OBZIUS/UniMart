
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';
import { validateEmail, sanitizeText } from '@/utils/inputSanitization';

interface SecurityEnhancedLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SecurityEnhancedLoginModal = ({ isOpen, onClose }: SecurityEnhancedLoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { logSuspiciousActivity, checkRateLimit } = useSecurityAudit();

  const handleEmailChange = (value: string) => {
    const sanitized = sanitizeText(value);
    setEmail(sanitized);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Check rate limiting
      const canProceed = await checkRateLimit('login_attempt');
      if (!canProceed) {
        await logSuspiciousActivity('excessive_login_attempts', { email });
        toast({
          title: "Too Many Attempts",
          description: "Please wait before trying again.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Enhanced email validation
      if (!validateEmail(email)) {
        await logSuspiciousActivity('invalid_email_login', { email });
        toast({
          title: "Invalid Email",
          description: "Only @sst.scaler.com email addresses are allowed.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Attempt login
      const { error } = await signIn(email, password);
      
      if (error) {
        setAttemptCount(prev => prev + 1);
        
        // Check if it's a "user not found" or "invalid credentials" error
        if (error.includes('Invalid login credentials') || error.includes('User not found') || error.includes('Email not confirmed')) {
          toast({
            title: "Account Not Found",
            description: "No account found with this email. Redirecting to signup...",
            variant: "destructive"
          });
          
          // Close modal and redirect to signup page after a short delay
          setTimeout(() => {
            onClose();
            navigate('/signup');
          }, 2000);
          
          setIsLoading(false);
          return;
        }
        
        // Log failed login attempts
        await logSuspiciousActivity('failed_login_attempt', { 
          email, 
          attempt_count: attemptCount + 1,
          error 
        });
        
        toast({
          title: "Login Failed",
          description: error,
          variant: "destructive"
        });
        
        // Block after 5 failed attempts
        if (attemptCount >= 4) {
          await logSuspiciousActivity('excessive_failed_logins', { email });
          toast({
            title: "Account Temporarily Locked",
            description: "Too many failed attempts. Please try again later.",
            variant: "destructive"
          });
          onClose();
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        onClose();
        navigate('/categories');
      }
    } catch (error) {
      await logSuspiciousActivity('login_error', { email, error });
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md font-inter bg-white/95 backdrop-blur-md border border-white/60 shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-recoleta text-2xl text-center">Secure Login</DialogTitle>
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
              maxLength={100}
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
              maxLength={128}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || attemptCount >= 5}
            className="w-full bg-unigreen hover:bg-unigreen/90 text-white hover:scale-105 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
          >
            {isLoading ? 'Logging in...' : 'Secure Login'}
          </Button>
          
          {attemptCount > 0 && (
            <p className="text-sm text-orange-600 text-center">
              {5 - attemptCount} attempts remaining
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityEnhancedLoginModal;
