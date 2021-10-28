const multer = require("multer");

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.toLowerCase().match(/\.(img|png|jpg|jpeg)$/)) {
      cb(new Error("Only images are allowed!"));
    }
    cb(null, true);
  },
});

module.exports = upload;
