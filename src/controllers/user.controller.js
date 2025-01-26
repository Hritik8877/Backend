import {asynchandler} from "../utils/asynchandler.js";
import Apierror from "../utils/Apierror.js";
import User from "../models/user.models.js";
import uploadonconudinary from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import JWT from "jsonwebtoken";


const generateAccessTokenandrefreshToken=async(userid)=>{
    try {
        const user=await User.findById(userid)
        if(!user){
            throw new Apierror(404,"user not found")
        }
        const accessToken=await user.generateAccessToken()
        const refreshToken=await user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforesave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new Apierror(500,"somthing went wrong while generation accessToen and retreshToken")

        
    }
}

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
//const coverImageLocalpath= req.files?.coverImage[0]?.path;
let coverImageLocalpath;
if(req.files&& Array.isArray(req.files.coverImageLocalpath)&&req.files.coverImageLocalpath.length>0){
    coverImageLocalpath=req.files.coverImageLocalpath[0].path;
}
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

const loginUser=asynchandler(async(req,res)=>{
    const {Email,password,username}=req.body
    if(!(Email ||password)){
        throw new Apierror(400,"Email and password are required")
    }
    const user=await User.findOne({
        $or:[{Email},{username}]
    })
    if(!user){
        throw new Apierror(404,"user not found")
    }
    const ispasswordvalid=await user.ispasswordCorrect(password)

    if(!ispasswordvalid){
        throw new Apierror(401,"Invalid password")
    }
    const {accessToken,refreshToken}=await generateAccessTokenandrefreshToken(user._id)

    const loggedinuser=await User.findById(user._id).select("-passsword -refreshToken")
     
    const options={
        httpOnly:true,
        secure:true,
    }
    
    
    return res
    .status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(new Apiresponse(200,{
       user:loggedinuser, accessToken,refreshToken
    },"User logged in successfully"))

})

const logoutuser=asynchandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken:undefined
        }},

        {
            new:true
        }
        
     );
     const options={
            httpOnly:true,
            secure:true,
     }

     return res
     .status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json(new Apiresponse(200,{},"User logged out successfully"))
})

const refreshaccesstoken=asynchandler(async(req,res)=>{
   const incomingrefreshtoken= req.cookies.refreshToken||req.body.refreshToken
    if(!incomingrefreshtoken){
         throw new Apierror(401,"Unauthorized request")
    }
    
    try {
        const decodedtoken=await JWT.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET)
        const user =await User.findById(decodedtoken._id).select("-password -refreshToken")
        if(!user){
            throw new Apierror(401,"Invalid refresh token")
        }
        if(user?.refreshToken!==incomingrefreshtoken){
            throw new Apierror(401,"Invalid refresh token")
        }
    
        const options={
            httpOnly:true,
            secure:true,
        }
        const {accessToken,refreshToken}=await generateAccessTokenandrefreshToken(user._id)
    
        return res.status(200)
        .cookie("refreshToken",refreshToken,options)
        .cookie("accessToken",accessToken,options)
        .json(new Apiresponse(200,{
            user,accessToken,refreshToken
        },"Access token refreshed successfully"))
    } catch (error) {
        throw new Apierror(401,error?.message||"Unauthorized request")
        
    }
})


const changepassword=asynchandler(async(req,res)=>{
    const {oldpassword,newpassword}=req.body
    const user=await User.findById(req.user._id)
    const ispasswordCorrect=user.ispasswordCorrect(oldpassword)
    if(!ispasswordCorrect){
        throw new Apierror(400,"Invalid password")
    }
    user.password=newpassword
    await user.save({validateBeforeSave:false})

    return res.status(200).json(new Apiresponse(200,{},"Password changed successfully"))
})

const getcurrentuser=asynchandler(async(req,res)=>{
    const user=await User.findById(req.user._id).select("-password -refreshToken")
    return res.status(200).json(new Apiresponse(200,user,"User details fetched successfully"))
})

const updateaccountdetail=asynchandler(async(req,res)=>{
    const {fullName,Email}=req.body
    if(!fullName||!Email){
        throw new Apierror(400,"All fields are required")
    }

  const user=User.findByIdAndUpdate(req.user._id,{
        $set:{
            fullName,
            Email
        }
    },{
        new:true
    }).select("-password")

    return res.status(200).json(new Apiresponse(200,user,"account details updated successfully"))
})

const updateUserAvatar=asynchandler(async(req,res)=>{
   const avatarlocalpath=req.file?.path

   if (!avatarlocalpath) {
    throw new Apierror(400,"Avatar file is missing")
    
   }
   const avatar=uploadonconudinary(avatarlocalpath);
   if (!avatar.url) {
    throw new Apierror(400,"error while uploading on avatar")
   }

  const user= await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            avatar:avatar.url
        }
    },
    {new:true}
   ).select("-password")

   return res
   .status(200)
   .json(
    new Apiresponse(200,user,"avatar update successfully")
   )


})

const updateUsercoverImage=asynchandler(async(req,res)=>{
    const coverImagelocalpath=req.file?.path
 
    if (!coverImagelocalpath) {
     throw new Apierror(400,"coverImage file is missing")
     
    }
    const coverImage=uploadonconudinary(coverImagelocalpath);
    if (!coverImage.url) {
     throw new Apierror(400,"error while uploading on avatar")
    }
 
   const user= await User.findByIdAndUpdate(
     req.user?._id,
     {
         $set:{
            coverImage:coverImage.url
         }
     },
     {new:true}
    ).select("-password")
 
    return res
    .status(200)
    .json(
     new Apiresponse(200,user,"coverImage updated successfully")
    )
 
 
 })



export {registerUser,loginUser,logoutuser,refreshaccesstoken,updateaccountdetail,getcurrentuser,updateUserAvatar,updateUsercoverImage,changepassword}