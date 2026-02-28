const tenantService = require('../services/tenant.service');

const getAll = async (req, res) => {
    try {
        const tenants = await tenantService.getAll();
        return res.status(200).json({ success: true, data: tenants });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const getById = async (req, res) => {
    try {
        const tenant = await tenantService.getById(req.params.id);
        if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found.' });
        return res.status(200).json({ success: true, data: tenant });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const id = await tenantService.create(req.body);
        return res.status(201).json({ success: true, message: 'Tenant created successfully.', data: { id } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const update = async (req, res) => {
    try {
        const affected = await tenantService.update(req.params.id, req.body);
        if (!affected) return res.status(404).json({ success: false, message: 'Tenant not found.' });
        return res.status(200).json({ success: true, message: 'Tenant updated successfully.' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAll, getById, create, update };
