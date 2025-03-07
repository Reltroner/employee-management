const multer = require('multer');
const path = require('path');
const ExpressError = require('../utils/ErrorHandler');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/'); // Folder penyimpanan
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
        cb(null, true);
    } else {
        cb(new ExpressError('Only .jpg, .jpeg, and .png formats are allowed!', 400));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2MB
    fileFilter: fileFilter
});

module.exports = upload;
