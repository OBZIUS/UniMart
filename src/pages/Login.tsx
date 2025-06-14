
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SecurityEnhancedLoginModal from '../components/SecurityEnhancedLoginModal';
import StaticPageHeader from '../components/StaticPageHeader';

const Login = () => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(true);

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StaticPageHeader title="Login" emoji="🔐" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to UniMart</h2>
            <p className="text-gray-600 mb-6">Please log in with your email and password</p>
          </div>
        </div>
      </main>

      <SecurityEnhancedLoginModal
        isOpen={showLoginModal}
        onClose={handleBackToHome}
      />
    </div>
  );
};

export default Login;
