const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testSearch() {
  try {
    // Note: This needs a token. Since I don't have one easily here, 
    // I might just check if the route is defined correctly in express.
    console.log('Testing search endpoint...');
    const res = await axios.get(`${BASE_URL}/users/search?q=a`);
    console.log('Response:', res.data);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

testSearch();
