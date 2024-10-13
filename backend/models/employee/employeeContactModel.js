import mongoose from "mongoose";

const employeeContactSchema =  new mongoose.Schema({
    employeeId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Employee', 
        required: true,
    },
    address:{
        type: String,
        required: true,
    },
    stateOrProvince:{
        type: String,
        required: true,
    },
    postalCode:{
        type: String,
        required: true,
    },
    country:{
        type: String,
        required: true,
    },
    homeNumber:{
        type: String,
        
    },
    mobileNumber:{
        type: String,
        required: true,
    },
    otherEmail:{
        type: String,
        required: true,
    },
    
    

},{timestamps: true})
export const EmployeeContact
= mongoose.model('EmployeeContact',employeeContactSchema);
