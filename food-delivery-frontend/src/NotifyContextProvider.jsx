// src/NotifyContextProvider.jsx
import { createContext, useContext, useState } from "react";

const NotifyContext = createContext({
  notification: null,
  setNotification: () => {},
  load:false,
  setLoad:()=>{}

});

// Enhanced NotifyContextProvider.jsx
export const ContextProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    message: null,
    type: "success", // 'success', 'error', 'warning', 'info'
  });

  const [load,setLoad]=useState(false);
  // setTimeout(() => {
  //   setLoad(false);
  // }, 300);

  const showNotification = (message, type = "success", duration = 5000) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: null, type });
    }, duration);
  };

  const getBgColor = () => {
    switch (notification.type) {
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-green-800";
    }
  };

  return (
    <NotifyContext.Provider
      value={{
        notification,
        setNotification: showNotification,
        load,
        setLoad

      }}
    >
      {children}
      {notification.message && (
        <div
          className={`fixed bottom-4 border-b-2 border-b-amber-50  right-4 ${getBgColor()} text-white font-semibold px-6 py-6 text-xl rounded-md shadow-lg animate-fade-in`}
        >
          {notification.message}
        </div>
      )}
    </NotifyContext.Provider>
  );
};

export const useNotify = () => useContext(NotifyContext);
