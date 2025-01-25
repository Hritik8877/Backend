import { asynchandler } from "../utils/asynchandler.js";
import JWT from "jsonwebtoken";
import User from "../models/user.models.js";


export const verifyJWT=asynchandler(async(req,res,next)=>{
    try {
        const token=await req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer","")
    
        if(!token){
            throw new Apierror(401,"Unauthorized request")
        }
       const decodedtoken=await JWT.verify(token,process.env.ACCESS_TOKEN_SECRET)
      const user=await User.findById(decodedtoken._id).select("-password -refreshToken")
    
      if(!user){
          throw new Apierror(401,"invalid accesstoken")
      }
    
      req.user=user;
        next()
    } catch (error) {
        throw new Apierror(401,error?.message||"Unauthorized request")
        
    }
   


})