import mongoose from "mongoose";

const taskSchema=mongoose.Schema({
    id:{
        type:Number,
        required:true,
        unique:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    status:{
        type:Boolean,
        required:true,
        default:false
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timeStamps:true})

export const Task=mongoose.model("Task",taskSchema)