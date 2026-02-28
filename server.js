const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth.routes');
const tenantRoutes = require('./routes/tenant.routes');
const userRoutes = require('./routes/user.routes');
const requestRoutes = require('./routes/request.routes');
const studentRoutes = require('./routes/student.routes');
const sampleRoutes = require('./routes/sample.routes');
const approvalRoutes = require('./routes/approval.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'ID Card Management API is running ✅',
        timestamp: new Date().toISOString()
    });
});

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/samples', sampleRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/upload', uploadRoutes);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('❌ Unhandled Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.', error: err.message });
});

// ─── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await testConnection();
    app.listen(PORT, () => {
        console.log(`\n🚀 ID Card Management API running on http://localhost:${PORT}`);
        console.log(`📋 Available routes:`);
        console.log(`   POST  /api/auth/login`);
        console.log(`   GET   /api/auth/me`);
        console.log(`   GET   /api/tenants`);
        console.log(`   GET   /api/requests`);
        console.log(`   POST  /api/requests`);
        console.log(`   GET   /api/requests/:id`);
        console.log(`   GET   /api/requests/stats`);
        console.log(`   GET   /api/students/request/:request_id`);
        console.log(`   POST  /api/students/bulk`);
        console.log(`   GET   /api/samples/request/:request_id`);
        console.log(`   POST  /api/samples`);
        console.log(`   GET   /api/approvals/request/:request_id`);
        console.log(`   POST  /api/approvals\n`);
    });
};

startServer();
