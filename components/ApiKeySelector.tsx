import React, { useEffect, useState } from 'react';
import { Key } from 'lucide-react';

export const ApiKeySelector: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    if ((window as any).aistudio) {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    }
  };

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      // Assume success as per instructions to avoid race condition
      setHasKey(true);
    } else {
      alert("未检测到 AI Studio 环境。请确保在 window.aistudio 可用的环境中运行，或手动配置 process.env.API_KEY。");
    }
  };

  if (hasKey) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleSelectKey}
        className="flex items-center gap-2 px-4 py-2 bg-black/80 text-white rounded-full backdrop-blur-md shadow-lg hover:bg-black transition-all text-sm font-medium border border-white/10"
      >
        <Key size={16} />
        选择 API Key
      </button>
    </div>
  );
};