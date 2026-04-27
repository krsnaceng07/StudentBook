require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');

const debugAggregation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('--- Step 1: Check one profile and its userId type ---');
        const profile = await Profile.findOne();
        console.log('Profile userId:', profile.userId, 'Type:', typeof profile.userId, 'Is ObjectId?', profile.userId instanceof mongoose.Types.ObjectId);

        console.log('\n--- Step 2: Test lookup in aggregation ---');
        const aggregation = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $limit: 1 }
        ];

        const results = await Profile.aggregate(aggregation);
        console.log('Lookup result (first 1):', JSON.stringify(results[0].user, null, 2));

        if (results[0].user.length === 0) {
            console.log('!!! LOOKUP FAILED TO FIND USER !!!');
            
            // Try casting userId to ObjectId in lookup
            console.log('\n--- Step 3: Try casting userId to ObjectId in aggregation ---');
            const aggregationWithCast = [
                {
                    $addFields: {
                        userIdObj: { $toObjectId: "$userId" }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userIdObj',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $limit: 1 }
            ];
            const resultsCast = await Profile.aggregate(aggregationWithCast);
            console.log('Lookup with cast result:', resultsCast[0].user.length > 0 ? 'SUCCESS' : 'FAILED');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugAggregation();
