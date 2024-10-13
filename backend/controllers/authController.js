import { User } from "../models/userModel.js"
import bcryptjs from "bcryptjs"
import crypto from "crypto";
import JWT from "jsonwebtoken"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js"
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js"
import { Employee } from "../models/employee/employeeModel.js";

export const AdminSignupController = async (req,res)=>{
    const{userNic,password}=req.body
    try {
        if(!userNic || !password){
            throw new Error("all  fields are required")
        }
        const userAlredyExists = await User.findOne({userNic})
        if(userAlredyExists){
            return res.status(400).send({
                success: false,
                message: "user already exists"
            })
            }
        
            const hashedPassword = await bcryptjs.hash(password,10)
            const verificationToken = Math.floor(1000 + Math.random() * 9000).toString();
            const user = new User({
                userNic,
                password: hashedPassword,
                verificationToken,
                verificationTokenExpireAt:Date.now()+24*60*60*1000

            })
            await user.save()

            //jwt
            const token = generateTokenAndSetCookie(res,user._id)
            res.status(200).send({
                success: true,
                message: "user registered successfully",
                user:{
                    ...user._doc,
                    password :undefined
                },token
            })

    } catch (error) {
        res.status(400).send({
            success: false,
            message: error.message
        })
    }

}
export const employeeSignupController = async (req, res) => {
    const { userNic, password } = req.body;

    try {
        // Ensure NIC and password are provided
        if (!userNic || !password) {
            throw new Error("All fields are required");
        }

        // Check if the user already exists
        const userAlreadyExists = await User.findOne({ userNic });
        if (userAlreadyExists) {
            return res.status(400).send({
                success: false,
                message: "User already exists",
            });
        }

        console.log(userNic);

        // Check if admin approval exists for this employee
        const isAdminApproved = await Employee.findOne({ employeeNIC: userNic });
        if (!isAdminApproved) {
            return res.status(401).send({
                success: false,
                message: "Admin approval is required",
            });
        }

        // Hash the password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Generate a verification token
        const verificationToken = Math.floor(1000 + Math.random() * 9000).toString();

        // Create new user (ensure all required fields are included)
        const user = new User({
            userNic, // Assuming userNic is part of User schema
            password: hashedPassword,
            verificationToken,
            verificationTokenExpireAt: Date.now() + 24 * 60 * 60 * 1000, // Token expiration time (24 hours)
        });

        // Save the user to the database
        await user.save();

        // Generate JWT token and set it as a cookie
        const token = generateTokenAndSetCookie(res, user._id);

        // Optionally, send the verification email (uncomment if needed)
        // await sendVerificationEmail(user.email, verificationToken);

        // Respond with success and omit the password from the response
        res.status(200).send({
            success: true,
            message: "User registered successfully",
            user: {
                ...user._doc,
                password: undefined, // Don't send the hashed password in the response
            },
            token,
        });

    } catch (error) {
        // Handle any errors
        res.status(400).send({
            success: false,
            message: error.message,
        });
    }
};


export const loginController = async (req,res)=>{
    try{
        const {userNic,password} = req.body;
        const user = await User.findOne({userNic});

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
        const token = JWT.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"})
        user.lastLogin = new Date()
        await user.save()
        res.status(200).send({
            success:false,
            message:"Login succesfully",
            user:{
                ...user._doc,
                password:undefined,
            },
            token
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
        sendWelcomeEmail(user.email).catch((err) => console.error("Email sending failed", err));

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
    const { userNic, email } = req.body;

    if (!userNic || !email) {
        return res.status(400).json({ success: false, message: "NIC and email are required" });
    }

    try {
        const user = await User.findOne({ userNic });

        // Send the same response regardless of whether the user exists for security reasons
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If a user with that email exists, a password reset link has been sent.",
            });
        }

        // Generate reset token and expiration
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpireAt = Date.now() + 3600000; // 1-hour expiration

        // Update user with reset token and expiration
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpireAt = resetTokenExpireAt;
        await user.save();
        console.log(email)
        // Build the reset URL
        const resetUrl = `${process.env.CLIENT_URL}/forgot-password/${resetToken}`;

        // Send password reset email
        await sendPasswordResetEmail(email, resetUrl);  // Ensure `user.email` is valid

        return res.status(200).json({
            success: true,
            message: "If a user with that email exists, a password reset link has been sent.",
        });
    } catch (error) {
        console.error("Error in forgot password process:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while processing the request.",
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

export const testController = (req,res)=>{
    console.log("protected routes")
    res.send("protected routes")
}
