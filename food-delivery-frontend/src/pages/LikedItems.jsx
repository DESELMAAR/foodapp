import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { useNavigate } from "react-router-dom";
import LoadingAnimation from "../components/LoadingAnimation";
// import { toast } from "react-toastify"; // For notifications
import { useNotify } from "../NotifyContextProvider";

const LikedItems = () => {
  const [likedMenus, setLikedMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setNotification } = useNotify();

  useEffect(() => {
    fetchLikedMenus();
  }, []);

  const fetchLikedMenus = async () => {
    try {
      const response = await apiClient.get("/user/likes");
      setLikedMenus(response.data.liked_menus);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      }
      console.error("Error fetching liked menus:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (menuId) => {
    try {
      await apiClient.post(`/menus/${menuId}/unlike`);
      setLikedMenus(likedMenus.filter(menu => menu.id !== menuId));
      // toast.success("Removed from favorites");
      setNotification("Menu disliked successfully!", "success");

    } catch (err) {
      console.error("Error unliking menu:", err);
      // toast.error("Failed to remove from favorites");
      setNotification(
        error.response?.data?.message || "Failed to add menu item", 
        "error"
      );
      fetchLikedMenus();
    }
  };

  const handleAddToCart = async (menuId) => {
    try {
      await apiClient.post("/cart", { 
        product_id: menuId,
        quantity: 1 // Default quantity
      });
      setNotification("Added to cart!","success");
    } catch (err) {
      console.error("Error adding to cart:", err);
      setNotification(err.response?.data?.message || "Failed to add to cart");
    }
  };

  if (loading) return <LoadingAnimation />;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Liked Menu Items</h1>
      
      {likedMenus.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {likedMenus.map(menu => (
            <div 
              key={menu.id} 
              className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white"
            >
              {/* Menu Image */}
              <div 
                className="h-48 overflow-hidden cursor-pointer" 
                onClick={() => navigate(`/menus/${menu.id}`)}
              >
                <img 
                  src={menu.image_url} 
                  alt={menu.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = '/placeholder-food.jpg';
                  }}
                />
              </div>
              
              {/* Menu Details */}
              <div className="p-4">
                <h3 
                  className="font-bold text-lg cursor-pointer hover:text-purple-600"
                  onClick={() => navigate(`/menus/${menu.id}`)}
                >
                  {menu.name}
                </h3>
                <p className="text-gray-600">{menu.restaurant?.name}</p>
                <div className="mt-3 flex justify-between items-center">
                  <p className="text-purple-600 font-semibold">{menu.price} DH</p>
                  <div className="flex gap-2">
                    <button 
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlike(menu.id);
                      }}
                    >
                      ♥
                    </button>
                    <button 
                      className="px-3 py-1 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(menu.id);
                      }}
                    >
                      + Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">You haven't liked any items yet</p>
          <button 
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            onClick={() => navigate('/menus')}
          >
            Browse Menus
          </button>
        </div>
      )}
    </div>
  );
};

export default LikedItems;