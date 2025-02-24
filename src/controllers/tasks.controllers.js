import { Task } from "../models/tasks.models.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { apiError } from "../utils/apiError.utils.js";
import { apiResponse } from "../utils/apiResponse.utils.js";
import { User } from "../models/users.models.js";
import mongoose from "mongoose";
import { isSubadmin } from "../middlewares/auth.middlewares.js";

const addTask=asyncHandler(async(req ,res,next)=>{
    const {title,description,status}=req.body
    
    if(!title){
        return next(apiError.badRequest(400,"title is required"))
    }
    else if(!status){
        return next(apiError.badRequest(400,"status is required"))
    }

    const task=await Task.create({
        title,
        description,
        status,
        user:req.user._id
    })

    const createdtask=await Task.findById(task._id)

    if(!createdtask){
        return next(apiError.badRequest(400,"something went wrong while add task"))
    }

    res.status(200)
    .json(new apiResponse(200,createdtask,"add task successfully..."))
})

const getTask=asyncHandler(async(req,res,next)=>{
    const task=await Task.aggregate([
        {
            $match:{user:req.user._id}
        },
        {$lookup:{
            from:"users",
            localField:"user",
            foreignField:"_id",
            as:"userDetails",
            pipeline:[
                {$project:{
                    refreshToken:0,
                    password:0
                }}
            ]
        }}
    ])
    
    if(!task){
        return next(apiError.notFound(404,"Task not found"))
    }
    res.status(200)
    .json(new apiResponse(200,task,"Task fetch successfully..."))
})

const updateTaskHelper=async(id,title,description,status,req,res,next)=>{
    const updatedtask=await Task.findByIdAndUpdate(
        id,
        {
            $set:{
                title:title,
                description:description,
                status:status
            }
        },
        {
            new:true
        }
    )

    if(!updatedtask){
        return next(apiError.badRequest(400,"task not updated!!"))
    }

    res.status(200)
    .json(new apiResponse(200,updatedtask,"task updated successfully..."))

}

const updateTask=asyncHandler(async(req,res,next)=>{
    const {id}=req.params;
    const {title,description,status}=req.body

    const task=await Task.findById(id);
    if(!task){
        return next(apiError.notFound(404,"id not found!!"))
    }

    if(req.user.role === "admin"){
        return updateTaskHelper(id,title,description,status,req,res,next);
    }

    if(req.user.role==="user" && task.user.toString() === req.user._id.toString())
    {
        return updateTaskHelper(id,title,description,status,req,res,next);
    }

    if(req.user.role === "subadmin"){
        const assignuser=await User.findOne({_id:task.user,subadmin:req.user._id})

        if(!assignuser){
            return next(apiError.unAuthorized(401,"Access denied!! you can update only ypur assign users."))
        }

        return updateTaskHelper(id,title,description,status,req,res,next);       
    }
    return next(apiError.unAuthorized(401,"Access denied!!"))
    
})

const deleteTaskHelper=async(id,req,res,next)=>{
    const deletedtask=await Task.findByIdAndDelete(id)

    if(!deletedtask){
        return next(apiError.badRequest(400,"Task not deleted!!"))
    }

    res.status(200)
    .json(new apiResponse(200,{},"Task deleted successfully"))
}

const deleteTask=asyncHandler(async(req,res,next)=>{
    const {id}=req.params;

    const task=await Task.findById(id)
    if(!task){
        return next(apiError.notFound(404,"id not found!!"))
    }

    if(req.user.role === "admin"){
        return deleteTaskHelper(id,req,res,next);
    }

    if(req.user.role === "user" && task.user.toString() === req.user._id.toString()){
        return deleteTaskHelper(id,req,res,next);

    }

    if(req.user.role === "subadmin"){
        const assignuser=await User.findOne({_id:task.user,subadmin:req.user._id})

        if(!assignuser){
            return next(apiError.unAuthorized(401,"you can delete Task only your assigned users!!"))
        }

        return deleteTaskHelper(id,req,res,next);
    }

    return next(apiError.unAuthorized(401,"Access denied!!"))

})

const getAllTasks=asyncHandler(async(req,res,next)=>{
    //const alltask=await Task.find()
    const alltask = await Task.aggregate([
        {$lookup:{
            from:"users",
            localField:"user",
            foreignField:"_id",
            as:"userDetails",
        }}
    ])

    if(!alltask){
        return next(apiError.badRequest("Tasks are not fetched!!"))
    }

    res.status(200)
    .json(new apiResponse(200,alltask,"All Tasks are fetched successfully"))
})

const assignTask=asyncHandler(async(req,res,next)=>{
    if(req.user.role !== "subadmin"){
        return next(apiError.unAuthorized(401,"only subadmin can assign the task!!"))
    }

    const{userid,title,description,status}=req.body;
    const user=await User.findById(userid);

    if(!user || user.subadmin.toString() !== req.user._id.toString()){
        return next(apiError.unAuthorized(401,"you can assign task only your assign users!!"))
    }

    const task=await Task.create({
        title:title,
        description:description,
        status:status,
        user:userid
    })

    if(!task){
        return next(apiError.badRequest(400,"Task not Assigned!!"))
    }

    res.status(200)
    .json(new apiResponse(200,task,"Task Assigned successfully..."))
})

const getAssignUserTask=asyncHandler(async(req,res,next)=>{
    if(req.user.role !== "subadmin"){
        return next(apiError.unAuthorized(401,"only subadmins are allowed"))
    }

    //console.log(req.user._id);
    const allusers=await Task.aggregate([
        {
            $lookup:{
                from:"users",
                localField:"user",
                foreignField:"_id",
                as:"userDetails"
            }
        },
        {
            $match:{"userDetails.subadmin":req.user._id}
        }
    ])

    if(!allusers){
        return next(apiError.notFound(404,"Tasks not fetched!!"))
    }

    res.status(200)
    .json(new apiResponse(200,allusers,"data fetch successfully..."))

})

export {addTask,getTask,updateTask,deleteTask,getAllTasks,getAssignUserTask,assignTask}