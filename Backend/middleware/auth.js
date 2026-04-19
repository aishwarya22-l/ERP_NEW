export const isAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }
  next();
};

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = req.session.user.role;

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied: ${userRole}`
      });
    }

    next();
  };
};