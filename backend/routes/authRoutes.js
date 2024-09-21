import express, { Router } from 'express';
import { signupController,loginController,logoutController,emailVerifyController,forgotPasswordController, resetPasswordController,checkAuthController } from '../controllers/authController.js';
import { verify } from 'crypto';
import { verifyToken } from '../middlewares/verifyToken.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router = express.Router()

router.get("check-auth",verifyToken,checkAuthController)
router.post("/signup",signupController)
router.post("/login",loginController)
router.post("/logout",logoutController)

router.post("/email-verify",emailVerifyController)
router.post("/forgot-password",forgotPasswordController)
router.post("/reset-password/:token",resetPasswordController)
router.get("/admin-auth",verifyToken,isAdmin, (req,res)=>{
    res.status(200).send({ok:true});
})

export default router;