require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');

const listAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const profiles = await Profile.find({});
        console.log(`Total Profiles: ${profiles.length}`);
        
        for (const p of profiles) {
            const user = await User.findById(p.userId);
            if (user) {
                console.log(`Profile ${p._id}: User ${user.name} (Status: ${user.status})`);
            } else {
                console.log(`Profile ${p._id}: USER NOT FOUND (${p.userId})`);
            }
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listAll();
