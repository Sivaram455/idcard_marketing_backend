const requestService = require('../services/request.service');

const getAll = async (req, res) => {
    try {
        const { status } = req.query;
        // School admin sees only their tenant's requests
        const tenant_id = req.user.role === 'SCHOOL_ADMIN' ? req.user.tenant_id : req.query.tenant_id;
        const requests = await requestService.getAll({ tenant_id, status });
        return res.status(200).json({ success: true, data: requests });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const getById = async (req, res) => {
    try {
        const request = await requestService.getWithDetails(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
        return res.status(200).json({ success: true, data: request });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const result = await requestService.create(req.body, req.user.id);
        return res.status(201).json({
            success: true,
            message: 'ID Card request submitted successfully.',
            data: result
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;
        const affected = await requestService.updateStatus(req.params.id, status, remarks);
        if (!affected) return res.status(404).json({ success: false, message: 'Request not found.' });
        return res.status(200).json({ success: true, message: 'Status updated successfully.' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const getStatusCounts = async (req, res) => {
    try {
        const tenant_id = req.user.role === 'SCHOOL_ADMIN' ? req.user.tenant_id : null;
        const counts = await requestService.getStatusCounts(tenant_id);
        return res.status(200).json({ success: true, data: counts });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }

};

const updateDispatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, tracking_info } = req.body;
        
        const affected = await requestService.updateDispatch(id, status, tracking_info);
        
        if (!affected) {
            return res.status(404).json({ success: false, message: 'Request not found.' });
        }
        
        return res.status(200).json({ 
            success: true, 
            message: 'Request marked as dispatched.' 
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAll, getById, create, updateStatus, updateDispatch, getStatusCounts };
