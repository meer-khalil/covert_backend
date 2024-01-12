const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'images') {
      cb(null, 'public/images');
    } else if (file.fieldname === 'files') {
      cb(null, 'public/files');
    } else if (file.fieldname === 'cover') {
      cb(null, 'public/images/blog');
    }
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage, limits: { fieldSize: 25 * 1024 * 1024 } });

module.exports = upload