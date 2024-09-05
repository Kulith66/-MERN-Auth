import express, { Router } from 'express';
import { signupController,loginController,logoutController } from '../controllers/authController.js';

const router = express.Router()

router.post("/signup",signupController)
router.get("/login",loginController)
router.get("/logout",logoutController)


export default router;