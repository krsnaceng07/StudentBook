require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');

const checkBrokenLinks = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const profiles = await Profile.find({});
        console.log(`Checking ${profiles.length} profiles...`);
        
        for (const profile of profiles) {
            const user = await User.findById(profile.userId);
            if (!user) {
                console.log(`Broken Profile found: ${profile._id}, userId ${profile.userId} DOES NOT EXIST in users collection.`);
            } else {
                console.log(`Valid Profile: ${profile._id} -> User: ${user.name} (${user._id})`);
            }
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkBrokenLinks();
