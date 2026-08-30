const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });
const { HfInference } = require('@huggingface/inference');
const mysql = require('mysql2/promise');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// ── Database Setup ──
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'researchos',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const JWT_SECRET = process.env.JWT_SECRET || 'researchos_secret_key';

// ── Auth Middleware ──
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ── Auth Endpoints ──

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    
    const user = { id: result.insertId, username };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];
    
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid username or password' });

    const payload = { id: user.id, username: user.username };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: payload, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get Current User
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// ── Chat Endpoints (MySQL Persisted) ──

// Get all chats for the authenticated user
app.get('/api/chats', authenticateToken, async (req, res) => {
  try {
    const [sessions] = await pool.query(
      'SELECT id, title, updatedAt FROM chat_sessions WHERE userId = ? ORDER BY updatedAt DESC',
      [req.user.id]
    );

    // Fetch messages for all sessions
    for (let session of sessions) {
      const [messages] = await pool.query(
        'SELECT id, role, content, timestamp FROM messages WHERE sessionId = ? ORDER BY timestamp ASC',
        [session.id]
      );
      session.messages = messages;
    }

    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Create a new chat session
app.post('/api/chats', authenticateToken, async (req, res) => {
  const { id, title } = req.body;
  if (!id || !title) return res.status(400).json({ error: 'Missing chat session id or title' });

  try {
    await pool.query(
      'INSERT INTO chat_sessions (id, userId, title) VALUES (?, ?, ?)',
      [id, req.user.id, title]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// Add a message to an existing chat session (and update title/timestamp)
app.put('/api/chats/:id', authenticateToken, async (req, res) => {
  const sessionId = req.params.id;
  const { title, message } = req.body; // message: { id, role, content }

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update session title (and updatedAt implicitly triggers on MySQL)
      await connection.query(
        'UPDATE chat_sessions SET title = ? WHERE id = ? AND userId = ?',
        [title, sessionId, req.user.id]
      );

      // Insert message if provided
      if (message) {
        await connection.query(
          'INSERT INTO messages (id, sessionId, role, content) VALUES (?, ?, ?, ?)',
          [message.id, sessionId, message.role, message.content]
        );
      }

      await connection.commit();
      res.json({ success: true });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update chat' });
  }
});

// Delete a chat session
app.delete('/api/chats/:id', authenticateToken, async (req, res) => {
  const sessionId = req.params.id;
  try {
    await pool.query(
      'DELETE FROM chat_sessions WHERE id = ? AND userId = ?',
      [sessionId, req.user.id]
    );
    // Messages are deleted via CASCADE in DB schema
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

// ── Research OS HF Inference ──
const HF_TOKEN = process.env.HF_TOKEN || '';

if (!HF_TOKEN) {
  console.warn('⚠️  HF_TOKEN is not set in .env — HuggingFace API calls will fail.');
}

const hf = new HfInference(HF_TOKEN);

app.post('/api/query', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  if (!HF_TOKEN) {
    return res.status(503).json({
      error: 'HuggingFace API token is not configured.',
    });
  }

  try {
    const result = await hf.chatCompletion({
      model: 'meta-llama/Llama-3.1-8B-Instruct',
      provider: 'novita',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful deep research assistant. Answer questions thoroughly and accurately.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
      max_tokens: 512,
      temperature: 0.7,
    });

    const answer = result.choices?.[0]?.message?.content?.trim() || 'No response generated.';
    res.json({ answer });
  } catch (err) {
    console.error('Research error:', err?.message || err);
    const msg = err?.message || 'Unknown error';
    const statusCode = msg.includes('401') || msg.toLowerCase().includes('unauthorized') ? 401 : 500;
    res.status(statusCode).json({
      error: statusCode === 401
        ? 'HuggingFace token is invalid or expired. Please check your HF_TOKEN in .env.'
        : 'Failed to process query: ' + msg,
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🔧 Research server listening on http://localhost:${PORT}`);
});
