// components/PrivateRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCasUserContext } from "../context/CasUserContext";

const PrivateRoute = () => {
  const { casUser } = useCasUserContext();
  const location = useLocation();

  return casUser ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export default PrivateRoute;
