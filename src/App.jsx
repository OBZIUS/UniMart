// src/App.jsx
import React from "react";
import { NavigationBar } from "./Components/common/Navbar";
import { MainPage } from "./Components/common/MainPage";
const App = () => {
  return (
    <div>
      <NavigationBar/>
      <MainPage/>
    </div>
  );
};

export default App;
