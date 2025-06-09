const jwt = require("jsonwebtoken");
require("dotenv").config();

// 1. Middleware to check JWT token
function checkJWT(req, res, next) {
  // Read token from cookie
  const token = req.cookies?.jwt;
  if (!token) {
    res.locals.loggedin = false;
    return next();
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.locals.loggedin = false;
      return next();
    }
    // Token is valid
    res.locals.loggedin = true;
    res.locals.firstname = decoded.account_firstname;
    res.locals.account_type = decoded.account_type;
    res.locals.account_id = decoded.account_id;
    req.accountData = decoded;
    next();
  });
}

// 2. Middleware to require authentication
function requireAuth(req, res, next) {
  if (!res.locals.loggedin) {
    return res.redirect('/account/login?message=You must be logged in to access this area.');
  }
  next();
}

// 3. Middleware to check account type
function checkAccountType(requiredTypes = ['Employee', 'Admin']) {
  return (req, res, next) => {
    if (!res.locals.loggedin || !requiredTypes.includes(res.locals.account_type)) {
      return res.redirect('/account/login?message=You do not have access to that area.');
    }
    next();
  };
}

module.exports = { 
  checkJWT, 
  requireAuth, 
  checkAccountType 
};