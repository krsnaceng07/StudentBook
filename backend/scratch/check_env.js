require('dotenv').config();
console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
  console.log('Key prefix:', process.env.GEMINI_API_KEY.substring(0, 5));
}
