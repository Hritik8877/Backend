import {asynchandler} from "../utils/asynchandler.js";
import {Apierror} from "../utils/error.js";
import User from "../models/user.model.js";
import {uploadonconudinary} from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/Apiresponse.js";


const registerUser=asynchandler(async(req,res)=>{
    //get user details from req.body
  const {username,fullName,Email,password}=req.body
  console.log(Email);
   
  //validtaion
    
      if(
        [username,fullName,Email,password].some((field)=>field?.trim()==="")
      ){
        throw new Apierror(400,"All fields are required")
      }

    //if user already exists
    const existeduser=await User.findOne({Email})
    if(existeduser){
        throw new Apierror(409,"User already exists")
    }

    //check for imgaes
   const avatarlocalpath= req.files?.avatar[0]?.path;
   const coverImageLocalpath= req.files?.coverImage[0]?.path;

   if (!avatarlocalpath) {
       throw new Apierror(400,"Avatar is required")
   }

   //upload them to cloudinary
    const avatar=await uploadonconudinary(avatarlocalpath)
    const coverImage=await uploadonconudinary(coverImageLocalpath)

    if (!avatar) {
        throw new Apierror(400,"Avatar is required")
    }

    //create entry in database
     const user= await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        Email,
        password,
        username:username.toLowerCase()
    })

   const createduser= await User.findById(user._id).select("-password -refreshToken" )

   if (!createduser) {
       throw new Apierror(500,"User not created")
   }

   return res.status(201).json(new Apiresponse(201,createduser,"User created successfully"))

})


export {registerUser}