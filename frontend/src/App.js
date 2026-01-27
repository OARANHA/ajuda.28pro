import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ArticleList from './components/ArticleList';
import ChatIA from './components/ChatIA';

function App() {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
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
    fetchArticles(category, searchQuery);
  };

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
            category={selectedCategory}
          />
        </main>
      </div>

      {/* Chat IA */}
      <ChatIA apiUrl={API_URL} />
    </div>
  );
}

export default App;
