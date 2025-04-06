import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { useNotify } from "../NotifyContextProvider";

const RegisterPage = () => {
  const { setNotification, notification, setLoad } = useNotify();

  const [register, setRegister] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "restaurant", // Initial role
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    console.log(formData);
    try {
      const response = await apiClient.post("/register", formData);
      setNotification("Registration successful! Please log in.");
      navigate("/login"); // Redirect to login page after registration
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred during registration.");
      }
    }
  };

  const handleClickToRegister = () => {
    setRegister(true);
    setFormData((prev) => ({
      ...prev,
      role: "restaurant",
    }));
  };

  const handleClickToCustomer = () => {
    setRegister(false);
    setFormData((prev) => ({
      ...prev,
      role: "customer",
    }));
  };

  return (
    <div>
      <div
        className={register ? "bg-lime-800 bg-opacity-90" : "  bg-opacity-90"}
        style={styles.container}
      >
        <div className="grid grid-cols-2 rounded-md overflow-hidden">
          <button
            className={`py-2 font-semibold px-3 transition-all duration-200 ease-in-out ${
              !register ? "bg-lime-600" : "bg-lime-700 hover:bg-lime-500"
            }`}
            onClick={handleClickToCustomer}
          >
            Customer
          </button>
          <button
            className={`py-2 font-semibold px-3 transition-all duration-200 ease-in-out ${
              register ? "bg-lime-600" : "bg-lime-700 hover:bg-lime-500"
            }`}
            onClick={handleClickToRegister}
          >
            Restaurant
          </button>
        </div>

        <h2>Register</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="name"
            placeholder={register ? "Restaurant Name" : "Customer Name"}
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="true"
            style={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="true"
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="false"
            style={styles.input}
          />
          <input
            type="password"
            name="password_confirmation"
            placeholder="Confirm Password"
            value={formData.password_confirmation}
            onChange={handleChange}
            required
            autoComplete="false"
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

// Inline styles for simplicity
const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.6)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
};

export default RegisterPage;
