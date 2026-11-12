/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/engine';
import { STAGES } from './game/stages';
import { soundManager } from './game/audio';
import { HUD } from './components/HUD';
import { TitleMenu } from './components/TitleMenu';
import { PauseMenu } from './components/PauseMenu';
import { BestiaryModal } from './components/BestiaryModal';
import { GameOverModal } from './components/GameOverModal';
import { EndingCutscene } from './components/EndingCutscene';
import { HardwareType, PlayerState, WeaponType } from './game/types';

type AppState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<AppState>('TITLE');
  const [isBestiaryOpen, setIsBestiaryOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Synced Player State for HUD
  const [playerState, setPlayerState] = useState<PlayerState>({
    x: 80,
    y: 400,
    vx: 0,
    vy: 0,
    width: 36,
    height: 52,
    hp: 100,
    maxHp: 100,
    mp: 100,
    maxMp: 100,
    isGrounded: false,
    jumpCount: 0,
    maxJumps: 2,
    facingRight: true,
    isDashing: false,
    dashTimer: 0,
    dashCooldown: 0,
    invulnerableTimer: 0,
    isAttacking: false,
    attackTimer: 0,
    attackCooldown: 0,
    comboIndex: 0,
    isCharging: false,
    chargeTime: 0,
    skillCooldown: 0,
    ultimateCharge: 40,
    maxUltimateCharge: 100,
    ultimateCooldown: 0,
    equippedWeapon: 'ruler',
    inventoryWeapons: ['ruler'],
    equippedHardware: [],
    inventoryHardware: [],
    shieldReady: false,
    shieldCooldown: 0,
    creditScore: 10,
    isFrozen: false,
    freezeTimer: 0,
  });

  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);

  // Initialize Canvas & Game Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set fixed virtual internal resolution
    canvas.width = 1200;
    canvas.height = 675;

    const engine = new GameEngine(canvas, {
      onStateChange: () => {
        if (engineRef.current) {
          setPlayerState({ ...engineRef.current.player });
          setCurrentStageIdx(engineRef.current.currentStageIndex);
        }
      },
      onGameOver: () => {
        setGameState('GAME_OVER');
      },
      onGameVictory: () => {
        setGameState('VICTORY');
      },
    });

    engineRef.current = engine;

    return () => {
      engine.stop();
    };
  }, []);

  // Handle Pause key (ESC)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (gameState === 'PLAYING') {
          handlePauseToggle();
        } else if (gameState === 'PAUSED') {
          handleResume();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState]);

  // Game Lifecycle Handlers
  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.restart();
      setGameState('PLAYING');
    }
  };

  const handlePauseToggle = () => {
    if (gameState === 'PLAYING') {
      if (engineRef.current) engineRef.current.isPaused = true;
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED') {
      handleResume();
    }
  };

  const handleResume = () => {
    if (engineRef.current) engineRef.current.isPaused = false;
    setGameState('PLAYING');
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.restart();
      setGameState('PLAYING');
    }
  };

  const handleRetryStage = () => {
    if (engineRef.current) {
      engineRef.current.player.hp = 100;
      engineRef.current.player.mp = 100;
      engineRef.current.loadStage(engineRef.current.currentStageIndex);
      engineRef.current.isPaused = false;
      engineRef.current.start();
      setGameState('PLAYING');
    }
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleSelectWeapon = (w: WeaponType) => {
    if (engineRef.current) {
      engineRef.current.switchWeapon(w);
    }
  };

  const handleToggleHardware = (h: HardwareType) => {
    if (engineRef.current) {
      engineRef.current.toggleHardware(h);
    }
  };

  const handleVirtualAction = (
    action: 'left' | 'right' | 'up' | 'down' | 'attack' | 'dash' | 'skill' | 'ultimate' | 'switch',
    active: boolean
  ) => {
    if (engineRef.current) {
      engineRef.current.triggerVirtualAction(action, active);
    }
  };

  const currentStage = STAGES[Math.min(currentStageIdx, STAGES.length - 1)];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex items-center justify-center font-sans">
      {/* 16:9 Game Container with aspect ratio preservation */}
      <div className="relative w-full h-full max-w-[177.78vh] max-h-[56.25vw] flex items-center justify-center shadow-2xl overflow-hidden bg-slate-900 border border-slate-800">
        {/* The Game Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full block object-contain cursor-crosshair"
        />

        {/* HUD Overlay (Visible during PLAYING) */}
        {gameState === 'PLAYING' && (
          <HUD
            player={playerState}
            stageName={currentStage.name}
            discipline={currentStage.discipline}
            onPauseToggle={handlePauseToggle}
            isPaused={false}
            onOpenBestiary={() => setIsBestiaryOpen(true)}
            onToggleMute={handleToggleMute}
            isMuted={isMuted}
            onSelectWeapon={handleSelectWeapon}
            onToggleHardware={handleToggleHardware}
            onVirtualAction={handleVirtualAction}
          />
        )}

        {/* Title Screen */}
        {gameState === 'TITLE' && (
          <TitleMenu
            onStartGame={handleStartGame}
            onOpenBestiary={() => setIsBestiaryOpen(true)}
          />
        )}

        {/* Pause Menu Modal */}
        {gameState === 'PAUSED' && (
          <PauseMenu
            isOpen={true}
            onResume={handleResume}
            onRestart={handleRestart}
            onOpenBestiary={() => setIsBestiaryOpen(true)}
            onToggleMute={handleToggleMute}
            isMuted={isMuted}
            creditScore={playerState.creditScore}
          />
        )}

        {/* Game Over Modal */}
        {gameState === 'GAME_OVER' && (
          <GameOverModal
            isOpen={true}
            onRetry={handleRetryStage}
            onRestart={handleRestart}
            onOpenBestiary={() => setIsBestiaryOpen(true)}
            stageName={currentStage.name}
          />
        )}

        {/* Ending Cutscene (Waking up with 60 pts passing notification!) */}
        {gameState === 'VICTORY' && (
          <EndingCutscene
            onRestart={handleRestart}
            onOpenBestiary={() => setIsBestiaryOpen(true)}
          />
        )}

        {/* Monster Bestiary Encyclopedia Modal */}
        <BestiaryModal
          isOpen={isBestiaryOpen}
          onClose={() => setIsBestiaryOpen(false)}
        />
      </div>
    </div>
  );
}
