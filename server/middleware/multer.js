import multer from "multer";
// Use of the multer middleware to handle file uploads, specifically for storing uploaded files
// in a "public" directory with a unique filename based on the current timestamp and original filename,
// The file size limit is set to 5 MB to prevent excessively large uploads.

const storage = multer.diskStorage({  
    destination: function (req,file,cb) {
        cb(null, "public")
    },
    filename: function (req,file,cb) {
        const fileName = `${Date.now()}-${file.originalname}`
        cb(null,fileName)
    }
})


export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});