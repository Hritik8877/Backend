import multer from "multer";
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./Public/Temp");
    },
    filename:function(req,file,cb){
        cb(null,file.originalname)
    }
})
const upload = multer({ 
    
    storage

});