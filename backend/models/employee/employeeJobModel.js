import mongoose from "mongoose";

const employeeJobSchema =  new mongoose.Schema({
    employeeId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Employee', 
        required: true,
    },
    joinedDate:{
        type: Date,
        required: true,
    },
    jobTitle:{
        type: String,
        required: true,
    },
    jobCategory:{
        type: String,
        required: true,
    },
    subUnit
    :{
        type: String,
        required: true,
    },
    employmentStatus
    :{
        type: String,
        
    },
    leaveBalance:{
        type: Number,
        required: true,
    },
    
    
    

},{timestamps: true})
export const EmployeeJob
= mongoose.model('EmployeeJob',employeeJobSchema);
