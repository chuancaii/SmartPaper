import React, { useState, useRef } from 'react';
import { extractReferencesFromPdf, searchReferenceOnline } from './services/geminiService';
import { ReferenceItem, SearchResult, AppState } from './types';
import Button from './components/Button';
import SearchResultCard from './components/SearchResultCard';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [selectedRefIndex, setSelectedRefIndex] = useState<number | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [manualQuery, setManualQuery] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('请上传 PDF 格式的文件');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('文件过大，请上传小于 20MB 的 PDF');
      return;
    }

    setError(null);
    setAppState(AppState.ANALYZING_PDF);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const refs = await extractReferencesFromPdf(base64);
        setReferences(refs);
        setAppState(AppState.BROWSING_REFS);
      } catch (err: any) {
        setError(err.message || '解析 PDF 失败');
        setAppState(AppState.UPLOAD);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSearchReference = async (item: ReferenceItem, idx: number) => {
    setSelectedRefIndex(idx);
    setSearchResult({ loading: true, summary: '', sources: [] });
    
    try {
      // Prefer searchQuery optimized by Gemini, fallback to content
      const query = item.searchQuery || item.content;
      const result = await searchReferenceOnline(query);
      setSearchResult({ ...result, loading: false });
    } catch (err: any) {
      setSearchResult({ loading: false, summary: '', sources: [], error: err.message });
    }
  };

  const handleManualSearch = async () => {
    if (!manualQuery.trim()) return;
    
    // Deselect list item if manual search
    setSelectedRefIndex(-1); 
    setSearchResult({ loading: true, summary: '', sources: [] });

    try {
      const result = await searchReferenceOnline(manualQuery);
      setSearchResult({ ...result, loading: false });
    } catch (err: any) {
      setSearchResult({ loading: false, summary: '', sources: [], error: err.message });
    }
  };

  const resetApp = () => {
    setAppState(AppState.UPLOAD);
    setReferences([]);
    setSearchResult(null);
    setSelectedRefIndex(null);
    setManualQuery('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl">
              Ref
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">智能文献助手</h1>
          </div>
          {appState !== AppState.UPLOAD && (
            <Button variant="outline" onClick={resetApp} className="text-sm py-1.5 px-3">
              重新上传
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            <span>{error}</span>
          </div>
        )}

        {/* View: Upload */}
        {appState === AppState.UPLOAD && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-lg text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-slate-900">分析论文参考文献</h2>
                <p className="text-slate-500">上传 PDF 论文，自动提取参考文献列表，一键搜索摘要及全文下载链接。</p>
              </div>

              <div 
                className="group border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-2xl p-12 transition-all cursor-pointer bg-white"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-slate-700">点击上传 PDF 文件</p>
                    <p className="text-sm text-slate-400">支持最大 20MB</p>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="application/pdf" 
                  className="hidden" 
                />
              </div>
            </div>
          </div>
        )}

        {/* View: Analyzing */}
        {appState === AppState.ANALYZING_PDF && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-800">正在分析 PDF...</h3>
              <p className="text-slate-500 mt-2">AI 正在识别并提取参考文献列表，请稍候。</p>
            </div>
          </div>
        )}

        {/* View: Browser */}
        {appState === AppState.BROWSING_REFS && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Reference List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700">参考文献列表 ({references.length})</h3>
                </div>
                
                <div className="overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
                  {references.map((ref, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearchReference(ref, idx)}
                      className={`w-full text-left p-3 rounded-lg text-sm transition-colors duration-150 flex gap-3 ${
                        selectedRefIndex === idx 
                          ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' 
                          : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                      }`}
                    >
                      <span className="font-mono font-medium text-slate-400 shrink-0 mt-0.5 w-6 text-right">
                        {ref.index}
                      </span>
                      <span className="line-clamp-3 font-serif leading-relaxed">
                        {ref.content}
                      </span>
                    </button>
                  ))}
                  
                  {references.length === 0 && (
                     <div className="p-8 text-center text-slate-400">
                        未检测到结构化参考文献，请尝试手动搜索。
                     </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Search & Details */}
            <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-24">
              
              {/* Manual Search Input */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-medium text-slate-700 mb-2">手动搜索 / 补充搜索</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={manualQuery}
                    onChange={(e) => setManualQuery(e.target.value)}
                    placeholder="输入参考文献序号或标题..."
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                  />
                  <Button onClick={handleManualSearch} disabled={!manualQuery.trim()} isLoading={searchResult?.loading && selectedRefIndex === -1}>
                    搜索
                  </Button>
                </div>
              </div>

              {/* Selection Prompt */}
              {selectedRefIndex === null && !searchResult && !isProcessing && (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400">
                  <p>请从左侧列表选择一项参考文献，或在上方输入内容进行搜索。</p>
                </div>
              )}

              {/* Selected Reference Preview (before search results) */}
              {selectedRefIndex !== null && selectedRefIndex !== -1 && references[selectedRefIndex] && (
                 <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-1 block">当前选中</span>
                    <p className="text-slate-800 font-serif text-sm leading-relaxed">
                      <span className="font-bold mr-2">{references[selectedRefIndex].index}</span>
                      {references[selectedRefIndex].content}
                    </p>
                 </div>
              )}

              {/* Search Results */}
              {searchResult && (
                <SearchResultCard result={searchResult} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;