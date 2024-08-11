import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        min:3,
        max:20,
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    mobileNumber:{
        type:String,
        required:true,
        trim:true,
        max:10,
    },
    role:{
        type:String,
        enum:['candidate','recruiter'],
        required:true,
    },
    profile:{
        bio:{
            type:String,
        },
        skills:[{type:String}],
        resume:{
            type:String,
        },
        company:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Company',
        },
        education:[{
            degree:{
                type:String,
            },
            institution:{
                type:String,
            },
            passingYear:{
                type:String,
            },
        }],
        experience:[{
            title:{
                type:String,
            },
            company:{
                type:String,
            },
            location:{
                type:String,
            },
            from:{
                type:Date,
            },
            to:{
                type:Date,
            },
            current:{
                type:Boolean,
                default:false,
            },
            description:{
                type:String,
            },
        }],
        social:{
            github:{
                type:String,
            },
            linkedin:{
                type:String,
            },
        },
        profilePicture:{
            type:String,
        },
        },
        refreshToken:{
            type:String
        },
        passwordResetToken:{
            type:String
        }
},{timestamps:true});

userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,10);
        next();
    }
    return next();
});

userSchema.methods.isPasswordCorrect=async function(password){
    const result=await bcrypt.compare(password,this.password);
    return result;
}

userSchema.methods.generateAccessToken=async function(){
    return jwt.sign(
        {
            _id:this._id,
            name:this.name,
            email:this.email,
            password:this.password
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken=async function(){
    return jwt.sign({
        _id:this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}

export default mongoose.model('User',userSchema);