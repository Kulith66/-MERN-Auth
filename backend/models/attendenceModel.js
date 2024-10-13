import mongoose from "mongoose";
const attendanceSchema = new mongoose.Schema({
  employeeNIC: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const Attendance = mongoose.model('Attendance',userSchema);

