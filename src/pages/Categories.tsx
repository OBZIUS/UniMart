import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import FloatingIcons from '../components/FloatingIcons';
import CursorPanda from '../components/CursorPanda';
import ProductUploadModal from '../components/ProductUploadModal';
import { useAuth } from '../contexts/AuthContext';

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const categories = [
    {
      name: 'Electronics',
      image: '/images/496b6b8b-14d1-4873-b994-d9e2bc28ff28.png',
      description: 'Tech gadgets and devices',
      route: '/electronics'
    },
    {
      name: 'Beauty & Personal Care',
      image: '/images/5428b7b7-2790-4dd9-af38-891aed610a08.png',
      description: 'Skincare and wellness',
      route: '/beauty'
    },
    {
      name: 'Munchies',
      image: '/images/75567ed8-2c7e-4de6-8d13-0b271186858e.png',
      description: 'Snacks and treats',
      route: '/munchies'
    },
    {
      name: 'Stationary',
      image: '/images/17a20097-4fc8-4d4e-a46c-b664b8613d1b.png',
      description: 'Study supplies',
      route: '/stationary'
    },
    {
      name: 'Fruits & Veggies',
      image: '/images/937c21db-e21b-4c3b-aa77-b63fa998652b.png',
      description: 'Fresh and healthy options',
      route: '/fruits-veggies'
    },
    {
      name: 'Other Products',
      image: '/images/e17b519a-997a-443d-9e08-af3170dabbf7.png',
      description: 'Various other items',
      route: '/other-products'
    }
  ];

  const handleAddProduct = (categoryName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }
    setSelectedCategory(categoryName);
    setShowUploadModal(true);
  };

  const handleCategoryCardClick = (route: string) => {
    navigate(route);
  };

  const handleProductCreated = () => {
    console.log('Product created successfully');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden font-inter">
      <FloatingIcons />
      <CursorPanda />
      
      {/* Header */}
      <header className="flex items-center justify-between p-6 relative z-10">
        <div className="flex items-center space-x-4 cursor-pointer" onClick={handleGoToDashboard}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-unigreen to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">U</span>
            </div>
            <h1 className="text-xl font-recoleta font-semibold text-gray-800">UniMart</h1>
          </div>
          <span className="text-lg">🛒</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated && (
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 p-0"
            >
              <span className="text-lg">👤</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 relative z-10">
        <div className="text-center mb-12">
          <span className="text-4xl mb-4 block">⭐</span>
          <h1 className="text-3xl font-recoleta font-bold mb-4 bg-gradient-to-r from-[#5D735C] to-[#E87A64] bg-clip-text text-transparent animate-pulse">What we offer!</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need—sold by students, for students. At your Uni.
          </p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-recoleta font-semibold mb-8">Shop by Category</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => handleCategoryCardClick(category.route)}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-recoleta font-semibold mb-2">{category.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">
                    ↗ Check now!
                  </span>
                  <Button 
                    onClick={(e) => handleAddProduct(category.name, e)}
                    className="w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 text-unigreen p-0"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <ProductUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        category={selectedCategory}
        onProductCreated={handleProductCreated}
      />
    </div>
  );
};

export default Categories;