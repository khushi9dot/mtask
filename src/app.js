import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler.middlewares.js";

const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true
}))

app.use(express.json({limit:"18kb"}))
app.use(express.urlencoded({limit:"18kb",extended:true}))
app.use(express.static("./public"))

app.use(cookieParser())

import userRouter from "./routes/users.routes.js";
app.use("/api/users",userRouter)

import taskRouter from "./routes/tasks.routes.js"
app.use("/api/tasks",taskRouter)

app.use(errorHandler)

export {app}