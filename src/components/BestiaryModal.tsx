import React, { useState } from 'react';
import { BESTIARY_DATA, BestiaryEntry } from '../game/constants';
import { X, ShieldAlert, Award, Skull, Sparkles, BookOpen } from 'lucide-react';

interface BestiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BestiaryModal: React.FC<BestiaryModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<'全部' | '小怪' | '大怪' | 'BOSS'>('全部');
  const [activeMonster, setActiveMonster] = useState<BestiaryEntry>(BESTIARY_DATA[0]);

  if (!isOpen) return null;

  const filteredMonsters =
    selectedCategory === '全部'
      ? BESTIARY_DATA
      : BESTIARY_DATA.filter((m) => m.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-black text-white tracking-wide">
                異世界設計修羅場：怪物圖鑑 (Bestiary)
              </h2>
              <p className="text-xs text-slate-400">
                期末及格保衛戰・所有學科魔物弱點與機制解析
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Concept Art Banner (Displaying the user's uploaded illustration!) */}
        <div className="relative bg-slate-950 border-b border-slate-800 overflow-hidden group">
          <img
            src="/assets/aistudio/image_4e4c90c1.png"
            alt="異世界設計修羅場怪物圖鑑全家福"
            referrerPolicy="no-referrer"
            className="w-full h-44 object-cover object-center filter contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-2 left-6 text-xs text-slate-300 font-bold bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-700/60 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>企劃設定手繪全景圖鑑：隨堂考卷、大怪邊角料與死線魔神</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800 bg-slate-900/50">
          {(['全部', '小怪', '大怪', 'BOSS'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Two-Column Body: Monster List + Detailed Inspector */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Monster List Column */}
          <div className="overflow-y-auto p-4 space-y-2 max-h-[360px] md:max-h-[420px]">
            {filteredMonsters.map((m) => {
              const isSelected = activeMonster.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMonster(m)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500 shadow-md'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          m.category === 'BOSS'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : m.category === '大怪'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {m.category}
                      </span>
                      <span className="text-xs font-bold text-white">{m.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      HP: {m.hp} · 傷害: {m.damage}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Inspector Column */}
          <div className="md:col-span-2 p-6 overflow-y-auto bg-slate-900/60 max-h-[360px] md:max-h-[420px]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded ${
                      activeMonster.category === 'BOSS'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : activeMonster.category === '大怪'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    {activeMonster.category}
                  </span>
                  <h3 className="text-lg font-black text-white">
                    {activeMonster.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {activeMonster.desc}
                </p>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-3 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 shrink-0">
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 font-medium">生命值 (HP)</div>
                  <div className="text-sm font-black text-rose-400 font-mono">
                    {activeMonster.hp}
                  </div>
                </div>
                <div className="w-px h-6 bg-slate-800" />
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 font-medium">攻擊傷害</div>
                  <div className="text-sm font-black text-amber-400 font-mono">
                    {activeMonster.damage}
                  </div>
                </div>
              </div>
            </div>

            {/* Mechanics & Weakness boxes */}
            <div className="mt-6 space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>特殊攻擊機制</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeMonster.mechanic}
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1.5">
                  <Award className="w-4 h-4" />
                  <span>學生應對破綻 & 攻略策略</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeMonster.weakness}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
