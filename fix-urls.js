const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixUrls() {
  console.log('Atualizando URLs dos artigos para ajuda.28pro.com.br...');
  
  try {
    const result = await pool.query(
      'SELECT id, title, category, url, slug FROM articles'
    );
    
    console.log(`Encontrados ${result.rows.length} artigos para atualizar.`);
    
    let updated = 0;
    
    for (const article of result.rows) {
      const oldUrl = article.url;
      
      if (oldUrl.includes('aprendaerp.gitbook.io') || oldUrl.includes('ajuda.aprendaerp.com.br')) {
        
        const slug = article.slug;
        const categorySlug = article.category ? article.category.toLowerCase().replace(/\s+/g, '-') : 'geral';
        const newUrl = `https://ajuda.28pro.com.br/${categorySlug}/${slug}`;
        
        await pool.query(
          'UPDATE articles SET url = $1 WHERE id = $2',
          [newUrl, article.id]
        );
        
        console.log(`✓ ${article.title.substring(0, 50)}... - Atualizado`);
        updated++;
      }
    }
    
    console.log(`\n=== Total atualizado: ${updated} de ${result.rows.length} artigos ===`);
    
  } catch (err) {
    console.error('Erro ao atualizar URLs:', err.message);
  } finally {
    await pool.end();
  }
}

fixUrls();
