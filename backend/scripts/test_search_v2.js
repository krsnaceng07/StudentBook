require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');

const testSearch = async (searchTerm) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const currentUserId = new mongoose.Types.ObjectId("69e46d73429e90d07868ac9f"); // krsna
        const excludedIds = [currentUserId];
        
        console.log('Searching for:', searchTerm);
        
        const query = {
            userId: { $nin: excludedIds }
        };

        const aggregation = [
            { $match: query },
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

        // LOG INTERMEDIATE
        const intermediate = await Profile.aggregate(aggregation);
        console.log('Intermediate count (before search filter):', intermediate.length);
        if (intermediate.length > 0) {
            console.log('First intermediate user name:', intermediate[0].user.name);
        }

        if (searchTerm) {
            aggregation.push({
                $match: {
                    $or: [
                        { 'user.name': { $regex: searchTerm, $options: 'i' } },
                        { 'user.username': { $regex: searchTerm, $options: 'i' } },
                        { bio: { $regex: searchTerm, $options: 'i' } },
                        { field: { $regex: searchTerm, $options: 'i' } }
                    ]
                }
            });
        }

        const results = await Profile.aggregate(aggregation);
        console.log(`Final Search Results:`, results.length);
        results.forEach(r => console.log(`- ${r.user.name}`));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testSearch(process.argv[2] || 'Bob');
