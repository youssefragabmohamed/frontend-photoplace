import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  
  if (!token || !userId) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export default PrivateRoute;