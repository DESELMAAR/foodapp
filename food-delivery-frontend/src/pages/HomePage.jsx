import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [quantities, setQuantities] = useState({}); // Track quantities for each menu item

  // Fetch restaurants from the API
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await apiClient.get("/restaurants");
        setRestaurants(response.data);
      } catch (err) {
        setError("Failed to load restaurants.");
        console.error("Error fetching restaurants:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Handle quantity changes
  const handleIncrement = (itemId) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const handleDecrement = (itemId) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0)
    }));
  };

  // Handle restaurant click
  const handleRestaurantClick = (id) => {
    setSelectedRestaurantId(id);
    setQuantities({}); // Reset quantities when changing restaurant
  };

  // Get the selected restaurant's menu
  const selectedRestaurant = restaurants.find(
    (restaurant) => restaurant.id === selectedRestaurantId
  );

  const handleAddToCart = async (itemId) => {
    const quantity = quantities[itemId] || 1; // Default to 1 if quantity not set
    console.log(itemId,quantity)

    try {
      await apiClient.post('/cart', {
        product_id: itemId,
        quantity: quantity
        
      });
      alert('Item added to cart successfully!');
      // Optionally reset the quantity for this item
      setQuantities(prev => ({ ...prev, [itemId]: 0 }));
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert('Failed to add item to cart');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="grid grid-cols-[30%_69%] gap-[1%]   ">
      <div className="bg-orange-600 bg-opacity-90 backdrop-blur-sm p-4">
        <h1 className="font-bold text-white">Welcome to Food Delivery</h1>
        <p className="text-white">
          Explore our restaurants and place your order today!
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
          {restaurants.map((restaurant) => (
            <div
              className="bg-slate-50 cursor-pointer"
              key={restaurant.id}
              style={styles.card}
              onClick={() => handleRestaurantClick(restaurant.id)}
            >
              <h3>{restaurant.name}</h3>
              <p>{restaurant.address}</p>
              <p>{restaurant.phone}</p>
            </div>
          ))}
        </div>

        <button className="bg-green-700 my-2 font-semibold px-4 py-2 rounded-full bg-opacity-50 hover:bg-teal-600 hover:text-white transition-all duration-300">
          Make Order Now
        </button>

        <Link
          to="/restaurant"
          className="bg-green-700 my-2 font-semibold px-4 py-2 rounded-full bg-opacity-50 hover:bg-teal-600 hover:text-white transition-all duration-300"
        >
          Add new restaurant
        </Link>
      </div>

      <div className="menu grid grid-cols-2 gap-2">
        {selectedRestaurant ? (
          selectedRestaurant.menus.map((item) => (
            <div
              key={item.id}
              className="card p-4 bg-green-500 bg-opacity-50 backdrop-blur-md rounded-lg"
            >
              <h1 className="font-semibold text-lg">{item.name}</h1>
              <p className="text-gray-800 font-medium">{item.price}DH</p>
              
              {/* Quantity Selector */}
              <div className="flex items-center justify-center py-1">
                <button 
                  onClick={() => handleDecrement(item.id)}
                  className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full"
                  disabled={!quantities[item.id]}
                >
                  -
                </button>
                <span className="mx-2 font-medium">
                  {quantities[item.id] || 0}
                </span>
                <button 
                  onClick={() => handleIncrement(item.id)}
                  className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full"
                >
                  +
                </button>
              </div>
              
              <button 
                className="w-full bg-slate-100 py-2 font-semibold rounded-full bg-opacity-70 hover:bg-opacity-100 transition-all duration-300"
                onClick={() => handleAddToCart(item.id)}
                disabled={!quantities[item.id]} // Disable if quantity is 0
              >
                Add to Cart
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600">Select a restaurant to view its menu.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "16px",
    width: "250px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
};

export default HomePage;