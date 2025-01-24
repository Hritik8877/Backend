const asynchandler=(reqhandler)=>{
   return (req,res,next)=>{
        Promise.resolve(reqhandler(req,res,next)).catch((err)=> next(err))
  }
}

export  {asynchandler}


// const async=(fn)=>async(req,res,next)=>{
//     try{
//          await fn(req,res,next)
// }catch(err){
//     res.status(500).json({message:err.message})
// }
// }