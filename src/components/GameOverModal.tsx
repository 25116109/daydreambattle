import React from 'react';
import { RotateCcw, AlertTriangle, BookOpen } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  onRetry: () => void;
  onRestart: () => void;
  onOpenBestiary: () => void;
  stageName: string;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onRetry,
  onRestart,
  onOpenBestiary,
  stageName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      {/* BSOD Crash Dialog */}
      <div className="w-full max-w-md bg-slate-900 border border-rose-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="bg-rose-950/80 border-b border-rose-800/80 px-4 py-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <span className="text-xs font-mono font-bold text-rose-200">
            FATAL_ERROR: LIVER_EXHAUSTED (肝臟新鮮度歸零)
          </span>
        </div>

        <div className="p-6 text-center">
          <div className="text-4xl font-mono text-rose-500 font-black mb-2">
            : (
          </div>
          <h3 className="text-xl font-black text-white">
            專案當掉！專題審查未通過！
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            在「{stageName}」倒下了……
            咖啡因已無法支撐意識，需要重新調動記憶體資源再戰一次！
          </p>

          <div className="mt-6 space-y-2.5">
            <button
              onClick={onRetry}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>載入本關備份重來 (Retry Stage)</span>
            </button>

            <button
              onClick={onRestart}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <span>從頭開始趕稿 (Restart All)</span>
            </button>

            <button
              onClick={onOpenBestiary}
              className="w-full py-2 px-4 rounded-xl bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>查看怪物機制與破綻</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
