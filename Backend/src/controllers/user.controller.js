import {User} from '../models/user.models.js';
import {ApiError,AsyncHandler,ApiResponse} from '../utils/AsyncHandler.js';
import { uploadFile } from '../utils/Cloudinary.js';

const generateTokens=async(userId)=>{
   try{
      const user=await User.findOne(userId);
      const accessToken=user.generateAccessToken();
      const refreshToken=user.generateRefreshToken();
      user.refreshToken=refreshToken;
      await user.save({
         validateBeforeSave:false
      });
      return {accessToken,refreshToken};
   }
   catch(err){
      throw new ApiError()
   }
}
// Create and Save a new User
const register=AsyncHandler(async(req,res)=>{
   const {name,email,password,role}=req.body;

   if([name,email,password,role].some((field)=>{
    if(field.trim()==="") return true;
   })){
    throw new ApiError(400,"All fields are required");
   }

   if(!(email.include("@") && email.include("."))){
    throw new ApiError(400,"Invalid email");
   }

   const existedUser=await User.findOne({email});

   if(existedUser){
    throw new ApiError(400,"User already exists");
   }

   const profilePath=req.files?.profilePicture[0]?.path;
   const profile=await uploadFile(profilePath);
   if(!profile){
    throw new ApiError(500,"Something went wrong while updating profile picture");
   }

   const user=await User.create({
    name,
    email,
    password,
    role,
    profile:{
      profilePicture:profile.secure_url
    },
   })

   const createdUser=await user.findById(user._id).select("-password -resetPasswordToken -refreshToken");
   
   if(!createdUser){
    throw new ApiError(500,"Something went wrong while creating unew ser");
   }
    
   return res.status(200).json(new ApiResponse(200,"User created successfully",createdUser));
});

const loginUser=AsyncHandler(async(req,res)=>{
   const {email,password}=req.body;
   if(!email && !password){
      throw new ApiError(400,"Username or email not found");
   }

   const existedUser=await User.findOne({email});

   if(!existedUser){
      throw new ApiError(404,"User not exist !! Please register");
   }

   const isPasswordValide=await existedUser.isPasswordCorrect(password);

   if(!isPasswordValide){
      throw new ApiError(401,"Invalid credentials!!");
   }

   const {accessToken,refreshToken}=await generateTokens(existedUser._id);

   const loggedUser=await User.findById(existedUser._id);

   return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,refreshToken).json(
      new ApiResponse(
         200,
         "User loggedIn successfully!!",
         {
            user:loggedUser,accessToken,refreshToken
         }
      )
   )
});
export {register,loginUser};