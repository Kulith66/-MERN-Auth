import { EmergencyFile } from "../models/employee/emergencydetailsModel.js";

export const emergencyAttachment = async (req, res) => {
  const { nic } = req.params;

  
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Validate file type (example: only allow images and PDFs)
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).send('Invalid file type. Only images and PDFs are allowed.');
  }

  try {
    const { originalname, mimetype, path, size } = req.file; // Extract relevant properties

    // Save only the relevant file details to the database
    await EmergencyFile.create({
      employeeId: nic, // Use the NIC directly
      filePath: path,   // Store the file path
      originalName: originalname, // Store the original name if needed
      mimeType: mimetype, // Store the mime type if needed
      size: size, // Store the file size if needed
    });

    res.status(200).json({ success: true, message: 'File saved successfully' });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: 'An error occurred while saving the file.' });
  }
};
