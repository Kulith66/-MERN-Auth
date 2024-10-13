import mongoose from 'mongoose';

const employeePersonalSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Employee', 
        required: true,
    },
    employeeNIC: {
        type: String,
        required: true,
    },
    otherId: {
        type: String,
        required: true,
    },
    driverLicense: {
        type: String,
        required: true,
    },
    licenseExpiryDate: {
        type: Date,
        required: true,
    },
    nationality: {
        type: String,
        required: true,
    },
    maritalStatus: {
        type: String,
        required: true,
       
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    photo: {
        data: Buffer,
        contentType: String,
    },
}, { timestamps: true });

export const EmployeePersonal = mongoose.model('EmployeePersonal', employeePersonalSchema);
