import express, { Router } from 'express';
import {
    createEmployeeController,
    allEmployeeslist,
    deleteEmployeeController,
    singleEmployeeAllDetails,
    updateNICController,
    updateProfilePhotoController,
    attendenceController,
    updateEmployeeDetailsController,
    fillContactDetailsController,
    fillPersonalDetailsController,
    updatePersonalDetailsController,
    updateContactDetailsController,
    getProfilePhotoController,
    fillJobDetailsController,
    updateJobDetailsController,
    getEmployeByNIC} from "../controllers/employeeController.js"
import { requireSignIn,isAdmin } from '../middlewares/authMiddleware.js';
import formidable from 'express-formidable';

const router = express.Router()
//create Employee
router.post("/createEmployee",requireSignIn,isAdmin,createEmployeeController)
//fill
router.post("/fillDetails-personal/:employeeId",fillPersonalDetailsController)
router.post("/fillDetails-contact/:employeeId",fillContactDetailsController)
router.post("/fillDetails-job/:employeeId",fillJobDetailsController)


//update
router.put("/updateDetails-employee/:employeeId",updateEmployeeDetailsController)
router.put("/updateDetails-personal/:employeeId",updatePersonalDetailsController)
router.put("/updateDetails-contact/:employeeId",updateContactDetailsController)
router.put("/updateDetails-job/:employeeId",updateJobDetailsController)


router.put("/nic", updateNICController); // Update NIC route

router.get("/allEmployeeList",allEmployeeslist)

router.get("/singleEmployeeDetails/:employeeID",singleEmployeeAllDetails)



router.delete("/deleteEmployee/:employeeNIC",deleteEmployeeController)

router.put("/updatePhoto/:employeeId",formidable(),updateProfilePhotoController)
router.get("/getPhoto/:employeeId",formidable(),getProfilePhotoController)
router.post("/attendence",attendenceController)

/////get employee by NIC
router.get("/getEmployeeByNIC/:employeeNIC",getEmployeByNIC)



export default router;