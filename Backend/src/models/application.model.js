import mongoose from "mongoose";

const applicationSchema=new mongoose.Schema({
    job:{
        type:mongoose.Types.ObjectId,
        ref:'Job',
        required:true,
    },
    applicant:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true,
    },
    status:{
        type:String,
        enum:['pending','shortlisted','accepted','rejected'],
        default:'pending',
    },
    resume:{
        type:String,
    },
},{timestamps:true});

export default mongoose.model('Application',applicationSchema);