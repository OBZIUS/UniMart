import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import FloatingIcons from '../components/FloatingIcons';
import { useAuth } from '../contexts/AuthContext';

const ProductDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();
  const product = location.state?.product;

  if (!product) {
    navigate('/no-products');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden font-inter">
      <FloatingIcons />
      
      {/* Header */}
      <header className="flex items-center justify-between p-6 relative z-10">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => navigate('/no-products')}
            variant="ghost" 
            className="flex items-center space-x-2 rounded-full"
          >
            <span>← Back</span>
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-unigreen to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">U</span>
            </div>
            <h1 className="text-xl font-recoleta font-semibold text-gray-800">UniMart</h1>
          </div>
          <span className="text-lg">🛒</span>
        </div>
        
        <Button 
          onClick={() => navigate('/dashboard')}
          className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 p-0"
        >
          <span className="text-lg">
            {userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('') : '👤'}
          </span>
        </Button>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 relative z-10 max-w-2xl">
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <span className="text-6xl mb-6 block">✅</span>
            <h1 className="text-3xl font-recoleta font-bold mb-4 text-unigreen">Product Listed Successfully!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Your product is now live on UniMart
            </p>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-4xl mb-4 block">📦</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="font-medium text-gray-600">Product Name:</span>
                <span className="font-semibold">{product.name}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="font-medium text-gray-600">Market Price:</span>
                <span className="font-semibold text-gray-500 line-through">{product.marketPrice}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="font-medium text-gray-600">Your Price:</span>
                <span className="font-semibold text-unigreen text-xl">{product.sellingPrice}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="font-medium text-gray-600">Room Number:</span>
                <span className="font-semibold">{product.roomNumber}</span>
              </div>
            </div>

            <div className="flex space-x-4 pt-6">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-unigreen hover:bg-unigreen/90 text-white rounded-full"
              >
                View Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/no-products')}
                variant="outline" 
                className="flex-1 rounded-full"
              >
                Add Another
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;
