// Simple authentication middleware for admin console
export const simpleAuth = (req, res, next) => {
  // For now, we'll skip authentication in backend since frontend handles it
  // In a production environment, you might want to verify tokens or sessions
  next();
};

// Protected route middleware - simplified for admin console
export const protect = () => {
  return simpleAuth;
};

// Role-based protection - simplified since we only have admin
export const protectWithRoles = (roles) => {
  return simpleAuth;
}; 
