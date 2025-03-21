import express from "express"
import {getUserProfile, logout, register, updatedProfile} from "../controllers/user.controller.js"
import {login} from "../controllers/user.controller.js"
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";


const router =express.Router();


// routes
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/profile').get(isAuthenticated,getUserProfile);
router.route('/profile/update').put(isAuthenticated,upload.single("profilePhoto"),updatedProfile);





export default router;