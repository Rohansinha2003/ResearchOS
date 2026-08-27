// server/index.cjs
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/query', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    // Dynamically import the ESM-only @huggingface/inference
    const { HfInference } = await import('@huggingface/inference');
    const hf = new HfInference(process.env.HF_TOKEN || '');

    const result = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.3',
      inputs: `<s>[INST] You are a helpful deep research assistant. Answer the following question thoroughly:\n\n${query} [/INST]`,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.7,
        return_full_text: false,
      },
    });

    const answer = result.generated_text?.trim() || 'No response generated.';
    res.json({ answer });
  } catch (err) {
    console.error('Research error:', err?.message || err);
    res.status(500).json({ error: 'Failed to process query: ' + (err?.message || 'Unknown error') });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔧 Research server listening on http://localhost:${PORT}`);
});
