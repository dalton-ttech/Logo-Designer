import React from 'react';
import { motion } from 'framer-motion';
import { LogoType, TypeCardData } from '../types';
import { Type, Hexagon, Component, Italic } from 'lucide-react';

interface Props {
  selected: LogoType;
  onChange: (type: LogoType) => void;
}

const cards: TypeCardData[] = [
  { 
    id: LogoType.Wordmark, 
    title: "文字标", 
    subtitle: "极简排版 | Wordmark", 
    icon: <Type size={24} strokeWidth={1.5} />
  },
  { 
    id: LogoType.Abstract, 
    title: "图形标", 
    subtitle: "抽象符号 | Abstract", 
    icon: <Hexagon size={24} strokeWidth={1.5} />
  },
  { 
    id: LogoType.Combo, 
    title: "图文组合", 
    subtitle: "经典结构 | Combo", 
    icon: <Component size={24} strokeWidth={1.5} />
  },
  { 
    id: LogoType.LetterMod, 
    title: "字母变形", 
    subtitle: "首字母设计 | Letter", 
    icon: <Italic size={24} strokeWidth={1.5} />
  },
];

export const TypeSelector: React.FC<Props> = ({ selected, onChange }) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-w-[600px] md:min-w-0">
        {cards.map((card) => {
          const isSelected = selected === card.id;
          return (
            <motion.div
              key={card.id}
              onClick={() => onChange(card.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative cursor-pointer rounded-2xl p-4 h-32 flex flex-col justify-between
                transition-all duration-300 border backdrop-blur-md
                ${isSelected 
                  ? 'bg-purple-900/20 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]' 
                  : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'
                }
              `}
            >
              <div className={`
                p-2 rounded-full w-fit
                ${isSelected ? 'bg-purple-400/10 text-purple-300' : 'bg-white/5 text-slate-400'}
              `}>
                {card.icon}
              </div>
              <div>
                <div className={`text-lg font-semibold tracking-tight leading-none mb-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {card.title}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {card.subtitle}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};