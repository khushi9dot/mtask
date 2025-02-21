import { Router } from "express";
import { registerUser ,loginUser,logoutUser} from "../controllers/users.controllers.js";
import { veriftJWT } from "../middlewares/auth.middlewares.js";

const router=Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(veriftJWT,logoutUser)

export default router