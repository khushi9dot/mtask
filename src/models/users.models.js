import mongoose from "mongoose";
import bcrypt from "bcrypt"
import Jwt from "jsonwebtoken"

const userSchema=mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    fullname:{
        type:String
    },
    email:{
        type:String,
        required:true
    },
    mno:{
        type:String
    },
    password:{
        type:String,
        required:true
    },
    refreshToken:{
        type:String
    },
    role:{
        type:String,
        enum:["user","admin","subadmin"],
        default:"user"
    },
    subadmin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:function(){return this.role === "user";}
    },
    passwordResetToken:{
        type:String
    },
    passwordResetExpiry:{
        type:Date
    }
},{timeStamps:true})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,10)
    next();
})

userSchema.methods.isCorrectPassword=async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
    return Jwt.sign({
        _id:this._id,
        username:this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }) 
}

userSchema.methods.generateRefreshToken=function(){
    return Jwt.sign({
        _id:this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }) 
}

export const User=mongoose.model("User",userSchema)