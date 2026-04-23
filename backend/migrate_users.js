require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const migrateUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');
        
        const result = await User.updateMany(
            { status: { $exists: false } },
            { $set: { status: 'active' } }
        );
        
        console.log(`Migration completed! Updated ${result.modifiedCount} users.`);
        process.exit();
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrateUsers();
