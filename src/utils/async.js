const async=(reqhandler)=>{
    (req,res,next)=>{
        Promise.resolve(reqhandler(req,res,next)).catch((err)=> next(err))
  }
}

export default async;


// const async=(fn)=>async(req,res,next)=>{
//     try{
//          await fn(req,res,next)
// }catch(err){
//     res.status(500).json({message:err.message})
// }
// }