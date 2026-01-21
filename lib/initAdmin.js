const Admin = require('./models/Admin');

const initAdmin = async () => {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'tashu';
    const adminPassword = process.env.ADMIN_PASSWORD || 'tashu123';

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
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};

module.exports = initAdmin;
