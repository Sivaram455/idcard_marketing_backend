const orderService = require('../services/order.service');

const createOrder = async (req, res) => {
    try {
        const id = await orderService.createOrder({ ...req.body, created_by: req.user.id });
        res.status(201).json({ success: true, message: 'Order created', data: { id } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await orderService.getOrderById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getOrdersBySchool = async (req, res) => {
    try {
        const orders = await orderService.getOrdersBySchool(req.params.school_id);
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateOrder = async (req, res) => {
    try {
        await orderService.updateOrder(req.params.id, req.body);
        res.json({ success: true, message: 'Order updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteOrder = async (req, res) => {
    try {
        await orderService.deleteOrder(req.params.id);
        res.json({ success: true, message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getOrderStats = async (req, res) => {
    try {
        const stats = await orderService.getOrderStats();
        res.json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { createOrder, getAllOrders, getOrderById, getOrdersBySchool, updateOrder, deleteOrder, getOrderStats };
