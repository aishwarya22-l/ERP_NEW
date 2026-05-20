export const isAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }
  next();
};

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = req.session.user.role?.toString().toLowerCase();
    const normalizedRoles = roles.map((role) => role.toString().toLowerCase());

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied: ${req.session.user.role}`
      });
    }

    next();
  };
};

export const allowUserTypes = (...userTypes) => {
  return (req, res, next) => {
    const userType = req.session.user.userType;

    if (!userTypes.includes(userType)) {
      return res.status(403).json({
        message: `Access denied for user type: ${userType}`
      });
    }

    next();
  };
};