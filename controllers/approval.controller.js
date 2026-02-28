const approvalService = require('../services/approval.service');

const getByRequest = async (req, res) => {
    try {
        const approvals = await approvalService.getByRequest(req.params.request_id);
        return res.status(200).json({ success: true, data: approvals });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const result = await approvalService.create(req.body, req.user);
        return res.status(201).json({
            success: true,
            message: `Action recorded. Request status → ${result.newStatus}`,
            data: result
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const getTimeline = async (req, res) => {
    try {
        const timeline = await approvalService.getTimeline(req.params.request_id);
        return res.status(200).json({ success: true, data: timeline });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getByRequest, create, getTimeline };
