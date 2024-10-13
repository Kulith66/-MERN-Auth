import { Employee } from "../models/employee/employeeModel.js";
import fs from "fs";
import { EmployeePersonal } from "../models/employee/employeePersonalModel.js";
import { EmployeeContact } from "../models/employee/employeeContactModel.js";
import { EmployeeJob } from "../models/employee/employeeJobModel.js";
import { sendWelcomeEmail } from "../mailtrap/emails.js";


export const createEmployeeController = async (req,res)=>{
    const {employeeNIC,firstName,lastName,middleName,email} = req.body;
    try {
        if(!employeeNIC || !firstName || !lastName ||!email) {
            return res.status(400).json({success: false, message: "All fields are required"})
        }
        const existingEmployee = await Employee.findOne({employeeNIC: employeeNIC})

        if(existingEmployee){
            return res.status(409).json({success: false, message: "Employee already exists"})
        }
        const employee = new Employee({employeeNIC: employeeNIC, firstName: firstName, lastName:lastName, middleName: middleName,email: email})
        res.status(200).json({
             success:true,
             message: "Employee created successfully",
             employee
            })
        await employee.save()
        sendWelcomeEmail(employee.email).catch((err) => console.error("Email sending failed", err));

    } catch (error) {
        console.error("Error in creating employee:", error);
        res.status(500).json({success: false, message: "An error occurred while creating the employee"})    
    }
}
//fill details -------------------------------------------------------------
export const fillPersonalDetailsController = async (req, res) => {
    const { employeeId } = req.params; // Extract employeeId from params

    // Destructure body params
    const {
        employeeNIC, // Make sure this is in the request body
        otherId,
        driverLicense,
        licenseExpiryDate,
        nationality,
        maritalStatus,
        dateOfBirth
    } = req.body;

    console.log(employeeId);

    try {
        // Validate required fields
        if (!employeeNIC || !otherId || !driverLicense || !licenseExpiryDate || !nationality || !maritalStatus || !dateOfBirth) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be filled."
            });
        }

        // Check if the employee exists
        const existingEmployee = await Employee.findById(employeeId); // Use employeeId directly
        if (!existingEmployee) {
            return res.status(404).json({ success: false, message: "Employee not registered" });
        }

        // Create a new instance of EmployeePersonal
        const employeePersonal = new EmployeePersonal({
            employeeId, // Reference to the Employee model
            employeeNIC,
            otherId,
            driverLicense,
            licenseExpiryDate,
            nationality,
            maritalStatus,
            dateOfBirth
        });

        // Save the EmployeePersonal document
        await employeePersonal.save();

        res.status(200).json({
            success: true,
            message: "Details updated successfully",
            employeePersonal,
        });

    } catch (error) {
        console.error("Error in filling details:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while filling details."
        });
    }
};

export const fillContactDetailsController = async (req, res) => {
    const {  employeeId } = req.params;

    // Destructure body params
    const {
        address,
        stateOrProvince,
        postalCode,
        country,
        homeNumber,
        mobileNumber,
        otherEmail
    } = req.body;

    try {
        // Validate required fields
        if (!address || !stateOrProvince || !postalCode || !country || !mobileNumber || !otherEmail) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be filled."
            });
        }

        // Check if the employee exists using employeeId
        const existingEmployee = await Employee.findById(employeeId);
        if (!existingEmployee) {
            return res.status(404).json({ success: false, message: "Employee not registered" });
        }

        // Create a new instance of EmployeeContact and link it with employeeId
        const employeeContact = new EmployeeContact({
            employeeId, // Link contact information to the employee
            address,
            stateOrProvince,
            postalCode,
            country,
            homeNumber,
            mobileNumber,
            otherEmail
        });

        // Save the EmployeeContact document
        await employeeContact.save();

        res.status(200).json({
            success: true,
            message: "Details updated successfully",
            employeeContact,
        });

    } catch (error) {
        console.error("Error in filling details:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while filling details."
        });
    }
};

   export const fillJobDetailsController = async (req, res) => {
    const {
               employeeId,
               } =  req.params
           // Destructure body params
           const {
               
            joinedDate,
            jobTitle,
            jobCategory,
            subUnit,
            employmentStatus,
            leaveBalance,
            
           } = req.body;
       try {
          
   
           // Validate required fields
           if ( !joinedDate || !jobTitle || !jobCategory ||
               !subUnit || !employmentStatus || !leaveBalance) {
               return res.status(400).json({
                   success: false,
                   message: "All required fields must be filled."
               });
           }
   
           // Check if the employee exists
           const existingEmployee = await Employee.findById( employeeId);
           if (!existingEmployee) {
               return res.status(404).json({ success: false, message: "Employee not registered" });
           }
   
          
   
          
   
   
           const employeeJob = new EmployeeJob({
            employeeId,
               joinedDate,
               jobTitle,
               jobCategory,
               subUnit,
               employmentStatus,
               leaveBalance,
           });
   
           // Save both documents
           await employeeJob.save();
   
           res.status(200).json({
               success: true,
               message: "Details updated successfully",
               employeeJob,
           });
   
       } catch (error) {
           console.error("Error in filling details:", error);
           res.status(500).json({
               success: false,
               message: "An error occurred while filling details"
           });
       }
   };



