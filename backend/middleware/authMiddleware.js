const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  const parts = authorization ? authorization.split(' ') : [];
  const [scheme, token] = parts;

  if (parts.length !== 2 || scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Access denied. Please log in.' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'Authentication is not configured.' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ message: `${role} access only.` });
  }
  return next();
};

const verifyStaff = [verifyToken, requireRole('staff')];
const verifyUser = [verifyToken, requireRole('user')];

module.exports = { verifyToken, requireRole, verifyStaff, verifyUser };
