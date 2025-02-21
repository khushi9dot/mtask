import { Router } from "express";
import { addTask , getTask ,updateTask,deleteTask,getAllTasks} from "../controllers/tasks.controllers.js";
import { veriftJWT } from "../middlewares/auth.middlewares.js";

const router=Router()

router.route("/addTask").post(veriftJWT,addTask)
router.route("/getTask/:id").get(veriftJWT,getTask)
router.route("/updateTask/:id").patch(veriftJWT,updateTask)
router.route("/deleteTask/:id").delete(veriftJWT,deleteTask)
router.route("/getAllTasks").get(veriftJWT,getAllTasks)

export default router