//update details ------------------------------------------------------

export const updateEmployeeDetailsController = async (req, res) => {
    const { employeeId } = req.params; // Extracting employeeId from request parameters
    console.log(employeeId);

    try {
        // Assuming req.body for form fields
        const { firstName, lastName, middleName, email } = req.body;

        // Check if the employee exists
        const existingEmployee = await Employee.findById(employeeId);
        if (!existingEmployee) {
            return res.status(404).send({ success: false, message: "Employee not found" });
        }

        // Build updates dynamically for employee details
        const employeeUpdates = {};

        if (firstName) employeeUpdates.firstName = firstName;
        if (lastName) employeeUpdates.lastName = lastName;
        if (middleName) employeeUpdates.middleName = middleName;
        if (email) employeeUpdates.email = email; // Corrected this line, was mistakenly setting middleName instead of email

        // Update Employee model
        let employeeBasics;

        if (Object.keys(employeeUpdates).length > 0) {
            employeeBasics = await Employee.findOneAndUpdate(
                { _id: employeeId }, // Use employeeId here
                employeeUpdates,
                { new: true } // Return the updated document
            );
        }

        if (!employeeBasics) {
            return res.status(400).send({ success: false, message: "Failed to update employee details" });
        }

        // Send the response with the updated details
        res.status(200).send({
            success: true,
            message: "Details updated successfully",
            employeeBasics,
        });

    } catch (error) {
        console.error("Error updating details:", error);
        res.status(500).json({ success: false, message: "An error occurred while updating details" });
    }
};


export const updatePersonalDetailsController = async (req, res) => {
    const { employeeId } = req.params;
    console.log(employeeId);

    try {
        // Assuming req.body for form fields
        const { 
            otherId,
            driverLicense,
            licenseExpiryDate,
            nationality,
            maritalStatus,
            dateOfBirth
        } = req.body;

        // Build updates dynamically for employee details
        const personalUpdates = {};

        if (otherId) personalUpdates.otherId = otherId;
        if (driverLicense) personalUpdates.driverLicense = driverLicense;
        if (licenseExpiryDate) personalUpdates.licenseExpiryDate = licenseExpiryDate;
        if (nationality) personalUpdates.nationality = nationality;
        if (maritalStatus) personalUpdates.maritalStatus = maritalStatus;
        if (dateOfBirth) personalUpdates.dateOfBirth = dateOfBirth;

        // Update EmployeePersonal model
        let employeePersonal;

        if (Object.keys(personalUpdates).length > 0) {
            employeePersonal = await EmployeePersonal.findOneAndUpdate(
                { employeeId }, 
                personalUpdates, 
                { new: true } // Return the updated document
            );
        }

        if (!employeePersonal) {
            return res.status(400).send({ success: false, message: "Failed to update employee personal details" });
        }

        // Send the response with the updated details
        res.status(200).send({
            success: true,
            message: "Details updated successfully",
            employeePersonal,
        });

    } catch (error) {
        console.error("Error updating details:", error);
        res.status(500).json({ success: false, message: "An error occurred while updating personal details" });
    }
};

