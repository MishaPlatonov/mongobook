const multer = require('multer');
const storage = multer.diskStorage({
  destination(req, file, cb){
    cb(null, 'user-imgs');
  },
  filename(req, file, cb){
    cb(null, new Date().toISOString().replace(/[\/\\:]/g, "_") + file.originalname);
  }
});

//MIME  allowedTypes
//image/extention
const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
const fileFilter = (req, file, cb)=>{
  if(allowedTypes.includes(file.mimetype)){
    cb(null, true);
  }
  else{
    cb(null, false);
  }
}


//destination filename
module.exports = multer({
  storage, fileFilter
})