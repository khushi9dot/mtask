import { Router } from "express";
import { registerUser ,loginUser,logoutUser,getProfile,getAllProfile,getAssignUserProfile,updateProfile,deleteProfile,
        changePassword } from "../controllers/users.controllers.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middlewares.js";

const router=Router()

router.route("/register").post(verifyJWT,registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/getProfile").get(verifyJWT,getProfile)
router.route("/getAllProfile").get(verifyJWT,isAdmin,getAllProfile)
router.route("/getAssignUserProfile").get(verifyJWT,getAssignUserProfile)
router.route("/updateProfile/:id").patch(verifyJWT,updateProfile)
router.route("/deleteProfile/:id").delete(verifyJWT,deleteProfile)
router.route("/changePassword").post(verifyJWT,changePassword)

export default router