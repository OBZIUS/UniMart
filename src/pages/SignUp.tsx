import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FloatingIcons from '../components/FloatingIcons';
import SecurityEnhancedLoginModal from '../components/SecurityEnhancedLoginModal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';
import { 
  sanitizeText, 
  sanitizeName, 
  sanitizeNumericInput, 
  validateEmail, 
  validatePhoneNumber, 
  validateUPIId 
} from '@/utils/inputSanitization';

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { logSuspiciousActivity, checkRateLimit } = useSecurityAudit();
  const [authMode, setAuthMode] = useState<'main' | 'signup' | 'email-login'>('main');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    phoneNumber: '',
    upiId: '',
    roomNumber: '',
    academicYear: '',
    password: '',
    confirmPassword: ''
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/categories');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (field: string, value: string) => {
    let filteredValue = value;
    
    switch (field) {
      case 'name':
        // Use the new sanitizeName function that properly handles spaces
        filteredValue = sanitizeName(value);
        break;
      case 'email':
        filteredValue = sanitizeText(value).replace(/[^a-zA-Z0-9@._-]/g, '');
        break;
      case 'phone':
      case 'phoneNumber':
        filteredValue = sanitizeNumericInput(value);
        break;
      case 'roomNumber':
        filteredValue = sanitizeText(value).replace(/[^a-zA-Z0-9\-]/g, '');
        break;
      case 'upiId':
        filteredValue = sanitizeText(value).replace(/[^a-zA-Z0-9@.\-]/g, '');
        break;
      default:
        filteredValue = sanitizeText(value);
        break;
    }
    
    setFormData(prev => ({ ...prev, [field]: filteredValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Check rate limiting for registration attempts
      const canProceed = await checkRateLimit('user_registration');
      if (!canProceed) {
        await logSuspiciousActivity('excessive_registration_attempts', { email: formData.email });
        toast({
          title: "Too Many Attempts",
          description: "Please wait before trying to register again.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Enhanced validation
      if (!validateEmail(formData.email)) {
        await logSuspiciousActivity('invalid_email_registration', { email: formData.email });
        toast({
          title: "Invalid Email Domain",
          description: "Only @sst.scaler.com email addresses are allowed to register.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      if (!validatePhoneNumber(formData.phoneNumber)) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid phone number.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (!validateUPIId(formData.upiId)) {
        toast({
          title: "Invalid UPI ID",
          description: "Please enter a valid UPI ID (e.g., user@paytm).",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 8) {
        toast({
          title: "Password Too Short",
          description: "Password must be at least 8 characters long.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Passwords Don't Match",
          description: "Please make sure both passwords match.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Attempt registration
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.phoneNumber,
        formData.roomNumber,
        formData.academicYear
      );

      if (error) {
        await logSuspiciousActivity('failed_registration', { 
          email: formData.email, 
          error 
        });
        
        toast({
          title: "Sign Up Failed",
          description: error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome to UniMart!",
          description: "Please check your email to verify your account.",
        });
        navigate('/categories');
      }
    } catch (error) {
      await logSuspiciousActivity('registration_error', { 
        email: formData.email, 
        error 
      });
      
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleBackClick = () => {
    if (authMode === 'main') {
      navigate('/');
    } else {
      setAuthMode('main');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden font-inter">
      <FloatingIcons />
      
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Button 
          onClick={handleBackClick}
          variant="ghost" 
          className="flex items-center space-x-2 rounded-full hover:bg-white/80 hover:scale-105 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
        >
          <span>←</span>
        </Button>
      </div>

      {/* Header */}
      <header className="flex items-center justify-center pt-12 pb-8 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-unigreen to-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">U</span>
          </div>
          <h1 className="text-2xl font-recoleta font-semibold text-gray-800">UniMart 🛒</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 relative z-10 max-w-md">
        {authMode === 'main' && (
          <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-white/60 p-8 animate-float">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-recoleta font-bold leading-tight mb-4">
                Join Your Campus
                <br />
                <span className="text-unigreen">Marketplace</span>
                <br />
                <span className="text-peach">Community</span>
              </h1>
              <p className="text-gray-600">
                Connect with fellow students at Scaler School of Technology, discover amazing deals, and make campus life more affordable with UniMart.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => setAuthMode('email-login')}
                className="w-full bg-unigreen hover:bg-unigreen/90 text-white rounded-full hover:scale-105 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
              >
                Login
              </Button>
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={() => setAuthMode('signup')}
                className="w-full bg-unigreen hover:bg-unigreen/90 text-white rounded-full hover:scale-105 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
              >
                Create New Account
              </Button>
            </div>
            
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
              <div className="text-center">
                <span className="text-2xl">💰</span>
                <p className="text-sm text-gray-500">Cheaper than Market</p>
              </div>
              <div className="text-center">
                <span className="text-2xl">🏠</span>
                <p className="text-sm text-gray-500">Right next to your door</p>
              </div>
              <div className="text-center">
                <span className="text-2xl">♻️</span>
                <p className="text-sm text-gray-500">Never waste a thing!</p>
              </div>
            </div>
          </div>
        )}

        {authMode === 'signup' && (
          <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-white/60 p-8 animate-float">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-recoleta font-bold leading-tight mb-4">
                Create Your Account
              </h1>
              <p className="text-gray-600">
                Join the UniMart community and start discovering amazing deals.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your @sst.scaler.com email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  maxLength={100}
                />
                <p className="text-xs text-gray-500">Only @sst.scaler.com email addresses are allowed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  required
                  maxLength={15}
                />
                <p className="text-xs text-gray-500">Required for deal confirmations</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  placeholder="Enter your UPI ID (e.g., username@paytm)"
                  value={formData.upiId}
                  onChange={(e) => handleInputChange('upiId', e.target.value)}
                  required
                  maxLength={50}
                />
                <p className="text-xs text-gray-500">Required for payment processing</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">Room Number</Label>
                <Input
                  id="room"
                  placeholder="Enter your room number (e.g., A-204)"
                  value={formData.roomNumber}
                  onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                  required
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <Select onValueChange={(value) => handleInputChange('academicYear', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                    <SelectItem value="4th Year">4th Year</SelectItem>
                    <SelectItem value="Graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password (min 8 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={8}
                  maxLength={128}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  maxLength={128}
                />
              </div>

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-unigreen hover:bg-unigreen/90 text-white rounded-full hover:scale-105 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up Free'}
              </Button>
            </form>
          </div>
        )}
      </main>
      
      <SecurityEnhancedLoginModal 
        isOpen={authMode === 'email-login'} 
        onClose={() => setAuthMode('main')} 
      />
    </div>
  );
};

export default SignUp;
