// Debug endpoint to verify deployment structure
module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const fs = require('fs');
    const path = require('path');

    // Check what directories exist at various paths
    const checks = {
        message: 'Debug endpoint for MAUSE Website',
        timestamp: new Date().toISOString(),
        cwd: process.cwd(),
        env: {
            hasMongoURI: !!process.env.MONGODB_URI,
            hasJWTSecret: !!process.env.JWT_SECRET,
            NODE_ENV: process.env.NODE_ENV
        },
        paths: {}
    };

    // Check common paths
    const pathsToCheck = [
        '.',
        './public',
        './api',
        './lib'
    ];

    for (const p of pathsToCheck) {
        try {
            const fullPath = path.resolve(p);
            const exists = fs.existsSync(fullPath);
            const isDir = exists && fs.statSync(fullPath).isDirectory();
            checks.paths[p] = {
                fullPath,
                exists,
                isDirectory: isDir,
                contents: isDir ? fs.readdirSync(fullPath).slice(0, 10) : null
            };
        } catch (e) {
            checks.paths[p] = { error: e.message };
        }
    }

    res.status(200).json(checks);
};
