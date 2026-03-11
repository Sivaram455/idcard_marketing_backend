const express = require('express');
const router = express.Router();
const sampleController = require('../controllers/sample.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticate);
router.use(authorizeRoles('school', 'SCHOOL_ADMIN', 'admin', 'GMMC_ADMIN', 'printer', 'PRINTER'));

router.get('/request/:request_id', sampleController.getByRequest);
router.post('/', sampleController.create);

module.exports = router;