export const updateContactDetailsController = async (req, res) => {
    const { employeeId } = req.params;
    console.log(employeeId);

    try {
        // Assuming req.body for form fields
        const { 
            address,
            stateOrProvince,
            postalCode,
            country,
            homeNumber,
            mobileNumber,
            otherEmail
        } = req.body;

        // Build updates dynamically for employee contact details
        const contactUpdates = {};

        if (stateOrProvince) contactUpdates.stateOrProvince = stateOrProvince;
        if (postalCode) contactUpdates.postalCode = postalCode;
        if (country) contactUpdates.country = country;
        if (homeNumber) contactUpdates.homeNumber = homeNumber;
        if (mobileNumber) contactUpdates.mobileNumber = mobileNumber;
        if (otherEmail) contactUpdates.otherEmail = otherEmail;
        if (address) contactUpdates.address = address;

        // Update EmployeeContact model
        let employeeContact;

        if (Object.keys(contactUpdates).length > 0) {
            employeeContact = await EmployeeContact.findOneAndUpdate(
                { employeeId }, 
                contactUpdates, 
                { new: true } // Return the updated document
            );
        }

        if (!employeeContact) {
            return res.status(400).send({ success: false, message: "Failed to update employee contact details" });
        }

        // Send the response with the updated details
        res.status(200).send({
            success: true,
            message: "Details updated successfully",
            employeeContact,
        });

    } catch (error) {
        console.error("Error updating details:", error);
        res.status(500).json({ success: false, message: "An error occurred while updating contact details" });
    }
};
export const updateJobDetailsController = async (req, res) => {
    const { employeeId } = req.params; // Extract employeeId from request parameters
    console.log(employeeId);

    try {
        // Assuming req.body for form fields
        const { 
            joinedDate,
            jobTitle,
            jobCategory,
            subUnit,
            employmentStatus,
            leaveBalance
        } = req.body;

        // Check if the employee exists
        const existingEmployee = await Employee.findById(employeeId);
        if (!existingEmployee) {
            return res.status(404).send({ success: false, message: "Employee not found" });
        }

        // Build updates dynamically for job details
        const jobUpdates = {};
        if (joinedDate) jobUpdates.joinedDate = joinedDate; // Use joinedDate
        if (jobTitle) jobUpdates.jobTitle = jobTitle;       // Use jobTitle
        if (jobCategory) jobUpdates.jobCategory = jobCategory; // Use jobCategory
        if (subUnit) jobUpdates.subUnit = subUnit;           // Use subUnit
        if (employmentStatus) jobUpdates.employmentStatus = employmentStatus; // Use employmentStatus
        if (leaveBalance) jobUpdates.leaveBalance = leaveBalance; // Use leaveAmount

        // Update EmployeeJob model
        let employeeJob;
        if (Object.keys(jobUpdates).length > 0) {
            employeeJob = await EmployeeJob.findOneAndUpdate(
                { employeeId }, 
                jobUpdates, 
                { new: true } // Return the updated document
            );
        }

        if (!employeeJob) {
            return res.status(400).send({ success: false, message: "Failed to update employee job details" });
        }

        // Send the response with the updated details
        res.status(200).send({
            success: true,
            message: "Job details updated successfully",
            employeeJob,
        });

    } catch (error) {
        console.error("Error updating details:", error);
        res.status(500).json({ success: false, message: "An error occurred while updating job details" });
    }
};




//get All Employee with employeeNIC,firstName,lastName,middleName
export const allEmployeeslist = async (req, res) => {
    try {
        const allEmployeeslist = await Employee.find({})
        res.status(200).send({ success: true, employees: allEmployeeslist,message: "Employees"});
    } catch (error) {
        console.error("Error getting all employees:", error);
        res.status(500).json({ success: false, message: "An error occurred while getting all employees" });
    }
} 

export const  getEmployeByNIC = async (req, res)=>{
    const {employeeNIC} = req.params
    try {
        const employee = await Employee.findOne({employeeNIC: employeeNIC})
        res.status(200).send({ success: true, employee: employee, message: "Employee"});
    } catch (error) {
        res.status(500).send({ error: error})
    }
}

//get single Employee  with personal and contact details
export const singleEmployeeAllDetails = async (req, res) => {
        const {employeeId} = req.params
    try {
        const employee = await Employee.findOne({id: employeeId})   ;
        const allEmployeePersonalDetails = await EmployeePersonal.findOne({employeeId: employeeId});
        const allEmployeeContactDetails = await EmployeeContact.findOne({employeeId: employeeId})
        const  allEmployeeJobdetails = await EmployeeJob.findOne({employeeId: employeeId})
        res.status(200).send({
             success: true, 
             employee: employee,
             contact :allEmployeeContactDetails,
             personal:allEmployeePersonalDetails,
             job: allEmployeeJobdetails,
             

             message: "Employee All details"
            });
    } catch (error) {
        console.error("Error getting all employees:", error);
        res.status(500).json({ success: false, message: "An error occurred while getting all employees" });
    }
} 
//update NIC number
export const updateNICController = async (req, res) => {
    const { oldNic, newNic } = req.body;

    try {
        // Check if the employee exists with the old NIC
        const existingEmployee = await Employee.findOne({ employeeNIC: oldNic });

        if (!existingEmployee) {
            return res.status(400).send({ success: false, message: "Employee not found" });
        }

        // Update employeeNIC in Employee model
        const updatedEmployee = await Employee.findOneAndUpdate(
            { employeeNIC: oldNic }, 
            { employeeNIC: newNic }, 
            { new: true } // Return the updated document
        );

        // Update employeeNIC in EmployeePersonal model
        const updatedEmployeePersonalDetails = await EmployeePersonal.findOneAndUpdate(
            { employeeNIC: oldNic }, 
            { employeeNIC: newNic }, 
            { new: true }
        );

        // Update employeeNIC in EmployeeContact model
        const updatedEmployeeContactDetails = await EmployeeContact.findOneAndUpdate(
            { employeeNIC: oldNic }, 
            { employeeNIC: newNic }, 
            { new: true }
        );

        // If all updates were successful, return a success response
        res.status(200).send({
            success: true,
            message: "NIC updated successfully",
            updatedEmployee,
            updatedEmployeePersonalDetails,
            updatedEmployeeContactDetails
        });

    } catch (error) {
        console.error("Error updating NIC:", error);
        res.status(500).json({ success: false, message: "An error occurred while updating NIC number" });
    }
};

    

