import {Router} from "express"
import { register,loginUser,logoutUser,updateProfile,refreshAccessToken,getUserDetails } from "../controllers/user.controller.js"
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

userRoutes.route('/logout').post(verifyJWT,logoutUser);

userRoutes.route('/update-user-details').put(verifyJWT,updateUserDetails);

userRoutes.route('/refresh-token').get(refreshAccessToken);

userRoutes.route('/user-details').get(verifyJWT,getUserDetails);

export default userRoutes; 