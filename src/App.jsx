import "./App.css";
import React, { useState, useEffect } from "react";
import Sidebar from "./components/mains/Sidebar";
import Header from "./components/mains/Header";
import Login from "./components/mains/Login";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/pages/Home";
import Reports from "./components/pages/Reports";
import NotFound from "./components/pages/NoFound";
import Client from "./components/pages/Client";
import Employee from "./components/pages/Employee";
import Category from "./components/pages/Category";
import Tax from "./components/pages/Tax";
import SidebarClose from "./components/mains/SidebarClose";
import InventaryGeneral from "./components/pages/InventaryGeneral";
import InventarySamples from "./components/pages/InventarySamples";
import Bill from "./components/pages/Bill";
import Sales from "./components/pages/Sales";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "./config/apiConfig";

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("token")
  );

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    await fetch(`${API_BASE_URL}/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  const handleVerifyToken = async () => {
    const token = localStorage.getItem("token");

    if (token != null) {
      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (
        !response.ok &&
        response.redirected &&
        response.url.includes("login_failed")
      ) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    handleVerifyToken();
  }, []);

  return (
    <Router>
      <ToastContainer position="bottom-right" autoClose={3000} />
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="relative h-screen">
          <div className="flex">
            {/* Sidebar */}
            <div>
              {isSidebarOpen ? (
                <Sidebar
                  isOpen={isSidebarOpen}
                  toggleSidebar={toggleSidebar}
                  onLogout={handleLogout}
                />
              ) : (
                <SidebarClose
                  isOpen={isSidebarOpen}
                  toggleSidebar={toggleSidebar}
                />
              )}
            </div>

            {/* Header */}
            <div className="w-full">
              <Header onLogout={handleLogout} />
              {/* Main Content */}
              <div className="transition-all duration-300">
                <Routes>
                  <Route path="/" element={<Home onLogout={handleLogout} />} />
                  <Route
                    path="/reports"
                    element={<Reports onLogout={handleLogout} />}
                  />
                  <Route
                    path="/client"
                    element={<Client onLogout={handleLogout} />}
                  />
                  <Route
                    path="/employee"
                    element={<Employee onLogout={handleLogout} />}
                  />
                  <Route
                    path="/category"
                    element={<Category onLogout={handleLogout} />}
                  />
                  <Route
                    path="/inventarygeneral"
                    element={<InventaryGeneral onLogout={handleLogout} />}
                  />
                  <Route
                    path="/inventarysamples"
                    element={<InventarySamples onLogout={handleLogout} />}
                  />
                  <Route
                    path="/bill"
                    element={<Bill onLogout={handleLogout} />}
                  />
                  <Route
                    path="/tax"
                    element={<Tax onLogout={handleLogout} />}
                  />
                  <Route
                    path="/sales"
                    element={<Sales onLogout={handleLogout} />}
                  />
                  <Route
                    path="*"
                    element={<NotFound onLogout={handleLogout} />}
                  />
                </Routes>
              </div>
            </div>
          </div>
          {/* <Footer /> */}
        </div>
      )}
    </Router>
  );
}

export default App;
