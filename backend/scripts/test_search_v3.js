const testSearch = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/v1/search/unified?q=react');
    console.log('Search Result Status:', res.status);
    const data = await res.json();
    if (data.data) console.log('Data Keys:', Object.keys(data.data));
  } catch (err) {
    console.error('Search Test Failed:', err.message);
  }
};

testSearch();
