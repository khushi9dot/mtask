import { User } from "../models/users.models.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { apiError } from "../utils/apiError.utils.js";
import { apiResponse } from "../utils/apiResponse.utils.js";

const generateAccessAndRefreshToken=async(userid)=>{
    const user=await User.findById(userid)
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()

    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave:false})

    return{accessToken,refreshToken}
}

const registerUser=asyncHandler(async(req ,res,next)=>{
    const {username,email,password,role}=req.body;

    if(!username){
        return next(apiError.badRequest(400,"username is requird"))
    }
    else if(!password){
        return next(apiError.badRequest(400,"password is requird"))
    }

    let subadmin=null;
    if(role === "subadmin" ){
        if(req.user.role !== "admin"){
            return next(apiError.unAuthorized(401,"only admin can create subadmin!!"))
        }
    }
    // console.log(req.user.role);

    //user must be assigned to subadmin.
     else if(role === "user"){
        if(req.user.role !== "subadmin"){
            return next(apiError.unAuthorized(401,"only subadmin can create user!!"))
        }
        subadmin=req.user._id;
    }
    else{
        return next(apiError.unAuthorized(401,"invalid role!only user and subadmin are allowed!!"))
    }

    const existeduser=await User.findOne({username})

    if(existeduser){
        return next(apiError.badRequest(400,"this user is already exists"))
    }

    const user=await User.create({
        username,
        email,
        password,
        role,
        subadmin
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

const getProfile=asyncHandler(async(req,res,next)=>{
    const users=await User.findById(req.user._id)

    if(!users){
        return next(apiError.badRequest(400,"user not fetched!!"))
    }

    res.status(200)
    .json(new apiResponse(200,users,"user fetched successfully..."))
})

const getAllProfile=asyncHandler(async(req,res,next)=>{
    const users=await User.find()
    if(!users){
        return next(apiError.badRequest(400,"profile not fetched!!"))
    }

    res.status(200)
    .json(new apiResponse(200,users,"Profile fetched successfully..."))
})

const getAssignUserProfile=asyncHandler(async(req,res,next)=>{
    if(req.user.role !== "subadmin"){
        return next(apiError.unAuthorized(401,"only subadmins are allowed!! "))
    }

    const users=await User.find({subadmin:req.user._id})

    res.status(200)
    .json(new apiResponse(200,users,"user fetched successfully..."))
})

const updateProfileHelper=async(id,username,fullname,email,mno,req,res,next)=>{
    const updateprofile=await User.findByIdAndUpdate(
        id,
        {$set:{
            username:username,
            fullname:fullname,
            email:email,
            mno:mno
        }},
        {
            new:true
        }
    )

    if(!updateprofile){
        return next(apiError.badRequest(400,"profile not updated!!"))
    }

    res.status(200)
    .json(new apiResponse(200,updateprofile,"Profile Updated successfully..."))
}

const updateProfile=asyncHandler(async(req,res,next)=>{
    const {id} =req.params;
    const {username,fullname,email,mno}=req.body

    const user=await User.findById(id);
    if(!user){
        return next(apiError.notFound(404,"id not found!!"))
    }

    if(req.user.role === "admin"){
        return updateProfileHelper(id,username,fullname,email,mno,req,res,next);
    }

    if(req.user.role === "user" && req.user._id.toString() === id )
    {
        return updateProfileHelper(id,username,fullname,email,mno,req,res,next);
    }

    if(req.user.role === "subadmin"){
        const assignuser=await User.findOne({_id:id,subadmin:req.user._id})

        if(!assignuser){
            return next(apiError.unAuthorized(401,"you update profile only your assign users!!"))
        }

        return updateProfileHelper(id,username,fullname,email,mno,req,res,next);
    }

    return next(apiError.unAuthorized(401,"Access denied!!"))
})

const deleteProfileHelper=async(id,req,res,next)=>{
    const deleteprofile=await User.findByIdAndDelete(id);

    if(!deleteprofile){
        return next(apiError.badRequest(400,"Profile not deleted!!"))
    }

    res.status(200)
    .json(new apiResponse(200,{},"profile deleted successfully..."))

}

const deleteProfile=asyncHandler(async(req,res,next)=>{
    const {id}=req.params;
    const user=await User.findById(id);
    if(!user){
        return next(apiError.notFound(404,"id not found!!"))
    }

    if(req.user.role === "admin"){
        return deleteProfileHelper(id,req,res,next);
    }

    if(req.user.role === "user" && req.user._id.toString() === id){
        return deleteProfileHelper(id,req,res,next);
    }

    if(req.user.role === "subadmin"){
        const assignuser=await User.findOne({_id:id,subadmin:req.user._id})
        if(!assignuser){
            return next(apiError.unAuthorized(401,"you delete only your assigned users!!"))
        }

        return deleteProfileHelper(id,req,res,next);
    }

    return next(apiError.unAuthorized(401,"Access Denied!!"))

})

const changePassword=asyncHandler(async(req,res,next)=>{
    const {oldpassword,newpassword}=req.body;

    const user=await User.findById(req.user._id)
    if(!user){
        return next(apiError.notFound(404,"User not Found!!"))
    }

    const verifypwd=await user.isCorrectPassword(oldpassword)

    if(!verifypwd){
        return next(apiError.notFound(404,"user not found!!"))
    }

    user.password=newpassword;
    user.save({vallidateBeforeSave:false})

    res.status(200)
    .json(new apiResponse(200,{},"change password successfully..."))
})

export {registerUser,loginUser,logoutUser,getProfile,getAllProfile,getAssignUserProfile,updateProfile,deleteProfile,changePassword}