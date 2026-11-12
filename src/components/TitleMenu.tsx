import React from 'react';
import { Play, BookOpen, Coffee, Award, Sparkles, Monitor, Cpu } from 'lucide-react';

interface TitleMenuProps {
  onStartGame: () => void;
  onOpenBestiary: () => void;
}

export const TitleMenu: React.FC<TitleMenuProps> = ({ onStartGame, onOpenBestiary }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950 select-none overflow-y-auto">
      {/* Background Graphic & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Main Content Box */}
      <div className="relative w-full max-w-4xl bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl text-center my-auto">
        {/* Concept Art Preview Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 mb-6 shadow-inner">
          <img
            src="/assets/aistudio/image_4e4c90c1.png"
            alt="異世界設計修羅場怪物圖鑑"
            referrerPolicy="no-referrer"
            className="w-full h-44 sm:h-56 object-cover object-center filter contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
          <div className="absolute top-3 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-amber-400 border border-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>動畫與遊戲設計科 · 期末大作戰</span>
          </div>
        </div>

        {/* Title & Tagline */}
        <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-400 tracking-tight">
          異世界設計修羅場：低空飛過！
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto leading-relaxed">
          熬夜死背考卷的設計系高中生，墜入網格線與色票構成的學科異世界！
          揮舞塑膠三角板與繪圖神筆，擊破隨堂考卷、無限迴圈與死線魔神，守護 60 分及格底線！
        </p>

        {/* 3 Major Stages Highlight */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 text-left">
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">STAGE 01</div>
            <div className="text-sm font-bold text-white mt-0.5">《造型美學》荒野</div>
            <p className="text-[11px] text-slate-400 mt-1">
              迎戰隨堂考卷與黃金比例螺線怪，破解美學妖精的對稱石柱！
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
            <div className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">STAGE 02</div>
            <div className="text-sm font-bold text-white mt-0.5">《色彩學》色票森林</div>
            <p className="text-[11px] text-slate-400 mt-1">
              踏破 CMYK 泥沼，在色相魔導的極寒冰霜與烈焰顏料雨中穿梭！
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
            <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">STAGE 03</div>
            <div className="text-sm font-bold text-white mt-0.5">《遊戲設計實務》引擎聖殿</div>
            <p className="text-[11px] text-slate-400 mt-1">
              斬破報錯蟲與死當魔像，裝備 RTX 5090 決戰專題總評審死線魔神！
            </p>
          </div>
        </div>

        {/* Controls Quick Guide */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-slate-950/70 border border-slate-800/80 px-4 py-2.5 rounded-2xl text-xs text-slate-300 mb-6">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">WASD</span>
            <span>移動/跳/按 S 進門</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40">Q</span>
            <span>切換技能</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">J</span>
            <span>普攻(+RAM)</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-blue-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">K</span>
            <span>無敵衝刺</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-purple-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">L</span>
            <span>專屬技能</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40">O</span>
            <span className="text-amber-300 font-bold">全螢幕大招</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onStartGame}
            className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2.5 transition active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>開始及格保衛戰 (Start Game)</span>
          </button>

          <button
            onClick={onOpenBestiary}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 flex items-center justify-center gap-2 transition"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>怪物圖鑑一覽 (Bestiary)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
