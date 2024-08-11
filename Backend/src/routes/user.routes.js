import {Router} from "express"
import { register,loginUser } from "../controllers/user.controller.js"
import {upload} from "../middleware/multer.middleware.js"
import verifyJWT from "../middleware/isAuthenticated.middleware.js";

const userRoutes=Router();

userRoutes.route('/register').post(
    upload.single(
        profilePicture
    ),
    register
)

userRoutes.route('/login').post(verifyJWT,loginUser);

export default userRoutes; 