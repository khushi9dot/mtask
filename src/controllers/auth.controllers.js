import crypto from "crypto"
import { User } from "../models/users.models.js"
import { sendEmail } from "../middlewares/sendEmail.middlewares.js"
import { asyncHandler } from "../utils/asyncHandler.utils.js"
import { apiError } from "../utils/apiError.utils.js"
import { apiResponse } from "../utils/apiResponse.utils.js"

const forgotPassword=asyncHandler(async(req , res , next)=>{
    const {email}=req.body;

    //find eamil
    const user=await User.findOne({email})
    if(!user){
        return next(apiError.notFound(404,"User not found!!"))
    }

    //generate random reset token
    const resetToken=crypto.randomBytes(32).toString("hex");
    const hashedToken=crypto.createHash("sha256").update(resetToken).digest("hex");
 
    //store hashedToken in db with expiry
    user.passwordResetToken=hashedToken;
    user.passwordResetExpiry=Date.now() + 15*60*1000;
    await user.save()

    //create resetURL
    const resetURL= `http://localhost:4000/api/users/resetPassword?token=${resetToken}&email=${email}`

    //send email with reset link
    const message=`Click the link to reset your password: ${resetURL}`
    await sendEmail(user.email,"resetPassword",message);

    res.status(200)
    .json(new apiResponse(200,{},"Reset link sent to email..."))

})

const resetPassword=asyncHandler(async(req,res,next)=>{
    const {token,email,newpassword}=req.body;

    //hash recieved token
    const hashedToken=crypto.createHash("sha256").update(token).digest("hex");

    //find user or expires token
    const user=await User.findOne({
        email,
        passwordResetToken:hashedToken,
        passwordResetExpiry:{$gte:Date.now()}
    })

    if(!user){
        return next(apiError.notFound(404,"invalid or token expires!!"))
    }

    //update password and remove resetToken
    user.password = newpassword;
    user.passwordResetToken=undefined;
    user.passwordResetExpiry=undefined;
    await user.save();

    res.status(200)
    .json(new apiResponse(200,{},"password reset successfully..."))


})

export {forgotPassword,resetPassword}