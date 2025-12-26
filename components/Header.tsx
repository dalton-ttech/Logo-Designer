import React from 'react';
import { Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-40 px-8 py-4 flex items-center justify-between bg-black/20 backdrop-blur-xl border-b border-white/5 shadow-sm transition-all">
      <div className="flex items-center gap-2 group cursor-default">
        <Sparkles className="w-5 h-5 text-purple-400 opacity-90" strokeWidth={2} />
        <h1 className="text-xl font-bold tracking-tight text-slate-100">
          Turing Studio
        </h1>
        <span className="inline-block w-2 h-5 bg-slate-100/50 animate-pulse ml-0.5 rounded-sm" />
      </div>
      
      <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-400">
        <span className="hover:text-purple-400 transition-colors cursor-pointer">关于</span>
        <span className="hover:text-purple-400 transition-colors cursor-pointer">画廊</span>
        <span className="hover:text-purple-400 transition-colors cursor-pointer">登录</span>
      </div>
    </header>
  );
};