import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import FloatingIcons from '../components/FloatingIcons';
import LoginModal from '../components/LoginModal';
import CursorPanda from '../components/CursorPanda';
import NotificationBell from '../components/NotificationBell';
import { useAuth } from '../contexts/AuthContext';
import { useDealsCounter } from '../hooks/useDealsCounter';

const Index = () => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const { dealsCompleted, isLoading: dealsLoading, refreshCount } = useDealsCounter();
  const [typedText, setTypedText] = useState('');
  const [showContent, setShowContent] = useState(true);
  const fullText = 'Your Campus Marketplace Reimagined';

  // Only set typed text once on mount - no dependencies to prevent re-runs
  useEffect(() => {
    setTypedText(fullText);
  }, []); // Empty dependency array - runs only once

  const handleStartShopping = () => {
    if (isAuthenticated) {
      navigate('/categories');
    } else {
      navigate('/signup');
    }
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleUserIconClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const handleDealCompleted = () => {
    // Refresh the deals counter when a deal is completed
    refreshCount();
  };

  const renderStyledText = (text: string) => {
    const words = text.split(' ');
    return (
      <div className="flex flex-col">
        <div>
          <span className="text-black">Your </span>
          <span className="text-black">Campus</span>
        </div>
        <div>
          <span style={{ color: '#E87A64' }}>Marketplace</span>
        </div>
        <div>
          <span style={{ color: '#5D735C' }}>Reimagined</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden font-inter">
      <FloatingIcons />
      <CursorPanda />
      
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-unigreen to-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">U</span>
          </div>
          <h1 className="text-xl md:text-2xl font-recoleta font-semibold text-gray-800">UniMart 🛒</h1>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          {isAuthenticated && <NotificationBell onDealCompleted={handleDealCompleted} />}
          <Button 
            onClick={() => navigate('/faq')}
            variant="ghost"
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full px-2 md:px-4 py-2 text-sm md:text-base"
          >
            FAQ
          </Button>
          <Button 
            onClick={handleUserIconClick}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white hover:bg-gray-50 p-1 hover:scale-105 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg overflow-hidden"
          >
            <img 
              src="/images/9aac6389-298a-420d-8832-0d2d85d62209.png" 
              alt="User profile" 
              className="w-full h-full object-cover rounded-full"
            />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 md:space-y-8">
            <div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-recoleta font-bold leading-tight min-h-[150px] md:min-h-[200px]">
                {renderStyledText(typedText)}
              </h1>
            </div>
            
            <div className={`transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-base md:text-lg text-gray-600 max-w-lg">
                Discover unbeatable deals, connect with fellow students, and make campus life more affordable with UniMart.
              </p>
              
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-6">
                <div className="flex items-center space-x-2 bg-green-100 px-3 md:px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs md:text-sm font-medium text-green-700">Students only</span>
                </div>
                <div className="flex items-center space-x-2 bg-red-100 px-3 md:px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs md:text-sm font-medium text-red-700">Verified deals</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-100 px-3 md:px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs md:text-sm font-medium text-blue-700">
                    {dealsLoading ? 'Loading...' : `${dealsCompleted} deals completed`}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-8">
                {!isAuthenticated && (
                  <Button 
                    onClick={handleSignUp}
                    className="bg-unigreen hover:bg-unigreen/90 text-white px-6 md:px-8 py-3 rounded-full font-medium hover:scale-105 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
                  >
                    Sign Up Free
                  </Button>
                )}
                <Button 
                  onClick={handleStartShopping}
                  variant="outline" 
                  className="border-peach text-peach hover:bg-peach hover:text-white px-6 md:px-8 py-3 rounded-full font-medium hover:scale-105 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
                >
                  🛒 Start Shopping
                </Button>
              </div>
              
              <div className="flex items-center justify-between pt-6 md:pt-8 border-t border-gray-200 mt-6 md:mt-8">
                <div className="text-center">
                  <p className="text-xs md:text-sm text-gray-500">Cheaper than</p>
                  <p className="font-medium text-gray-700 text-sm md:text-base">Market</p>
                </div>
                <div className="text-center">
                  <p className="text-xs md:text-sm text-gray-500">Right next to your</p>
                  <p className="font-medium text-gray-700 text-sm md:text-base">door</p>
                </div>
                <div className="text-center">
                  <p className="text-xs md:text-sm text-gray-500">Never waste a</p>
                  <p className="font-medium text-gray-700 text-sm md:text-base">thing!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Floating Image */}
          <div className={`relative transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative z-10 animate-float">
              <img 
                src="/images/99a9b824-e9a9-4288-9090-a75a7a1cc214.png" 
                alt="Shopping icons" 
                className="w-full max-w-md mx-auto rounded-3xl shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Panda Emoji */}
        <div className="fixed bottom-6 left-6 z-20">
          <button 
            onClick={() => navigate('/error')}
            className="text-4xl hover:scale-110 transition-transform duration-200"
          >
            🐼
          </button>
        </div>
      </main>
      
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default Index;
