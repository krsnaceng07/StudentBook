const { supabaseAdmin } = require('../config/supabase');

const getStudyFeed = async (req, res) => res.json({ success: true, data: [] });
const createStudyPost = async (req, res) => res.json({ success: true, data: {} });
const askQuestion = async (req, res) => res.json({ success: true, data: {} });
const answerQuestion = async (req, res) => res.json({ success: true, data: {} });
const getQuestions = async (req, res) => res.json({ success: true, data: [] });
const getQuestionById = async (req, res) => res.json({ success: true, data: {} });
const voteAnswer = async (req, res) => res.json({ success: true, data: {} });
const getTopContributors = async (req, res) => res.json({ success: true, data: [] });

module.exports = { getStudyFeed, createStudyPost, getQuestions, askQuestion, answerQuestion, getQuestionById, voteAnswer, getTopContributors };
