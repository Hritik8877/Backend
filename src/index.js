import dotenv from "dotenv";
import connectDB from "./db/db.js";

dotenv.config({
    path: "./.env",
});

connectDB();














// import express from "express";
// const app = express();
// ;(async()=>{
//     try{
//        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
//        app.on("error",(err)=>{
//            console.log(err)
//            throw err
//        })

//        app.listen(process.env.PORT,()=>{
//               console.log(`Server is running on port ${process.env.PORT}`)
//        })
//     }catch(err){
//         console.log(err)
//         throw err
//     }
// })()