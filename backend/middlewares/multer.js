import multer from "multer";
import path from "path"

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, './backend/files'); // ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' +file.originalname ); // gives the file a unique name
  },
});

export const upload = multer({ storage: storage });
