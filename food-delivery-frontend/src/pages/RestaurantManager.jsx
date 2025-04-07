import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import MenuManager from "./MenuManager";

const RestaurantManager = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [restaurants, setRestaurants] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    user_id: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showMenuManager, setShowMenuManager] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await apiClient.get("/restaurants");
      setRestaurants(response.data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
      user_id: user.id,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.put(`/restaurants/${editingId}`, formData);
      } else {
        await apiClient.post("/restaurants", formData);
      }
      setFormData({ name: "", address: "", phone: "" });
      setEditingId(null);
      fetchRestaurants();
    } catch (error) {
      console.error("Error saving restaurant:", error);
    }
  };

  const handleEdit = (restaurant) => {
    setFormData({
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
    });
    setEditingId(restaurant.id);
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/restaurants/${id}`);
      fetchRestaurants();
    } catch (error) {
      console.error("Error deleting restaurant:", error);
    }
  };

  const handleMenuClick = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setShowMenuManager(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-indigo-800 mb-6">Restaurant Manager</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Restaurant Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              placeholder="Restaurant Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-md transition-all duration-300"
            >
              {editingId ? "Update Restaurant" : "Add Restaurant"}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold text-gray-800">{restaurant.name}</h2>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full">
                    ID: {restaurant.id}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {restaurant.address}
                  </p>
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {restaurant.phone}
                  </p>
                </div>

                {user.roles[0] !== "customer" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEdit(restaurant)}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 font-medium rounded-lg hover:bg-indigo-200 transition-colors duration-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(restaurant.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors duration-300"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleMenuClick(restaurant.id)}
                      className="px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 transition-colors duration-300"
                    >
                      Manage Menu
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showMenuManager && (
        <MenuManager 
          restaurantId={selectedRestaurantId} 
          onClose={() => setShowMenuManager(false)} 
        />
      )}
    </div>
  );
};

export default RestaurantManager;