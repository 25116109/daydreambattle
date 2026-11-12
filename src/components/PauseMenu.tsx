import React from 'react';
import { Play, RotateCcw, BookOpen, Volume2, VolumeX, FolderGit2 } from 'lucide-react';

interface PauseMenuProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onOpenBestiary: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  creditScore: number;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isOpen,
  onResume,
  onRestart,
  onOpenBestiary,
  onToggleMute,
  isMuted,
  creditScore,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      {/* OS File Explorer Window Styling */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Titlebar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/90 border-b border-slate-700/80">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              final_project_v9_really_final_definitely.psd [已暫停]
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-xs text-amber-400 font-bold tracking-wider mb-1">
              PROMPT // 期末進度暫停
            </div>
            <h3 className="text-xl font-black text-white">
              設計師，要喝口水喘口氣嗎？
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              當前累積學分：<span className="font-bold text-emerald-400">{creditScore} 分</span> (及格門檻: 60 分)
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={onResume}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>繼續趕稿 (Resume)</span>
            </button>

            <button
              onClick={onOpenBestiary}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>翻閱怪物圖鑑 (Bestiary)</span>
            </button>

            <button
              onClick={onToggleMute}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span>取消靜音 (Unmute)</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>音效靜音 (Mute)</span>
                </>
              )}
            </button>

            <button
              onClick={onRestart}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 border border-rose-800/50 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重新開檔 (Restart)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
