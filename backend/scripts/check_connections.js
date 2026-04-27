require('dotenv').config();
const mongoose = require('mongoose');
const Connection = require('./models/Connection');
const User = require('./models/User');

const checkConnections = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const krsna = await User.findOne({ name: 'krsna' });
        if (!krsna) {
            console.log('User krsna not found');
            process.exit();
        }
        console.log('krsna ID:', krsna._id);
        
        const connections = await Connection.find({
            $or: [{ requester: krsna._id }, { recipient: krsna._id }]
        });
        console.log(`Connections for krsna: ${connections.length}`);
        for (const conn of connections) {
            console.log(`- Request from ${conn.requester} to ${conn.recipient}, status: ${conn.status}`);
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkConnections();
