import React from 'react';
import { SearchResult } from '../types';
import ReactMarkdown from 'react-markdown';

interface SearchResultCardProps {
  result: SearchResult;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ result }) => {
  if (result.loading) {
    return (
      <div className="mt-4 p-6 bg-white rounded-xl border border-slate-200 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2 mt-6"></div>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
        <p>{result.error}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 p-6 bg-white rounded-xl border border-blue-100 shadow-lg ring-1 ring-blue-50">
      <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
        <span className="text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
        </span>
        论文智能摘要
      </h3>
      
      <div className="prose prose-sm prose-slate max-w-none text-slate-600 mb-6 bg-slate-50 p-4 rounded-lg">
        <ReactMarkdown>{result.summary}</ReactMarkdown>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">来源与下载链接</h4>
        {result.sources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.sources.map((source, idx) => (
              <a 
                key={idx}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <div className="bg-slate-100 p-2 rounded-md group-hover:bg-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-700">
                    {source.title || 'External Source'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{new URL(source.uri).hostname}</p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">暂无直接链接，请尝试根据摘要手动搜索。</p>
        )}
      </div>
    </div>
  );
};

export default SearchResultCard;