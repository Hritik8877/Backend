import mongoose ,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userschema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    Email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    avatar:{
        type:String,//using cloudinary url
        required:true,

    },coverImage:{
        type:String,//using cloudinary url
    },watchHistory:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },password:{
        type:String,
        required:[true,"Password is required"],
    },refreshToken:{
        type:String,
    }

},
{
    timestamps:true
}
)


userschema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
        this.password=await bcrypt.hash(this.password,10)
        next()
})

userschema.methods.ispasswordCorrect=async function(password){
        return await bcrypt.compare(password,this.password)
    
}

userschema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            Email:this.Email,
            username:this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


userschema.methods.generateRefreshToken=function(){
  return   jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



const User=mongoose.model("User",userschema)

export default User;