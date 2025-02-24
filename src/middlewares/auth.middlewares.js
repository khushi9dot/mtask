import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { apiError } from "../utils/apiError.utils.js";
import { User } from "../models/users.models.js";
import jwt from "jsonwebtoken"

const verifyJWT=asyncHandler(async(req ,res ,next)=>{
    try {
        const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            return next(apiError.unAuthorized(401,"unauthorized access"))
        }
    
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user=await User.findById(decodedToken?._id).select("-password")
    
        req.user=user;
        next();
    } catch (error) {
        return next(apiError.unAuthorized(401,"invalid access token"))
    }
})

const isAdmin=(req,res,next)=>{
    if(req.user.role !== "admin"){
        return next(apiError.unAuthorized(401,"access denied! only admin allowed.!!"))
    }
    next();
}

const isSubadmin=(req,res,next)=>{
    if(req.user.role !== "subadmin"){
        return next(apiError.unAuthorized(401,"access denied! only subadmins are allowed.!!"))
    }
    next();
}

const isUserOrAdmin=(req,res,next)=>{
    if(req.user.role === "admin"){
        return next();
    }

    if(req.user._id.toString() !== req.params._id){
        return next(apiError.unAuthorized(401,"access denied! you can only access your own data.!!"))
    }
    next();
}

export{verifyJWT,isAdmin,isSubadmin,isUserOrAdmin}