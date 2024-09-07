import { User } from "../models/userModel.js"
import bcryptjs from "bcryptjs"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js"
import { sendVerificationEmail } from "../mailtrap/emails.js"

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
export const loginController = ()=>{
    
}
export const logoutController = ()=>{
    
}