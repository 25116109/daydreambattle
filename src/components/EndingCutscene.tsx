import React, { useEffect, useState } from 'react';
import { soundManager } from '../game/audio';
import { Award, CheckCircle, RotateCcw, Smartphone, Sparkles, BookOpen } from 'lucide-react';

interface EndingCutsceneProps {
  onRestart: () => void;
  onOpenBestiary: () => void;
}

export const EndingCutscene: React.FC<EndingCutsceneProps> = ({ onRestart, onOpenBestiary }) => {
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    soundManager.stopBGM();

    // Sequence timing
    const t1 = setTimeout(() => setStep(1), 1200); // Wake up
    const t2 = setTimeout(() => {
      setStep(2); // Phone ding
      soundManager.playVictoryFanfare();
    }, 2800);
    const t3 = setTimeout(() => setStep(3), 4200); // Full 60 score celebration

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 text-white select-none">
      {/* Step 0: Fade to black */}
      {step === 0 && (
        <div className="text-center animate-pulse">
          <p className="text-sm font-mono text-slate-400">
            [ 傳送門光芒收束 ... 意識正在抽離異世界 ... ]
          </p>
        </div>
      )}

      {/* Step 1 & 2: Desk Waking Up Scene */}
      {step >= 1 && (
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Narrative Prologue */}
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              EPILOGUE // 結局彩蛋
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              猛然從書桌前驚醒！
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              臉頰上還印著代針筆的筆痕，桌上的黑咖啡已經涼透。
              眼前散落著草稿、色票與編譯到一半的遊戲專案……
              原來剛才那場激烈的學科戰鬥，是一場無比真實的白日夢？
            </p>
          </div>

          {/* Phone Notification Card */}
          {step >= 2 && (
            <div className="bg-slate-950 border border-slate-700/80 rounded-2xl p-5 shadow-2xl relative mb-6 animate-in slide-in-from-bottom-4 duration-400">
              {/* Notification Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2 font-bold text-slate-300">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>校務行政系統 · 成績即時通知</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400">剛剛 · 叮咚！</span>
              </div>

              {/* Notification Body */}
              <div className="py-4 text-center">
                <div className="text-xs text-slate-400 font-medium">
                  動畫與遊戲設計科 · 本學期期末總審查
                </div>

                {/* Score Breakdown Table */}
                <div className="grid grid-cols-3 gap-2 my-4 max-w-sm mx-auto">
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-bold">造型美學</div>
                    <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">60 分</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-bold">色彩學</div>
                    <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">60 分</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-bold">遊戲設計實務</div>
                    <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">60 分</div>
                  </div>
                </div>

                {/* The Legendary 60 Points Passing Banner */}
                {step >= 3 && (
                  <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 border-2 border-emerald-400/80 rounded-2xl p-4 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-in zoom-in-90 duration-300">
                    <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-xl sm:text-2xl">
                      <Sparkles className="w-6 h-6 animate-spin text-amber-400" />
                      <span>全科 60 分低空飛過！！及格 PASS！</span>
                      <Sparkles className="w-6 h-6 animate-spin text-amber-400" />
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-medium">
                      多一分浪費，少一分受罪！恭喜爆肝設計生保衛學分成功，順利存活到下學期！
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {step >= 3 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onRestart}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl flex items-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>再次挑戰修羅場 (Play Again)</span>
              </button>

              <button
                onClick={onOpenBestiary}
                className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-2 transition"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>回顧怪物圖鑑 (Bestiary)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
