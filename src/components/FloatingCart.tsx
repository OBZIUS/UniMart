
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const FloatingCart = () => {
  const { cart, removeFromCart, clearCart, addToPurchased } = useAuth();
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  if (cart.length === 0) return null;

  const total = cart.reduce((sum, item) => {
    const price = parseFloat(item.selling_price.toString());
    return sum + price;
  }, 0);

  const handleCheckout = () => {
    // Add all cart items to purchased products
    cart.forEach(item => addToPurchased(item));
    clearCart();
    setShowCart(false);
    navigate('/payment-success');
  };

  return (
    <>
      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowCart(true)}
          className="w-16 h-16 rounded-full bg-[#E87A64] hover:bg-[#E87A64]/90 text-white shadow-lg relative"
        >
          🛒
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </Button>
      </div>

      {/* Cart Modal */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-recoleta text-center">Shopping Cart</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {cart.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">₹{item.selling_price}</p>
                </div>
                <Button
                  onClick={() => removeFromCart(item.id)}
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-[#E87A64] text-lg">₹{total.toFixed(2)}</span>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={clearCart}
                variant="outline"
                className="flex-1 rounded-full"
              >
                Clear Cart
              </Button>
              <Button
                onClick={handleCheckout}
                className="flex-1 bg-[#5D735C] hover:bg-[#5D735C]/90 text-white rounded-full"
              >
                Checkout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingCart;
