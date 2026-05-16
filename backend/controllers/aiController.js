const { getGeminiResponse } = require('../services/aiService');

// @desc    Ask AI a study question
// @route   POST /api/v1/ai/ask
// @access  Private
const askAI = async (req, res) => {
  const { query, field } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, message: 'Please provide a query' });
  }

  try {
    const aiData = await getGeminiResponse(query, field || req.user?.field || 'General');
    
    res.status(200).json({
      success: true,
      data: aiData,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { askAI };
