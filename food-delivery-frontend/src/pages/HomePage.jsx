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
      <div className="bg-white bg-opacity-90 backdrop-blur-sm p-4">
        <h1 className="font-bold text-indigo-900">Welcome to Food Delivery</h1>
        <p className="text-white">
          Explore our restaurants and place your order today!
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: "center",
          }}
        >
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
              <button>
                <strong>Variety Meal:</strong> {restaurant.menus.length}
              </button>
              <br />

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
              />
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
            <div  key={item.id}>
              <div
               
                
                className="grid grid-cols-3 rounded-lg h-full group relative overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                {/* Background overlay that scales on hover */}
                <div style={{
                  backgroundImage: `url(http://localhost:8000/storage/${item.image_path})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }} className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 transform group-hover:scale-105"></div>

                <div className="card bg-white rounded-xl bg-opacity-80 backdrop-blur-xl z-10">
                  <div className="">
                    <h1 className="font-semibold text-lg">{item.name}</h1>
                    <p className="text-gray-800 font-medium">{item.price}DH</p>
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
                  </div>

                  <button
                    className="w-full bg-slate-100 py-2 font-semibold rounded-full bg-opacity-70 hover:bg-opacity-100 transition-all duration-300 mb-2"
                    onClick={() => handleAddToCart(item.id)}
                    disabled={!quantities[item.id]}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="w-full bg-red-100 py-2 font-semibold rounded-full bg-opacity-70 hover:bg-opacity-100 transition-all duration-300"
                    onClick={() =>
                      handleDeleteItem(item.id, selectedRestaurant.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
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
