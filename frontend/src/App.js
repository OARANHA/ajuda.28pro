import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Menu, X, ArrowLeft, BookOpen, Sparkles, XCircle } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ArticleList from './components/ArticleList';
import ChatIA from './components/ChatIA';

function App() {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

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

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/search`, { params: { q: query, limit: 5 } });
      setSuggestions(response.data.results || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery) {
        fetchSuggestions(searchQuery);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }
    
    setSearching(true);
    fetchArticles(selectedCategory, searchQuery)
      .finally(() => {
        setSearching(false);
        setShowSuggestions(false);
      });
  };

  const handleSuggestionClick = (article) => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedArticle(article);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedArticle(null);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    fetchArticles(category);
  };

  const handleArticleSelect = (article) => {
    setSelectedArticle(article);
  };

  const handleBack = () => {
    setSelectedArticle(null);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query.split(' ').join('|')})`, 'gi');
    return text.replace(regex, match => `<mark class="bg-yellow-200 rounded px-1">${match}</mark>`);
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex">
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
          <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Voltar</span>
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{selectedArticle.title}</h1>
                {selectedArticle.category && (
                  <span className="inline-flex items-center px-3 py-1 text-sm bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full ml-3 shadow-sm">
                    {selectedArticle.category}
                  </span>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 py-8 w-full">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                <div
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
                <style>{`
                  .article-content { min-height: calc(100vh - 150px); }
                  .article-content mark { background-color: #fef08a; padding: 0.125rem 0.25rem; border-radius: 0.25rem; }
                  .article-content h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; color: #1e293b; }
                  .article-content h2 { font-size: 1.5rem; font-weight: 600; margin-top: 2.5rem; margin-bottom: 1rem; color: #334155; }
                  .article-content h3 { font-size: 1.25rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; color: #475569; }
                  .article-content p { margin-bottom: 1.25rem; line-height: 1.8; color: #64748b; }
                  .article-content ul { margin-bottom: 1.25rem; padding-left: 1.75rem; }
                  .article-content li { margin-bottom: 0.75rem; line-height: 1.7; }
                  .article-content a { color: #2563eb; text-decoration: none; font-weight: 500; transition: color 0.2s; }
                  .article-content a:hover { color: #1d4ed8; text-decoration: underline; }
                  .article-content img { max-width: 100%; height: auto; border-radius: 0.75rem; margin: 1.5rem 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                  .article-content strong { font-weight: 600; color: #1e293b; }
                `}</style>
              </div>
            </div>
          </main>
        </div>

        {/* Chat IA */}
        <ChatIA apiUrl={API_URL} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex">
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
        <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex items-center gap-3 flex-1">
              <img
                src="/logo.png"
                alt="28ProAjuda Logo"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">28ProAjuda</h1>
                <p className="text-sm text-gray-500">Sistema de Ajuda 28Pro ERP Cloud</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar artigos, tutoriais..."
                  autoFocus={selectedArticle === null}
                  className={`w-full pl-12 pr-10 py-3 bg-white border-2 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 shadow-sm ${searching ? 'ring-2 ring-blue-500' : ''}`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle size={18} className="text-gray-400" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="absolute right-2 top-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={20} />
              </button>
            </form>
          </div>
        </header>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="fixed top-20 left-1/2 right-1/2 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200">
            <div className="p-3 border-b border-gray-200">
              <p className="text-sm text-gray-500 font-medium">Sugestões</p>
              <button
                onClick={() => setShowSuggestions(false)}
                className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {suggestions.map((article, index) => (
                <button
                  key={article.id}
                  onClick={() => handleSuggestionClick(article)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {article.title.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm group-hover:text-blue-700">
                      {article.title}
                    </h4>
                    {article.category && (
                      <span className="text-xs text-gray-500 ml-2">{article.category}</span>
                    )}
                  </div>
                  <ArrowLeft size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
            <div className="p-2 bg-gray-50 text-center text-xs text-gray-500">
              Pressione <kbd className="bg-gray-200 px-1.5 py-0.5 rounded font-mono">Enter</kbd> para buscar
            </div>
          </div>
        )}

        {/* Articles */}
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse flex flex-col items-center gap-3">
                <BookOpen size={48} className="text-blue-600" />
                <p className="text-gray-500 font-medium">Carregando artigos...</p>
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <BookOpen size={64} className="text-gray-300" />
              <p className="mt-4 text-gray-500 font-medium">Nenhum artigo encontrado</p>
              <p className="text-sm text-gray-400">Tente buscar por outros termos ou selecione outra categoria</p>
            </div>
          ) : (
            <ArticleList
              articles={articles}
              onSelectArticle={handleArticleSelect}
              highlightQuery={searchQuery}
            />
          )}
        </main>
      </div>

      {/* Chat IA */}
      <ChatIA apiUrl={API_URL} />
    </div>
  );
}

export default App;
