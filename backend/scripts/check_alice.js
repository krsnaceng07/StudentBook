require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkAlice = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const alice = await User.findOne({ name: /Alice/i });
        console.log('Alice User (Raw):', alice.toObject({ transform: false }));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkAlice();
