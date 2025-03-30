import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

const Navbar = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = localStorage.getItem("authToken");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount();
    }
  }, [isAuthenticated, cartItems]); // Update count when cartItems change

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
    try {
      const response = await apiClient.get("/cart");
      setCartItems(response.data.items || response.data);
    //   console.log()
    } catch (error) {
      console.error("Error fetching cart items:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
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

    try {
      await apiClient.put(`/cart/${itemId}`, { quantity: newQuantity });
      // Update local state optimistically
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating cart item:", error);
      // Revert if API call fails
      fetchCartItems();
    }
  };

  const removeCartItem = async (itemId) => {
    try {
      await apiClient.delete(`/cart/${itemId}`);
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
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
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  return (
    <div>
      <nav className="font-semibold py-2 " style={styles.navbar}>
        <div style={styles.left}>
          <Link to="/" style={styles.link}>
            Home
          </Link>
          {isAuthenticated && user && (
            <Link to="/orders" style={styles.link}>
              Orders
            </Link>
          )}
        </div>
        <div style={styles.right}>
          {isAuthenticated ? (
            <div style={styles.userSection}>
              <button onClick={handleLogout} style={styles.button}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" style={styles.link}>
                Login
              </Link>
              <Link to="/register" style={styles.link}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
      <div className="flex justify-between  ">
        {user && (
          <>
            <span style={styles.userName}>Hello, {user.name || "User"}!</span>
            <div className="relative flex justify-center cursor-pointer">
              <img
                className="w-10"
                src="../src/assets/cart.svg"
                alt="cart"
                onClick={handleClickCartIcon}
              />
              {cartCount > 0 && (
                <span
                  className="absolute bottom-1 font-bold text-xl text-blue-800"
                  onClick={handleClickCartIcon}
                >
                  {cartCount}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Cart Drawer/Sidebar */}
      {isCartOpen && (
        <div style={styles.cartOverlay}>
          <div style={styles.cartDrawer}>
            <div style={styles.cartHeader}>
              <h2>Your Cart ({cartCount})</h2>
              <button onClick={closeCart} style={styles.closeButton}>
                &times;
              </button>
            </div>
            <div style={styles.cartContent}>
              {isLoading ? (
                <p>Loading cart items...</p>
              ) : cartItems.length > 0 ? (
                <>
                  <ul style={styles.cartList}>
                    {cartItems.map((item) => (
                      <li key={item.id} style={styles.cartItem}>
                        <div style={styles.itemInfo}>
                          <span>
                            <strong>{item.product.name}</strong>
                          </span>
                          <span>
                            ${item.product.price} x {item.quantity}
                          </span>
                        </div>
                        <div style={styles.itemControls}>
                          <button
                            onClick={() => handleDecrement(item.id, item.quantity)}
                            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="mx-2 font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleIncrement(item.id, item.quantity)}
                            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full"
                          >
                            +
                          </button>
                        </div>
                        <div style={styles.itemTotal}>
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </div>
                        <div style={styles.itembtn}>
                          <button
                            onClick={() => removeCartItem(item.id)}
                            style={styles.removeButton}
                          >
                            <img
                              className="w-5"
                              src="../src/assets/delete.svg"
                              alt="delete"
                            />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div style={styles.cartSummary}>
                    <div className="font-bold text-green-700 " style={styles.summaryRow}>
                      <span className="text-xl" >Subtotal:</span>
                      <span className="text-xl">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p>Your cart is empty</p>
              )}
            </div>
            {cartItems.length > 0 && (
              <div style={styles.cartFooter}>
                <button
                  style={styles.checkoutButton}
                  onClick={() => {
                    navigate("/checkout");
                    closeCart();
                  }}
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    // padding: "10px 20px",
    color: "#fff",
  },
  left: {
    display: "flex",
    gap: "20px",
  },
  right: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  userName: {
    fontSize: "16px",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "16px",
  },
  button: {
    // padding: "0px 10px",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  cartOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "flex-end",
  },
  cartDrawer: {
    width: "400px",
    maxWidth: "90%",
    height: "100%",
    backgroundColor: "#fff",
    color: "#333",
    display: "flex",
    flexDirection: "column",
  },
  cartHeader: {
    padding: "20px",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
  },
  cartContent: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
  },
  cartList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  cartItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },
  itemInfo: {
    flex: "30%",
    display: "flex",
    flexDirection: "column",
  },
  itemControls: {
    flex: "20%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  itemTotal: {
    flex: "20%",
    fontWeight: "bold",
    display: "flex",
    justifyContent: "center",
  },
  itembtn: {
    flex: "10%",
    display: "flex",
    justifyContent: "center",
  },
  removeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  cartSummary: {
    padding: "15px 0",
    // borderTop: "1px solid #eee",
    marginTop: "10px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontSize: "16px",
  },
  cartFooter: {
    padding: "20px",
    borderTop: "1px solid #eee",
  },
  checkoutButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Navbar;

// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import apiClient from "../api/apiClient";

// const Navbar = () => {
//   const navigate = useNavigate();
//   const [cartCount, setCartCount] = useState(0);
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [cartItems, setCartItems] = useState([]);
//   const isAuthenticated = localStorage.getItem("authToken");
//   const userString = localStorage.getItem("user");
//   const user = userString ? JSON.parse(userString) : null;
//   const [quantities, setQuantities] = useState({}); // Track quantities for each menu item

//   useEffect(() => {
//     if (isAuthenticated) {
//       fetchCartCount();
//     }
//   }, [isAuthenticated]);

//   const fetchCartCount = async () => {
//     try {
//       const response = await apiClient.get("/cart/count");
//       setCartCount(response.data.count);
//     } catch (error) {
//       console.error("Error fetching cart count:", error);
//     }
//   };

//   const fetchCartItems = async () => {
//     try {
//       const response = await apiClient.get("/cart");
//       setCartItems(response.data.items);
//       console.log(cartItems);
//     } catch (error) {
//       console.error("Error fetching cart items:", error);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("authToken");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   const handleClickCartIcon = () => {
//     if (isAuthenticated) {
//       fetchCartItems();
//       setIsCartOpen(true);
//     } else {
//       navigate("/login");
//     }
//   };

//   const handleDecrement = (itemId) => {
//     setQuantities(prev => ({
//       ...prev,
//       [itemId]: Math.max((prev[itemId] || 0) - 1, 0)
//     }));
//   };
//   const handleIncrement = (itemId) => {
//     setQuantities(prev => ({
//       ...prev,
//       [itemId]: (prev[itemId] || 0) + 1
//     }));
//   };
//   const closeCart = () => {
//     setIsCartOpen(false);
//   };

//   return (
//     <div>
//       <nav className="font-semibold" style={styles.navbar}>
//         <div style={styles.left}>
//           <Link to="/" style={styles.link}>
//             Home
//           </Link>
//           {isAuthenticated && user && (
//             <Link to="/orders" style={styles.link}>
//               Orders
//             </Link>
//           )}
//         </div>
//         <div style={styles.right}>
//           {isAuthenticated ? (
//             <div style={styles.userSection}>
//               <button onClick={handleLogout} style={styles.button}>
//                 Logout
//               </button>
//             </div>
//           ) : (
//             <>
//               <Link to="/login" style={styles.link}>
//                 Login
//               </Link>
//               <Link to="/register" style={styles.link}>
//                 Register
//               </Link>
//             </>
//           )}
//         </div>
//       </nav>
//       <div className="flex justify-between">
//         {user && (
//           <>
//             <span style={styles.userName}>Hello, {user.name || "User"}!</span>
//             <div className="relative flex justify-center cursor-pointer">
//               <img
//                 className="w-10"
//                 src="../src/assets/cart.svg"
//                 alt="cart"
//                 onClick={handleClickCartIcon}
//               />
//               {cartCount > 0 && (
//                 <span
//                   className="absolute bottom-1 font-bold text-xl text-blue-800"
//                   onClick={handleClickCartIcon}
//                 >
//                   {cartCount}
//                 </span>
//               )}
//             </div>
//           </>
//         )}
//       </div>

//       {/* Cart Drawer/Sidebar */}
//       {isCartOpen && (
//         <div style={styles.cartOverlay}>
//           <div style={styles.cartDrawer}>
//             <div style={styles.cartHeader}>
//               <h2>Your Cart ({cartCount})</h2>
//               <button onClick={closeCart} style={styles.closeButton}>
//                 &times;
//               </button>
//             </div>
//             <div style={styles.cartContent}>
//               {cartItems.length > 0 ? (
//                 <ul style={styles.cartList}>
//                   {cartItems.map((item) => (
//                     <li key={item.id} style={styles.cartItem}>
//                       <div style={styles.itemInfo}>
//                         <span>
//                           <strong>{item.product.name}</strong>
//                         </span>
//                         <span>
//                           ${item.product.price} x {item.quantity}
//                         </span>
//                       </div>
// {/* incrementer */}
//                       <div className="flex items-center justify-center py-1">
//                         <button
//                           onClick={() => handleDecrement(item.id)}
//                           className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full"
//                           disabled={!quantities[item.id]}
//                         >
//                           -
//                         </button>
//                         <span className="mx-2 font-medium">
//                           {quantities[item.id] || 0}
//                         </span>
//                         <button
//                           onClick={() => handleIncrement(item.id)}
//                           className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full"
//                         >
//                           +
//                         </button>
//                       </div>

//                       <div style={styles.itemTotal}>
//                         ${item.product.price * item.quantity}
//                       </div>
//                       <div style={styles.itembtn}>
//                         <img
//                           className="w-5"
//                           src="../src/assets/delete.svg"
//                           alt="delete"
//                         />
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p>Your cart is empty</p>
//               )}
//             </div>
//             <div style={styles.cartFooter}>
//               <button
//                 style={styles.checkoutButton}
//                 onClick={() => {
//                   navigate("/checkout");
//                   closeCart();
//                 }}
//               >
//                 Proceed to Checkout
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const styles = {
//   navbar: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: "10px 20px",
//     color: "#fff",
//   },
//   left: {
//     display: "flex",
//     gap: "20px",
//   },
//   right: {
//     display: "flex",
//     gap: "20px",
//     alignItems: "center",
//   },
//   userSection: {
//     display: "flex",
//     alignItems: "center",
//     gap: "15px",
//   },
//   userName: {
//     fontSize: "16px",
//   },
//   link: {
//     color: "#fff",
//     textDecoration: "none",
//     fontSize: "16px",
//   },
//   button: {
//     padding: "0px 10px",
//     color: "#fff",
//     border: "none",
//     borderRadius: "4px",
//     cursor: "pointer",
//     fontSize: "16px",
//   },
//   cartOverlay: {
//     position: "fixed",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     zIndex: 1000,
//     display: "flex",
//     justifyContent: "flex-end",
//   },
//   cartDrawer: {
//     width: "400px",
//     maxWidth: "90%",
//     height: "100%",
//     backgroundColor: "#fff",
//     color: "#333",
//     display: "flex",
//     flexDirection: "column",
//   },
//   cartHeader: {
//     padding: "20px",
//     borderBottom: "1px solid #eee",
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   closeButton: {
//     background: "none",
//     border: "none",
//     fontSize: "24px",
//     cursor: "pointer",
//   },
//   cartContent: {
//     flex: 1,
//     padding: "20px",
//     overflowY: "auto",
//   },
//   cartList: {
//     listStyle: "none",
//     padding: 0,
//     margin: 0,
//   },
//   cartItem: {
//     display: "flex",
//     justifyContent: "space-between",
//     justifyContent:"center",
//     padding: "10px 0",
//     borderBottom: "1px solid #eee",
//   },
//   itemInfo: {
//     flex: "30%",
//     display: "flex",
//     flexDirection: "column",
//   },
//   itemTotal: {
//     flex: "25%",
//     fontWeight: "bold",
//     display: "flex",
//     justifyContent: "center",
//     alignItems:"center",
//   },
//   itembtn: {
//     flex: "25%",
//     display: "flex",
//     justifyContent: "center",
//     alignItems:"center",
//   },
//   itemIncrement: {
//     flex: "20%",
//   },
//   cartFooter: {
//     padding: "20px",
//     borderTop: "1px solid #eee",
//   },
//   checkoutButton: {
//     width: "100%",
//     padding: "10px",
//     backgroundColor: "#4CAF50",
//     color: "white",
//     border: "none",
//     borderRadius: "4px",
//     cursor: "pointer",
//     fontSize: "16px",
//   },
// };

// export default Navbar;
