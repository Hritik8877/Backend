import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadonconudinary=async(localfilepath)=>{
   try{
      if(!localfilepath)return null;
        const response=await cloudinary.uploader.upload(localfilepath,{
            resource_type: "auto",

        });
        console.log("file uploaded successfully",response.url); 
        fs.unlinkSync(localfilepath)
        return response;
   }catch(error){
    fs.unlinkSync(localfilepath);//remove temporary file 
       console.log(error)
   }
}


export default uploadonconudinary;