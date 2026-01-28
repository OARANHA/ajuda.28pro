-- Schema PostgreSQL otimizado 28ProAjuda
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Tabela articles (scraping ajuda.aprendaerp.com.br)
DROP TABLE IF EXISTS articles CASCADE;

CREATE TABLE IF NOT EXISTS articles (
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
);

-- Índices GIN para RAG
CREATE INDEX CONCURRENTLY idx_articles_fts ON articles USING GIN(to_tsvector('portuguese', COALESCE(title, '') || ' ' || COALESCE(content, '')));
CREATE INDEX CONCURRENTLY idx_articles_keywords ON articles USING GIN(keywords);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'pgsql';

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();