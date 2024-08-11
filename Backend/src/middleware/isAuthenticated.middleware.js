import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';
import ApiError from '../utils/ApiError.js';
import AsyncHandler from '../utils/AsyncHandler.js';

const verifyJWT=AsyncHandler(async(req,_,next)=>{
    const token=await req.cookies ? req.cookies.accessToken:null;
    if(!token){
        return next(new ApiError(401,"Unauthorized"));
    }

    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    const user=await User.findById(decodedToken._id);
    if(!user){
        return next(new ApiError(401,"Invalid access token"));
    }
    req.user=user;
    next();
});

export default verifyJWT;
