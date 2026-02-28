const sampleService = require('../services/sample.service');

const getByRequest = async (req, res) => {
    try {
        const samples = await sampleService.getByRequest(req.params.request_id);
        return res.status(200).json({ success: true, data: samples });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const id = await sampleService.create(req.body, req.user.id);
        return res.status(201).json({
            success: true,
            message: 'Sample uploaded and status updated to SAMPLE_UPLOADED.',
            data: { id }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getByRequest, create };
