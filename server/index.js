// server/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { OpenAI } = require('openai');
const { ChatOpenAI } = require('langchain/chat_models/openai');
const { LLMChain } = require('langchain/chains');
const { PromptTemplate } = require('langchain/prompts');

const app = express();
app.use(cors());
app.use(express.json());

// Simple research chain using OpenAI Chat model
const chatModel = new ChatOpenAI({
  temperature: 0.7,
  modelName: 'gpt-4o-mini', // adjust as needed
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const prompt = PromptTemplate.fromTemplate(`You are a deep research assistant. Perform multi-step reasoning to answer the user's query comprehensively. Provide a concise answer and cite sources when appropriate.

User query: {question}`);

const chain = new LLMChain({ llm: chatModel, prompt });

app.post('/api/query', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Missing query in request body' });
  }
  try {
    const result = await chain.invoke({ question: query });
    res.json({ answer: result.text });
  } catch (error) {
    console.error('Research error:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔧 Research server listening on http://localhost:${PORT}`);
});
