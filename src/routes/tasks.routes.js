import { Router } from "express";
import { addTask , getTask ,updateTask,deleteTask,getAllTasks,getAssignUserTask,assignTask} from "../controllers/tasks.controllers.js";
import { verifyJWT ,isAdmin, isSubadmin} from "../middlewares/auth.middlewares.js";

const router=Router()

router.route("/addTask").post(verifyJWT,addTask)
router.route("/getTask").get(verifyJWT,getTask)
router.route("/updateTask/:id").patch(verifyJWT,updateTask)
router.route("/deleteTask/:id").delete(verifyJWT,deleteTask)
router.route("/getAllTasks").get(verifyJWT,isAdmin,getAllTasks)
router.route("/getAssignUserTask").get(verifyJWT,isSubadmin,getAssignUserTask)
router.route("/assignTask").post(verifyJWT,assignTask)

export default router