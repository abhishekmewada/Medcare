import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();

  const { user, isAuthenticated, loading, } = useSelector(
    (state) => state.auth
  );

  console.log("PROTECTED:", {
    user,
    isAuthenticated,
    loading,
  });


   // Auth check abhi chal raha hai
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading...
        </p>
      </div>
    );
  }

  // User login nahi hai
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/Login"
        replace
        state={{ from: location }}
      />
    );
  }

  // User logged in hai but role allowed nahi hai
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;