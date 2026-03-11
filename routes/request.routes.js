const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticate);
router.use(authorizeRoles('school', 'SCHOOL_ADMIN', 'admin', 'GMMC_ADMIN', 'printer', 'PRINTER'));

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

// PATCH /api/requests/:id/dispatch - Submit tracking info and mark as dispatched
router.patch('/:id/dispatch', requestController.updateDispatch);

module.exports = router;
