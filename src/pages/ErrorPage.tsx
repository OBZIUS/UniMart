
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import FloatingIcons from '../components/FloatingIcons';
import CursorPanda from '../components/CursorPanda';
import { useAuth } from '../contexts/AuthContext';

const ErrorPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleBrowseCategories = () => {
    if (isAuthenticated) {
      navigate('/categories');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden font-inter">
      <FloatingIcons />
      <CursorPanda />
      
      {/* Header */}
      <header className="flex items-center justify-between p-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-unigreen to-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">U</span>
          </div>
          <h1 className="text-xl font-recoleta font-semibold text-gray-800">UniMart</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 relative z-10 max-w-2xl">
        <div className="text-center">
          {/* Robot Character */}
          <div className="relative mb-8">
            <div className="inline-block">
              {/* Robot Head */}
              <div className="relative">
                <div className="w-32 h-24 bg-gray-300 rounded-t-3xl mx-auto relative">
                  {/* Eyes */}
                  <div className="absolute top-4 left-6 w-4 h-4 bg-black rounded-full"></div>
                  <div className="absolute top-4 right-6 w-4 h-4 bg-black rounded-full"></div>
                  {/* Blush */}
                  <div className="absolute top-8 left-2 w-3 h-3 bg-pink-300 rounded-full opacity-60"></div>
                  <div className="absolute top-8 right-2 w-3 h-3 bg-pink-300 rounded-full opacity-60"></div>
                  {/* Mouth */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rounded-full"></div>
                </div>
                
                {/* Screen/Body */}
                <div className="w-40 h-32 bg-gray-700 rounded-lg mx-auto -mt-2 relative">
                  <div className="absolute inset-4 bg-gray-800 rounded">
                    <div className="p-2 text-xs">
                      <div className="text-green-400">ERROR: System.exe has stopped working</div>
                    </div>
                  </div>
                </div>
                
                {/* Arms */}
                <div className="absolute top-20 -left-8 w-6 h-16 bg-gray-400 rounded-full transform rotate-12"></div>
                <div className="absolute top-20 -right-8 w-6 h-16 bg-gray-400 rounded-full transform -rotate-12"></div>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-recoleta font-bold mb-4">
            Oops! Looks like you're a little 
            <span className="text-unigreen block">lost.</span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            This page doesn't exist or was moved. Let's get you back on track.
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/')}
              className="bg-unigreen hover:bg-unigreen/90 text-white px-8 py-3 rounded-lg font-medium"
            >
              Back to Home
            </Button>
            
            <div className="text-center">
              <Button 
                onClick={handleBrowseCategories}
                variant="ghost"
                className="text-peach hover:text-peach/80"
              >
                Browse Categories
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ErrorPage;
