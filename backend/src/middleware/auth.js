function requireAuth(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      ok: false,
      message: "Authentication required",
    });
  }

  next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({
        ok: false,
        message: "Authentication required",
      });
    }

    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        ok: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
}

module.exports = { requireAuth, requireRole };