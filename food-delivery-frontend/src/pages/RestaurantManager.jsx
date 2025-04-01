import React, { useState, useEffect } from "react";
// import axios from 'axios';
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

  // Fetch all restaurants
  useEffect(() => {
    fetchRestaurants();
    console.log(user.roles[0]);
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await apiClient.get("/restaurants");
      setRestaurants(response.data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
      user_id: user.id,
    });
  };

  // Handle form submission for creating or updating a restaurant
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(user.roles);
    try {
      if (editingId) {
        // Update existing restaurant
        await apiClient.put(`/restaurants/${editingId}`, formData);
      } else {
        // Create new restaurant
        await apiClient.post("/restaurants", formData);
      }
      setFormData({ name: "", address: "", phone: "" });
      setEditingId(null);
      fetchRestaurants(); // Refresh the list
    } catch (error) {
      console.error("Error saving restaurant:", error);
    }
  };

  // Edit a restaurant
  const handleEdit = (restaurant) => {
    setFormData({
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
    });
    setEditingId(restaurant.id);
  };

  // Delete a restaurant
  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/restaurants/${id}`);
      fetchRestaurants(); // Refresh the list
    } catch (error) {
      // console.error('Error deleting restaurant:', error);
    }
  };

  const [showMenuManager, setShowMenuManager] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const handleMenuClick = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setShowMenuManager(true);
  };

  return (
    <div>
      <h1>Restaurant Manager</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <button type="submit">{editingId ? "Update" : "Create"}</button>
      </form>

      <ul className="grid grid-cols-3 mt-4 max-md:grid-cols-1  gap-2 justify-center">
        {restaurants.map((restaurant) => (
          <li
            key={restaurant.id}
            className="bg-blue-400 p-2 hover:bg-emerald-400 transition-all duration-300 ease-in-out cursor-pointer"
          >
            <h1>{restaurant.name} </h1> <p>{restaurant.address}</p>{" "}
            <p>{restaurant.phone}</p>
            {user.roles[0] === "customer" ? (
              ""
            ) : (
              <>
                <button
                  className="px-3 font-semibold transition-all duration-300 bg-slate-50 bg-opacity-50 hover:bg-opacity-90 mr-2 "
                  onClick={() => handleEdit(restaurant)}
                >
                  Edit
                </button>
                <button
                  className="px-3 font-semibold transition-all duration-300 bg-red-300 bg-opacity-50 hover:bg-opacity-90 mr-2"
                  onClick={() => handleDelete(restaurant.id)}
                >
                  Delete
                </button>

                <button
                  className="px-3 font-semibold transition-all duration-300 bg-blue-500 bg-opacity-50 hover:bg-opacity-90 "
                  onClick={() => handleMenuClick(restaurant.id)}
                >
                  My menu
                </button>
              </>
            )}
          </li>
         
        ))}
      </ul>
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
