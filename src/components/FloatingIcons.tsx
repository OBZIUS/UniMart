import React from 'react';
import { Coffee, Headphones, Book, Laptop, Smartphone, Gamepad2, Camera, Watch, ShoppingBag, Tag, DollarSign } from 'lucide-react';

interface FloatingIconsProps {
  onIconClick?: () => void;
}

const FloatingIcons = ({ onIconClick }: FloatingIconsProps) => {
  return (
    <>
      {/* Enhanced floating icons with better visibility and soft glow */}
      <div 
        className="fixed top-20 left-10 w-16 h-16 bg-green-200/60 rounded-full opacity-40 animate-float-slow flex items-center justify-center z-0 cursor-pointer hover:opacity-60 transition-opacity" 
        style={{ animationDelay: '0s', filter: 'drop-shadow(0 0 10px rgba(93, 115, 92, 0.3))' }}
        onClick={onIconClick}
      >
        <Coffee className="w-8 h-8 text-unigreen" />
      </div>
      
      <div 
        className="fixed top-32 right-20 w-14 h-14 bg-peach/40 rounded-full opacity-50 animate-float flex items-center justify-center z-0 cursor-pointer hover:opacity-70 transition-opacity" 
        style={{ animationDelay: '1s', filter: 'drop-shadow(0 0 8px rgba(232, 122, 100, 0.4))' }}
        onClick={onIconClick}
      >
        <Headphones className="w-7 h-7 text-peach" />
      </div>

      <div 
        className="fixed top-1/4 right-10 w-12 h-12 bg-blue-200/50 rounded-full opacity-35 animate-float-delayed flex items-center justify-center z-0 cursor-pointer hover:opacity-55 transition-opacity" 
        style={{ animationDelay: '2s', filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.3))' }}
        onClick={onIconClick}
      >
        <Book className="w-6 h-6 text-blue-500" />
      </div>

      <div 
        className="fixed top-1/2 left-5 w-18 h-18 bg-pink-200/50 rounded-full opacity-45 animate-float flex items-center justify-center z-0 cursor-pointer hover:opacity-65 transition-opacity" 
        style={{ animationDelay: '0.5s', filter: 'drop-shadow(0 0 12px rgba(244, 114, 182, 0.3))' }}
        onClick={onIconClick}
      >
        <Laptop className="w-9 h-9 text-pink-400" />
      </div>

      
      <div 
        className="fixed bottom-1/3 right-5 w-16 h-16 bg-yellow-200/50 rounded-full opacity-40 animate-float-slow flex items-center justify-center z-0 cursor-pointer hover:opacity-60 transition-opacity" 
        style={{ animationDelay: '1.5s', filter: 'drop-shadow(0 0 10px rgba(234, 179, 8, 0.3))' }}
        onClick={onIconClick}
      >
        <ShoppingBag className="w-8 h-8 text-yellow-600" />
      </div>

      <div 
        className="fixed bottom-20 left-20 w-14 h-14 bg-purple-200/50 rounded-full opacity-45 animate-float-delayed flex items-center justify-center z-0 cursor-pointer hover:opacity-65 transition-opacity" 
        style={{ animationDelay: '2.5s', filter: 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.3))' }}
        onClick={onIconClick}
      >
        <Tag className="w-7 h-7 text-purple-400" />
      </div>

      <div 
        className="fixed bottom-32 right-32 w-12 h-12 bg-green-200/50 rounded-full opacity-40 animate-float flex items-center justify-center z-0 cursor-pointer hover:opacity-60 transition-opacity" 
        style={{ animationDelay: '3s', filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.3))' }}
        onClick={onIconClick}
      >
        <DollarSign className="w-6 h-6 text-green-500" />
      </div>

      <div 
        className="fixed bottom-40 left-1/4 w-10 h-10 bg-orange-200/50 rounded-full opacity-45 animate-float-slow flex items-center justify-center z-0 cursor-pointer hover:opacity-65 transition-opacity" 
        style={{ animationDelay: '0.8s', filter: 'drop-shadow(0 0 5px rgba(249, 115, 22, 0.3))' }}
        onClick={onIconClick}
      >
        <Laptop className="w-5 h-5 text-orange-500" />
      </div>

      <div 
        className="fixed top-40 left-1/3 w-13 h-13 bg-teal-200/50 rounded-full opacity-40 animate-float-delayed flex items-center justify-center z-0 cursor-pointer hover:opacity-60 transition-opacity" 
        style={{ animationDelay: '1.2s', filter: 'drop-shadow(0 0 7px rgba(20, 184, 166, 0.3))' }}
        onClick={onIconClick}
      >
        <Smartphone className="w-6 h-6 text-teal-500" />
      </div>

      <div 
        className="fixed bottom-1/4 left-1/2 w-15 h-15 bg-indigo-200/50 rounded-full opacity-45 animate-float flex items-center justify-center z-0 cursor-pointer hover:opacity-65 transition-opacity" 
        style={{ animationDelay: '2.8s', filter: 'drop-shadow(0 0 9px rgba(99, 102, 241, 0.3))' }}
        onClick={onIconClick}
      >
        <Gamepad2 className="w-7 h-7 text-indigo-500" />
      </div>

      <div 
        className="fixed top-3/4 right-1/4 w-11 h-11 bg-red-200/50 rounded-full opacity-40 animate-float-slow flex items-center justify-center z-0 cursor-pointer hover:opacity-60 transition-opacity" 
        style={{ animationDelay: '1.8s', filter: 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.3))' }}
        onClick={onIconClick}
      >
        <Camera className="w-5 h-5 text-red-500" />
      </div>

      <div 
        className="fixed top-1/6 left-1/2 w-14 h-14 bg-cyan-200/50 rounded-full opacity-45 animate-float-delayed flex items-center justify-center z-0 cursor-pointer hover:opacity-65 transition-opacity" 
        style={{ animationDelay: '3.2s', filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.3))' }}
        onClick={onIconClick}
      >
        <Watch className="w-7 h-7 text-cyan-500" />
      </div>

      <div 
        className="fixed bottom-1/6 right-1/3 w-12 h-12 bg-lime-200/50 rounded-full opacity-40 animate-float flex items-center justify-center z-0 cursor-pointer hover:opacity-60 transition-opacity" 
        style={{ animationDelay: '2.2s', filter: 'drop-shadow(0 0 6px rgba(132, 204, 22, 0.3))' }}
        onClick={onIconClick}
      >
        <Coffee className="w-6 h-6 text-lime-600" />
      </div>

      <div 
        className="fixed top-16 right-1/3 w-13 h-13 bg-rose-200/50 rounded-full opacity-45 animate-float-slow flex items-center justify-center z-0 cursor-pointer hover:opacity-65 transition-opacity" 
        style={{ animationDelay: '0.3s', filter: 'drop-shadow(0 0 7px rgba(244, 63, 94, 0.3))' }}
        onClick={onIconClick}
      >
        <Headphones className="w-6 h-6 text-rose-500" />
      </div>

      <div 
        className="fixed bottom-16 left-1/3 w-11 h-11 bg-amber-200/50 rounded-full opacity-40 animate-float-delayed flex items-center justify-center z-0 cursor-pointer hover:opacity-60 transition-opacity" 
        style={{ animationDelay: '2.7s', filter: 'drop-shadow(0 0 5px rgba(245, 158, 11, 0.3))' }}
        onClick={onIconClick}
      >
        <Book className="w-5 h-5 text-amber-600" />
      </div>

      {/* Additional icons for better coverage */}
      <div 
        className="fixed top-60 left-16 w-10 h-10 bg-emerald-200/50 rounded-full opacity-35 animate-float flex items-center justify-center z-0 cursor-pointer hover:opacity-55 transition-opacity" 
        style={{ animationDelay: '4s', filter: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.3))' }}
        onClick={onIconClick}
      >
        <Tag className="w-5 h-5 text-emerald-600" />
      </div>

      <div 
        className="fixed top-80 right-16 w-12 h-12 bg-violet-200/50 rounded-full opacity-40 animate-float-slow flex items-center justify-center z-0 cursor-pointer hover:opacity-60 transition-opacity" 
        style={{ animationDelay: '3.5s', filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.3))' }}
        onClick={onIconClick}
      >
        <DollarSign className="w-6 h-6 text-violet-500" />
      </div>

      <div 
        className="fixed bottom-60 right-16 w-11 h-11 bg-sky-200/50 rounded-full opacity-35 animate-float-delayed flex items-center justify-center z-0 cursor-pointer hover:opacity-55 transition-opacity" 
        style={{ animationDelay: '4.2s', filter: 'drop-shadow(0 0 5px rgba(14, 165, 233, 0.3))' }}
        onClick={onIconClick}
      >
        <Camera className="w-5 h-5 text-sky-500" />
      </div>

      <div 
        className="fixed bottom-80 left-16 w-13 h-13 bg-fuchsia-200/50 rounded-full opacity-40 animate-float flex items-center justify-center z-0 cursor-pointer hover:opacity-60 transition-opacity" 
        style={{ animationDelay: '3.8s', filter: 'drop-shadow(0 0 7px rgba(217, 70, 239, 0.3))' }}
        onClick={onIconClick}
      >
        <Watch className="w-6 h-6 text-fuchsia-500" />
      </div>
    </>
  );
};

export default FloatingIcons;
