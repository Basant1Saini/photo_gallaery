# Photo Gallery Application

A simple photo gallery web application that allows users to upload and view images.

## Technologies Used

This application is built using the following technologies:

- **Express.js**: A minimal and flexible Node.js web application framework
- **EJS**: A simple templating engine that lets you generate HTML with plain JavaScript
- **Multer**: A middleware for handling multipart/form-data, primarily used for file uploads

## Prerequisites

Before you begin, ensure you have Node.js and npm installed on your system. You can check your current version with:

```bash
node -v
npm -v
```

## Installation

1. Clone or download this repository to your local machine.

2. Navigate to the project directory:

```bash
cd photo-gallery
```

3. Install the required dependencies:

```bash
npm install
```

This will install Express.js, EJS, Multer, and any other dependencies specified in the package.json file.

## Running the Application

To start the server, run:

```bash
npm start
```

By default, the application will be available at http://localhost:3000.

## Using the Photo Gallery

### Viewing Photos

- Open your web browser and navigate to http://localhost:3000
- The home page will display all uploaded photos in a grid layout
- Click on any photo to view it in larger size

### Uploading Photos

1. From the home page, click on the "Upload" button or navigate to http://localhost:3000/upload
2. Select an image file using the file picker
3. Click the "Upload" button to submit your photo
4. After successful upload, you'll be redirected to the gallery where you can see your newly uploaded photo

## File Structure

```
photo-gallery/
├── app.js              # Main server file
├── package.json        # Project dependencies and scripts
├── public/             # Static files
│   └── uploads/        # Directory where uploaded photos are stored
└── views/              # EJS templates
    ├── index.ejs       # Gallery view template
    └── upload.ejs      # Upload form template
```

## Note

This is a simple implementation intended for learning purposes. For a production environment, consider adding:

- User authentication
- Image optimization
- Security enhancements
- Database storage for image metadata

## License

This project is open source and available under the [MIT License](LICENSE).

