import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { TypeSelector } from './components/TypeSelector';
import { ResultCard } from './components/ResultCard';
import { ApiKeySelector } from './components/ApiKeySelector';
import { LogoType, GenerationParams, GeneratedResult } from './types';
import { generateLogoPrompt, generateLogoImage } from './services/geminiService';
import { ChevronDown, ChevronRight, Wand2, Hash, Tag, Type as TypeIcon } from 'lucide-react';

export default function App() {
  // Input State
  const [brandName, setBrandName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [logoType, setLogoType] = useState<LogoType>(LogoType.Wordmark);
  const [bgStyle, setBgStyle] = useState("");
  const [extraDesc, setExtraDesc] = useState("");
  const [gradientTarget, setGradientTarget] = useState("");
  const [abstractTarget, setAbstractTarget] = useState("");

  // UI State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(""); // "Translating intent...", "Designing geometry..."
  const [result, setResult] = useState<GeneratedResult | null>(null);

  const handleGenerate = async () => {
    if (!brandName) {
      alert("请输入品牌名称。");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Step 1: Text to Prompt (Gemini Pro)
      setLoadingStep("正在解析设计意图...");
      const params: GenerationParams = {
        brandName,
        keywords,
        logoType,
        backgroundStyle: bgStyle,
        gradientTarget,
        abstractTarget,
        extraDesc
      };

      const promptData = await generateLogoPrompt(params);

      // Step 2: Prompt to Image (Gemini Image Pro)
      setLoadingStep("正在构建几何图形...");
      
      // Artificial delay for the "Designing" feeling if step 1 was too fast
      await new Promise(r => setTimeout(r, 800)); 
      
      setLoadingStep("正在渲染光影质感...");
      const imageUrl = await generateLogoImage(promptData.english_prompt);

      setResult({
        imageUrl,
        explanation: promptData.chinese_explanation
      });
      
    } catch (error: any) {
      console.error("Generation Error:", error);
      
      const isForbidden = error.message?.includes('403') || error.status === 403 || error.message?.includes('PERMISSION_DENIED');
      const isQuotaExceeded = error.message?.includes('429') || error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED');
      const isAllImagesExhausted = error.message === "ALL_IMAGE_MODELS_EXHAUSTED";

      if (isForbidden) {
        const confirmRetry = confirm("权限不足 (403 Permission Denied)。\n\n这通常是因为当前选择的 API Key 没有访问 Gemini 3 Pro 模型的权限，或者该项目未启用计费。\n\n是否重新选择 API Key？");
        if (confirmRetry) {
          if ((window as any).aistudio) {
            await (window as any).aistudio.openSelectKey();
            // Reset loading state but don't clear inputs so user can try again immediately
            setLoading(false);
            setLoadingStep("");
            return;
          }
        }
      } else if (isAllImagesExhausted) {
         alert("图像生成配额耗尽 (Image Quota Exhausted)。\n\n我们尝试了 Gemini Pro、Gemini Flash 和 Imagen 模型，但您的 API Key 对这些图像模型都没有免费访问权限 (Limit: 0)。\n\n文字生成成功，但无法生成图片。\n\n解决方法：请前往 Google AI Studio / Google Cloud Console 为您的项目启用计费 (Billing)。");
      } else if (isQuotaExceeded) {
        alert("请求过于频繁 (429 Resource Exhausted)。\n\n请稍后重试，或检查您的 API Key 配额限制。");
      } else {
        alert(`错误: ${error.message || "发生未知错误"}`);
      }
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <ApiKeySelector />

      <main className="pt-32 px-4 md:px-0 max-w-[800px] mx-auto flex flex-col items-center">
        
        {/* Main Interface Stack */}
        <div className="w-full space-y-4">
          
          {/* Module 1: Brand & Genes */}
          <div className="glass-card p-8">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">品牌名称 (Brand Identity)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                     <TypeIcon className="w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="输入品牌名称"
                    className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/10 rounded-xl text-xl font-medium text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:bg-black/40 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">核心关键词 (DNA)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                     <Hash className="w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="例如：科技, 速度, 未来感, 有机, 极简..."
                    className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-base text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:bg-black/40 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Module 2: Type Selector */}
          <div className="glass-card p-6">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-4 block">Logo 类型 (Archetype)</label>
            <TypeSelector selected={logoType} onChange={setLogoType} />
          </div>

          {/* Module 3: Advanced Accordion */}
          <div className="glass-card overflow-hidden transition-all duration-500">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-6 text-slate-400 hover:text-white transition-colors"
            >
              <span className="text-sm font-medium flex items-center gap-2">
                <Tag size={16} /> 高级设置 (Advanced)
              </span>
              <motion.div animate={{ rotate: showAdvanced ? 180 : 0 }}>
                <ChevronDown size={16} />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-8 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={bgStyle}
                      onChange={(e) => setBgStyle(e.target.value)}
                      placeholder="背景风格 (默认: 深色科技渐变)"
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:bg-black/40 placeholder:text-slate-600"
                    />
                     {logoType === LogoType.LetterMod && (
                        <input
                        type="text"
                        value={abstractTarget}
                        onChange={(e) => setAbstractTarget(e.target.value)}
                        placeholder="变形字母 (例如 'Q')"
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:bg-black/40 placeholder:text-slate-600"
                      />
                     )}
                     <input
                        type="text"
                        value={gradientTarget}
                        onChange={(e) => setGradientTarget(e.target.value)}
                        placeholder="渐变文字 (选填)"
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:bg-black/40 placeholder:text-slate-600"
                      />
                  </div>
                  <textarea
                    value={extraDesc}
                    onChange={(e) => setExtraDesc(e.target.value)}
                    placeholder="补充描述 (例如：希望线条更圆润一些...)"
                    rows={2}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:bg-black/40 placeholder:text-slate-600 resize-none"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Module 4: Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="group relative w-full h-16 rounded-2xl overflow-hidden glass-card shadow-lg hover:shadow-purple-500/20 transition-all duration-300 active:scale-[0.99] border-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[length:200%_100%] animate-shimmer" />
            <div className="absolute inset-0 flex items-center justify-center gap-3 text-white font-semibold tracking-wide z-10">
              {loading ? (
                 <span className="font-mono text-sm animate-pulse text-purple-200">{loadingStep}</span>
              ) : (
                <>
                  <Wand2 size={20} className="text-purple-400" />
                  <span>立即生成 Logo</span>
                  <ChevronRight size={16} className="text-slate-500 group-hover:translate-x-1 transition-transform group-hover:text-white" />
                </>
              )}
            </div>
          </button>

          {/* Result Area */}
          <ResultCard loading={loading} result={result} loadingStep={loadingStep} />

        </div>
      </main>
    </div>
  );
}