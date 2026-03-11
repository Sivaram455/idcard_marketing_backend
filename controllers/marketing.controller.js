const marketingService = require('../services/marketing.service');

// --- Schools ---

const createSchool = async (req, res) => {
    try {
        const id = await marketingService.createSchool(req.body);
        
        // If the person creating the lead is an agent, auto-assign it to them
        if (req.user.role === 'agent') {
            await marketingService.assignSchoolToAgent(req.user.id, id, new Date());
        }

        res.status(201).json({ success: true, message: 'School added successfully', data: { id } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getAllSchools = async (req, res) => {
    try {
        // If agent, only get assigned schools. If admin, get all.
        let schools;
        if (req.user.role === 'agent') {
            schools = await marketingService.getSchoolsByAgent(req.user.id);
        } else {
            schools = await marketingService.getAllSchools();
        }
        res.json({ success: true, data: schools });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getSchoolDetail = async (req, res) => {
    try {
        const school = await marketingService.getSchoolById(req.params.id);
        if (!school) return res.status(404).json({ success: false, message: 'School not found' });
        
        const activities = await marketingService.getActivitiesBySchool(req.params.id);
        res.json({ success: true, data: { ...school, activities } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateSchool = async (req, res) => {
    try {
        await marketingService.updateSchool(req.params.id, req.body);
        res.json({ success: true, message: 'School updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- Agent Schools ---

const assignSchool = async (req, res) => {
    try {
        const { agent_id, school_id, assigned_date } = req.body;
        await marketingService.assignSchoolToAgent(agent_id, school_id, assigned_date);
        res.json({ success: true, message: 'School assigned to agent successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- Activities ---

const createActivity = async (req, res) => {
    try {
        // Always set agent_id to current user if they are an agent
        const activityData = {
            ...req.body,
            agent_id: req.user.role === 'agent' ? req.user.id : req.body.agent_id
        };
        const id = await marketingService.createActivity(activityData);
        res.status(201).json({ success: true, message: 'Activity logged successfully', data: { id } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getMyActivities = async (req, res) => {
    try {
        const activities = (req.user.role === 'admin' || req.user.role === 'GMMC_ADMIN')
            ? await marketingService.getAllActivities()
            : await marketingService.getActivitiesByAgent(req.user.id);
        res.json({ success: true, data: activities });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getPendingFollowUps = async (req, res) => {
    try {
        const activities = (req.user.role === 'admin' || req.user.role === 'GMMC_ADMIN')
            ? await marketingService.getAllPendingFollowUps()
            : await marketingService.getPendingFollowUps(req.user.id);
        res.json({ success: true, data: activities });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateActivityStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await marketingService.updateActivityStatus(req.params.id, status);
        res.json({ success: true, message: 'Activity status updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    createSchool,
    getAllSchools,
    getSchoolDetail,
    updateSchool,
    assignSchool,
    createActivity,
    getMyActivities,
    getPendingFollowUps,
    updateActivityStatus
};
