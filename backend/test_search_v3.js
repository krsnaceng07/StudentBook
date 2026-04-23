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
            { 
              $match: { 
                $or: [
                  { 'user.status': 'active' },
                  { 'user.status': { $exists: false } }
                ]
              } 
            }
        ];

        if (searchTerm) {
            const searchRegex = { $regex: searchTerm, $options: 'i' };
            const orMatch = [
                { 'user.name': searchRegex },
                { 'user.username': searchRegex },
                { bio: searchRegex },
                { field: searchRegex }
            ];

            if (mongoose.Types.ObjectId.isValid(searchTerm)) {
                console.log('Detected valid ObjectId string');
                orMatch.push({ userId: new mongoose.Types.ObjectId(searchTerm) });
            }

            aggregation.push({ $match: { $or: orMatch } });
        }

        const results = await Profile.aggregate(aggregation);
        console.log(`Results:`, results.length);
        results.forEach(r => console.log(`- ${r.user.name} (ID: ${r.userId})`));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testSearch(process.argv[2]);
