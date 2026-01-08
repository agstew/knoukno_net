const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-please';

function requireAuth(req, res, next){
  const token = req.cookies && req.cookies.token;
  if (!token) return res.redirect('/auth/login');
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  }catch(e){
    return res.redirect('/auth/login');
  }
}

module.exports = requireAuth;
