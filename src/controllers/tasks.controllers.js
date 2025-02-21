import { Task } from "../models/tasks.models.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { apiError } from "../utils/apiError.utils.js";
import { apiResponse } from "../utils/apiResponse.utils.js";
import { User } from "../models/users.models.js";

const addTask=asyncHandler(async(req ,res,next)=>{
    const {id,title,description,status}=req.body

    if(!id){
        return next(apiError.badRequest(400,"id is required"))
    }
    else if(!title){
        return next(apiError.badRequest(400,"title is required"))
    }
    else if(!status){
        return next(apiError.badRequest(400,"status is required"))
    }

    const task=await Task.create({
        id,
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

const updateTask=asyncHandler(async(req,res,next)=>{
    const {id}=req.params;
    const {title,description,status}=req.body

    const task=await Task.findOne({id})
    if(!task){
        return next(apiError.notFound(404,"id not found!!"))
    }

    if(req.user.role !== "admin" && task.user.toString() !== req.user._id.toString()){
        return next(apiError.unAuthorized(401,"you are not allowed to update this task"))
    }

    const updatedtask=await Task.findOneAndUpdate(
        {id},
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

})

const deleteTask=asyncHandler(async(req,res,next)=>{
    const {id}=req.params;

    const task=await Task.findOne({id})
    if(!task){
        return next(apiError.notFound(404,"id not found!!"))
    }

    if(req.user.role !== "admin" && task.user.toString() !== req.user._id.toString()){
        return next(apiError.unAuthorized(401,"you are not allowed to delete Task!!"))
    }

    const deletedtask=await Task.findOneAndDelete({id})

    if(!deletedtask){
        return next(apiError.badRequest(400,"Task is not deleted!!"))
    }

    res.status(200)
    .json(new apiResponse(200,{},"Task deleted successfully..."))
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

export {addTask,getTask,updateTask,deleteTask,getAllTasks}