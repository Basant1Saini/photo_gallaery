/**
 * Authentication middleware to protect routes that require authentication.
 * This middleware checks if a user is logged in by examining the session.
 * If the user is logged in, the request proceeds to the next middleware.
 * If the user is not logged in, they are redirected to the login page.
 */

module.exports = {
  // Middleware to check if the user is authenticated
  isAuthenticated: function(req, res, next) {
    // Check if user is authenticated via session
    if (req.session && req.session.user && req.session.user.id) {
      // User is authenticated, proceed to the next middleware
      return next();
    }

    // User is not authenticated, redirect to login page
    req.flash('error_msg', 'Please log in to access this page');
    return res.redirect('/users/login');
  },

  // Optional middleware to check if the user is an admin (for future use)
  isAdmin: function(req, res, next) {
    if (req.session && req.session.user && req.session.user.id && req.session.isAdmin) {
      return next();
    }
    
    // Not admin, redirect to home page with error message
    req.flash('error_msg', 'You need admin privileges to access this page');
    return res.redirect('/');
  },

  // Middleware to check if the user is NOT authenticated (for login/register pages)
  isGuest: function(req, res, next) {
    // If user is already logged in, redirect to home page
    if (req.session && req.session.user && req.session.user.id) {
      req.flash('info_msg', 'You are already logged in');
      return res.redirect('/');
    }

    // User is not logged in, proceed to the login/register page
    return next();
  }
};


