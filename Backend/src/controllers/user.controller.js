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

const logoutUser=AsyncHandler(async(req,res)=>{
   const id=req.user._id;
   const user=await User.findByIdAndUpdate(id,{refreshToken:""});
   if(!user){
      throw new ApiError(500,"Something went wrong while logging out");
   }
   const options={
      httpOnly:true,
      secure:true
   }
   return res.status(200).clearCookies("accessToken",options).clearCookies("refreshToken",options).json(new ApiResponse(200,"User logged out successfully"));
});

const updateProfile=AsyncHandler(async(req,res)=>{
   const {name,email,bio,skills,mobileNumber,education}=req.body;
   const id=req.user._id;
   const resumePath=req.files?.resume[0]?.path;
   const resume=await uploadFile(resumePath);
   if(!resume){
      throw new ApiError(500,"Something went wrong while updating resume");
   }
   let skillsArray=skills.split(",");
   let educationArray=education.split(",");
   const user=await User.findByIdAndUpdate(id,{
      name,
      email,
      bio,
      skills:skillsArray,
      mobileNumber,
      education:educationArray,
      resume:resume.secure_url
   });
   if(!user){
      throw new ApiError(500,"Something went wrong while updating profile");
   }
   const updatedUser=await User.findById(id).select("-password -resetPasswordToken -refreshToken");
   return res.status(200).json(new ApiResponse(200,"Profile updated successfully",updatedUser));
});

const refreshAccessToken=AsyncHandler(async(req,res)=>{
   const token=req.cookies ? req.cookies.refreshToken:null;
   if(!token){
      throw new ApiError(401,"Unauthorized");
   }
   const decodedToken=jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
   const user=await User.findById(decodedToken._id);
   if(!user){
      throw new ApiError(401,"Invalid refresh token");
   }
   const {accessToken,refreshToken}=await generateTokens(user._id);
   return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,"Access token refreshed successfully"));
});

const getUserDetails=AsyncHandler(async(req,res)=>{
   const id=req.user._id;
   const user=await User.findById(id).select("-password -resetPasswordToken -refreshToken");
   if(!user){
      throw new ApiError(404,"User not found");
   }
   return res.status(200).json(new ApiResponse(200,"User details fetched successfully",user));
});
export {register,loginUser,logoutUser,generateTokens,updateProfile,refreshAccessToken};