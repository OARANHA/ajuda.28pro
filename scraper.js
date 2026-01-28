const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function cleanContent(content, categorySlug) {
  if (!content) return content;
  
  let cleaned = content;
  
  cleaned = cleaned.replace(/https:\/\/aprendaerp\.gitbook\.io\//g, '/');
  cleaned = cleaned.replace(/https:\/\/ajuda\.aprendaerp\.com\.br\//g, '/');
  cleaned = cleaned.replace(/http:\/\/ajuda\.aprendaerp\.com\.br\//g, '/');
  
  const links = cleaned.match(/href=["']([^"']+)["']/g);
  if (links) {
    links.forEach(link => {
      const urlMatch = link.match(/href=["']([^"']+)["']/);
      if (urlMatch) {
        let url = urlMatch[1];
        if (url.startsWith('/') && !url.startsWith('//')) {
          const relativePath = url.substring(1);
          const newPath = `/${categorySlug}/${relativePath}`;
          cleaned = cleaned.replace(url, `/${newPath}`);
        }
      }
    });
  }
  
  return cleaned;
}

async function scrape() {
  const dbId = '6769d09365797380ed48483f';
  const centralSlug = 'aprenda-erp';
  const apiBaseUrl = `https://ajuda.aprendaerp.com.br/backend/api/public/docs/${dbId}`;
  
  console.log('Iniciando scraper via API de:', centralSlug);

  try {
    console.log('Buscando estrutura de categorias...');
    const { data: categories } = await axios.get(`${apiBaseUrl}/central/${centralSlug}`);
    
    console.log(`Encontradas ${categories.length} categorias.`);
    
    let totalDocuments = 0;
    let totalProcessed = 0;

    for (const cat of categories) {
      console.log(`\nCategoria: ${cat.nome} (${cat.slug})`);
      
      if (!cat.documentos || cat.documentos.length === 0) {
        console.log('  Nenhum documento encontrado nesta categoria.');
        continue;
      }

      console.log(`  ${cat.documentos.length} documentos encontrados.`);
      totalDocuments += cat.documentos.length;

      for (const doc of cat.documentos) {
        console.log(`  Processando: ${doc.titulo}`);
        totalProcessed++;

        try {
          const { data: articleData } = await axios.get(
            `${apiBaseUrl}/section/${cat.slug}/doc/${doc.slug}`
          );

          const content = articleData.conteudoHtml || articleData.conteudo;
          const cleanedContent = await cleanContent(content, cat.slug);
          const articleUrl = `https://ajuda.28pro.com.br/${cat.slug}/${doc.slug}`;

          await pool.query(
            `INSERT INTO articles (title, category, content, description, url) 
               VALUES ($1, $2, $3, $4, $5) 
               ON CONFLICT (url) DO UPDATE 
               SET content = $3, description = $4`,
            [
              articleData.titulo,
              cat.nome,
              cleanedContent,
              articleData.conteudo ? articleData.conteudo.substring(0, 500) : '',
              articleUrl
            ]
          );

          console.log(`    ✓ Salvo com sucesso`);
        } catch (e) {
          console.error(`    ✗ Erro ao processar documento ${doc.slug}:`, e.message);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`\n=== Scrapping finalizado ===`);
    console.log(`Total de categorias: ${categories.length}`);
    console.log(`Total de documentos: ${totalDocuments}`);
    console.log(`Total processados: ${totalProcessed}`);
  } catch (err) {
    console.error('Erro no scraper:', err.message);
  } finally {
    await pool.end();
  }
}

scrape();
