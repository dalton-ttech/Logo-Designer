import React, { useEffect, useState } from 'react';
import { Key, Save, X } from 'lucide-react';
import { getApiKey } from '../services/geminiService';

export const ApiKeySelector: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [manualKey, setManualKey] = useState("");

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    // 1. Check Env Vars or Local Storage
    const existingKey = getApiKey();
    if (existingKey) {
      setHasKey(true);
      return;
    }

    // 2. Check AI Studio (Project IDX)
    if ((window as any).aistudio) {
      try {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        if (selected) {
          setHasKey(true);
          return;
        }
      } catch (e) {
        console.warn("AI Studio check failed", e);
      }
    }

    setHasKey(false);
    // Automatically show input if no key is found
    setShowInput(true);
  };

  const handleSaveManualKey = () => {
    if (!manualKey.trim()) return;
    localStorage.setItem('gemini_api_key', manualKey.trim());
    setHasKey(true);
    setShowInput(false);
    window.location.reload(); // Reload to ensure service picks up the new key
  };

  const handleAIStudioSelect = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setHasKey(true);
      setShowInput(false);
    }
  };

  // If we have a key and input is hidden, show nothing or a small settings trigger
  if (hasKey && !showInput) {
    return (
      <div className="fixed bottom-4 right-4 z-50 opacity-50 hover:opacity-100 transition-opacity">
         <button 
           onClick={() => setShowInput(true)}
           className="p-2 bg-black/40 text-slate-400 rounded-full hover:text-white hover:bg-black/60 border border-white/5"
           title="API Key Settings"
         >
           <Key size={14} />
         </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 relative">
        {hasKey && (
           <button 
             onClick={() => setShowInput(false)}
             className="absolute top-4 right-4 text-slate-500 hover:text-white"
           >
             <X size={20} />
           </button>
        )}
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-500/10 rounded-full text-purple-400">
            <Key size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">配置 API Key</h2>
            <p className="text-xs text-slate-400">需要 Gemini API Key 才能生成图像</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">手动输入 Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={manualKey}
                onChange={(e) => setManualKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
              />
              <button
                onClick={handleSaveManualKey}
                disabled={!manualKey}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save size={16} /> 保存
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              您的 Key 仅存储在本地浏览器 (LocalStorage) 中，不会发送到我们的服务器。
              <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-purple-400 hover:underline ml-1">
                获取 Key &rarr;
              </a>
            </p>
          </div>

          {(window as any).aistudio && (
            <>
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-slate-600 text-xs">OR</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <button
                onClick={handleAIStudioSelect}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300 font-medium transition-colors"
              >
                使用 AI Studio 快速链接
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};