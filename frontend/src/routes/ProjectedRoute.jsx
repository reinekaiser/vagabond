import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import authService from "../services/authService";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const ProtectedRoute = ({ requireAdmin = false, requiredRole = null, redirectTo = "/sign-in" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      
      if (!authenticated) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }
      
      if (requireAdmin) {
        setIsAuthorized(authenticated && authService.isAdmin());
      } else if (requiredRole) {
        // Check if user has the specific required role
        const userRole = authService.getUserRole();
        setIsAuthorized(authenticated && userRole === requiredRole);
      } else {
        // If no specific role is required, just check authentication
        setIsAuthorized(authenticated);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [requireAdmin, requiredRole]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthorized ? <Outlet /> : <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;