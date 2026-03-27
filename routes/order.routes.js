const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

router.use(authenticate);

const roles = ['AGENT', 'Agent', 'marketer', 'admin', 'GMMC_ADMIN'];

router.get('/stats',              authorizeRoles(...roles), orderController.getOrderStats);
router.get('/',                   authorizeRoles(...roles), orderController.getAllOrders);
router.post('/',                  authorizeRoles(...roles), orderController.createOrder);
router.get('/school/:school_id',  authorizeRoles(...roles), orderController.getOrdersBySchool);
router.get('/:id',                authorizeRoles(...roles), orderController.getOrderById);
router.put('/:id',                authorizeRoles(...roles), orderController.updateOrder);
router.delete('/:id',             authorizeRoles('admin', 'GMMC_ADMIN'), orderController.deleteOrder);

module.exports = router;
