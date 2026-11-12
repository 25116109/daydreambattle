import { GameStageConfig } from './types';

export const STAGES: GameStageConfig[] = [
  // ==========================================
  // WORLD 1: 《造型美學》
  // ==========================================
  // Stage 1-1: Minions + Elite
  {
    id: 1,
    name: '第 1-1 關：線條與構圖荒野（小怪與菁英戰）',
    discipline: '《造型美學》',
    subtitle: '掌握點線面：擊倒小考卷與退件草稿，消滅黃金比例螺線怪以開啟傳送門！',
    width: 2800,
    bgTheme: 'grid_paper',
    isBossStage: false,
    platforms: [
      { x: 0, y: 540, width: 850, height: 120, type: 'solid', label: '座標基底網格' },
      { x: 950, y: 540, width: 900, height: 120, type: 'solid', label: '素描白紙平台' },
      { x: 1950, y: 540, width: 850, height: 120, type: 'solid', label: '幾何美學終點' },

      // Floating pencil bars
      { x: 250, y: 410, width: 140, height: 20, type: 'one_way', color: '#fef08a', label: '黃鉛筆架' },
      { x: 460, y: 310, width: 160, height: 20, type: 'one_way', color: '#fef08a' },
      { x: 700, y: 220, width: 130, height: 20, type: 'one_way', color: '#fef08a' },

      // Bouncy Erasers
      { x: 865, y: 510, width: 80, height: 30, type: 'eraser_bounce', color: '#f43f5e', label: '彈力橡皮擦' },
      { x: 1865, y: 510, width: 80, height: 30, type: 'eraser_bounce', color: '#f43f5e', label: '彈力橡皮擦' },

      // Platforms leading to Elite
      { x: 1100, y: 400, width: 160, height: 20, type: 'one_way' },
      { x: 1340, y: 300, width: 180, height: 20, type: 'one_way' },
      { x: 1580, y: 390, width: 160, height: 20, type: 'one_way' },
      { x: 2150, y: 390, width: 160, height: 20, type: 'one_way' },
    ],
    spawnEnemies: [
      { type: 'quiz_paper', x: 350, y: 320 },
      { type: 'quiz_paper', x: 600, y: 280 },
      { type: 'draft_paper_ball', x: 500, y: 500 },
      { type: 'midterm_paper', x: 750, y: 300 },
      { type: 'draft_paper_ball', x: 1150, y: 500 },
      { type: 'quiz_paper', x: 1300, y: 250 },
      { type: 'midterm_paper', x: 1450, y: 280 },
      { type: 'draft_paper_ball', x: 1600, y: 500 },
    ],
    elite: { type: 'golden_ratio', x: 1650, y: 480 },
    nextStageX: 2650,
  },

  // Stage 1-2: Hardcore BOSS Arena
  {
    id: 1,
    name: '第 1-2 關：美學妖精・律動與平衡之靈（魔王決戰）',
    discipline: '《造型美學・BOSS 決戰》',
    subtitle: '高難度魔王戰：妖精施展對稱石柱與天秤雷射！破壞左右單側裝飾物使其陷入硬直！',
    width: 2000,
    bgTheme: 'grid_paper',
    isBossStage: true,
    platforms: [
      { x: 0, y: 540, width: 2000, height: 120, type: 'solid', label: '古典神殿大理石基座' },
      // Symmetrical battle platforms
      { x: 350, y: 400, width: 160, height: 22, type: 'one_way', color: '#e2e8f0', label: '左平衡石柱' },
      { x: 1450, y: 400, width: 160, height: 22, type: 'one_way', color: '#e2e8f0', label: '右平衡石柱' },
      { x: 620, y: 310, width: 180, height: 22, type: 'one_way', color: '#cbd5e1' },
      { x: 1180, y: 310, width: 180, height: 22, type: 'one_way', color: '#cbd5e1' },
      { x: 900, y: 220, width: 200, height: 22, type: 'one_way', color: '#f8fafc', label: '天秤核心台' },
      // Eraser jump pads for quick dodging
      { x: 180, y: 510, width: 70, height: 30, type: 'eraser_bounce', color: '#f43f5e' },
      { x: 1720, y: 510, width: 70, height: 30, type: 'eraser_bounce', color: '#f43f5e' },
    ],
    spawnEnemies: [],
    boss: { type: 'boss_aesthetic', x: 1000, y: 380 },
    nextStageX: 1880,
  },

  // ==========================================
  // WORLD 2: 《色彩學》
  // ==========================================
  // Stage 2-1: Minions + Elite
  {
    id: 2,
    name: '第 2-1 關：迷幻色票森林（小怪與菁英戰）',
    discipline: '《色彩學》',
    subtitle: '踏遍彩度階梯：避開色偏泥沼，擊敗 CMYK 溢色史萊姆解鎖 BOSS 領域傳送門！',
    width: 3000,
    bgTheme: 'pantone_forest',
    isBossStage: false,
    platforms: [
      { x: 0, y: 540, width: 950, height: 120, type: 'solid', color: '#0284c7', label: '冷色系調色盤' },
      { x: 1050, y: 540, width: 950, height: 120, type: 'solid', color: '#ea580c', label: '暖色系火熱地面' },
      { x: 2100, y: 540, width: 900, height: 120, type: 'solid', color: '#9333ea', label: '中差色混色原野' },

      // Swatch platforms
      { x: 220, y: 410, width: 140, height: 24, type: 'one_way', color: '#f43f5e', label: 'PANTONE 185C' },
      { x: 440, y: 310, width: 150, height: 24, type: 'one_way', color: '#06b6d4', label: 'PANTONE 311C' },
      { x: 680, y: 230, width: 150, height: 24, type: 'one_way', color: '#eab308', label: 'PANTONE 116C' },

      // Color Boost Pads
      { x: 960, y: 510, width: 80, height: 30, type: 'swatch_boost', color: '#ec4899', label: '洋紅增幅台' },
      { x: 2010, y: 510, width: 80, height: 30, type: 'swatch_boost', color: '#3b82f6', label: '青色跳躍板' },

      // Elite Route
      { x: 1250, y: 400, width: 160, height: 22, type: 'one_way', color: '#f97316' },
      { x: 1480, y: 300, width: 170, height: 22, type: 'one_way', color: '#10b981' },
      { x: 1720, y: 400, width: 160, height: 22, type: 'one_way', color: '#8b5cf6' },
    ],
    spawnEnemies: [
      { type: 'midterm_paper', x: 300, y: 300 },
      { type: 'draft_paper_ball', x: 450, y: 500 },
      { type: 'quiz_paper', x: 700, y: 220 },
      { type: 'draft_paper_ball', x: 800, y: 500 },
      { type: 'midterm_paper', x: 1250, y: 280 },
      { type: 'draft_paper_ball', x: 1500, y: 500 },
      { type: 'quiz_paper', x: 2250, y: 320 },
    ],
    elite: { type: 'cmyk_slime', x: 1700, y: 480 },
    nextStageX: 2850,
  },

  // Stage 2-2: Hardcore BOSS Arena
  {
    id: 2,
    name: '第 2-2 關：色相魔導・三原色幻象師（魔王決戰）',
    discipline: '《色彩學・BOSS 決戰》',
    subtitle: '極限色溫考驗：寒色地面極度結冰打滑，暖色落下烈焰流星雨！善用衝刺與跳躍節奏！',
    width: 2100,
    bgTheme: 'pantone_forest',
    isBossStage: true,
    platforms: [
      { x: 0, y: 540, width: 2100, height: 120, type: 'solid', color: '#16a34a', label: '色相環魔導決鬥場' },
      { x: 300, y: 410, width: 160, height: 24, type: 'one_way', color: '#f43f5e', label: 'CMY 翼階 L' },
      { x: 1600, y: 410, width: 160, height: 24, type: 'one_way', color: '#06b6d4', label: 'CMY 翼階 R' },
      { x: 650, y: 320, width: 180, height: 24, type: 'one_way', color: '#eab308' },
      { x: 1250, y: 320, width: 180, height: 24, type: 'one_way', color: '#8b5cf6' },
      { x: 950, y: 230, width: 200, height: 24, type: 'one_way', color: '#10b981', label: '色溫平衡台' },
      // Speed pads
      { x: 150, y: 510, width: 80, height: 30, type: 'swatch_boost', color: '#ec4899' },
      { x: 1850, y: 510, width: 80, height: 30, type: 'swatch_boost', color: '#3b82f6' },
    ],
    spawnEnemies: [],
    boss: { type: 'boss_color', x: 1050, y: 380 },
    nextStageX: 1980,
  },

  // ==========================================
  // WORLD 3: 《遊戲設計實務》
  // ==========================================
  // Stage 3-1: Minions + Elite
  {
    id: 3,
    name: '第 3-1 關：編譯地獄與算圖魔像（小怪與菁英戰）',
    discipline: '《遊戲設計實務》',
    subtitle: '攻克崩潰代碼：斬斷報錯蟲與無限迴圈，擊碎算圖死當魔像以獲取 RTX 5090！',
    width: 3200,
    bgTheme: 'engine_temple',
    isBossStage: false,
    platforms: [
      { x: 0, y: 540, width: 950, height: 120, type: 'solid', color: '#1e293b', label: 'Main Thread 主執行緒' },
      { x: 1080, y: 540, width: 950, height: 120, type: 'solid', color: '#0f172a', label: 'Build Pipeline 編譯產線' },
      { x: 2150, y: 540, width: 1050, height: 120, type: 'solid', color: '#1e293b', label: 'Shader Core 著色器核心' },

      // Missing textures and blueprints
      { x: 250, y: 410, width: 150, height: 22, type: 'one_way', color: '#38bdf8', label: 'Blueprint 節點' },
      { x: 480, y: 320, width: 140, height: 22, type: 'missing_texture', label: '遺失貼圖（紫黑格）' },
      { x: 720, y: 240, width: 150, height: 22, type: 'one_way', color: '#38bdf8' },

      // FPS Drop Zone
      { x: 960, y: 510, width: 110, height: 30, type: 'fps_drop', color: '#ef4444', label: '掉幀沼澤 (FPS Drop)' },

      // Elite route
      { x: 1250, y: 420, width: 150, height: 22, type: 'one_way' },
      { x: 1480, y: 310, width: 140, height: 22, type: 'missing_texture' },
      { x: 1720, y: 400, width: 160, height: 22, type: 'one_way' },
      { x: 2030, y: 510, width: 110, height: 30, type: 'fps_drop' },
    ],
    spawnEnemies: [
      { type: 'syntax_bug', x: 400, y: 500 },
      { type: 'syntax_bug', x: 650, y: 500 },
      { type: 'infinite_loop_slime', x: 800, y: 500 },
      { type: 'syntax_bug', x: 1280, y: 500 },
      { type: 'infinite_loop_slime', x: 1450, y: 500 },
      { type: 'syntax_bug', x: 2350, y: 500 },
    ],
    elite: { type: 'bsod_golem', x: 1800, y: 460 },
    nextStageX: 3050,
  },

  // Stage 3-2: Ultra Hardcore FINAL BOSS
  {
    id: 3,
    name: '第 3-2 關：專題總評審・死線魔神（最終魔王審判）',
    discipline: '《遊戲設計實務・最終決戰》',
    subtitle: '畢業保衛終局戰：改稿大剪刀與當掉印章連擊！二階段狂暴施放「檔案未儲存」全螢幕滅團技！',
    width: 2200,
    bgTheme: 'engine_temple',
    isBossStage: true,
    platforms: [
      { x: 0, y: 540, width: 2200, height: 120, type: 'solid', color: '#020617', label: '專題總審查裁決聖殿' },
      // Tribunal platforms
      { x: 300, y: 410, width: 170, height: 24, type: 'one_way', color: '#64748b', label: '評審辯護席 L' },
      { x: 1700, y: 410, width: 170, height: 24, type: 'one_way', color: '#64748b', label: '評審辯護席 R' },
      { x: 650, y: 310, width: 180, height: 24, type: 'one_way', color: '#38bdf8', label: '緩衝緩衝區' },
      { x: 1350, y: 310, width: 180, height: 24, type: 'one_way', color: '#38bdf8', label: '緩衝緩衝區' },
      { x: 1000, y: 220, width: 220, height: 24, type: 'one_way', color: '#dc2626', label: '死線裁決台' },
    ],
    spawnEnemies: [],
    boss: { type: 'boss_deadline', x: 1100, y: 370 },
    nextStageX: 2050,
  },
];
