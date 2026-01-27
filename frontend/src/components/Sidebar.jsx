import React from 'react';
import { ChevronRight, X } from 'lucide-react';

const Sidebar = ({ categories, selectedCategory, onSelectCategory, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-80 bg-white border-r border-gray-200 z-30
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">28</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">28Pro ERP</h2>
                <p className="text-xs text-gray-500">Base de Conhecimento</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
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
                  w-full flex items-center justify-between px-4 py-3 rounded-lg text-left
                  transition-colors duration-200
                  ${
                    !selectedCategory
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <span>Todos os Artigos</span>
                <ChevronRight size={16} />
              </button>

              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => onSelectCategory(category.name)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-lg text-left
                    transition-colors duration-200
                    ${
                      selectedCategory === category.name
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <span>{category.name}</span>
                  <div className="flex items-center gap-2">
                    {category.count && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    )}
                    <ChevronRight size={16} />
                  </div>
                </button>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p>Sistema 28ProAjuda v1.0</p>
              <p className="mt-1">Powered by Groq AI</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