//delete employee
export const deleteEmployeeController = async (req, res) => {
    const { eId } = req.params; // Get the employee ID from the request parameters
    try {
        // Find the employee using their ID
        const employee = await Employee.findOneAndDelete({id: eId});
        if (!employee) {
            return res.status(404).send({ success: false, message: "Employee not found" }); // Return 404 if not found
        }

        // Log the employee's NIC for debugging
        console.log("Employee NIC:", employee.employeeNIC);

        // Find and delete employee contact and personal details
        const contactDeleted = await EmployeeContact.findOneAndDelete({ employeeNIC: employee.employeeNIC });
        const personalDeleted = await EmployeePersonal.findOneAndDelete({ employeeNIC: employee.employeeNIC });
        const jobDeleted = await EmployeeJob.findOneAndDelete({ employeeNI:employee.employee.employeeNIC });
        console.log(contactDeleted)
        // Check if contact and personal details were found and deleted
        if (contactDeleted) {
            console.log("Deleted contact details for NIC:", employee.employeeNIC);
        } else {
            console.log("No contact details found for NIC:", employee.employeeNIC);
        }

        if (personalDeleted) {
            console.log("Deleted personal details for NIC:", employee.employeeNIC);
        } else {
            console.log("No personal details found for NIC:", employee.employeeNIC);
        }
        if (jobDeleted) {
            console.log("Deleted job details for NIC:", employee.employeeNIC);
        } else {
            console.log("No job details found for NIC:", employee.employeeNIC);
        }

        // Now delete the employee

        // Send success response
        res.status(200).send({ success: true, message: "Employee details deleted successfully" });
    } catch (error) {
        console.error("Error deleting employee:", error);
        res.status(500).json({ success: false, message: "An error occurred while deleting the employee" });
    }
};



export const updateProfilePhotoController = async (req, res) => {
    const { employeeId } = req.params;

    // Check if the files object exists before destructuring
    if (!req.files || !req.files.photo) {
        return res.status(400).send({ success: false, message: 'No file uploaded' });
    }

    const { photo } = req.files; // Now it's safe to destructure photo

    try {
        // Find the employee by their ID
        const employee = await EmployeePersonal.findOne({ id: employeeId });
        if (!employee) {
            return res.status(404).send({ success: false, message: 'Employee not found' });
        }

        // Update the employee's photo if it exists
        if (photo) {
            employee.photo  .data = fs.readFileSync(photo.path);
            employee.photo.contentType = photo.type; // Use mimetype instead of type
        }

        const updatedEmployee = await employee.save(); // Ensure you await the save operation

        res.status(200).send({
            success: true,
            message: 'Profile photo updated successfully',
            employee: updatedEmployee,
        });
    } catch (error) {
        console.error("Error updating profile photo:", error);
        res.status(500).json({ success: false, message: "An error occurred while updating the profile photo" });
    }
};



export const getProfilePhotoController = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const employee = await EmployeePersonal.findOne({ id: employeeId });

        if (!employee) {
            return res.status(404).send({ success: false, message: 'Employee not found' });
        }

        // Assuming employee.profilePhoto contains the URL or path to the profile photo
        return res.status(200).send({ success: true, profilePhoto: employee.photo });
        
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).send({ success: false, message: 'Server error' });
    }
};


export const attendenceController =async (req,res)=>{
    const { latitude, longitude, isInWorkplace,employeeNIC } = req.body;

    try {
      if (isInWorkplace) {
        const attendance = new Attendance({
          employeeNIC, // Replace with the actual employee ID from the session
          latitude,
          longitude,
          status: 'present',
          timestamp: new Date(),
        });
  
        await attendance.save();
        res.status(200).json({ message: 'Attendance marked successfully' });
      } else {
        res.status(400).json({ message: 'You are not in the workplace' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error marking attendance', error });
    }
  }
export const test = ()=>{
    console.log("test")
}
