const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Middleware to check if user is not logged in (for login and register pages)
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  next();
};

// GET: Display Login Form
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('login', { 
    title: 'Login',
    error: req.flash('error'),
    success: req.flash('success')
  });
});

// POST: Process Login Form
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate form inputs
    if (!username || !password) {
      req.flash('error', 'Please provide both username and password');
      return res.redirect('/users/login');
    }

    // Find user in database
    const user = await User.findOne({ username });
    if (!user) {
      req.flash('error', 'Invalid username or password');
      return res.redirect('/users/login');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error', 'Invalid username or password');
      return res.redirect('/users/login');
    }

    // Set session variables
    req.session.user = {
      id: user._id,
      username: user.username
    };

    req.flash('success', 'You are now logged in');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Server error occurred');
    res.redirect('/users/login');
  }
});

// GET: Display Registration Form
router.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('register', { 
    title: 'Register',
    error: req.flash('error')
  });
});

// POST: Process Registration Form
router.post('/register', async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;
    
    // Validate form inputs
    if (!username || !password || !confirmPassword) {
      req.flash('error', 'Please fill in all fields');
      return res.redirect('/users/register');
    }
    
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/users/register');
    }
    
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.flash('error', 'Username already exists');
      return res.redirect('/users/register');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
      createdAt: Date.now()
    });
    
    await newUser.save();
    
    req.flash('success', 'Registration successful, you can now log in');
    res.redirect('/users/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Server error occurred');
    res.redirect('/users/register');
  }
});

// GET: Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.redirect('/');
    }
    res.redirect('/users/login');
  });
});

module.exports = router;

