const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure base uploads directory exists
const baseDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const sub = path.join(baseDir, req.params.folder || 'general');
        if (!fs.existsSync(sub)) fs.mkdirSync(sub, { recursive: true });
        cb(null, sub);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
        cb(null, name);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.zip', '.rar', '.xlsx', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`File type not allowed: ${ext}`), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB for zip files
});

module.exports = { upload };
