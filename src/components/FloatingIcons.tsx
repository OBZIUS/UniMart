import React from 'react';
import { Coffee, Headphones, Book, Laptop, ShoppingBag, Tag, DollarSign, Smartphone } from 'lucide-react';

interface FloatingIconsProps {
  onIconClick?: () => void;
}

const FloatingIcons = ({ onIconClick }: FloatingIconsProps) => {
  return (
    <>
      {/* Reduced and optimized floating icons for better mobile experience */}
      <div 
        className="fixed top-20 left-10 w-12 h-12 md:w-16 md:h-16 bg-green-200/50 rounded-full opacity-30 animate-float-slow flex items-center justify-center z-0 cursor-pointer hover:opacity-50 transition-opacity" 
        style={{ animationDelay: '0s', filter: 'drop-shadow(0 0 8px rgba(93, 115, 92, 0.2))' }}
        onClick={onIconClick}
      >
        <Coffee className="w-6 h-6 md:w-8 md:h-8 text-unigreen" />
      </div>
      
      <div 
        className="fixed top-32 right-20 w-10 h-10 md:w-14 md:h-14 bg-peach/30 rounded-full opacity-40 animate-float flex items-center justify-center z-0 cursor-pointer hover:opacity-60 transition-opacity" 
        style={{ animationDelay: '1s', filter: 'drop-shadow(0 0 6px rgba(232, 122, 100, 0.3))' }}
        onClick={onIconClick}
      >
        <Headphones className="w-5 h-5 md:w-7 md:h-7 text-peach" />
      </div>

      <div 
        className="fixed top-1/3 right-10 w-10 h-10 md:w-12 md:h-12 bg-blue-200/40 rounded-full opacity-30 animate-float-delayed flex items-center justify-center z-0 cursor-pointer hover:opacity-50 transition-opacity" 
        style={{ animationDelay: '2s', filter: 'drop-shadow(0 0 5px rgba(59, 130, 246, 0.2))' }}
        onClick={onIconClick}
      >
        <Book className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
      </div>

      <div 
        className="fixed top-1/2 left-5 w-12 h-12 md:w-16 md:h-16 bg-pink-200/40 rounded-full opacity-35 animate-float flex items-center justify-center z-0 cursor-pointer hover:opacity-55 transition-opacity" 
        style={{ animationDelay: '0.5s', filter: 'drop-shadow(0 0 10px rgba(244, 114, 182, 0.2))' }}
        onClick={onIconClick}
      >
        <Laptop className="w-6 h-6 md:w-8 md:h-8 text-pink-400" />
      </div>

      <div 
        className="fixed bottom-1/3 right-5 w-12 h-12 md:w-14 md:h-14 bg-yellow-200/40 rounded-full opacity-30 animate-float-slow flex items-center justify-center z-0 cursor-pointer hover:opacity-50 transition-opacity" 
        style={{ animationDelay: '1.5s', filter: 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.2))' }}
        onClick={onIconClick}
      >
        <ShoppingBag className="w-6 h-6 md:w-7 md:h-7 text-yellow-600" />
      </div>

      <div 
        className="fixed bottom-20 left-20 w-10 h-10 md:w-12 md:h-12 bg-purple-200/40 rounded-full opacity-35 animate-float-delayed flex items-center justify-center z-0 cursor-pointer hover:opacity-55 transition-opacity" 
        style={{ animationDelay: '2.5s', filter: 'drop-shadow(0 0 6px rgba(147, 51, 234, 0.2))' }}
        onClick={onIconClick}
      >
        <Tag className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
      </div>

      <div 
        className="fixed bottom-32 right-32 w-10 h-10 md:w-12 md:h-12 bg-green-200/40 rounded-full opacity-30 animate-float flex items-center justify-center z-0 cursor-pointer hover:opacity-50 transition-opacity" 
        style={{ animationDelay: '3s', filter: 'drop-shadow(0 0 5px rgba(34, 197, 94, 0.2))' }}
        onClick={onIconClick}
      >
        <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
      </div>

      <div 
        className="fixed top-40 left-1/3 w-10 h-10 md:w-12 md:h-12 bg-teal-200/40 rounded-full opacity-35 animate-float-delayed flex items-center justify-center z-0 cursor-pointer hover:opacity-55 transition-opacity" 
        style={{ animationDelay: '1.2s', filter: 'drop-shadow(0 0 6px rgba(20, 184, 166, 0.2))' }}
        onClick={onIconClick}
      >
        <Smartphone className="w-5 h-5 md:w-6 md:h-6 text-teal-500" />
      </div>
    </>
  );
};

export default FloatingIcons;