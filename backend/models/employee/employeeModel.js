import mongoose from "mongoose";

const employeeSchema =  new mongoose.Schema({
    
    
    employeeNIC:{
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    middleName:{
        type:String,
    },
    lastName:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    }
},{timestamps: true})
export const Employee = mongoose.model('Employee',employeeSchema);
