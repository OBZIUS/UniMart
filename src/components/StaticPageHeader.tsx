
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

interface StaticPageHeaderProps {
  title: string;
  emoji: string;
  onBackClick?: () => void;
}

const StaticPageHeader = React.memo(({ title, emoji, onBackClick }: StaticPageHeaderProps) => {
  const navigate = useNavigate();

  const handleBackClick = React.useCallback(() => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate('/categories');
    }
  }, [onBackClick, navigate]);

  const handleUserIconClick = React.useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  return (
    <>
      <div className="absolute top-6 left-6 z-20">
        <Button 
          onClick={handleBackClick}
          variant="ghost" 
          className="flex items-center space-x-2 rounded-full hover:bg-white/80 hover:scale-105 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
        >
          <span>←</span>
        </Button>
      </div>

      <header className="flex items-center justify-between pt-12 pb-8 px-6 relative z-10">
        <div className="flex items-center space-x-3 flex-1 justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-unigreen to-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">U</span>
          </div>
          <h1 className="text-2xl font-recoleta font-semibold text-gray-800">{title} {emoji}</h1>
        </div>
        
        <div className="absolute right-6 top-12">
          <Button 
            onClick={handleUserIconClick}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white hover:bg-gray-50 p-1 hover:scale-105 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg overflow-hidden"
          >
            <img 
              src="/images/71d387f8-8e9a-4a69-87d5-d9f47b02941e.png" 
              alt="User profile" 
              className="w-full h-full object-cover rounded-full"
            />
          </Button>
        </div>
      </header>
    </>
  );
});

StaticPageHeader.displayName = 'StaticPageHeader';

export default StaticPageHeader;
