import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FloatingIcons from '../components/FloatingIcons';
import DashboardSkeleton from '../components/DashboardSkeleton';
import ProductUploadModal from '../components/ProductUploadModal';
import NotificationBell from '../components/NotificationBell';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedDashboard } from '../hooks/useOptimizedDashboard';
import { useUserStats } from '../hooks/useUserStats';

const Dashboard = React.memo(() => {
  const navigate = useNavigate();
  const { user, userProfile, updateProfile, favorites, logout, isAuthenticated, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSavedItems, setShowSavedItems] = useState(false);
  const [showListedItems, setShowListedItems] = useState(false);
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    room_number: '',
    academic_year: ''
  });

  // Use optimized dashboard hook
  const { dashboardData, loading: isDashboardLoading, refresh } = useOptimizedDashboard();
  const { purchasedCount, soldCount, isLoading: statsLoading, refreshStats } = useUserStats();

  const handleEditSave = useCallback(async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await updateProfile(editData);
      
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
        setShowEditModal(false);
        await refreshProfile();
        refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  }, [user, editData, updateProfile, toast, refreshProfile, refresh]);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      console.log('Starting logout process...');
      
      // Use the logout function from AuthContext
      await logout();
      
      console.log('Logout successful, navigating to home...');
      navigate('/', { replace: true });
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Unexpected logout error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout.",
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, navigate, toast]);

  const handleAddListing = useCallback(() => {
    setShowAddListingModal(true);
  }, []);

  const handleProductCreated = useCallback(() => {
    refresh();
    toast({
      title: "Success",
      description: "Product listed successfully!",
    });
  }, [refresh, toast]);

  const handleProductDeleted = useCallback((productId: string) => {
    refresh();
    toast({
      title: "Success",
      description: "Product deleted successfully!",
    });
  }, [refresh, toast]);

  const handleFloatingIconClick = useCallback(() => {
    // Removed confetti effect
  }, []);

  const handleDealCompleted = useCallback(() => {
    refreshStats();
    refresh();
  }, [refreshStats, refresh]);

  // Get user initials for avatar
  const getUserInitials = useCallback(() => {
    const currentProfile = dashboardData?.profile || userProfile;
    if (currentProfile?.name) {
      return currentProfile.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  }, [dashboardData?.profile, userProfile, user?.email]);

  // Memoized computed values
  const currentProfile = useMemo(() => dashboardData?.profile || userProfile, [dashboardData?.profile, userProfile]);
  const currentProducts = useMemo(() => dashboardData?.userProducts || [], [dashboardData?.userProducts]);
  const profileName = useMemo(() => currentProfile?.name || 'Loading...', [currentProfile?.name]);
  const profileEmail = useMemo(() => currentProfile?.email || user?.email || 'Loading...', [currentProfile?.email, user?.email]);
  const stats = useMemo(() => dashboardData?.stats || { totalProducts: currentProducts.length, totalFavorites: favorites.length }, [dashboardData?.stats, currentProducts.length, favorites.length]);

  // Modal callbacks
  const handleShowSavedItems = useCallback(() => setShowSavedItems(true), []);
  const handleShowListedItems = useCallback(() => setShowListedItems(true), []);
  const handleEditProfile = useCallback(() => setShowEditModal(true), []);
  const handleGoToFAQ = useCallback(() => navigate('/faq'), [navigate]);
  const handleGoHome = useCallback(() => navigate('/'), [navigate]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Initialize edit data when userProfile is available
  useEffect(() => {
    if (userProfile) {
      setEditData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        room_number: userProfile.room_number || '',
        academic_year: userProfile.academic_year || ''
      });
    }
  }, [userProfile]);

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Show skeleton while dashboard data is loading
  if (isDashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 relative overflow-hidden font-inter">
        <FloatingIcons onIconClick={handleFloatingIconClick} />
        
        {/* Horizontal Header for all screen sizes */}
        <header className="flex items-center justify-between p-3 relative z-20 bg-gray-50 md:p-6">
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleGoHome}
              variant="ghost" 
              className="flex items-center space-x-1 rounded-full text-sm px-2 md:text-base md:px-4"
            >
              <span>← Back</span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-unigreen to-green-600 rounded-full flex items-center justify-center md:w-10 md:h-10">
                <span className="text-white font-bold text-sm md:text-base">U</span>
              </div>
              <h1 className="text-lg font-recoleta font-semibold text-gray-800 md:text-xl">UniMart</h1>
            </div>
            <span className="text-base md:text-lg">🛒</span>
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-2">
            <NotificationBell onDealCompleted={handleDealCompleted} />
            <Button 
              onClick={handleGoToFAQ}
              className="w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 p-0 text-xs md:w-8 md:h-8 md:text-sm"
            >
              i
            </Button>
            <Button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 rounded-full relative z-30 text-xs px-2 md:text-sm md:px-4"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </header>

        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden font-inter">
      <FloatingIcons onIconClick={handleFloatingIconClick} />
      
      {/* Horizontal Header for all screen sizes */}
      <header className="flex items-center justify-between p-3 relative z-20 bg-gray-50 md:p-6">
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleGoHome}
            variant="ghost" 
            className="flex items-center space-x-1 rounded-full text-sm px-2 md:text-base md:px-4"
          >
            <span>← Back</span>
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-unigreen to-green-600 rounded-full flex items-center justify-center md:w-10 md:h-10">
              <span className="text-white font-bold text-sm md:text-base">U</span>
            </div>
            <h1 className="text-lg font-recoleta font-semibold text-gray-800 md:text-xl">UniMart</h1>
          </div>
          <span className="text-base md:text-lg">🛒</span>
        </div>
        
        <div className="flex items-center space-x-1 md:space-x-2">
          <NotificationBell onDealCompleted={handleDealCompleted} />
          <Button 
            onClick={handleGoToFAQ}
            className="w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 p-0 text-xs md:w-8 md:h-8 md:text-sm"
          >
            i
          </Button>
          <Button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 rounded-full relative z-30 text-xs px-2 md:text-sm md:px-4"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8 relative z-10 max-w-4xl">
        <div className="text-center mb-6 md:mb-8">
          <span className="text-3xl md:text-4xl mb-4 block">🛒</span>
          <h1 className="text-2xl md:text-3xl font-recoleta font-bold mb-2">Your Profile Dashboard</h1>
          <p className="text-gray-600 text-sm md:text-base">Manage your UniMart presence and connect with fellow students</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            <div className="bg-white rounded-3xl p-4 md:p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center relative mx-auto sm:mx-0 overflow-hidden shadow-md">
                  <img 
                    src="/images/71d387f8-8e9a-4a69-87d5-d9f47b02941e.png" 
                    alt="User profile" 
                    className="w-full h-full object-cover rounded-full"
                  />
                  <div className="absolute ml-8 md:ml-12 mt-8 md:mt-12 w-5 h-5 md:w-6 md:h-6 bg-peach rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-lg md:text-xl font-recoleta font-semibold">
                    {profileName}
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base">{profileEmail}</p>
                  {currentProfile?.phone && (
                    <p className="text-gray-500 text-xs md:text-sm">Phone: {currentProfile.phone}</p>
                  )}
                  {currentProfile?.room_number && (
                    <p className="text-gray-500 text-xs md:text-sm">Room: {currentProfile.room_number}</p>
                  )}
                  {currentProfile?.academic_year && (
                    <p className="text-gray-500 text-xs md:text-sm">Academic Year: {currentProfile.academic_year}</p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Button 
                  onClick={handleEditProfile}
                  className="bg-peach hover:bg-peach/90 text-white rounded-full text-sm md:text-base"
                >
                  Edit Profile
                </Button>
                <Button 
                  onClick={handleAddListing}
                  className="bg-unigreen hover:bg-unigreen/90 text-white rounded-full font-medium px-4 md:px-6 text-sm md:text-base"
                >
                  Add Listing
                </Button>
              </div>
            </div>

            {/* Statistics - Now with 4 cards: Items Listed, Favourites, Products Purchased, Products Sold */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-6 text-center shadow-lg cursor-pointer" onClick={handleShowListedItems}>
                <span className="text-2xl md:text-3xl block mb-1 md:mb-2">📦</span>
                <p className="text-lg md:text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
                <p className="text-gray-600 text-xs md:text-sm">Items Listed</p>
              </div>
              <div className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-6 text-center shadow-lg cursor-pointer" onClick={handleShowSavedItems}>
                <span className="text-2xl md:text-3xl block mb-1 md:mb-2">❤️</span>
                <p className="text-lg md:text-2xl font-bold text-pink-600">{stats.totalFavorites}</p>
                <p className="text-gray-600 text-xs md:text-sm">Favourites</p>
              </div>
              <div className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-6 text-center shadow-lg">
                <span className="text-2xl md:text-3xl block mb-1 md:mb-2">🛍️</span>
                <p className="text-lg md:text-2xl font-bold text-purple-600">
                  {statsLoading ? '...' : purchasedCount}
                </p>
                <p className="text-gray-600 text-xs md:text-sm">Products Purchased</p>
              </div>
              <div className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-6 text-center shadow-lg">
                <span className="text-2xl md:text-3xl block mb-1 md:mb-2">💰</span>
                <p className="text-lg md:text-2xl font-bold text-green-600">
                  {statsLoading ? '...' : soldCount}
                </p>
                <p className="text-gray-600 text-xs md:text-sm">Products Sold</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-recoleta">Edit Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Name</Label>
              <Input
                id="editName"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editPhone">Phone Number</Label>
              <Input
                id="editPhone"
                value={editData.phone}
                onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editRoom">Room Number</Label>
              <Input
                id="editRoom"
                value={editData.room_number}
                onChange={(e) => setEditData(prev => ({ ...prev, room_number: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editAcademicYear">Academic Year</Label>
              <Select
                value={editData.academic_year}
                onValueChange={(value) => setEditData(prev => ({ ...prev, academic_year: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st Year">1st Year</SelectItem>
                  <SelectItem value="2nd Year">2nd Year</SelectItem>
                  <SelectItem value="3rd Year">3rd Year</SelectItem>
                  <SelectItem value="4th Year">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <Button 
                onClick={handleEditSave} 
                disabled={isUpdating}
                className="flex-1 bg-unigreen hover:bg-unigreen/90 text-white rounded-full"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                onClick={() => setShowEditModal(false)} 
                variant="outline" 
                className="flex-1 rounded-full"
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Saved Items Modal */}
      <Dialog open={showSavedItems} onOpenChange={setShowSavedItems}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-recoleta">Saved Items</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {favorites.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">₹{item.selling_price}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Listed Items Modal - Simple product display without buttons */}
      <Dialog open={showListedItems} onOpenChange={setShowListedItems}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-recoleta">Your Listed Items</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {currentProducts.length === 0 ? (
              <p className="text-center text-gray-500">No products listed yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-lg">
                    <div className="aspect-square overflow-hidden relative">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-4xl">📦</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      {product.description && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 line-through text-sm">₹{product.market_price}</span>
                        <span className="text-unigreen font-bold text-xl">₹{product.selling_price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Listing Modal */}
      <ProductUploadModal
        isOpen={showAddListingModal}
        onClose={() => setShowAddListingModal(false)}
        onProductCreated={handleProductCreated}
      />
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
