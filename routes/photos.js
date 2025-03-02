const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import models
const Photo = require('../models/Photo');

// Import middleware
const { isAuthenticated } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image file.'), false);
  }
};
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Home route - display all photos
router.get('/', async (req, res) => {
  const uploadsDir = path.join(__dirname, '../public/uploads');
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  try {
    // Fetch photos from database
    let photos;
    
    if (req.session.user) {
      // If user is logged in, get photos from the database
      photos = await Photo.find().sort({ uploadDate: -1 });
    } else {
      // If not logged in, get photos from filesystem (for backward compatibility)
      const files = fs.readdirSync(uploadsDir);
      
      // Filter for image files
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
      });
      
      // Map to create photo objects similar to database model
      photos = imageFiles.map(file => ({
        filename: file,
        path: `/uploads/${file}`,
        uploadDate: new Date()
      }));
    }
    
    // Group photos by date
    const photosByDate = {};
    photos.forEach(photo => {
      const date = photo.uploadDate.toISOString().split('T')[0];
      if (!photosByDate[date]) {
        photosByDate[date] = [];
      }
      photosByDate[date].push({
        path: photo.path || `/uploads/${photo.filename}`,
        filename: photo.filename,
        _id: photo._id
      });
    });
    
    res.render('index', { 
      photosByDate,
      isAuthenticated: !!req.session.user
    });
  } catch (err) {
    console.error('Error fetching photos:', err);
    req.flash('error_msg', 'Error loading photos');
    res.status(500).render('index', { photosByDate: {}, isAuthenticated: !!req.session.user });
  }
});

// Upload route - display the upload form
router.get('/upload', isAuthenticated, (req, res) => {
  res.render('upload');
});

// Handle the file upload
router.post('/upload', isAuthenticated, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    req.flash('error_msg', 'No file uploaded or file type not supported.');
    return res.redirect('/upload');
  }
  
  try {
    // Get the date from the form or default to today
    const today = new Date().toISOString().split('T')[0];
    const uploadDate = req.body.date ? new Date(req.body.date) : new Date();
    const category = req.body.date || today;
    
    // Create a new photo document in the database
    const newPhoto = new Photo({
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      uploadDate: uploadDate,
      category: category,
      user: req.session.user.id
    });
    
    await newPhoto.save();
    req.flash('success_msg', 'Photo uploaded successfully');
    res.redirect('/');
  } catch (err) {
    console.error('Error saving photo to database:', err);
    req.flash('error_msg', 'Error uploading photo');
    res.redirect('/upload');
  }
});

// Delete a photo
router.post('/delete/:id', isAuthenticated, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    
    if (!photo) {
      req.flash('error_msg', 'Photo not found');
      return res.redirect('/');
    }
    
    // Check if the photo belongs to the logged-in user
    if (photo.user.toString() !== req.session.user.id.toString()) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/');
    }
    
    // Delete the file from the filesystem
    const filePath = path.join(__dirname, '../public', photo.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete the photo from the database
    await Photo.findByIdAndDelete(req.params.id);
    
    req.flash('success_msg', 'Photo deleted successfully');
    res.redirect('/');
  } catch (err) {
    console.error('Error deleting photo:', err);
    req.flash('error_msg', 'Error deleting photo');
    res.redirect('/');
  }
});

module.exports = router;

