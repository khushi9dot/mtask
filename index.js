import dotenv from "dotenv"
dotenv.config({path:"./.env"})

import { dbconnect } from "./src/db/dbconnect.js"
import { app } from "./src/app.js"

dbconnect()
.then(()=>{
    app.listen(process.env.PORT || 4000, ()=>{
        console.log(`server running at http://localhost:${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("connection failed!!",error);
})
