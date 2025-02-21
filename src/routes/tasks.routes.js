import { Router } from "express";
import { addTask , getTask ,updateTask,deleteTask,getAllTasks} from "../controllers/tasks.controllers.js";
import { veriftJWT ,isAdmin} from "../middlewares/auth.middlewares.js";

const router=Router()

router.route("/addTask").post(veriftJWT,addTask)
router.route("/getTask").get(veriftJWT,getTask)
router.route("/updateTask/:id").patch(veriftJWT,updateTask)
router.route("/deleteTask/:id").delete(veriftJWT,deleteTask)
router.route("/getAllTasks").get(veriftJWT,isAdmin,getAllTasks)

export default router