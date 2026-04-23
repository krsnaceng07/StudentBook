require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        console.log(`Total Users: ${users.length}`);
        
        const profiles = await Profile.find({});
        console.log(`Total Profiles: ${profiles.length}`);
        
        if (users.length > 0) {
            console.log('Sample User:', JSON.stringify(users[0], null, 2));
        }
        
        if (profiles.length > 0) {
            console.log('Sample Profile:', JSON.stringify(profiles[0], null, 2));
        }

        const orphanUsers = [];
        for (const user of users) {
            const profile = await Profile.findOne({ userId: user._id });
            if (!profile) {
                orphanUsers.push(user.name);
            }
        }
        console.log('Users without profiles:', orphanUsers);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
