import { EmployeeJob } from "../models/employee/employeeJobModel.js";
import { Employee } from "../models/employee/employeeModel.js";
import Leave from "../models/leaveModel.js";

export const leaveApplyController = async (req, res) => {
  // Extract leave details from request body
  const { employeeNIC, startDate, endDate, leaveType, leaveComment, leaveName } = req.body;
    
  try {
    // Find employee by employeeNIC
    const employee = await Employee.findOne({ employeeNIC });
    const EmployeeId = employee._id
    if(  leaveFilter(startDate, endDate,EmployeeId)!==0){
      return  res.status(201).json({ message: "Alredy get leaves between this days" });

    }
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    
    // Fetch the user's leave balance and job details using employeeId
    const user = await EmployeeJob.findOne({ employeeId: employee._id });

    // Check if the user's job details exist
    if (!user) {
      return res.status(404).json({ message: "Employee job details not found." });
    }

    const leaveBalance = user.leaveBalance;

    // Check for missing required fields
    if (!startDate || !endDate || !leaveType || !leaveComment || !leaveName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Initialize leaveLength and calculate leave length
    let leaveLength;
    let newLeaveBalance = leaveBalance;

    // Determine leave length based on leaveName
    if (leaveName === "miniDay") {
      leaveLength = 0.25;
    } else if (leaveName === "halfDay") {
      leaveLength = 0.5;
    } else if (leaveName === "fullDay") {
      leaveLength = 1.0;
    } else {
      leaveLength = calculateNumberOfDays(startDate, endDate); // Custom leave length calculation
    }

    // Check if leave balance is sufficient
    if (newLeaveBalance < leaveLength) {
      return res.status(400).json({ message: "Insufficient leave balance." });
    }

    // Update the leave balance
    newLeaveBalance -= leaveLength;
    await EmployeeJob.findOneAndUpdate(
      { employeeId: employee._id }, // Correct query to update by employeeId
      { leaveBalance: newLeaveBalance }
    );

    // Create a new leave record
    const newLeave = new Leave({
      startDate,
      endDate,
      leaveType,
      leaveComment,
      leaveName,
      leaveBalance: newLeaveBalance,
      leaveLength,
      employeeId: employee._id // Use employeeId here
    });

    // Save the leave record
    await newLeave.save();

    return res.status(200).json({ message: "Leave applied successfully.", newLeave });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error, please try again later." });
  }
};

// Helper function to calculate number of days between two dates
const calculateNumberOfDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const differenceInTime = end - start;
  return differenceInTime / (1000 * 3600 * 24);
};


export const getLeaveController = async (req, res) => {
  const { employeeId } = req.params; // leave model id

  try {
      const leaves = await Leave.find({ employeeId: employeeId });
      
      if (!leaves || leaves.length === 0) {
          return res.status(404).json({ success: false, message: "Leaves not found" });
      }

      return res.status(200).json({
          success: true,
          message: "All leaves found",
          leaves
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error, please try again later." });
  }
};


export const leaveFilterController = async (req, res) => {
  const { startDate, endDate } = req.body;
  const { employeeId } = req.params;

  try {
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Both start and end dates are required." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ message: "End date cannot be earlier than start date." });
    }

    const leaves = await Leave.find({
      employee: employeeId ,
      startDate: { $gte: start },
      endDate: { $lte: end },
      
    });


    if (leaves.length === 0) {
      return res.status(404).json({ message: "No leave records found for the given date range." });
    }

    return res.status(200).json({ message: "Leave records found.", leaves });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error, please try again later." });
  }
};

const leaveFilter = (startDate,endDate,employeeId) => {

  
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Both start and end dates are required." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ message: "End date cannot be earlier than start date." });
    }

    const leaves =  Leave.find({
      employee: employeeId ,
      startDate: { $gte: start },
      endDate: { $lte: end },
      
    });


    

    return leaves.length
  
};

