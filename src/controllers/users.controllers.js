import { User } from "../models/users.models.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { apiError } from "../utils/apiError.utils.js";
import { apiResponse } from "../utils/apiResponse.utils.js";
import { report } from "process";

const generateAccessAndRefreshToken=async(userid)=>{
    const user=await User.findById(userid)
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()

    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave:false})

    return{accessToken,refreshToken}
}

const registerUser=asyncHandler(async(req ,res,next)=>{
    const {username,fullname,email,mno,password}=req.body;

    if(!username){
        return next(apiError.badRequest(400,"username is requird"))
    }
    else if(!fullname){
        return next(apiError.badRequest(400,"fullname is requird"))
    }
    else if(!email){
        return next(apiError.badRequest(400,"email is requird"))
    }
    else if(!mno){
        return next(apiError.badRequest(400,"mobile no is requird"))
    }
    else if(!password){
        return next(apiError.badRequest(400,"password is requird"))
    }

    const existeduser=await User.findOne({username})

    if(existeduser){
        return next(apiError.badRequest(400,"this user is already exists"))
    }

    const user=await User.create({
        username,
        fullname,
        email,
        mno,
        password,
        role:"user"
    })

    const createduser=await User.findById(user._id).select("-password")

    if(!createduser){
        return next(apiError.badRequest(400,"something went wrong while registering!!"))
    }

    res.status(200)
    .json(new apiResponse(200,createduser,"register success..."))
}) 

const loginUser=asyncHandler(async(req,res,next)=>{
    const {username,password}=req.body

    if(!username){
        return next(apiError.badRequest(400,"username is required"))
    }
    else if(!password){
        return next(apiError.badRequest(400,"password is required"))
    }

    const user=await User.findOne({username})

    if(!user){
        return next(apiError.notFound(404,"username not found"))
    }

    const isPasswordValid=await user.isCorrectPassword(password)

    if(!isPasswordValid){
        return next(apiError.unAuthorized(401,"wrong password!!"))
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)

    const loggedinUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }

    res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new apiResponse(200,loggedinUser,"login success.."))
})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                accessToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new apiResponse(200,{},"logout success.."))
})

export {registerUser,loginUser,logoutUser}