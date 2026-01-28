import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Menu, X, ArrowLeft } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ArticleList from './components/ArticleList';
import ChatIA from './components/ChatIA';

function App() {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'https://ajuda.28pro.com.br/api';

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const fetchArticles = async (category = null, search = '') => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;
      if (search) params.q = search;
      
      const response = await axios.get(`${API_URL}/articles`, { params });
      setArticles(response.data.articles || []);
    } catch (error) {
      console.error('Erro ao buscar artigos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArticles(selectedCategory, searchQuery);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedArticle(null);
    fetchArticles(category, searchQuery);
  };

  const handleArticleSelect = (article) => {
    setSelectedArticle(article);
  };

  const handleBack = () => {
    setSelectedArticle(null);
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Voltar</span>
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{selectedArticle.title}</h1>
                {selectedArticle.category && (
                  <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full ml-3">
                    {selectedArticle.category}
                  </span>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full overflow-y-auto">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div 
                className="article-content"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />
              <style>{`
                .article-content h1 { font-size: 2rem; font-weight: bold; margin-bottom: 1rem; }
                .article-content h2 { font-size: 1.5rem; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem; }
                .article-content h3 { font-size: 1.25rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                .article-content p { margin-bottom: 1rem; line-height: 1.75; color: #374151; }
                .article-content ul { margin-bottom: 1rem; padding-left: 1.5rem; }
                .article-content li { margin-bottom: 0.5rem; }
                .article-content a { color: #2563eb; text-decoration: underline; }
                .article-content a:hover { color: #1d4ed8; }
                .article-content img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0; }
                .article-content strong { font-weight: 600; }
              `}</style>
            </div>
          </main>
        </div>

        {/* Chat IA */}
        <ChatIA apiUrl={API_URL} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">28ProAjuda</h1>
              <p className="text-sm text-gray-600">Sistema de Ajuda 28Pro ERP Cloud</p>
            </div>

            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar documentação..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>
          </div>
        </header>

        {/* Articles */}
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <ArticleList
            articles={articles}
            loading={loading}
            onSelectArticle={handleArticleSelect}
          />
        </main>
      </div>

      {/* Chat IA */}
      <ChatIA apiUrl={API_URL} />
    </div>
  );
}

export default App;
