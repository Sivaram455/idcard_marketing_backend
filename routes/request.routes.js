const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// GET /api/requests - list all (filtered by role / tenant_id query)
router.get('/', requestController.getAll);

// GET /api/requests/stats - status counts
router.get('/stats', requestController.getStatusCounts);

// GET /api/requests/:id - full detail with students, samples, approvals
router.get('/:id', requestController.getById);

// POST /api/requests - create new request (school admin)
router.post('/', requestController.create);

// PATCH /api/requests/:id/status - admin override status
router.patch('/:id/status', requestController.updateStatus);

module.exports = router;
