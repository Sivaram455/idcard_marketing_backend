const express = require('express');
const router = express.Router();
const path = require('path');
const { authenticate } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.use(authenticate);

// POST /api/upload/:folder  — upload a single file
// folder can be: logos, signatures, samples, photos, general
router.post('/:folder', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const fileUrl = `/uploads/${req.params.folder}/${req.file.filename}`;
    return res.status(200).json({
        success: true,
        message: 'File uploaded successfully.',
        data: {
            url: fileUrl,
            originalName: req.file.originalname,
            size: req.file.size,
            filename: req.file.filename,
        },
    });
});

module.exports = router;
