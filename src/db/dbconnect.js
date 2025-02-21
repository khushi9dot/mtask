import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const dbconnect=async()=>{
    try {
        const dbconnectInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("mongodb connection success...",dbconnectInstance.connection.host)
    } catch (error) {
        console.log("mongodb connection failed..!!",error);
        process.exit(1)
    }
}

export {dbconnect}