const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { Groq } = require('groq-sdk');
const Redis = require('ioredis');
const migrate = require('./migrate');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Conexões
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Health
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
});

// Verificação da tabela articles
app.get('/api/articles/exists', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'articles'
      )`
    );
    res.json({ exists: result.rows[0].exists });
  } catch (err) {
    console.error('Erro ao verificar tabela articles:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/articles', async (req, res) => {
  try {
    console.log('[DEBUG] GET /api/articles - Requisição recebida');
    const { category, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM articles WHERE true';
    const params = [];
    
    if (category) {
      params.push(category);
      query += ' AND category = $' + params.length;
    }
    
    params.push(limit);
    query += ' ORDER BY updated_at DESC LIMIT $' + params.length;
    
    const result = await pool.query(query, params);
    console.log(`[DEBUG] GET /api/articles - ${result.rows.length} artigos encontrados`);
    res.json({ articles: result.rows, total: result.rowCount });
  } catch (err) {
    console.error('[DEBUG] Erro em GET /api/articles:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    console.log('[DEBUG] GET /api/categories - Requisição recebida');
    const result = await pool.query(
      'SELECT category, COUNT(*) as count FROM articles GROUP BY category ORDER BY category ASC'
    );
    const categories = result.rows.map(row => ({ name: row.category, count: parseInt(row.count) }));
    console.log(`[DEBUG] GET /api/categories - ${categories.length} categorias encontradas`);
    res.json({ categories });
  } catch (err) {
    console.error('[DEBUG] Erro em GET /api/categories:', err);
    res.status(500).json({ error: err.message });
  }
});

// Busca FTS
app.post('/api/search', async (req, res) => {
  const { query, limit = 5 } = req.body;
  const result = await pool.query(
    `SELECT *, ts_rank(to_tsvector('portuguese', COALESCE(title||' '||content, '')), plainto_tsquery('portuguese', $1)) AS rank
     FROM articles WHERE to_tsvector('portuguese', COALESCE(title||' '||content, '')) @@ plainto_tsquery('portuguese', $1)
     ORDER BY rank DESC LIMIT $2`,
    [query, limit]
  );
  res.json({ results: result.rows });
});

// RAG Groq
app.post('/api/ask', async (req, res) => {
  const { question } = req.body;
  const docs = await pool.query(
    `SELECT title, content FROM articles 
     WHERE to_tsvector('portuguese', title||' '||content) @@ plainto_tsquery('portuguese', $1)
     ORDER BY ts_rank DESC LIMIT 3`, [question]
  );

  const context = docs.rows.map(r => `${r.title}: ${r.content}`).join('\n');
  const prompt = `Especialista 28Pro ERP. Use apenas contexto:\n${context}\n\nPergunta: ${question}`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'mixtral-8x7b-32768',
    temperature: 0.1
  });

  res.json({
    answer: completion.choices[0].message.content,
    sources: docs.rows.map(r => r.title)
  });
});

app.post('/api/migrate', async (req, res) => {
  try {
    await migrate(pool);
    res.json({ success: true, message: 'Migração executada com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

(async () => {
  try {
    await migrate(pool);
    app.listen(3000, () => console.log('28ProAjuda API:3000'));
  } catch (err) {
    console.error('[Startup] Erro ao iniciar API:', err);
    process.exit(1);
  }
})();