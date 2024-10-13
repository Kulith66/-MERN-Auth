import multer from 'multer';
import path from 'path';

// Configure storage settings for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory where uploaded files will be stored
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
});
// Create an upload instance with the storage configuration
const upload = multer({ storage });

// Export the upload instance for use in your routes
export default upload;
