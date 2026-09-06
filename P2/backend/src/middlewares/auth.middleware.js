const jwt = require('jsonwebtoken');
const config = require('../config');

// Vérifie le token JWT et attache l'utilisateur (id + role) à req.user
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Non authentifié' });
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    req.user = payload; // { id, role }
    next();
  } catch {
    return res.status(401).json({ error: 'Session invalide ou expirée' });
  }
}

// Attache req.user si un token valide est fourni, mais laisse passer les
// visiteurs anonymes (utile pour l'essai gratuit d'un quiz sans inscription).
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, config.JWT_SECRET);
    } catch {
      // token invalide/expiré : on continue en anonyme plutôt que de bloquer
    }
  }
  next();
}

// Restreint l'accès à une liste de rôles (ex: requireRole('admin'))
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
  };
}

module.exports = { auth, optionalAuth, requireRole };
