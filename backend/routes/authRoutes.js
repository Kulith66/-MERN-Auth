import express, { Router } from 'express';
import { loginController,logoutController,emailVerifyController,forgotPasswordController, resetPasswordController,checkAuthController, testController, AdminSignupController, employeeSignupController } from '../controllers/authController.js';
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
import { getLeaveController, leaveApplyController } from '../controllers/leaveController.js';
const router = express.Router()

router.get("check-auth",checkAuthController)
router.post("/signup-admin",AdminSignupController)
router.post("/signup-employee",employeeSignupController)

router.post("/login",loginController)
router.post("/logout",logoutController)

router.post("/email-verify",emailVerifyController)
router.post("/forgot-password",forgotPasswordController)
router.post("/reset-password/:token",resetPasswordController)

router.get("/test",requireSignIn,isAdmin, testController)
router.get("/admin-auth", (req,res)=>{
    res.status(200).send({ok:true});
})
router.post("/applyLeave",leaveApplyController);
router.get("/getAllLeaves/:employeeId",getLeaveController);
router.get("/filterLeaves/:employeeId",getLeaveController);



export default router;