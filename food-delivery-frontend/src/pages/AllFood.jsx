import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { useNotify } from "../NotifyContextProvider";
import { Link } from "react-router-dom";

const AllFood = () => {
  const [menuData, setMenuData] = useState({
    items: [],
    currentPage: 1,
    totalPages: 1,
    perPage: 12,
    totalItems: 0,
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const { setNotification } = useNotify();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const categoriesResponse = await apiClient.get(
          "/v1/all-food/categories"
        );
        setCategories(categoriesResponse.data.data);

        // Fetch initial menu items
        await fetchMenuItems();
      } catch (err) {
        setError("Failed to load data.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchMenuItems = async (page = 1, category = selectedCategory) => {
    try {
      const params = {
        page,
        per_page: menuData.perPage,
        ...(category !== "all" && { category }),
      };

      const response = await apiClient.get("/v1/all-food", { params });
      const { data, current_page, last_page, total } = response.data.data;

      setMenuData({
        items: data,
        currentPage: current_page,
        totalPages: last_page,
        perPage: menuData.perPage,
        totalItems: total,
      });
    } catch (err) {
      setError("Failed to load menu items.");
      console.error("Error fetching menu items:", err);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchMenuItems(1, category);
  };

  const handlePageChange = (page) => {
    fetchMenuItems(page);
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        All Available Menu Items
      </h1>
      <div className="grid grid-cols-[120px_1fr] gap-4">
        {/* Categories Sidebar */}
        <div className="flex flex-col gap-2">
          <Link
            to="/foods"
            className="px-4 py-2 rounded-full bg-gray-200 text-center hover:bg-gray-300 transition-colors"
          >
            Restaurants
          </Link>
          <button
            onClick={() => handleCategoryChange("all")}
            className={`px-4 py-2 rounded-full text-center ${
              selectedCategory === "all"
                ? "bg-purple-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            } transition-colors`}
          >
            All Items
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-center ${
                selectedCategory === category
                  ? "bg-purple-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              } transition-colors`}
            >
              {category || "Uncategorized"}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {menuData.items.map((item) => (
            <div
              key={item.id}
              className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
              style={{
                backgroundImage: item.image_path
                  ? `url(http://localhost:8000${item.image_url})`
                  : "linear-gradient(to bottom, #f3f4f6, #e5e7eb)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "300px",
              }}
            >
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"></div>

              {/* Content card */}
              <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-4 transform translate-y-10 group-hover:translate-y-0 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-gray-700">{item.restaurant?.name}</p>
                  </div>
                  <span className="font-bold text-purple-600">
                    {item.price} DH
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {item.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleDecrement(item.id)}
                      className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-full"
                      disabled={!quantities[item.id]}
                    >
                      -
                    </button>
                    <span className="mx-2 font-medium">
                      {quantities[item.id] || 0}
                    </span>
                    <button
                      onClick={() => handleIncrement(item.id)}
                      className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-full"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item.id)}
                    disabled={!quantities[item.id]}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-1 rounded-full transition-colors duration-300 disabled:opacity-50"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Category Filter */}

      {/* Pagination */}
      {menuData.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(menuData.currentPage - 1)}
            disabled={menuData.currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(5, menuData.totalPages) }, (_, i) => {
            let pageNum;
            if (menuData.totalPages <= 5) {
              pageNum = i + 1;
            } else if (menuData.currentPage <= 3) {
              pageNum = i + 1;
            } else if (menuData.currentPage >= menuData.totalPages - 2) {
              pageNum = menuData.totalPages - 4 + i;
            } else {
              pageNum = menuData.currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 rounded ${
                  menuData.currentPage === pageNum
                    ? "bg-purple-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(menuData.currentPage + 1)}
            disabled={menuData.currentPage === menuData.totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Items count */}
      <div className="text-center mt-4 text-gray-600">
        Showing {menuData.items.length} of {menuData.totalItems} items
      </div>
    </div>
  );
};

export default AllFood;
