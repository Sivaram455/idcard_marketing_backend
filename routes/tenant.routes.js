const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenant.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', authorizeRoles('GMMC_ADMIN'), tenantController.getAll);
router.get('/:id', tenantController.getById);
router.post('/', authorizeRoles('GMMC_ADMIN'), tenantController.create);
router.put('/:id', authorizeRoles('GMMC_ADMIN'), tenantController.update);

module.exports = router;
