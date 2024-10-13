import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
    employeeId: {
        type:String,
        required: true,  // Corrected to 'employeeId' instead of 'employee'
    },
    startDate: {
        type: Date,
        required: true, 
    },
    endDate: {
        type: Date,
        required: true, 
    },
    leaveType: {
        type: String, 
        required: true,
    },
    leaveBalance: {
        type: Number,
        required: true,
    },
    leaveLength: {
        type: Number,
        required: true, 
    },
    leaveComment: {
        type: String, 
    },
    leaveName:{
        type:String,
    }
}, { timestamps: true }); // Corrected to timestamps with lowercase 't'

// Exporting the Leave model
const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;
