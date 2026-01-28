import React from 'react';
import { ChevronRight, X, Book } from 'lucide-react';

const Sidebar = ({ categories, selectedCategory, onSelectCategory, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-80 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200/50 z-30
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">28</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">28Pro ERP</h2>
                <p className="text-xs text-gray-500">Base de Conhecimento</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Categories */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              <button
                onClick={() => onSelectCategory(null)}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl text-left
                  transition-all duration-200 shadow-sm
                  ${
                    !selectedCategory
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md'
                      : 'bg-white hover:bg-gray-50 text-gray-700 hover:shadow-md'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <Book size={18} />
                  <span>Todos os Artigos</span>
                </span>
                {!selectedCategory && <ChevronRight size={16} />}
              </button>

              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => onSelectCategory(category.name)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl text-left
                    transition-all duration-200 shadow-sm
                    ${
                      selectedCategory === category.name
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md'
                        : 'bg-white hover:bg-gray-50 text-gray-700 hover:shadow-md'
                    }
                  `}
                >
                  <span className="flex-1">{category.name}</span>
                  <div className="flex items-center gap-2">
                    {category.count && (
                      <span className="text-xs bg-white/90 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                        {category.count}
                      </span>
                    )}
                    {selectedCategory !== category.name && <ChevronRight size={16} />}
                  </div>
                </button>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200/50">
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p className="font-medium">28ProAjuda v1.0</p>
              <p>Powered by 28Web</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
