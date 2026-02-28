const express = require('express');
const router = express.Router();
const sampleController = require('../controllers/sample.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/request/:request_id', sampleController.getByRequest);
router.post('/', sampleController.create);

module.exports = router;
