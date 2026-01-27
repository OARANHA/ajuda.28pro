import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ArticleList = ({ onSelectArticle }) => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let url = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/articles`;
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await axios.get(url);
      setArticles(response.data);
    } catch (error) {
      console.error('Erro ao buscar artigos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Filtros */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 space-y-3">
        <input
          type="text"
          placeholder="Buscar artigos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Artigos */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Nenhum artigo encontrado</div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{article.title}</h3>
                {article.category && (
                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {article.category}
                  </span>
                )}
                {article.excerpt && (
                  <p className="text-sm text-gray-600 mt-2">{article.excerpt}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleList;
