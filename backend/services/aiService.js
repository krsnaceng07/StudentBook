const Groq = require("groq-sdk");
const { tavily } = require("@tavily/core");

/**
 * AI Service for Smart Study Hub
 * Integrates with Groq (Llama 3.3) + Tavily for Real-time Data
 */

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const getGeminiResponse = async (query, field = "General") => {
  try {
    console.log(`[AI] Processing query: "${query}" for field: ${field}`);
    
    // 1. Perform a real-time search via Tavily
    let searchContext = "";
    try {
      const searchResponse = await tvly.search(query, {
        searchDepth: "basic",
        maxResults: 5
      });
      
      searchContext = searchResponse.results.map(r => 
        `Source: ${r.url}\nTitle: ${r.title}\nContent: ${r.content}`
      ).join("\n\n");
      
      console.log(`[AI] Tavily search completed. Context length: ${searchContext.length}`);
    } catch (searchError) {
      console.error("[AI] Tavily Search Error:", searchError.message);
      searchContext = "No real-time data available due to search error.";
    }

    // 2. Prepare the prompt with grounding data (Refined for Students & Multilingual)
    const systemPrompt = `
      You are the "StudentSociety AI Mentor," a helpful academic assistant.
      
      IDENTITY & LANGUAGE:
      - Your name is StudentSociety AI Mentor.
      - ALWAYS respond in the SAME LANGUAGE as the user (e.g., if they ask in Nepali, reply in Nepali).
      - Be friendly, encouraging, and clear.

      CONTEXT FROM WEB SEARCH:
      ${searchContext}

      OUTPUT RULES:
      1. If the query is a simple greeting, personal question (e.g., "What is your name?"), or a casual chat, respond naturally and briefly without using the academic structure.
      2. For ACADEMIC/STUDY queries, use this structure:
         
         📖 **Quick Concept**: (Brief explanation)
         🔍 **Detailed Explanation**: (Bullet points)
         ✨ **Real-time Context**: (Latest info from search context)
         💡 **Student Tip**: (Practical study/exam tip)
         🔗 **Top Resources**: (Max 2-3 links)
         🏷️ **Related Topics**: #Tags
      
      3. Use emojis to keep it engaging.
      4. Relate information to the student's field (${field}) if it adds value.
    `;

    // 3. Generate response via Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 1500,
    });

    const text = chatCompletion.choices[0]?.message?.content || "";

    return {
      answer: text,
      suggestedTags: [] 
    };
  } catch (error) {
    console.error("[AI] Service Error:", error);
    throw new Error("AI service is currently unavailable. Please try again later.");
  }
};

module.exports = { getGeminiResponse };
