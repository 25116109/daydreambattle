import React, { useEffect, useState } from 'react';
import { HARDWARE, WEAPONS } from '../game/constants';
import { HardwareType, PlayerState, WeaponType } from '../game/types';
import { BookOpen, Coffee, Cpu, Pause, Play, Repeat, Volume2, VolumeX, Zap } from 'lucide-react';

interface HUDProps {
  player: PlayerState;
  stageName: string;
  discipline: string;
  onPauseToggle: () => void;
  isPaused: boolean;
  onOpenBestiary: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  onSelectWeapon: (w: WeaponType) => void;
  onToggleHardware: (h: HardwareType) => void;
  onVirtualAction: (action: 'left' | 'right' | 'up' | 'down' | 'attack' | 'dash' | 'skill' | 'ultimate' | 'switch', active: boolean) => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  stageName,
  discipline,
  onPauseToggle,
  isPaused,
  onOpenBestiary,
  onToggleMute,
  isMuted,
  onSelectWeapon,
  onToggleHardware,
  onVirtualAction,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const mpPercent = Math.max(0, Math.min(100, (player.mp / player.maxMp) * 100));
  const ultPercent = Math.min(100, Math.floor(player.ultimateCharge));
  const isUltReady = ultPercent >= 100;
  const creditPercent = Math.min(100, player.creditScore);
  const isPassing = creditPercent >= 60;

