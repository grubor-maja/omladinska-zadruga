const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  console.log('verifyToken middleware called for:', req.method, req.url);
  const header = req.headers['authorization'];
  console.log('Authorization header:', header);
  const token = header && header.split(' ')[1];
  console.log('Extracted token:', token ? 'token present' : 'no token');

  if (!token) {
    console.log('No token provided, returning 401');
    return res.sendStatus(401);
  }

  jwt.verify(token, 'tajna_rec', (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.sendStatus(403);
    }
    console.log('Token verified successfully for user:', user);
    req.user = user;
    next();
  });
};
