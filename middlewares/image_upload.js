const multer = require("multer");

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    return cb(null, true);
  }
  return cb("Imagem invalida", false);
};

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${appRoot}/resources/static/assets/uploads`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-mutants-${file.originalname}`);
  },
});

// var storage = multer.memoryStorage();
exports.upload = multer({ storage: storage, fileFilter: imageFilter });
