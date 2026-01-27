const axios = require('axios');
const cheerio = require('cheerio');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function scrape() {
  const baseUrl = 'https://ajuda.aprendaerp.com.br';
  console.log('Iniciando scraper em:', baseUrl);

  try {
    const { data } = await axios.get(baseUrl);
    const $ = cheerio.load(data);
    
    const categories = [];
    $('button.category-btn, .sidebar-menu a, .menu-item a').each((i, el) => {
        const name = $(el).text().replace(/\d+$/, '').trim();
        let href = $(el).attr('href');
        if (href && !href.startsWith('http')) href = baseUrl + href;
        if (href && href.includes(baseUrl) && name) {
            categories.push({ name, url: href });
        }
    });

    console.log(`Encontradas ${categories.length} categorias.`);

    for (const cat of categories) {
        console.log(`Scraping categoria: ${cat.name}`);
        try {
            const { data: catData } = await axios.get(cat.url);
            const $cat = cheerio.load(catData);
            
            const articles = [];
            $cat('a.article-link, .article-list a, .list-group-item a').each((i, el) => {
                const title = $(el).text().trim();
                let url = $(el).attr('href');
                if (url && !url.startsWith('http')) url = baseUrl + url;
                if (url && url.includes(baseUrl)) {
                    articles.push({ title, url });
                }
            });

            for (const art of articles) {
                console.log(`  Lendo artigo: ${art.title}`);
                try {
                    const { data: artData } = await axios.get(art.url);
                    const $art = cheerio.load(artData);
                    const content = $art('.article-content, .content, #root').html() || '';
                    const textContent = $art('.article-content, .content, #root').text().trim();

                    await pool.query(
                        'INSERT INTO articles (title, category, content, description, url) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (url) DO UPDATE SET content = $3, description = $4',
                        [art.title, cat.name, content, textContent.substring(0, 500), art.url]
                    );
                } catch (e) {
                    console.error(`Erro ao processar artigo ${art.url}:`, e.message);
                }
            }
        } catch (e) {
            console.error(`Erro ao processar categoria ${cat.url}:`, e.message);
        }
    }
    console.log('Scraping finalizado com sucesso.');
  } catch (err) {
    console.error('Erro no scraper:', err.message);
  } finally {
    await pool.end();
  }
}

scrape();
