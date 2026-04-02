const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', authorizeRoles('Agent', 'marketer', 'admin', 'GMMC_ADMIN'), userController.getAll);
router.get('/stats', authorizeRoles('GMMC_ADMIN'), userController.getStats);
router.post('/', authorizeRoles('GMMC_ADMIN'), userController.create);
router.put('/:id', authorizeRoles('GMMC_ADMIN'), userController.update);
router.post('/:id/reset-password', authorizeRoles('GMMC_ADMIN'), userController.resetPassword);

module.exports = router;
