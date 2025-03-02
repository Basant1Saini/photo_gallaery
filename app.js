const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const port = 3000;

// Import database connection
const connectDB = require('./config/database');

// Import models
const User = require('./models/User');

// Import middleware
const { isAuthenticated, isGuest } = require('./middleware/auth');

// Import routes
const userRoutes = require('./routes/users');
const photoRoutes = require('./routes/photos');

// Connect to database
connectDB();

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the public directory
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Set up session management
app.use(session({
  secret: 'photo-gallery-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Set up flash messages
app.use(flash());

// Make flash messages available to all templates
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.session.user || null;
  next();
});

// Use routes
app.use('/users', userRoutes);
app.use('/', photoRoutes);

// Create the necessary EJS view files
const viewsDir = path.join(__dirname, 'views');
if (!fs.existsSync(viewsDir)) {
  fs.mkdirSync(viewsDir, { recursive: true });
}

// Create index.ejs template if it doesn't exist
const indexPath = path.join(viewsDir, 'index.ejs');
if (!fs.existsSync(indexPath)) {
  const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Photo Gallery</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    h1 { text-align: center; }
    h2 { padding-left: 15px; border-bottom: 1px solid #eee; color: #555; }
    .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; margin-bottom: 30px; }
    .photo { width: 100%; height: 200px; object-fit: cover; border-radius: 5px; }
    .photo-container { position: relative; }
    .upload-btn, .login-btn, .register-btn, .logout-btn { display: inline-block; margin: 20px 10px; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; text-align: center; }
    .login-btn { background: #2196F3; }
    
</head>
<body>
  <h1>Photo Gallery</h1>
  <a href="/upload" class="upload-btn">Upload New Photo</a>
  
  <% if (photosByDate && Object.keys(photosByDate).length > 0) { %>
    <% Object.keys(photosByDate).sort().reverse().forEach(date => { %>
      <div class="date-category">
        <h2><%= new Date(date).toLocaleDateString() %></h2>
        <div class="gallery">
          <% photosByDate[date].forEach(photo => { %>
            <div class="photo-container">
              <img src="<%= photo.path %>" alt="Gallery Image" class="photo">
              <% if (isAuthenticated) { %>
                <form action="/delete/<%= photo._id %>" method="POST" class="delete-form">
                  <button type="submit" class="delete-btn">Delete</button>
                </form>
              <% } %>
            </div>
          <% }); %>
        </div>
      </div>
    <% }); %>
  <% } else { %>
    <p class="no-photos">No photos yet. Be the first to upload!</p>
  <% } %>
</html>`;
  fs.writeFileSync(indexPath, indexContent);
}

// Create upload.ejs template if it doesn't exist
const uploadPath = path.join(viewsDir, 'upload.ejs');
if (!fs.existsSync(uploadPath)) {
  const uploadContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upload Photo</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    h1 { text-align: center; }
    form { max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: bold; }
    input[type="file"] { width: 100%; padding: 8px; }
    button { padding: 10px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background: #45a049; }
    .back-link { display: block; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <h1>Upload New Photo</h1>
  
  <form action="/upload" method="POST" enctype="multipart/form-data">
    <div class="form-group">
      <label for="photo">Choose an image:</label>
      <input type="file" id="photo" name="photo" accept="image/*" required>
    </div>
    <button type="submit">Upload Photo</button>
  </form>
  
  <a href="/" class="back-link">Back to Gallery</a>
</body>
</html>`;
  fs.writeFileSync(uploadPath, uploadContent);
}

// Start the server
app.listen(port, () => {
  console.log(`Photo gallery app listening at http://localhost:${port}`);
  console.log(`Upload directory: ${path.join(__dirname, 'public/uploads')}`);
});

