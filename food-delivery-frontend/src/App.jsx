// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import OrderPage from "./pages/OrderPage";
import "./app.css";
import RestaurantManager from "./pages/RestaurantManager";
import { ContextProvider, useNotify } from "./NotifyContextProvider";
import CheckoutPage from "./pages/CheckoutPage";
import AllFood from "./pages/AllFood";
import LikedItems from "./pages/LikedItems";

const App = () => {
  const { setNotification, notification, setLoad } = useNotify();

  return (
    <ContextProvider>
      <div className="bg-cyan-50 bg-opacity-90 overflow-hidden p-4 rounded-xl app backdrop-blur-2xl">
        <Router>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/" element={<AllFood />} />

            {/* Protected Routes */}

            <Route
              path="/foods"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/restaurant"
              element={
                <ProtectedRoute>
                  <RestaurantManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/liked-items"
              element={
                <ProtectedRoute>
                  <LikedItems />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </div>
    </ContextProvider>
  );
};

export default App;
