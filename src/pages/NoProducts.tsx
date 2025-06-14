
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import FloatingIcons from '../components/FloatingIcons';
import ProductUploadModal from '../components/ProductUploadModal';
import { useAuth } from '../contexts/AuthContext';

const NoProducts = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleAddProduct = () => {
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }
    setShowUploadModal(true);
  };

  const handleProductCreated = () => {
    // Navigate back to categories after successful upload
    navigate('/categories');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden font-inter">
      <FloatingIcons />
      
      {/* Header */}
      <header className="flex items-center justify-between p-6 relative z-10">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => navigate('/categories')}
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 relative z-10 max-w-2xl">
        <div className="text-center">
          <span className="text-6xl mb-6 block">📦</span>
          <h1 className="text-3xl font-recoleta font-bold mb-4">No Products Listed Currently</h1>
          <p className="text-lg text-gray-600 mb-8">
            Be the first to add your product in this category and start earning!
          </p>
          
          <Button 
            onClick={handleAddProduct}
            className="bg-unigreen hover:bg-unigreen/90 text-white px-8 py-3 rounded-full font-medium"
          >
            Add Your Product
          </Button>
        </div>
      </main>

      <ProductUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        category=""
        onProductCreated={handleProductCreated}
      />
    </div>
  );
};

export default NoProducts;
