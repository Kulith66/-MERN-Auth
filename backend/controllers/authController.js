import { User } from "../models/userModel.js"
import bcryptjs from "bcryptjs"
import crypto from "crypto";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js"
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js"

export const signupController = async (req,res)=>{
    const{email,password,name}=req.body
    try {
        if(!email || !password || !name){
            throw new Error("all  fields are required")
        }
        const userAlredyExists = await User.findOne({email})
        if(userAlredyExists){
            return res.status(400).send({
                success: false,
                message: "user already exists"
            })
            }
            const hashedPassword = await bcryptjs.hash(password,10)
            const verificationToken = Math.floor(1000 + Math.random() * 9000).toString();
            const user = new User({
                email,
                password: hashedPassword,
                name ,
                verificationToken,
                verificationTokenExpireAt:Date.now()+24*60*60*1000

            })
            await user.save()

            //jwt
            generateTokenAndSetCookie(res,user._id)
            await sendVerificationEmail(user.email,verificationToken)
            res.status(200).send({
                success: true,
                message: "user registered successfully",
                user:{
                    ...user._doc,
                    password :undefined
                }
            })

    } catch (error) {
        res.status(400).send({
            success: false,
            message: error.message
        })
    }

}
export const loginController = async (req,res)=>{
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).send({
                success:false,
                message:"invalid credentials"
            })
        }
        const isPasswordValid = await bcryptjs.compare(password,user.password)
        if(!isPasswordValid){
            return res.status(400).send({
                success:false,
                message:"invalid credentials"
            })
        }
        generateTokenAndSetCookie(res,user._id)
        user.lastLogin = new Date()
        await user.save()
        res.status(200).send({
            success:false,
            message:"Login succesfully",
            user:{
                ...user._doc,
                password:undefined,
            },
        })
    }
    catch(error){
        console.error("error in login",error)
        res.status(400).send({
            success:false,
            message:error.message
        })
    }
}
export const logoutController = (req,res)=>{
    res.clearCookie("token");
    res.status(200).json({success:true,message:"Logged out succesfully"})
}
export const emailVerifyController = async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            message: "Verification code is required",
        });
    }

    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpireAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Verification token expired or invalid",
            });
        }

        // Update user status
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpireAt = undefined;

        await user.save();

        // Optionally handle email in the background using a job queue if it's a performance issue
        sendWelcomeEmail(user.email, user.name).catch((err) => console.error("Email sending failed", err));

        return res.status(200).json({
            success: true,
            message: "Verification successful, welcome email sent",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        console.error("Error in email verification", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during email verification",
        });
    }
};


export const forgotPasswordController = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    try {
        const user = await User.findOne({ email });

        // Send the same response regardless of whether the user exists for security reasons
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If a user with that email exists, a password reset link has been sent.",
            });
        }

        // Generate reset token and expiration
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpireAt = Date.now() + 1 * 60 * 60 * 1000; // 1-hour expiration

        // Update user with reset token and expiration
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpireAt = resetTokenExpireAt;
        await user.save();

        // Build the reset URL
        const resetUrl = `${process.env.CLIENT_URL}/forgot-password/${resetToken}`;

        // Send password reset email
        await sendPasswordResetEmail(user.email, resetUrl);

        return res.status(200).json({
            success: true,
            message: "If a user with that email exists, a password reset link has been sent.",
        });
    } catch (error) {
        console.error("Error in forgot password process:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while processing the request",
        });
    }
};

// Controller function
export const resetPasswordController = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Basic validation for password
        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false, 
                message: "Password is required and must be at least 6 characters long."
            });
        }

        // Find user with the reset token and check expiration
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpireAt: { $gt: Date.now() }, // Token must be valid and not expired
        });

        if (!user) {
            return res.status(400).json({
                success: false, 
                message: "Invalid token or token has expired."
            });
        }

        // Hash the new password and update the user
        const hashedPassword = await bcryptjs.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined; // Clear reset token
        user.resetPasswordExpireAt = undefined; // Clear expiration
        await user.save();

        // Send success email
        const emailResult = await sendResetSuccessEmail(user.email);
        if (!emailResult.success) {
            console.error("Failed to send reset success email:", emailResult.message);
        }

        // Return success response
        return res.status(200).json({ 
            success: true, 
            message: "Password has been reset successfully." 
        });

    } catch (error) {
        console.error("Error in reset password:", error);
        return res.status(500).json({
            success: false, 
            message: "An error occurred while resetting the password."
        });
    }
};

export const checkAuthController = async (req,res)=>{
    try {
        const user = await User.findById(req.userId).select("-password");
        if(!user){
            return res.status(400).json({success: false, message:"User not found"})
        }
        res.status(200).json({success: true, user});

    } catch (error) {
        console.log("error in checkAuthController",error);
        res.status(400).json({success: false, message:error.message});
    }
}
