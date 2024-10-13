import mongoose from 'mongoose';

const emergencyFileSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  filePath: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
});

export const EmergencyFile = mongoose.model('EmergencyFile', emergencyFileSchema);
