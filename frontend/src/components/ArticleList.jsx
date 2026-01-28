import React from 'react';
import { ArrowRight, FileText } from 'lucide-react';

const ArticleList = ({ articles, loading, onSelectArticle, highlightQuery = '' }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <FileText size={64} className="text-blue-600/50" />
          <p className="text-gray-500 font-medium">Carregando artigos...</p>
        </div>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FileText size={64} className="text-gray-300" />
        <p className="mt-4 text-gray-500 font-medium">Nenhum artigo encontrado</p>
        <p className="text-sm text-gray-400">Tente buscar por outros termos ou selecione outra categoria</p>
      </div>
    );
  }

  const highlightText = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query.split(' ').join('|')})`, 'gi');
    return text.replace(regex, match => `<mark class="bg-yellow-200 rounded px-1">${match}</mark>`);
  };

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <div
          key={article.id}
          onClick={() => onSelectArticle && onSelectArticle(article)}
          className="group bg-white rounded-2xl border border-gray-200/50 p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-white font-bold text-lg">
                {article.title.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">
                {highlightQuery ? highlightText(article.title, highlightQuery) : article.title}
              </h3>
            </div>
            <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
          </div>
          
          {article.category && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-lg shadow-sm">
                {article.category}
              </span>
            </div>
          )}
          
          {article.description && (
            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
              {highlightQuery ? highlightText(article.description, highlightQuery) : article.description.substring(0, 250)}
              ...
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ArticleList;
