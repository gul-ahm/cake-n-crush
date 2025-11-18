import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import secureAuth from '../../services/secureAuth';

const SecureRouteGuard = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const authenticated = await secureAuth.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Only check if we're on an admin route
    if (secureAuth.isAdminRoute(location.pathname)) {
      checkAuthentication();
    } else {
      setIsChecking(false);
      setIsAuthenticated(true); // Allow access to non-admin routes
    }
  }, [location.pathname]);

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated for admin routes
  if (secureAuth.isAdminRoute(location.pathname) && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default SecureRouteGuard;