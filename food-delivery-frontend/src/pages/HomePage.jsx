import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { Link } from "react-router-dom";
import { useNotify } from "../NotifyContextProvider";
import AddMenuItem from "./AddMenuItem";

const HomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [quantities, setQuantities] = useState({});
  const { setNotification } = useNotify();

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

  const handleIncrement = (itemId) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const handleDecrement = (itemId) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
    }));
  };

  const handleRestaurantClick = (id) => {
    setSelectedRestaurantId(id);
    setQuantities({});
  };

  const handleAddToCart = async (itemId) => {
    const quantity = quantities[itemId] || 1;

    try {
      await apiClient.post("/cart", {
        product_id: itemId,
        quantity: quantity,
      });
      setNotification("Item added to cart successfully!", "success");
      setQuantities((prev) => ({ ...prev, [itemId]: 0 }));
    } catch (err) {
      console.error("Error adding to cart:", err);
      setNotification("Failed to add item to cart", "error");
    }
  };

  const handleDeleteItem = async (itemId, restaurantId) => {
    try {
      await apiClient.delete(`/menus/${itemId}`);
      setNotification("Menu item deleted successfully!", "success");

      // Update the state to remove the deleted item
      setRestaurants((prev) =>
        prev.map((restaurant) =>
          restaurant.id === restaurantId
            ? {
                ...restaurant,
                menus: restaurant.menus.filter((item) => item.id !== itemId),
              }
            : restaurant
        )
      );
    } catch (err) {
      console.error("Error deleting menu item:", err);
      setNotification("Failed to delete menu item", "error");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const selectedRestaurant = restaurants.find(
    (restaurant) => restaurant.id === selectedRestaurantId
  );

  return (
    <div className="grid grid-cols-[30%_69%] gap-[1%]">
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-800 mb-2">
            Welcome to Food Delivery
          </h1>
          <p className="text-indigo-600 font-medium">
            Explore our restaurants and place your order today!
          </p>
        </div>

        <div className="grid grid-flow-row gap-6 mb-8">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
              onClick={() => handleRestaurantClick(restaurant.id)}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                    {restaurant.name}
                  </h3>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full">
                    {restaurant.menus.length} items
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {restaurant.address}
                  </p>
                  <p className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {restaurant.phone}
                  </p>
                </div>

                <AddMenuItem
                  restaurantId={restaurant.id}
                  onItemAdded={(newItem) => {
                    setRestaurants((prev) =>
                      prev.map((r) =>
                        r.id === restaurant.id
                          ? { ...r, menus: [...r.menus, newItem] }
                          : r
                      )
                    );
                  }}
                  className="mt-4"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <button className="bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold px-6 py-3 rounded-full hover:shadow-lg transition-all duration-300 hover:opacity-90">
            Make Order Now
          </button>

          <Link
            to="/restaurant"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-full hover:shadow-lg transition-all duration-300 hover:opacity-90"
          >
            Add new restaurant
          </Link>
        </div>
      </div>

      <div className="p-4">
        {selectedRestaurant ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {selectedRestaurant.menus.map((item) => (
              <div
                key={item.id}
                className="relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group h-full"
              >
                {/* Background image with hover effect */}
                <div
                  style={{
                    backgroundImage: item.image_path
                      ? `url(http://localhost:8000/storage/${item.image_path})`
                      : "linear-gradient(to bottom, #f3f4f6, #e5e7eb)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"
                ></div>

                {/* Content card */}
                <div className="relative p-4 h-full flex flex-col">
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {item.name}
                      </h3>
                      <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-2 py-1 rounded-full">
                        {item.price} DH
                      </span>
                    </div>

                    {/* Quantity selector */}
                    <div className="flex items-center justify-center my-4">
                      <button
                        onClick={() => handleDecrement(item.id)}
                        className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                        disabled={!quantities[item.id]}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <span className="mx-3 font-medium text-lg">
                        {quantities[item.id] || 0}
                      </span>
                      <button
                        onClick={() => handleIncrement(item.id)}
                        className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAddToCart(item.id)}
                      disabled={!quantities[item.id]}
                      className={`w-full py-2 font-semibold rounded-lg transition-all duration-300 ${
                        quantities[item.id]
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-md"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteItem(item.id, selectedRestaurant.id)
                      }
                      className="w-full py-2 font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-md transition-all duration-300"
                    >
                      Delete Item
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-4 text-lg text-gray-600">
              Select a restaurant to view its menu
            </p>
          </div>
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
