const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekiyor' });
  }
};

const checkRole = (role) => (req, res, next) => {
  if (req.user && req.user.role === role) {
    next();
  } else {
    res.status(403).json({ message: `Bu işlem için ${role} yetkisi gerekiyor` });
  }
};

module.exports = {
  adminOnly,
  checkRole
}; 