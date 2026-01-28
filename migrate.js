const fs = require('fs');
const path = require('path');

async function migrate(pool) {
  try {
    console.log('[Migrate] Verificando se a tabela articles existe...');

    const existsResult = await pool.query(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'articles'
      )`
    );

    if (existsResult.rows[0].exists) {
      console.log('[Migrate] Tabela articles já existe.');
      return;
    }

    console.log('[Migrate] Criando tabela articles...');

    await pool.query(`
      CREATE TABLE articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE,
        category VARCHAR(100),
        description TEXT,
        content TEXT,
        keywords TEXT[],
        difficulty VARCHAR(50),
        url VARCHAR(1000),
        scraped_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE 'pgsql'
    `);

    await pool.query(`
      CREATE TRIGGER update_articles_updated_at 
      BEFORE UPDATE ON articles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    await pool.query(`
      CREATE INDEX idx_articles_fts 
      ON articles USING GIN(to_tsvector('portuguese', COALESCE(title, '') || ' ' || COALESCE(content, '')))
    `);

    await pool.query(`
      CREATE INDEX idx_articles_keywords 
      ON articles USING GIN(keywords)
    `);

    console.log('[Migrate] Tabela articles criada com sucesso!');
  } catch (err) {
    console.error('[Migrate] Erro ao executar migração:', err.message);
    throw err;
  }
}

module.exports = migrate;
