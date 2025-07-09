import User from '../models/user.js';
import bcrypt from 'bcryptjs';

const initializeAdmin = async () => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Admin already exists');
            return;
        }

        // Create default admin
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new User({
            firstName: 'Quynh',
            lastName: 'Ngo',
            username: 'admin',
            email: 'admin@vagabond.com',
            password: hashedPassword,
            phoneNumber: '0123456789',
            nationality: 'Vietnam',
            city: 'Ho Chi Minh',
            role: 'admin'
        });

        await admin.save();
        console.log('Default admin created successfully');
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
};

export default initializeAdmin;