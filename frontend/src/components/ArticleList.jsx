import React from 'react';

const ArticleList = ({ articles, loading, onSelectArticle }) => {
  if (loading) {
    return <div className="text-center py-8 text-gray-500">Carregando...</div>;
  }

  if (!articles || articles.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nenhum artigo encontrado</div>;
  }

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <div
          key={article.id}
          onClick={() => onSelectArticle && onSelectArticle(article)}
          className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
        >
          <h3 className="font-semibold text-gray-900 mb-1">{article.title}</h3>
          {article.category && (
            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {article.category}
            </span>
          )}
          {article.description && (
            <p className="text-sm text-gray-600 mt-2">{article.description.substring(0, 200)}...</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ArticleList;
