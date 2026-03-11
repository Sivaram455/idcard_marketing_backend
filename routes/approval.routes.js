const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approval.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticate);
router.use(authorizeRoles('school', 'SCHOOL_ADMIN', 'admin', 'GMMC_ADMIN', 'printer', 'PRINTER'));

router.get('/request/:request_id', approvalController.getByRequest);
router.get('/timeline/:request_id', approvalController.getTimeline);
router.post('/', approvalController.create);

module.exports = router;
