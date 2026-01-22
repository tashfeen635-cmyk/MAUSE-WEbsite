const Admin = require('../models/Admin');

const initAdmin = async () => {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin@mascorporatess.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'mas123';

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ username: adminUsername });

    if (!existingAdmin) {
      // Create default admin
      const admin = new Admin({
        username: adminUsername,
        password: adminPassword
      });

      await admin.save();
      console.log('Default admin user created:', adminUsername);
    } else {
      console.log('Admin user already exists:', adminUsername);
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};

module.exports = initAdmin;
