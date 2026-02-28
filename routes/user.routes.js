const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticate);
router.use(authorizeRoles('GMMC_ADMIN'));

router.get('/', userController.getAll);
router.get('/stats', userController.getStats);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.post('/:id/reset-password', userController.resetPassword);

module.exports = router;