  // Delayed damage-bar effect (Fighting game / Arcade style)
  const [delayedHp, setDelayedHp] = useState(hpPercent);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayedHp(hpPercent);
    }, 400);
    return () => clearTimeout(timer);
  }, [hpPercent]);

  const activeWeapon = WEAPONS[player.equippedWeapon];

  // Weapon Skill names mapping
  const skillNames: Record<WeaponType, string> = {
    ruler: '雙重破空風刃',
    compass: '黃金精密貫穿',
    marker: '全色域噴濺波',
    stylus: '8192 筆壓劍氣',
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-3 select-none font-mono">
      {/* Top Bar: Retro Pixel Arcade Console Style */}
      <div className="flex items-start justify-between gap-2 sm:gap-4 pointer-events-auto flex-wrap sm:flex-nowrap">
        {/* Left: Pixel HP Bar + Animated Blue MP (RAM) Bar + Ultimate */}
        <div className="bg-slate-950/95 border-4 border-black p-3 shadow-[4px_4px_0px_#000] min-w-[280px] max-w-[340px]">
          {/* HP Header */}
          <div className="flex items-center justify-between mb-1 text-xs font-black tracking-wider">
            <div className="flex items-center gap-1.5 text-rose-400">
              <Coffee className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>肝臟新鮮度 (HP)</span>
            </div>
            <span
              className={`font-black ${
                hpPercent < 30 ? 'text-rose-500 animate-pulse' : 'text-slate-200'
              }`}
            >
              {Math.ceil(player.hp)} / {player.maxHp}
            </span>
          </div>

          {/* Chunky Pixel HP Bar with Delayed Damage Catch-up Bar */}
          <div className="w-full h-5 bg-slate-900 border-2 border-black relative overflow-hidden shadow-inner">
            {/* Delayed Yellow Damage Bar */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-amber-400 transition-all duration-500 ease-out"
              style={{ width: `${delayedHp}%` }}
            />
            {/* Front Red Health Bar */}
            <div
              className={`absolute top-0 bottom-0 left-0 transition-all duration-100 ${
                hpPercent < 30
                  ? 'bg-rose-600 animate-pulse'
                  : hpPercent < 60
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-rose-500 to-emerald-400'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
            {/* 10-Segment Pixel Dividers */}
            <div className="absolute inset-0 flex justify-between pointer-events-none opacity-40">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-[2px] h-full bg-black" />
              ))}
            </div>
          </div>
          {hpPercent < 30 && (
            <div className="text-[10px] text-rose-400 font-black mt-1 tracking-widest text-center animate-bounce bg-rose-950/60 border border-rose-800 py-0.5">
              ⚠ 警告：肝臟即將當掉！請找冰美式咖啡
            </div>
          )}

          {/* Blue MP / RAM Bar */}
          <div className="flex items-center justify-between mt-2.5 mb-1 text-xs font-black">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>記憶體快取 (RAM)</span>
            </div>
            <span className="font-mono text-cyan-300 font-black">
              {Math.ceil(player.mp)}%
            </span>
          </div>

          {/* Chunky Pixel Segmented Blue MP Bar */}
          <div className="w-full h-4 bg-slate-900 border-2 border-black relative overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-sky-300 transition-all duration-150"
              style={{ width: `${mpPercent}%` }}
            />
            {/* 10-Segment Pixel Dividers */}
            <div className="absolute inset-0 flex justify-between pointer-events-none opacity-40">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-[2px] h-full bg-black" />
              ))}
            </div>
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-0.5 px-0.5">
            <span>[K] 衝刺 -15%</span>
            <span>[L] 技能 -25%</span>
            <span className="text-cyan-300">[J] 普攻 +6%</span>
          </div>

          {/* Ultimate (大招 O 鍵) Gauge */}
          <div className="flex items-center justify-between mt-2.5 mb-1 text-xs">
            <div className="flex items-center gap-1.5 font-black">
              <Zap className={`w-3.5 h-3.5 ${isUltReady ? 'text-amber-400 fill-amber-400 animate-spin' : 'text-purple-400'}`} />
              <span className={isUltReady ? 'text-amber-300 font-black animate-pulse' : 'text-slate-300'}>
                {isUltReady ? '★ 爆肝覺醒！按 O 施放' : '終極審判充能 (O)'}
              </span>
            </div>
            <span className={`font-mono text-xs font-black ${isUltReady ? 'text-amber-300 animate-bounce' : 'text-purple-300'}`}>
              {ultPercent}%
            </span>
          </div>
          <div className={`w-full h-3 border-2 border-black relative overflow-hidden ${isUltReady ? 'bg-amber-950' : 'bg-slate-900'}`}>
            <div
              className={`h-full transition-all duration-150 ${
                isUltReady
                  ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 animate-pulse'
                  : 'bg-gradient-to-r from-purple-600 to-pink-500'
              }`}
              style={{ width: `${ultPercent}%` }}
            />
          </div>
        </div>

        {/* Center: Retro Arcade Marquee & Stage Discipline */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-950/95 border-4 border-black p-2.5 shadow-[4px_4px_0px_#000] flex items-center gap-3">
            <div className="text-center px-2">
              <div className="text-[10px] text-amber-400 font-black tracking-widest uppercase">
                {discipline}
              </div>
              <div className="text-sm sm:text-base font-black text-white tracking-wide mt-0.5">
                {stageName}
              </div>
            </div>

            <div className="flex items-center gap-1.5 border-l-2 border-slate-800 pl-2.5">
              <button
                onClick={onOpenBestiary}
                title="怪物圖鑑"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              <button
                onClick={onToggleMute}
                title={isMuted ? '開啟聲音' : '靜音'}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
              <button
                onClick={onPauseToggle}
                title="暫停"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
              >
                {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Pixel Skill/Weapon Selector with [Q] Switch Key + Academic Progress */}
        <div className="bg-slate-950/95 border-4 border-black p-3 shadow-[4px_4px_0px_#000] min-w-[280px]">
          {/* Credit Progress */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black text-slate-200">
              期末學分進度
            </span>
            <span
              className={`text-xs font-black px-2 py-0.5 border-2 border-black ${
                isPassing
                  ? 'bg-emerald-500 text-slate-950 shadow-[2px_2px_0px_#059669]'
                  : 'bg-rose-500 text-white shadow-[2px_2px_0px_#9f1239]'
              }`}
            >
              {player.creditScore} 分 {isPassing ? '✓ 及格 PASS' : '✗ 當掉中'}
            </span>
          </div>

          <div className="relative w-full h-4 bg-slate-900 border-2 border-black overflow-hidden shadow-inner">
            {/* 60 pt threshold line */}
            <div
              className="absolute top-0 bottom-0 w-[3px] bg-yellow-300 z-10"
              style={{ left: '60%' }}
              title="60分及格門檻"
            />
            <div
              className={`h-full transition-all duration-200 ${
                isPassing
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-rose-500 to-amber-500'
              }`}
              style={{ width: `${creditPercent}%` }}
            />
          </div>

          {/* Quick Skill Switcher Banner (Q Key) */}
          <div className="mt-2.5 pt-2 border-t-2 border-slate-800">
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <button
                onClick={() => onVirtualAction('switch', true)}
                className="flex items-center gap-1.5 px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition"
                title="按 Q 鍵切換技能武器"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>[Q] 切換技能</span>
              </button>
              <div className="text-[11px] font-black text-amber-300 truncate max-w-[150px]">
                {skillNames[player.equippedWeapon]}
              </div>
            </div>

            {/* Weapons inventory slots */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {(['ruler', 'compass', 'marker', 'stylus'] as WeaponType[]).map((wId) => {
                  const isUnlocked = player.inventoryWeapons.includes(wId);
                  const isEquipped = player.equippedWeapon === wId;
                  const info = WEAPONS[wId];

                  return (
                    <button
                      key={wId}
                      disabled={!isUnlocked}
                      onClick={() => onSelectWeapon(wId)}
                      title={isUnlocked ? `${info.name} - ${skillNames[wId]}` : '尚未解鎖'}
                      className={`w-7 h-7 text-[11px] font-black border-2 border-black transition flex items-center justify-center ${
                        isEquipped
                          ? 'bg-cyan-400 text-slate-950 shadow-[2px_2px_0px_#0284c7]'
                          : isUnlocked
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 shadow-[2px_2px_0px_#000]'
                          : 'bg-slate-900 text-slate-600 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      {wId === 'ruler' ? '尺' : wId === 'compass' ? '規' : wId === 'marker' ? '筆' : '壓'}
                    </button>
                  );
                })}
              </div>

              {/* Hardware slots */}
              <div className="flex items-center gap-1 border-l-2 border-slate-800 pl-2">
                {(['mouse', 'ram', 'monitor', 'gpu'] as HardwareType[]).map((hId) => {
                  const isUnlocked = player.inventoryHardware.includes(hId);
                  const isEquipped = player.equippedHardware.includes(hId);
                  const info = HARDWARE[hId];

                  return (
                    <button
                      key={hId}
                      disabled={!isUnlocked}
                      onClick={() => onToggleHardware(hId)}
                      title={isUnlocked ? `${info.name} (${isEquipped ? '已裝備' : '未裝備'})` : '尚未擊敗菁英怪物'}
                      className={`w-7 h-7 text-[10px] font-black border-2 border-black transition flex items-center justify-center ${
                        isEquipped
                          ? 'bg-pink-500 text-white shadow-[2px_2px_0px_#9d174d]'
                          : isUnlocked
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 shadow-[2px_2px_0px_#000]'
                          : 'bg-slate-900 text-slate-600 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      {hId === 'mouse' ? '鼠' : hId === 'ram' ? 'RAM' : hId === 'monitor' ? '螢' : '5090'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Retro Arcade Keyboard Controls & Touch Buttons */}
      <div className="flex items-end justify-between gap-4 pointer-events-auto">
        {/* Pixel Keyboard Legend */}
        <div className="bg-slate-950/95 border-4 border-black p-2.5 shadow-[4px_4px_0px_#000] text-xs text-slate-300 hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-cyan-400 text-slate-950 font-black border-2 border-black shadow-[2px_2px_0px_#000]">
              WASD
            </span>
            <span className="text-[11px] text-slate-300 font-bold">移動/跳/傳送門按S</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 font-black border-2 border-black shadow-[2px_2px_0px_#000]">
              Q
            </span>
            <span className="text-[11px] text-amber-300 font-bold">切換技能</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-slate-800 text-amber-300 font-black border-2 border-black shadow-[2px_2px_0px_#000]">
              J
            </span>
            <span className="text-[11px] text-slate-300 font-bold">普攻(+RAM)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-slate-800 text-cyan-300 font-black border-2 border-black shadow-[2px_2px_0px_#000]">
              K
            </span>
            <span className="text-[11px] text-slate-300 font-bold">無敵衝刺(-15%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-slate-800 text-purple-300 font-black border-2 border-black shadow-[2px_2px_0px_#000]">
              L
            </span>
            <span className="text-[11px] text-purple-300 font-bold">專屬技能(-25%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 font-black border-2 border-black shadow-[2px_2px_0px_#000]">
              O
            </span>
            <span className="text-[11px] text-amber-300 font-bold">全螢幕大招</span>
          </div>
        </div>

        {/* Pixel Arcade Touch / Click Buttons for Mobile / Mouse Test */}
        <div className="flex items-center gap-2 ml-auto">
          {/* D-Pad */}
          <div className="flex gap-1 bg-slate-950/95 border-4 border-black p-1 shadow-[3px_3px_0px_#000]">
            <button
              onMouseDown={() => onVirtualAction('left', true)}
              onMouseUp={() => onVirtualAction('left', false)}
              onTouchStart={() => onVirtualAction('left', true)}
              onTouchEnd={() => onVirtualAction('left', false)}
              className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center"
            >
              A
            </button>
            <button
              onMouseDown={() => onVirtualAction('up', true)}
              onMouseUp={() => onVirtualAction('up', false)}
              onTouchStart={() => onVirtualAction('up', true)}
              onTouchEnd={() => onVirtualAction('up', false)}
              className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center"
            >
              W
            </button>
            <button
              onMouseDown={() => onVirtualAction('down', true)}
              onMouseUp={() => onVirtualAction('down', false)}
              onTouchStart={() => onVirtualAction('down', true)}
              onTouchEnd={() => onVirtualAction('down', false)}
              className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center"
            >
              S
            </button>
            <button
              onMouseDown={() => onVirtualAction('right', true)}
              onMouseUp={() => onVirtualAction('right', false)}
              onTouchStart={() => onVirtualAction('right', true)}
              onTouchEnd={() => onVirtualAction('right', false)}
              className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center"
            >
              D
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 bg-slate-950/95 border-4 border-black p-1 shadow-[3px_3px_0px_#000]">
            {/* Q: Switch Weapon */}
            <button
              onClick={() => onVirtualAction('switch', true)}
              className="w-9 h-9 bg-amber-400 text-slate-950 font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center"
              title="切換技能武器"
            >
              Q
            </button>
            {/* J: Attack */}
            <button
              onMouseDown={() => onVirtualAction('attack', true)}
              onMouseUp={() => onVirtualAction('attack', false)}
              onTouchStart={() => onVirtualAction('attack', true)}
              onTouchEnd={() => onVirtualAction('attack', false)}
              className="w-9 h-9 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center"
              title="普攻三連擊"
            >
              J
            </button>
            {/* K: Dash */}
            <button
              onMouseDown={() => onVirtualAction('dash', true)}
              onMouseUp={() => onVirtualAction('dash', false)}
              onTouchStart={() => onVirtualAction('dash', true)}
              onTouchEnd={() => onVirtualAction('dash', false)}
              className="w-9 h-9 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center"
              title="衝刺閃避"
            >
              K
            </button>
            {/* L: Skill */}
            <button
              onMouseDown={() => onVirtualAction('skill', true)}
              onMouseUp={() => onVirtualAction('skill', false)}
              onTouchStart={() => onVirtualAction('skill', true)}
              onTouchEnd={() => onVirtualAction('skill', false)}
              className="w-9 h-9 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center"
              title="專屬技能"
            >
              L
            </button>
            {/* O: Ultimate */}
            <button
              onMouseDown={() => onVirtualAction('ultimate', true)}
              onMouseUp={() => onVirtualAction('ultimate', false)}
              onTouchStart={() => onVirtualAction('ultimate', true)}
              onTouchEnd={() => onVirtualAction('ultimate', false)}
              className={`w-9 h-9 font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center ${
                isUltReady
                  ? 'bg-amber-400 text-slate-950 animate-pulse shadow-[0_0_8px_#f59e0b]'
                  : 'bg-slate-800 text-slate-500'
              }`}
              title="全螢幕大招"
            >
              O
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
