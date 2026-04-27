require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');

const testSearch = async (searchTerm) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const currentUserId = new mongoose.Types.ObjectId("69e46d73429e90d07868ac9f"); // krsna
        const excludedIds = [currentUserId];
        
        const aggregation = [
            { $match: { userId: { $nin: excludedIds } } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            { $match: { 'user.status': 'active' } }
        ];

        const intermediate = await Profile.aggregate(aggregation);
        console.log('Intermediate users:', intermediate.map(i => i.user.name));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testSearch();
