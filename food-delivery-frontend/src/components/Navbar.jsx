import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { useNotify } from "../NotifyContextProvider";
import LoadingAnimation from "./LoadingAnimation";
// import { HeartIcon } from '@heroicons/react/24/solid';

const Navbar = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = localStorage.getItem("authToken");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const { setNotification, notification, setLoad, load } = useNotify();
  const [details, setDetails] = useState(0);

  useEffect(() => {
    if (isAuthenticated && !load) {
      fetchCartCount();
    }
  }, [isAuthenticated, cartItems, load]);

  const fetchCartCount = async () => {
    try {
      const response = await apiClient.get("/cart/count");
      setCartCount(response.data.count);
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const fetchCartItems = async () => {
    setIsLoading(true);
    setLoad(true);
    try {
      const response = await apiClient.get("/cart");
      setCartItems(response.data.items || response.data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
      setLoad(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleClickCartIcon = () => {
    if (isAuthenticated) {
      fetchCartItems();
      setIsCartOpen(true);
    } else {
      navigate("/login");
    }
  };

  const updateCartItem = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeCartItem(itemId);
      return;
    }
    setLoad(true);
    try {
      await apiClient.put(`/cart/${itemId}`, { quantity: newQuantity });
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating cart item:", error);
      fetchCartItems();
    }
  };

  const removeCartItem = async (itemId) => {
    try {
      await apiClient.delete(`/cart/${itemId}`);
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId)
      );
    } catch (error) {
      console.error("Error removing cart item:", error);
      fetchCartItems();
    }
  };

  const handleDecrement = (itemId, currentQuantity) => {
    const newQuantity = Math.max(currentQuantity - 1, 0);
    updateCartItem(itemId, newQuantity);
  };

  const handleIncrement = (itemId, currentQuantity) => {
    const newQuantity = currentQuantity + 1;
    updateCartItem(itemId, newQuantity);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product?.price * item.quantity,
      0
    );
  };

  const handleDetails = (id) => {
    setDetails(id);
  };

  const handleDetailsReset = () => {
    setDetails(0);
  };

  return (
    <div className="  sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 px-4 sm:px-8   sticky top-0 z-50">
          {/* Left side navigation */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-indigo-600 font-bold text-xl caveat flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              FoodDelivery
            </Link>
            {isAuthenticated && user && (
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  to="/orders"
                  className="relative text-gray-600 hover:text-indigo-600 transition-colors group"
                >
                  Orders
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                  to="/liked-items"
                  className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 group-hover:fill-red-500 group-hover:scale-110 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span className="relative">
                    Liked Items
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Right side navigation */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 bg-indigo-50 px-3 py-1 rounded-full">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-gray-700 font-medium">
                    Hello, {user.name || "User"}!
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>

                {/* Cart Icon */}
                <div className="relative ml-2">
                  <button
                    onClick={handleClickCartIcon}
                    className="p-2 text-gray-700 hover:text-indigo-600 focus:outline-none relative group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 group-hover:scale-110 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-indigo-600 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={closeCart}
            ></div>
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="w-screen max-w-md">
                <div className="cartdiv mt-20 flex flex-col mr-4 rounded-2xl bg-white shadow-xl">
                  <div className="flex-1 py-6 overflow-y-auto h-96 px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium text-gray-900">
                        Your Cart ({cartCount})
                      </h2>
                      <button
                        onClick={closeCart}
                        className="ml-3 h-7 flex items-center"
                      >
                        <svg
                          className="h-6 w-6 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-8">
                      {isLoading ? (
                        <LoadingAnimation />
                      ) : cartItems.length > 0 ? (
                        <div className="flow-root">
                          <ul className="-my-6 divide-y divide-gray-200">
                            {cartItems.map((item) => (
                              <li key={item.id} className="py-2 flex">
                                <div className="flex-shrink-0 w-14 h-12 border border-gray-200 rounded-md overflow-hidden">
                                  {item.product?.image_path ? (
                                    <img
                                      src={`http://localhost:8000/storage/${item.product.image_path}`}
                                      className="w-full h-full object-cover"
                                      alt={item.product.name}
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                      <svg
                                        className="h-12 w-12 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="1"
                                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                      </svg>
                                    </div>
                                    // <LoadingAnimation/>
                                  )}
                                </div>

                                <div className="ml-4 flex-1 flex flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>{item.product?.name}</h3>
                                      <p className="ml-4">
                                        ${item.product?.price}
                                      </p>
                                    </div>
                                    {details === item.id && (
                                      <div className="mt-1 text-sm text-gray-500">
                                        <p>
                                          Added:{" "}
                                          {new Date(
                                            item.created_at
                                          ).toLocaleDateString()}
                                        </p>
                                        <p>
                                          Restaurant:{" "}
                                          {item.product?.restaurant?.name}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 flex items-end justify-between text-sm">
                                    <div className="flex items-center">
                                      <button
                                        onClick={() =>
                                          handleDecrement(
                                            item.id,
                                            item.quantity
                                          )
                                        }
                                        className="text-gray-500 hover:text-indigo-500 px-2 py-1"
                                        disabled={item.quantity <= 1}
                                      >
                                        -
                                      </button>
                                      <span className="mx-2 font-medium">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() =>
                                          handleIncrement(
                                            item.id,
                                            item.quantity
                                          )
                                        }
                                        className="text-gray-500 hover:text-indigo-500 px-2 py-1"
                                      >
                                        +
                                      </button>
                                    </div>

                                    <div className="flex">
                                      <button
                                        onClick={() =>
                                          handleDetails(
                                            item.id === details ? 0 : item.id
                                          )
                                        }
                                        type="button"
                                        className="font-medium text-indigo-600 hover:text-indigo-500 mr-4"
                                      >
                                        {item.id === details
                                          ? "Hide"
                                          : "Details"}
                                      </button>
                                      <button
                                        onClick={() => removeCartItem(item.id)}
                                        type="button"
                                        className="font-medium text-red-600 hover:text-red-500"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1"
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <h3 className="mt-2 text-lg font-medium text-gray-900">
                            Your cart is empty
                          </h3>
                          <p className="mt-1 text-gray-500">
                            Start adding some delicious items to your cart!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {cartItems.length > 0 && (
                    <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Subtotal</p>
                        <p>${calculateTotal().toFixed(2)}</p>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        Shipping and taxes calculated at checkout.
                      </p>
                      <div className="mt-6">
                        <button
                          onClick={() => {
                            navigate("/checkout");
                            closeCart();
                          }}
                          className="bg-gradient-to-r mx-auto  from-purple-600 to-indigo-600 text-white py-2 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
                        >
                          Checkout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
