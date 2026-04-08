const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Core payment flows
router.post('/create-order', authenticate, paymentController.createOrder);
router.post('/verify-payment', authenticate, paymentController.verifyPayment);
router.post('/record-cash', authenticate, paymentController.recordCash);

// History and Analytics
router.get('/history/:order_id', authenticate, paymentController.getOrderPayments);
router.get('/all-history', authenticate, paymentController.getAllPayments);
router.get('/stats', authenticate, paymentController.getPaymentStats);

// Webhook route - No auth, Razorpay calls this directly
router.post('/webhook', express.json(), paymentController.handleWebhook);

module.exports = router;

