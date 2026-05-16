require('dotenv').config();
const { getGeminiResponse } = require('../services/aiService');

const testGroq = async () => {
  console.log('Testing Groq Integration...');
  console.log('GROQ_API_KEY present:', !!process.env.GROQ_API_KEY);
  
  try {
    const result = await getGeminiResponse('Hello, tell me about DBMS');
    console.log('Success:', result.answer.substring(0, 100) + '...');
  } catch (err) {
    console.error('Error in test:', err.message);
    if (err.stack) console.error(err.stack);
  }
};

testGroq();
