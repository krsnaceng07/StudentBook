require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkBob = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const bob = await User.findOne({ name: /Bob/i });
        console.log('Bob User:', JSON.stringify(bob, null, 2));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkBob();
