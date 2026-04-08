const Razorpay = require('razorpay');
const crypto = require('crypto');
const { pool } = require('../config/db');
const paymentService = require('../services/payment.service');
const orderService = require('../services/order.service');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order for online payment
const createOrder = async (req, res) => {
    try {
        const { order_id, amount } = req.body;

        if (!order_id || !amount) {
            return res.status(400).json({ success: false, message: 'Order ID and Amount are required' });
        }

        const payAmount = Number(amount);
        if (isNaN(payAmount) || payAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid payment amount' });
        }

        const order = await orderService.getOrderById(order_id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const remaining = Number(order.total_amount) - Number(order.initial_payment);
        if (payAmount > remaining + 0.01) {
            return res.status(400).json({ success: false, message: 'Amount exceeds remaining balance' });
        }

        const rzpOrder = await razorpay.orders.create({
            amount: Math.round(payAmount * 100),
            currency: 'INR',
            receipt: `rcpt_${order_id}_${Date.now()}`,
        });

        await paymentService.createPaymentRecord({
            order_id,
            rzp_order_id: rzpOrder.id,
            amount: payAmount,
            currency: 'INR',
            status: 'created',
            method: 'online'
        });

        res.status(201).json({
            success: true,
            data: {
                id: rzpOrder.id,
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                key_id: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (err) {
        console.error('Razorpay Order Creation Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Verify Razorpay payment
const verifyPayment = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        const [payments] = await connection.query(
            'SELECT * FROM marketing_payments WHERE rzp_order_id = ? FOR UPDATE', [razorpay_order_id]
        );
        const rec = payments[0];
        if (!rec) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }
        if (rec.status === 'captured') {
            await connection.commit();
            return res.json({ success: true, message: 'Payment already processed' });
        }

        const rzpPayment = await razorpay.payments.fetch(razorpay_payment_id);

        await connection.query(
            `UPDATE marketing_payments SET rzp_payment_id=?, rzp_signature=?, status='captured', method=? WHERE rzp_order_id=?`,
            [razorpay_payment_id, razorpay_signature, rzpPayment.method, razorpay_order_id]
        );

        const [orders] = await connection.query(
            'SELECT * FROM marketing_orders WHERE id = ? FOR UPDATE', [rec.order_id]
        );
        if (orders[0]) {
            const o = orders[0];
            const newPaid = Number(o.initial_payment || 0) + Number(rec.amount);
            await connection.query(
                `UPDATE marketing_orders SET initial_payment=?, payment_status=? WHERE id=?`,
                [newPaid, newPaid >= Number(o.total_amount) ? 'Paid' : 'Partial', o.id]
            );
        }

        await connection.commit();
        res.json({ success: true, message: 'Payment verified successfully' });
    } catch (err) {
        await connection.rollback();
        console.error('Payment Verification Error:', err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        connection.release();
    }
};

// Record cash payment
const recordCash = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { order_id, amount } = req.body;

        if (!order_id || !amount || Number(amount) <= 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Order ID and valid amount are required' });
        }

        const [orders] = await connection.query(
            'SELECT * FROM marketing_orders WHERE id = ? FOR UPDATE', [order_id]
        );
        const order = orders[0];
        if (!order) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const remaining = Number(order.total_amount) - Number(order.initial_payment);
        const payAmount = Number(amount);
        if (payAmount > remaining + 0.01) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Amount exceeds remaining balance' });
        }

        const receipt = `CASH-${order_id}-${Date.now()}`;
        await connection.query(
            `INSERT INTO marketing_payments (order_id, rzp_order_id, amount, currency, status, method) VALUES (?,?,?,'INR','captured','cash')`,
            [order_id, receipt, payAmount]
        );

        const newPaid = Number(order.initial_payment || 0) + payAmount;
        await connection.query(
            `UPDATE marketing_orders SET initial_payment=?, payment_status=? WHERE id=?`,
            [newPaid, newPaid >= Number(order.total_amount) ? 'Paid' : 'Partial', order_id]
        );

        await connection.commit();
        res.status(201).json({ success: true, message: 'Cash payment recorded successfully' });
    } catch (err) {
        await connection.rollback();
        console.error('Cash Payment Error:', err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        connection.release();
    }
};

// Get payments for one order
const getOrderPayments = async (req, res) => {
    try {
        const payments = await paymentService.getPaymentsByOrder(req.params.order_id);
        res.json({ success: true, data: payments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all payments
const getAllPayments = async (req, res) => {
    try {
        const payments = await paymentService.getAllPayments();
        res.json({ success: true, data: payments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Payment stats
const getPaymentStats = async (req, res) => {
    try {
        const stats = await paymentService.getPaymentStats();
        res.json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Razorpay webhook
const handleWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (expected !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    if (req.body.event === 'payment.captured') {
        const { order_id: rzpOid, id: payId, method } = req.body.payload.payment.entity;
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [payments] = await connection.query(
                'SELECT * FROM marketing_payments WHERE rzp_order_id = ? FOR UPDATE', [rzpOid]
            );
            if (payments[0] && payments[0].status !== 'captured') {
                const rec = payments[0];
                await connection.query(
                    `UPDATE marketing_payments SET rzp_payment_id=?, status='captured', method=? WHERE rzp_order_id=?`,
                    [payId, method, rzpOid]
                );
                const [orders] = await connection.query(
                    'SELECT * FROM marketing_orders WHERE id = ? FOR UPDATE', [rec.order_id]
                );
                if (orders[0]) {
                    const o = orders[0];
                    const newPaid = Number(o.initial_payment || 0) + Number(rec.amount);
                    await connection.query(
                        `UPDATE marketing_orders SET initial_payment=?, payment_status=? WHERE id=?`,
                        [newPaid, newPaid >= o.total_amount ? 'Paid' : 'Partial', o.id]
                    );
                }
            }
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            console.error('Webhook error:', err);
        } finally {
            connection.release();
        }
    }
    res.json({ status: 'ok' });
};

module.exports = {
    createOrder,
    verifyPayment,
    recordCash,
    getOrderPayments,
    getAllPayments,
    getPaymentStats,
    handleWebhook
};
