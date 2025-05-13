import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { MainPage } from './Components/common/MainPage';
import { SignUp } from './Components/common/SignUp';
import { Navbar } from './Components/common/Navbar';

const AppRoutes = () => {
  const location = useLocation();
  const hideNavbarRoutes = ['/SignUp']; // Add paths where Navbar shouldn't show

  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/SignUp" element={<SignUp />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
