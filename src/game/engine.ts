import { HARDWARE, WEAPONS } from './constants';
import { soundManager } from './audio';
import { GameRenderer } from './renderer';
import { STAGES } from './stages';
import {
  Enemy,
  FloatingText,
  HardwareType,
  LootDrop,
  Particle,
  Platform,
  PlayerState,
  Projectile,
  WeaponType,
} from './types';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: GameRenderer;

  // Game Loop
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  public isPaused: boolean = false;

  // Stages & Progression
  public currentStageIndex: number = 0;
  private stageWidth: number = 3800;
  private cameraX: number = 0;
  private screenShake: number = 0;
  public portalUnlocked: boolean = false;

  // Game Entities
  public player: PlayerState;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private lootDrops: LootDrop[] = [];
  private platforms: Platform[] = [];

  // Boss Stage 2 Phase
  private bossColorPhase: 'warm' | 'cold' = 'warm';
  private colorPhaseTimer: number = 0;

  // Input states
  private keys: Record<string, boolean> = {
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    KeyQ: false,
    KeyJ: false,
    KeyK: false,
    KeyL: false,
    KeyO: false,
    Space: false,
    ShiftLeft: false,
  };

  // Callbacks to UI
  private onStateChange: () => void;
  private onGameOver: () => void;
  private onGameVictory: () => void;

  constructor(
    canvas: HTMLCanvasElement,
    callbacks: {
      onStateChange: () => void;
      onGameOver: () => void;
      onGameVictory: () => void;
    }
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
    this.renderer = new GameRenderer(canvas, context);

    this.onStateChange = callbacks.onStateChange;
    this.onGameOver = callbacks.onGameOver;
    this.onGameVictory = callbacks.onGameVictory;

    this.player = this.createInitialPlayer();
    this.setupInputListeners();
    this.loadStage(0);
  }

  private createInitialPlayer(): PlayerState {
    return {
      x: 80,
      y: 420,
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
      inventoryWeapons: ['ruler', 'compass'],
      equippedHardware: [],
      inventoryHardware: [],
      shieldReady: false,
      shieldCooldown: 0,
      creditScore: 10,
      isFrozen: false,
      freezeTimer: 0,
    };
  }

  // --- Input Binding (WASD + Q, J, K, L, O) ---
  private setupInputListeners() {
    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      // WASD
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        this.keys.KeyW = true;
        this.handleJump();
      }
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.KeyA = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        this.keys.KeyS = true;
        this.handleDownOrPortal();
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.KeyD = true;

      // Q = 切換技能武器 (Switch Skill Weapon)
      if (e.code === 'KeyQ') {
        this.keys.KeyQ = true;
        this.handleSwitchSkillWeapon();
      }

      // J = 普攻 (Basic Attack)
      if (e.code === 'KeyJ') {
        this.keys.KeyJ = true;
        this.handleAttack();
      }
      // K = 衝刺 / 閃避 (Dash / Dodge)
      if (e.code === 'KeyK' || e.code === 'ShiftLeft') {
        this.keys.KeyK = true;
        this.handleDash();
      }
      // L = 技能 (Skill)
      if (e.code === 'KeyL') {
        this.keys.KeyL = true;
        this.handleSkill();
      }
      // O = 大招 (Ultimate)
      if (e.code === 'KeyO') {
        this.keys.KeyO = true;
        this.handleUltimate();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') this.keys.KeyW = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.KeyA = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.keys.KeyS = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.KeyD = false;
      if (e.code === 'KeyQ') this.keys.KeyQ = false;
      if (e.code === 'KeyJ') this.keys.KeyJ = false;
      if (e.code === 'KeyK' || e.code === 'ShiftLeft') this.keys.KeyK = false;
      if (e.code === 'KeyL') this.keys.KeyL = false;
      if (e.code === 'KeyO') this.keys.KeyO = false;
    });

    // Mouse Controls (Left = Attack, Right = Dash)
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.handleAttack();
      } else if (e.button === 2) {
        e.preventDefault();
        this.handleDash();
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // Virtual buttons for mobile / screen clicks
  public triggerVirtualAction(
    action: 'left' | 'right' | 'up' | 'down' | 'attack' | 'dash' | 'skill' | 'ultimate' | 'switch',
    active: boolean
  ) {
    if (action === 'left') this.keys.KeyA = active;
    if (action === 'right') this.keys.KeyD = active;
    if (action === 'down') {
      this.keys.KeyS = active;
      if (active) this.handleDownOrPortal();
    }
    if (action === 'up' && active) this.handleJump();
    if (action === 'switch' && active) this.handleSwitchSkillWeapon();
    if (action === 'attack' && active) this.handleAttack();
    if (action === 'dash' && active) this.handleDash();
    if (action === 'skill' && active) this.handleSkill();
    if (action === 'ultimate' && active) this.handleUltimate();
  }

  // --- Switch Skill Weapon (Q Key) ---
  public handleSwitchSkillWeapon() {
    if (this.player.isFrozen) return;

    const inv = this.player.inventoryWeapons;
    if (inv.length <= 1) {
      if (!inv.includes('compass')) inv.push('compass');
    }

    const currentIndex = inv.indexOf(this.player.equippedWeapon);
    const nextIndex = (currentIndex + 1) % inv.length;
    const nextWeapon = inv[nextIndex];
    this.player.equippedWeapon = nextWeapon;

    soundManager.playAttack(nextWeapon, 0);
    const info = WEAPONS[nextWeapon];

    this.floatingTexts.push({
      id: `switch_skill_${Date.now()}`,
      x: this.player.x,
      y: this.player.y - 35,
      text: `[Q] 切換技能武器：【${info.name}】！`,
      color: info.color,
      size: 14,
      life: 1.5,
      vy: -1.2,
    });

    this.onStateChange();
  }

  // Press S to Enter Portal or Drop through platform
  public handleDownOrPortal() {
    if (this.player.isFrozen) return;

    const portalX = this.stageWidth - 100;
    const distToPortal = Math.abs(this.player.x - portalX);

    // If standing in portal area (within 85px)
    if (distToPortal < 85) {
      if (this.portalUnlocked) {
        soundManager.playVictoryFanfare();
        this.screenShake = 6;
        this.floatingTexts.push({
          id: `portal_enter_${Date.now()}`,
          x: this.player.x,
          y: this.player.y - 40,
          text: '🌀 穿梭傳送門中...',
          color: '#38bdf8',
          size: 16,
          life: 1.0,
          vy: -1.5,
        });

        this.loadStage(this.currentStageIndex + 1);
        return;
      } else {
        // Locked feedback
        soundManager.playShieldBlock();
        this.screenShake = 4;
        const stageConfig = STAGES[this.currentStageIndex];
        const targetName = stageConfig.isBossStage ? '關卡首領魔王' : '菁英守衛';
        this.floatingTexts.push({
          id: `portal_locked_${Date.now()}`,
          x: this.player.x,
          y: this.player.y - 45,
          text: `🔒 傳送門封印中！請先擊敗【${targetName}】！`,
          color: '#ef4444',
          size: 14,
          life: 1.5,
          vy: -1.2,
        });
        return;
      }
    }

    // Otherwise drop down through one-way platforms
    if (this.player.isGrounded) {
      this.player.y += 6;
      this.player.isGrounded = false;
    }
  }

  // --- Stage Loading ---
  public loadStage(stageIndex: number) {
    if (stageIndex >= STAGES.length) {
      this.onGameVictory();
      return;
    }

    this.currentStageIndex = stageIndex;
    const stageConfig = STAGES[stageIndex];
    this.stageWidth = stageConfig.width;
    this.portalUnlocked = false;

    // Reset player position
    this.player.x = 80;
    this.player.y = 400;
    this.player.vx = 0;
    this.player.vy = 0;
    this.cameraX = 0;

    // Load platforms
    this.platforms = [...stageConfig.platforms];

    // Spawn Enemies
    this.enemies = [];
    stageConfig.spawnEnemies.forEach((e, idx) => {
      this.enemies.push(this.createEnemy(e.type, e.x, e.y, `minion_${idx}`));
    });

    // Spawn Elite if present
    if (stageConfig.elite) {
      this.enemies.push(this.createEnemy(stageConfig.elite.type, stageConfig.elite.x, stageConfig.elite.y, 'elite', true));
    }

    // Spawn Boss if present
    if (stageConfig.boss) {
      this.enemies.push(this.createEnemy(stageConfig.boss.type, stageConfig.boss.x, stageConfig.boss.y, 'boss', false, true));
    }

    // Reset drops & particles
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.lootDrops = [];

    // Play BGM
    soundManager.playBGM(stageConfig.id);
    this.onStateChange();
  }

  private createEnemy(
    type: Enemy['type'],
    x: number,
    y: number,
    id: string,
    isElite: boolean = false,
    isBoss: boolean = false
  ): Enemy {
    let name = '';
    let hp = 30;
    let width = 36;
    let height = 36;
    let damage = 12;

    switch (type) {
      case 'quiz_paper':
        name = '隨堂小考卷';
        hp = 20;
        width = 28;
        height = 32;
        damage = 10;
        break;
      case 'midterm_paper':
        name = '期中考卷';
        hp = 40;
        width = 42;
        height = 24;
        damage = 15;
        break;
      case 'draft_paper_ball':
        name = '退件草稿團';
        hp = 45;
        width = 32;
        height = 32;
        damage = 15;
        break;
      case 'syntax_bug':
        name = '紅色報錯蟲';
        hp = 65;
        width = 34;
        height = 26;
        damage = 20;
        break;
      case 'infinite_loop_slime':
        name = '無限迴圈史萊姆';
        hp = 90;
        width = 38;
        height = 30;
        damage = 22;
        break;
      case 'golden_ratio':
        name = '黃金比例螺線怪';
        hp = 320;
        width = 64;
        height = 64;
        damage = 22;
        break;
      case 'cmyk_slime':
        name = 'CMYK 溢色史萊姆';
        hp = 480;
        width = 68;
        height = 54;
        damage = 26;
        break;
      case 'bsod_golem':
        name = '算圖死當魔像';
        hp = 750;
        width = 76;
        height = 88;
        damage = 36;
        break;
      case 'boss_aesthetic':
        name = '美學妖精・律動與平衡之靈';
        hp = 1200;
        width = 120;
        height = 96;
        damage = 30;
        break;
      case 'boss_color':
        name = '色相魔導・三原色幻象師';
        hp = 1800;
        width = 80;
        height = 96;
        damage = 35;
        break;
      case 'boss_deadline':
        name = '專題總評審・死線魔神';
        hp = 2800;
        width = 110;
        height = 130;
        damage = 45;
        break;
    }

    return {
      id,
      type,
      name,
      x,
      y,
      vx: 0,
      vy: 0,
      width,
      height,
      hp,
      maxHp: hp,
      damage,
      isElite,
      isBoss,
      facingRight: Math.random() > 0.5,
      spawnX: x,
      patrolRadius: isBoss ? 0 : isElite ? 80 : (type === 'quiz_paper' ? 90 : type === 'draft_paper_ball' ? 140 : 100),
      patrolDir: Math.random() > 0.5 ? 1 : -1,
      pauseTimer: 0,
      stateTimer: 0,
      attackTimer: 0,
      isStunned: false,
      stunTimer: 0,
      reviveTimer: 0,
      bossPhase: 1,
      pillarHealthLeft: 120,
      pillarHealthRight: 120,
    };
  }

  // --- Player Actions ---
  private handleJump() {
    if (this.player.isFrozen) return;

    // Drop down through one-way platforms if S is held
    if (this.keys.KeyS && this.player.isGrounded) {
      this.player.y += 6;
      this.player.isGrounded = false;
      return;
    }

    if (this.player.jumpCount < this.player.maxJumps) {
      soundManager.playJump();
      this.player.vy = -12.5;
      this.player.jumpCount++;
      this.player.isGrounded = false;

      // Double jump particle burst
      if (this.player.jumpCount === 2) {
        for (let i = 0; i < 6; i++) {
          this.particles.push({
            x: this.player.x + this.player.width / 2,
            y: this.player.y + this.player.height,
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * 2 + 1,
            color: '#38bdf8',
            size: 3,
            life: 15,
            maxLife: 15,
          });
        }
      }
    }
  }

  private handleDash() {
    if (this.player.dashCooldown > 0 || this.player.isDashing || this.player.isFrozen) return;
    if (this.player.mp < 15) {
      this.floatingTexts.push({
        id: `nomp_dash_${Date.now()}`,
        x: this.player.x,
        y: this.player.y - 20,
        text: 'RAM 不足無法衝刺！',
        color: '#38bdf8',
        size: 11,
        life: 0.7,
        vy: -1.0,
      });
      return;
    }

    // Check wireless mouse hardware
    const hasMouse = this.player.equippedHardware.includes('mouse');
    const dashSpeed = hasMouse ? 16 : 12;
    const cooldown = hasMouse ? 0.35 : 0.6;

    this.player.mp = Math.max(0, this.player.mp - 15);
    this.onStateChange();
    this.player.isDashing = true;
    this.player.dashTimer = 0.22;
    this.player.dashCooldown = cooldown;
    this.player.invulnerableTimer = 0.26;
    this.player.vx = this.player.facingRight ? dashSpeed : -dashSpeed;
    this.player.vy = 0;

    soundManager.playDash();

    // Dash motion blur particles
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: this.player.x + Math.random() * this.player.width,
        y: this.player.y + Math.random() * this.player.height,
        vx: -this.player.vx * 0.2,
        vy: (Math.random() - 0.5) * 2,
        color: '#60a5fa',
        size: 4,
        life: 18,
        maxLife: 18,
      });
    }
  }

  private handleAttack() {
    if (this.player.attackCooldown > 0 || this.player.isFrozen) return;

    const weapon = WEAPONS[this.player.equippedWeapon];
    const hasRam = this.player.equippedHardware.includes('ram');
    const hasGpu = this.player.equippedHardware.includes('gpu');

    // Attack cooldown reduced by 32GB RAM
    const attackCd = hasRam ? weapon.attackSpeed * 0.6 : weapon.attackSpeed;

    this.player.isAttacking = true;
    this.player.attackTimer = 0.18;
    this.player.attackCooldown = attackCd;

    soundManager.playAttack(this.player.equippedWeapon, this.player.comboIndex);

    // Damage calculation
    let baseDmg = weapon.baseDamage;
    if (hasGpu) baseDmg *= 1.5; // RTX 5090 attack boost!

    // Create projectile or swing hitbox
    const dir = this.player.facingRight ? 1 : -1;
    const hitX = this.player.x + (this.player.facingRight ? this.player.width : -weapon.range);
    const hitW = weapon.range;
    const hitY = this.player.y - 10;
    const hitH = this.player.height + 20;

    // 3rd combo special effects
    if (this.player.comboIndex === 2) {
      if (this.player.equippedWeapon === 'ruler') {
        // Fires wind crescent projectile
        this.projectiles.push({
          id: `wind_${Date.now()}`,
          x: this.player.x + (this.player.facingRight ? this.player.width : 0),
          y: this.player.y + 20,
          vx: dir * 9,
          vy: 0,
          width: 28,
          height: 28,
          damage: Math.round(baseDmg * 1.3),
          fromPlayer: true,
          color: '#38bdf8',
          type: 'wind',
          life: 0.6,
          maxLife: 0.6,
        });
      } else if (this.player.equippedWeapon === 'marker') {
        // Creates ink puddle / splashing drops
        for (let i = 0; i < 3; i++) {
          this.projectiles.push({
            id: `ink_${Date.now()}_${i}`,
            x: this.player.x + (this.player.facingRight ? this.player.width : 0),
            y: this.player.y + 20,
            vx: dir * (6 + i * 2),
            vy: (Math.random() - 0.5) * 2,
            width: 14,
            height: 14,
            damage: Math.round(baseDmg * 0.8),
            fromPlayer: true,
            color: ['#06b6d4', '#ec4899', '#eab308'][i],
            type: 'ink',
            life: 0.5,
            maxLife: 0.5,
          });
        }
      }
    }

    // Hit test against enemies in melee range
    for (const enemy of this.enemies) {
      if (this.checkAABB(hitX, hitY, hitW, hitH, enemy.x, enemy.y, enemy.width, enemy.height)) {
        let isCrit = Math.random() < 0.25;
        if (this.player.equippedWeapon === 'compass') isCrit = Math.random() < 0.6; // Compass high crit

        let actualDmg = Math.round(baseDmg * (isCrit ? 1.8 : 1.0));

        this.damageEnemy(enemy, actualDmg, isCrit);
        // Gain ultimate charge on successful attack
        this.player.ultimateCharge = Math.min(100, this.player.ultimateCharge + 3.5);
        // Gain MP (RAM) on successful melee hit!
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + 6);
        this.onStateChange();
      }
    }

    this.player.comboIndex = (this.player.comboIndex + 1) % 3;
  }

  // --- Weapon Skill (L Key) ---
  private handleSkill() {
    if (this.player.skillCooldown > 0 || this.player.isFrozen) return;
    if (this.player.mp < 25) {
      this.floatingTexts.push({
        id: `nomp_${Date.now()}`,
        x: this.player.x,
        y: this.player.y - 20,
        text: 'RAM 不足！(需 25% 記憶體，可按 J 普攻吸取快取)',
        color: '#38bdf8',
        size: 11,
        life: 0.9,
        vy: -1.2,
      });
      return;
    }

    const hasRam = this.player.equippedHardware.includes('ram');
    const hasGpu = this.player.equippedHardware.includes('gpu');
    this.player.mp = Math.max(0, this.player.mp - 25);
    this.player.skillCooldown = hasRam ? 1.4 : 2.0;
    this.onStateChange();

    soundManager.playSkill();
    this.screenShake = 6;

    const dir = this.player.facingRight ? 1 : -1;
    const px = this.player.x + (this.player.facingRight ? this.player.width : 0);
    const py = this.player.y + 20;

    if (this.player.equippedWeapon === 'ruler') {
      // 雙重破空風刃 (Dual Aerodynamic Wind Slices)
      for (let i = 0; i < 2; i++) {
        this.projectiles.push({
          id: `wind_skill_${Date.now()}_${i}`,
          x: px,
          y: py - 8 + i * 16,
          vx: dir * (10 + i * 2),
          vy: (i - 0.5) * 1.5,
          width: 32,
          height: 32,
          damage: Math.round(36 * (hasGpu ? 1.5 : 1.0)),
          fromPlayer: true,
          color: '#38bdf8',
          type: 'wind',
          life: 0.7,
          maxLife: 0.7,
        });
      }
      this.floatingTexts.push({
        id: `skill_name_${Date.now()}`,
        x: this.player.x,
        y: this.player.y - 25,
        text: '【技能：雙重破空風刃】',
        color: '#38bdf8',
        size: 13,
        life: 1.0,
        vy: -1.5,
      });
    } else if (this.player.equippedWeapon === 'compass') {
      // 黃金幾何貫穿 (Golden Piercing Geometry)
      this.projectiles.push({
        id: `compass_skill_${Date.now()}`,
        x: px,
        y: py,
        vx: dir * 15,
        vy: 0,
        width: 44,
        height: 18,
        damage: Math.round(58 * (hasGpu ? 1.5 : 1.0)),
        fromPlayer: true,
        color: '#fbbf24',
        type: 'beam',
        life: 0.5,
        maxLife: 0.5,
      });
      this.floatingTexts.push({
        id: `skill_name_${Date.now()}`,
        x: this.player.x,
        y: this.player.y - 25,
        text: '【技能：黃金精密貫穿】',
        color: '#fbbf24',
        size: 13,
        life: 1.0,
        vy: -1.5,
      });
    } else if (this.player.equippedWeapon === 'marker') {
      // 全彩度潑墨噴濺 (Full Spectrum Ink Burst)
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        this.projectiles.push({
          id: `marker_skill_${Date.now()}_${i}`,
          x: this.player.x + this.player.width / 2,
          y: this.player.y + this.player.height / 2,
          vx: Math.cos(ang) * 9,
          vy: Math.sin(ang) * 9,
          width: 20,
          height: 20,
          damage: Math.round(42 * (hasGpu ? 1.5 : 1.0)),
          fromPlayer: true,
          color: ['#06b6d4', '#ec4899', '#eab308', '#22c55e', '#a855f7', '#f97316'][i],
          type: 'ink',
          life: 0.6,
          maxLife: 0.6,
        });
      }
      this.floatingTexts.push({
        id: `skill_name_${Date.now()}`,
        x: this.player.x,
        y: this.player.y - 25,
        text: '【技能：全色域噴濺波】',
        color: '#ec4899',
        size: 13,
        life: 1.0,
        vy: -1.5,
      });
    } else if (this.player.equippedWeapon === 'stylus') {
      // 8192 筆壓巨型書法斬 (Heavy Brush Slash)
      this.projectiles.push({
        id: `stylus_skill_${Date.now()}`,
        x: px,
        y: py,
        vx: dir * 16,
        vy: 0,
        width: 70,
        height: 45,
        damage: Math.round(95 * (hasGpu ? 1.5 : 1.0)),
        fromPlayer: true,
        color: '#c084fc',
        type: 'beam',
        life: 0.75,
        maxLife: 0.75,
      });
      this.floatingTexts.push({
        id: `skill_name_${Date.now()}`,
        x: this.player.x,
        y: this.player.y - 25,
        text: '【技能：8192 筆壓劍氣】',
        color: '#c084fc',
        size: 14,
        life: 1.0,
        vy: -1.5,
      });
    }

    // Boost ultimate on skill use
    this.player.ultimateCharge = Math.min(100, this.player.ultimateCharge + 10);
  }

  // --- Ultimate Move (O Key) ---
  private handleUltimate() {
    if (this.player.ultimateCharge < 100 || this.player.isFrozen) {
      if (this.player.ultimateCharge < 100) {
        this.floatingTexts.push({
          id: `ult_not_ready_${Date.now()}`,
          x: this.player.x,
          y: this.player.y - 25,
          text: `大招充能中: ${Math.floor(this.player.ultimateCharge)}% (按 J 攻擊或擊敗怪物充能)`,
          color: '#ec4899',
          size: 12,
          life: 0.8,
          vy: -1.2,
        });
      }
      return;
    }

    this.player.ultimateCharge = 0;
    this.player.invulnerableTimer = 2.0; // 2 seconds invulnerability during ultimate
    this.screenShake = 25;
    soundManager.playUltimate();

    // Epic Floating Text Announcement
    this.floatingTexts.push({
      id: `ult_banner_${Date.now()}`,
      x: this.player.x,
      y: this.player.y - 60,
      text: '⚡ 【 爆肝覺醒 · 全螢幕光追終極審判！！ 】 ⚡',
      color: '#fde047',
      size: 24,
      life: 2.2,
      vy: -1.0,
    });

    // Massive particle storm
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: this.cameraX + Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14,
        color: ['#ec4899', '#38bdf8', '#fbbf24', '#22c55e', '#a855f7'][Math.floor(Math.random() * 5)],
        size: Math.random() * 6 + 3,
        life: 40,
        maxLife: 40,
      });
    }

    // Damage ALL visible enemies on screen!
    const screenLeft = this.cameraX;
    const screenRight = this.cameraX + this.canvas.width;
    const hasGpu = this.player.equippedHardware.includes('gpu');
    const ultDamage = Math.round(180 * (hasGpu ? 1.6 : 1.0));

    for (const enemy of [...this.enemies]) {
      if (enemy.x >= screenLeft - 50 && enemy.x <= screenRight + 50) {
        this.damageEnemy(enemy, ultDamage, true);
      }
    }
  }

  // --- Damage System ---
  public damageEnemy(enemy: Enemy, dmg: number, isCrit: boolean = false) {
    enemy.hp -= dmg;
    soundManager.playEnemyHit();

    // Spawn floating damage text
    this.floatingTexts.push({
      id: `dmg_${Date.now()}_${Math.random()}`,
      x: enemy.x + enemy.width / 2,
      y: enemy.y - 10,
      text: `${dmg}${isCrit ? ' 爆擊!' : ''}`,
      color: isCrit ? '#f59e0b' : '#ffffff',
      size: isCrit ? 18 : 13,
      life: 0.8,
      vy: -1.8,
    });

    // Knockback
    const dir = this.player.facingRight ? 1 : -1;
    enemy.vx += dir * (isCrit ? 4.5 : 2.5);

    // Hit particles (RTX 5090 colorful ray-traced particles!)
    const hasGpu = this.player.equippedHardware.includes('gpu');
    const particleCount = hasGpu ? 15 : 6;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: enemy.x + Math.random() * enemy.width,
        y: enemy.y + Math.random() * enemy.height,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color: hasGpu ? ['#ec4899', '#38bdf8', '#fbbf24', '#22c55e'][Math.floor(Math.random() * 4)] : '#ffffff',
        size: Math.random() * 3 + 2,
        life: 20,
        maxLife: 20,
      });
    }

    // Check Boss Phase transition
    if (enemy.type === 'boss_deadline' && enemy.hp <= enemy.maxHp * 0.4 && (enemy.bossPhase || 1) < 2) {
      enemy.bossPhase = 2;
      soundManager.playBossAlarm();
      this.screenShake = 15;
      this.floatingTexts.push({
        id: `berserk_${Date.now()}`,
        x: enemy.x,
        y: enemy.y - 40,
        text: '⚠ 死線暴走！評審進入修改狂暴！',
        color: '#ef4444',
        size: 18,
        life: 2.0,
        vy: -1.0,
      });
    }

    // Check Aesthetic Boss pillar mechanic
    if (enemy.type === 'boss_aesthetic' && !enemy.isStunned) {
      if (Math.random() < 0.3) {
        enemy.isStunned = true;
        enemy.stunTimer = 3.0; // 3 seconds stun when balance disrupted!
        this.floatingTexts.push({
          id: `stun_${Date.now()}`,
          x: enemy.x,
          y: enemy.y - 30,
          text: '★ 對稱平衡崩塌！美學妖精眩暈 3 秒！',
          color: '#38bdf8',
          size: 14,
          life: 2.0,
          vy: -1.2,
        });
      }
    }

    // Check Death
    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  private killEnemy(enemy: Enemy) {
    // If infinite loop slime: check if revived
    if (enemy.type === 'infinite_loop_slime' && (!enemy.reviveTimer || enemy.reviveTimer <= 0)) {
      // Goes into down state for 3 seconds unless blasted
      enemy.reviveTimer = 3.0;
      enemy.hp = 0;
      this.floatingTexts.push({
        id: `revive_${Date.now()}`,
        x: enemy.x,
        y: enemy.y - 20,
        text: '編譯重新佇列中！(3秒內擊碎)',
        color: '#22c55e',
        size: 12,
        life: 1.5,
        vy: -1.0,
      });
      return;
    }

    // Remove from array
    this.enemies = this.enemies.filter((e) => e.id !== enemy.id);

    // Add Credit Score
    const creditBonus = enemy.isBoss ? 20 : enemy.isElite ? 12 : 3;
    this.player.creditScore = Math.min(100, this.player.creditScore + creditBonus);

    // Credit celebration banner if passed 60
    if (this.player.creditScore >= 60 && this.player.creditScore - creditBonus < 60) {
      soundManager.playVictoryFanfare();
      this.floatingTexts.push({
        id: `pass_60_${Date.now()}`,
        x: this.player.x,
        y: this.player.y - 45,
        text: '🎉 學分 60 分及格保衛成功！！低空飛過！！',
        color: '#22c55e',
        size: 20,
        life: 2.5,
        vy: -1.2,
      });
    }

    // Drop loot according to GDD spec
    if (enemy.type === 'golden_ratio') {
      // Drops German compass
      this.spawnLoot(enemy.x, enemy.y, 'weapon', 'compass', '德制圓規與製圖儀器', '#fbbf24');
    } else if (enemy.type === 'cmyk_slime') {
      // Drops Dual-tip marker & Monitor
      this.spawnLoot(enemy.x - 20, enemy.y, 'weapon', 'marker', '雙頭麥克筆', '#f43f5e');
      this.spawnLoot(enemy.x + 20, enemy.y, 'hardware', 'monitor', '高色域校色螢幕', '#eab308');
    } else if (enemy.type === 'bsod_golem') {
      // Drops Pressure stylus & RTX 5090
      this.spawnLoot(enemy.x - 25, enemy.y, 'weapon', 'stylus', '感壓繪圖筆', '#a855f7');
      this.spawnLoot(enemy.x + 25, enemy.y, 'hardware', 'gpu', 'RTX 5090 旗艦顯卡', '#ec4899');
    } else {
      // Minion normal drops: Coffee for HP or RAM for MP
      if (Math.random() < 0.45) {
        this.spawnLoot(enemy.x, enemy.y, 'health_coffee', undefined, '冰美式咖啡 (+HP)', '#22c55e');
      } else if (Math.random() < 0.3) {
        this.spawnLoot(enemy.x, enemy.y, 'ram_boost', undefined, 'RAM 快取條 (+MP)', '#3b82f6');
      }
    }

    // If boss defeated
    if (enemy.isBoss) {
      soundManager.playVictoryFanfare();
      this.screenShake = 18;
      this.portalUnlocked = true;
      this.floatingTexts.push({
        id: `boss_clear_${Date.now()}`,
        x: enemy.x,
        y: enemy.y - 60,
        text: `★ 守護者擊破！${enemy.name} 審核通過！`,
        color: '#fbbf24',
        size: 22,
        life: 3.5,
        vy: -1.0,
      });

      this.floatingTexts.push({
        id: `portal_open_boss_${Date.now()}`,
        x: this.player.x,
        y: this.player.y - 75,
        text: this.currentStageIndex === STAGES.length - 1
          ? '🏆 擊敗最終魔王！走到傳送門按【S】鍵返回現實世界！'
          : '✨ 魔王已被擊潰！傳送門已解鎖！走到最右側傳送門按【S】鍵進入下一關！',
        color: '#facc15',
        size: 16,
        life: 5.0,
        vy: -0.8,
      });
    }

    // If minion/elite stage and elite defeated or all cleared
    const currentConfig = STAGES[this.currentStageIndex];
    if (!currentConfig.isBossStage) {
      if (enemy.isElite || this.enemies.length === 0) {
        this.portalUnlocked = true;
        this.floatingTexts.push({
          id: `portal_open_elite_${Date.now()}`,
          x: this.player.x,
          y: this.player.y - 70,
          text: '✨ 菁英守衛已被討伐！傳送門已解鎖！走到最右側傳送門按【S】鍵進入BOSS決戰！',
          color: '#38bdf8',
          size: 16,
          life: 5.0,
          vy: -0.8,
        });
      }
    }
  }

  private spawnLoot(
    x: number,
    y: number,
    type: LootDrop['type'],
    itemId?: WeaponType | HardwareType,
    name: string = '戰利品',
    color: string = '#f59e0b'
  ) {
    this.lootDrops.push({
      id: `loot_${Date.now()}_${Math.random()}`,
      x,
      y: y - 10,
      vx: (Math.random() - 0.5) * 2,
      vy: -4,
      type,
      itemId,
      name,
      color,
      life: 60,
    });
  }

  public damagePlayer(dmg: number, reason: string = '受擊') {
    if (this.player.invulnerableTimer > 0) return;

    // RTX 5090 Ray Tracing Shield deflection!
    if (this.player.shieldReady) {
      this.player.shieldReady = false;
      this.player.shieldCooldown = 10.0; // 10s cooldown
      soundManager.playShieldBlock();
      this.screenShake = 6;
      this.floatingTexts.push({
        id: `shield_block_${Date.now()}`,
        x: this.player.x,
        y: this.player.y - 25,
        text: '🛡 RTX 5090 光追護盾抵擋致命傷害！',
        color: '#ec4899',
        size: 16,
        life: 1.5,
        vy: -1.5,
      });
      return;
    }

    this.player.hp -= dmg;
    this.player.invulnerableTimer = 1.0;
    this.screenShake = 10;
    soundManager.playPlayerHurt();

    this.floatingTexts.push({
      id: `player_dmg_${Date.now()}`,
      x: this.player.x,
      y: this.player.y - 20,
      text: `-${dmg} (${reason})`,
      color: '#ef4444',
      size: 15,
      life: 1.0,
      vy: -1.5,
    });

    if (this.player.hp <= 0) {
      this.player.hp = 0;
      this.isRunning = false;
      this.onGameOver();
    }
  }

  // --- Main Game Update Loop ---
  public update(dt: number) {
    if (this.isPaused) return;

    // Clamp dt
    dt = Math.min(dt, 0.1);

    // Screen Shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // 1. Update Player timers & cooldowns
    if (this.player.dashCooldown > 0) this.player.dashCooldown -= dt;
    if (this.player.invulnerableTimer > 0) this.player.invulnerableTimer -= dt;
    if (this.player.attackCooldown > 0) this.player.attackCooldown -= dt;
    if (this.player.skillCooldown > 0) this.player.skillCooldown -= dt;

    // Passive Ultimate (大招) Charge over time (+2% per sec, max 100)
    if (this.player.ultimateCharge < 100) {
      this.player.ultimateCharge = Math.min(100, this.player.ultimateCharge + dt * 2.5);
    }

    if (this.player.freezeTimer > 0) {
      this.player.freezeTimer -= dt;
      if (this.player.freezeTimer <= 0) {
        this.player.isFrozen = false;
      }
    }

    if (this.player.isDashing) {
      this.player.dashTimer -= dt;
      if (this.player.dashTimer <= 0) {
        this.player.isDashing = false;
      }
    }

    // Passive MP (RAM memory release) recovery (10% per second)
    this.player.mp = Math.min(this.player.maxMp, this.player.mp + dt * 10);

    // RTX 5090 Shield Cooldown (10s auto-refresh)
    if (this.player.equippedHardware.includes('gpu')) {
      if (!this.player.shieldReady) {
        this.player.shieldCooldown -= dt;
        if (this.player.shieldCooldown <= 0) {
          this.player.shieldReady = true;
          this.floatingTexts.push({
            id: `shield_up_${Date.now()}`,
            x: this.player.x,
            y: this.player.y - 20,
            text: '★ 光線追蹤護盾已就緒 (Shield Ready)!',
            color: '#ec4899',
            size: 12,
            life: 1.0,
            vy: -1.0,
          });
        }
      }
    }

    // Charge attack timer
    if (this.player.isCharging) {
      this.player.chargeTime += dt;
    }

    // 2. Player Movement Physics
    if (!this.player.isFrozen && !this.player.isDashing) {
      const hasMouse = this.player.equippedHardware.includes('mouse');
      const moveSpeed = hasMouse ? 5.8 : 4.4;

      if (this.keys.KeyA) {
        this.player.vx = -moveSpeed;
        this.player.facingRight = false;
      } else if (this.keys.KeyD) {
        this.player.vx = moveSpeed;
        this.player.facingRight = true;
      } else {
        // Friction (Slippery ice in World 2 cold phase)
        const isWorld2Cold = this.bossColorPhase === 'cold' && STAGES[this.currentStageIndex]?.id === 2;
        const friction = isWorld2Cold ? 0.96 : 0.78;
        this.player.vx *= friction;
        if (Math.abs(this.player.vx) < 0.1) this.player.vx = 0;
      }
    }

    // Gravity
    this.player.vy += 0.65;
    if (this.player.vy > 16) this.player.vy = 16;

    // Apply Velocity
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    // Platform Collisions
    this.resolvePlayerPlatformCollisions();

    // Clamp Player to stage boundaries
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x > this.stageWidth) this.player.x = this.stageWidth;

    // Pit Fall Check (Below bottom)
    if (this.player.y > 660) {
      this.damagePlayer(25, '跌落底層');
      this.player.y = 440;
      this.player.vy = -6;
      this.player.x = Math.max(40, this.player.x - 120);
    }

    // Camera follow player
    const targetCamX = this.player.x - this.canvas.width * 0.35;
    this.cameraX += (targetCamX - this.cameraX) * 0.1;
    if (this.cameraX < 0) this.cameraX = 0;
    if (this.cameraX > this.stageWidth - this.canvas.width) {
      this.cameraX = Math.max(0, this.stageWidth - this.canvas.width);
    }

    // 3. Update Enemies
    this.updateEnemies(dt);

    // 4. Update Projectiles
    this.updateProjectiles(dt);

    // 5. Update Loot Drops
    this.updateLootDrops(dt);

    // 6. Update Particles
    this.updateParticles(dt);

    // 7. Update Floating Texts
    this.updateFloatingTexts(dt);

    // 8. Clamp right boundary (Player must press S in front of portal to progress!)
    if (this.player.x > this.stageWidth - 40) {
      this.player.x = this.stageWidth - 40;
    }

    // 9. World 2 Color Phase Cycle (8s cycle)
    const currentConfig = STAGES[this.currentStageIndex];
    if (currentConfig && currentConfig.id === 2) {
      this.colorPhaseTimer += dt;
      if (this.colorPhaseTimer > 8.0) {
        this.colorPhaseTimer = 0;
        this.bossColorPhase = this.bossColorPhase === 'warm' ? 'cold' : 'warm';
      }
    }
  }

  // --- Platform Collision Resolution ---
  private resolvePlayerPlatformCollisions() {
    this.player.isGrounded = false;

    for (const p of this.platforms) {
      // Check Missing Texture platform active cycle
      if (p.type === 'missing_texture') {
        const active = Math.floor(Date.now() / 1400) % 2 === 0;
        if (!active) continue; // Phased out!
      }

      // Check one-way / bounce platforms
      if (p.type === 'one_way' || p.type === 'eraser_bounce' || p.type === 'swatch_boost' || p.type === 'missing_texture') {
        const prevY = this.player.y - this.player.vy;
        if (
          this.player.vy >= 0 &&
          prevY + this.player.height <= p.y + 10 &&
          this.player.y + this.player.height >= p.y &&
          this.player.x + this.player.width > p.x &&
          this.player.x < p.x + p.width
        ) {
          if (p.type === 'eraser_bounce') {
            soundManager.playJump();
            this.player.vy = -18; // Super high bouncy launch!
            this.player.jumpCount = 0;
            this.particles.push({
              x: this.player.x + this.player.width / 2,
              y: p.y,
              vx: 0,
              vy: -2,
              color: '#f43f5e',
              size: 5,
              life: 15,
              maxLife: 15,
            });
            return;
          } else if (p.type === 'swatch_boost') {
            soundManager.playJump();
            this.player.vx = this.player.facingRight ? 14 : -14;
            this.player.vy = -10;
            return;
          }

          // Normal platform land
          this.player.y = p.y - this.player.height;
          this.player.vy = 0;
          this.player.isGrounded = true;
          this.player.jumpCount = 0;
        }
      } else if (p.type === 'fps_drop') {
        // Slow zone
        if (this.checkAABB(this.player.x, this.player.y, this.player.width, this.player.height, p.x, p.y, p.width, p.height)) {
          this.player.vx *= 0.5;
        }
      } else {
        // Solid ground platform
        if (
          this.player.vy >= 0 &&
          this.player.y + this.player.height >= p.y &&
          this.player.y + this.player.height <= p.y + 24 &&
          this.player.x + this.player.width > p.x &&
          this.player.x < p.x + p.width
        ) {
          this.player.y = p.y - this.player.height;
          this.player.vy = 0;
          this.player.isGrounded = true;
          this.player.jumpCount = 0;
        }
      }
    }
  }

  // --- Enemies Behavior & AI ---
  private updateEnemies(dt: number) {
    for (const e of this.enemies) {
      e.stateTimer += dt;
      e.attackTimer += dt;

      // Handle Stun
      if (e.isStunned) {
        e.stunTimer -= dt;
        if (e.stunTimer <= 0) {
          e.isStunned = false;
        }
        continue;
      }

      // Handle Infinite loop slime revives
      if (e.reviveTimer && e.reviveTimer > 0) {
        e.reviveTimer -= dt;
        if (e.reviveTimer <= 0) {
          e.hp = e.maxHp;
          e.reviveTimer = 0;
          this.floatingTexts.push({
            id: `recompile_${Date.now()}`,
            x: e.x,
            y: e.y - 15,
            text: '⚡ 重新編譯完成！無限迴圈復活！',
            color: '#ef4444',
            size: 13,
            life: 1.5,
            vy: -1.0,
          });
        }
        continue;
      }

      // Monster Movement: Bounded Patrol (DO NOT CHASE PLAYER!)
      if (!e.isBoss) {
        if (e.pauseTimer > 0) {
          e.pauseTimer -= dt;
          e.vx = 0;
        } else {
          const minX = e.spawnX - e.patrolRadius;
          const maxX = e.spawnX + e.patrolRadius;

          // Turn around at patrol boundary
          if (e.x <= minX) {
            e.x = minX;
            e.patrolDir = 1;
            e.facingRight = true;
            e.pauseTimer = 0.5; // Brief pause before turning
          } else if (e.x >= maxX) {
            e.x = maxX;
            e.patrolDir = -1;
            e.facingRight = false;
            e.pauseTimer = 0.5;
          }

          let patrolSpeed = 1.6;
          if (e.type === 'draft_paper_ball') patrolSpeed = 2.8;
          else if (e.type === 'quiz_paper') patrolSpeed = 1.3;
          else if (e.type === 'syntax_bug') patrolSpeed = 1.4;
          else if (e.type === 'infinite_loop_slime') patrolSpeed = 1.0;
          else if (e.isElite) patrolSpeed = 1.0;

          e.vx = e.patrolDir * patrolSpeed;
          e.facingRight = e.patrolDir > 0;
        }
      } else {
        if (e.type === 'boss_aesthetic') {
          // World 1 Fairy floats in air and glides dynamically across arena!
          e.facingRight = this.player.x > e.x;
          const targetY = 300 + Math.sin(e.stateTimer * 2.0) * 55;
          e.vy = (targetY - e.y) * 0.08;
          const targetX = 1000 + Math.cos(e.stateTimer * 0.8) * 360;
          e.vx = (targetX - e.x) * 0.04;
        } else if (e.type === 'boss_color') {
          // Chromatic mage hovers gently
          e.facingRight = this.player.x > e.x;
          const targetY = 380 + Math.sin(e.stateTimer * 1.5) * 30;
          e.vy = (targetY - e.y) * 0.08;
          e.vx = 0;
        } else {
          // Boss stays at arena center, does NOT move towards player
          e.vx = 0;
          // Boss faces player only for visual aiming
          e.facingRight = this.player.x > e.x;
        }
      }

      const distToPlayer = Math.abs(this.player.x - e.x);

      // Actions by Enemy Type
      switch (e.type) {
        case 'quiz_paper':
          // Hover smoothly in sine wave within its sky zone
          e.vy = Math.sin(e.stateTimer * 3.5) * 1.5;
          break;

        case 'midterm_paper':
          // Shoot red X if player is in line of sight within 420px
          if (distToPlayer < 420 && e.attackTimer > 3.0) {
            e.attackTimer = 0;
            const shootDir = this.player.x > e.x ? 1 : -1;
            this.projectiles.push({
              id: `x_proj_${Date.now()}`,
              x: e.x + (shootDir > 0 ? e.width : 0),
              y: e.y + 10,
              vx: shootDir * 5.5,
              vy: 0,
              width: 14,
              height: 14,
              damage: 15,
              fromPlayer: false,
              color: '#dc2626',
              type: 'cross',
              life: 2.5,
              maxLife: 2.5,
            });
          }
          break;

        case 'draft_paper_ball':
          // Rolling ball bounces back and forth in its lane
          break;

        case 'syntax_bug':
          // Mechanical red bug crawls its patrol sector
          break;

        case 'golden_ratio':
          // Elite: Spin and cast geometric bullets
          if (e.attackTimer > 2.8) {
            e.attackTimer = 0;
            for (let i = 0; i < 4; i++) {
              const ang = (i * Math.PI) / 2 + e.stateTimer;
              this.projectiles.push({
                id: `geo_${Date.now()}_${i}`,
                x: e.x + e.width / 2,
                y: e.y + e.height / 2,
                vx: Math.cos(ang) * 4.5,
                vy: Math.sin(ang) * 4.5,
                width: 12,
                height: 12,
                damage: 18,
                fromPlayer: false,
                color: '#f59e0b',
                type: 'geometry',
                life: 3.0,
                maxLife: 3.0,
              });
            }
          }
          break;

        case 'cmyk_slime':
          // Elite: Jumps periodically in place
          if (e.attackTimer > 3.0) {
            e.attackTimer = 0;
            e.vy = -6;
          }
          break;

        case 'bsod_golem':
          // Elite: BSOD shockwave smash in its arena
          if (e.attackTimer > 3.5) {
            e.attackTimer = 0;
            // Telegraph warning
            e.telegraphWarning = {
              x: e.x - 120,
              y: e.y + e.height - 15,
              w: 240,
              h: 30,
              timer: 0.8,
            };
            setTimeout(() => {
              if (this.enemies.includes(e)) {
                this.screenShake = 12;
                e.telegraphWarning = null;
                // Shockwave damage
                if (this.player.isGrounded && Math.abs(this.player.x - e.x) < 130) {
                  this.damagePlayer(35, '當機地裂震盪波');
                }
              }
            }, 800);
          }
          break;

        case 'boss_aesthetic': {
          // Hardcore Boss: Aesthetics Fairy (律動與平衡之靈)
          const isPhase2 = e.hp <= e.maxHp * 0.5;
          const attackInterval = isPhase2 ? 1.8 : 2.5;

          if (e.attackTimer > attackInterval) {
            e.attackTimer = 0;
            const roll = Math.random();

            if (roll < 0.35) {
              // Attack 1: Dual Symmetrical Marble Pillar Crush
              const px = this.player.x;
              e.telegraphWarning = {
                x: px - 80,
                y: 120,
                w: 160,
                h: 420,
                timer: 0.75,
              };

              this.floatingTexts.push({
                id: `pillar_warn_${Date.now()}`,
                x: px,
                y: this.player.y - 35,
                text: '⚠ 雙側對稱石柱夾擊！(速跳起或衝刺閃避)',
                color: '#38bdf8',
                size: 13,
                life: 0.8,
                vy: -1.0,
              });

              setTimeout(() => {
                if (this.enemies.includes(e)) {
                  e.telegraphWarning = null;
                  this.screenShake = 14;
                  soundManager.playEnemyHit();

                  for (let i = 0; i < 18; i++) {
                    this.particles.push({
                      x: px + (Math.random() - 0.5) * 140,
                      y: 360 + Math.random() * 160,
                      vx: (Math.random() - 0.5) * 8,
                      vy: (Math.random() - 0.5) * 8,
                      color: '#e2e8f0',
                      size: 4,
                      life: 20,
                      maxLife: 20,
                    });
                  }

                  if (Math.abs(this.player.x - px) < 75 && !this.player.isDashing) {
                    this.damagePlayer(32, '對稱石柱夾擊');
                  }
                }
              }, 750);
            } else if (roll < 0.75) {
              // Attack 2: 【美學審判・天秤律動光束 (Aesthetic Balance Beam)】
              const beamY = this.player.y + 10;
              const dir = e.x < this.player.x ? 1 : -1;
              e.facingRight = dir > 0;

              // Telegraph warning beam line
              e.telegraphWarning = {
                x: dir > 0 ? e.x : 0,
                y: beamY - 16,
                w: dir > 0 ? this.stageWidth - e.x : e.x,
                h: 32,
                timer: 0.8,
              };

              this.floatingTexts.push({
                id: `fairy_beam_warn_${Date.now()}`,
                x: e.x,
                y: e.y - 40,
                text: '⚡ 【天秤審判·律動光束蓄力】(起跳或下蹲躲避！)',
                color: '#c084fc',
                size: 14,
                life: 0.9,
                vy: -1.0,
              });

              setTimeout(() => {
                if (this.enemies.includes(e)) {
                  e.telegraphWarning = null;
                  this.screenShake = 16;
                  soundManager.playSkill();

                  this.projectiles.push({
                    id: `fairy_beam_${Date.now()}`,
                    x: e.x + (dir > 0 ? 30 : -30),
                    y: beamY,
                    vx: dir * 18,
                    vy: 0,
                    width: 140,
                    height: 28,
                    damage: 32,
                    fromPlayer: false,
                    color: '#c084fc',
                    type: 'beam',
                    life: 1.0,
                    maxLife: 1.0,
                  });
                }
              }, 800);
            } else {
              // Attack 3: Fibonacci Golden Spiral Bullet Hell
              const bulletCount = isPhase2 ? 8 : 6;
              for (let i = 0; i < bulletCount; i++) {
                const angle = (i * Math.PI * 2) / bulletCount + e.stateTimer * 2;
                const speed = isPhase2 ? 5.8 : 4.5;
                this.projectiles.push({
                  id: `spiral_${Date.now()}_${i}`,
                  x: e.x + e.width / 2,
                  y: e.y + e.height / 2,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  width: 14,
                  height: 14,
                  damage: 22,
                  fromPlayer: false,
                  color: '#fbbf24',
                  type: 'geometry',
                  life: 3.2,
                  maxLife: 3.2,
                });
              }
            }
          }
          break;
        }

        case 'boss_color': {
          // Chromatic Mage (三原色幻象師) - Optimized bullet density & balanced pace
          const isWarm = this.bossColorPhase === 'warm';
          const interval = isWarm ? 2.6 : 3.0; // Moderate rhythm, fair dodge windows

          if (e.attackTimer > interval) {
            e.attackTimer = 0;

            if (isWarm) {
              // WARM PHASE: 2 Meteors (instead of 4) or 3-Way RGB Prism
              const roll = Math.random();
              if (roll < 0.5) {
                // 2 Fiery Meteors tracking with ground telegraph
                for (let i = 0; i < 2; i++) {
                  this.projectiles.push({
                    id: `meteor_${Date.now()}_${i}`,
                    x: this.player.x + (i === 0 ? -50 : 50) + (Math.random() - 0.5) * 30,
                    y: 40,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: 6.2,
                    width: 16,
                    height: 16,
                    damage: 24,
                    fromPlayer: false,
                    color: ['#ef4444', '#f97316'][i],
                    type: 'fire',
                    life: 2.2,
                    maxLife: 2.2,
                  });
                }
              } else {
                // 3-Way RGB Prism Laser Bolt (Wide spread with gap)
                const targetAngle = Math.atan2(
                  this.player.y - (e.y + e.height / 2),
                  this.player.x - (e.x + e.width / 2)
                );
                for (let i = -1; i <= 1; i++) {
                  const ang = targetAngle + (i * Math.PI) / 7;
                  this.projectiles.push({
                    id: `prism_${Date.now()}_${i}`,
                    x: e.x + e.width / 2,
                    y: e.y + e.height / 2,
                    vx: Math.cos(ang) * 5.8,
                    vy: Math.sin(ang) * 5.8,
                    width: 16,
                    height: 16,
                    damage: 22,
                    fromPlayer: false,
                    color: ['#06b6d4', '#ec4899', '#eab308'][i + 1],
                    type: 'ink',
                    life: 2.8,
                    maxLife: 2.8,
                  });
                }
              }
            } else {
              // COLD PHASE: 2 Frost Crystals (slower, readable)
              for (let i = 0; i < 2; i++) {
                const ang = Math.atan2(
                  this.player.y - (e.y + e.height / 2),
                  this.player.x - (e.x + e.width / 2)
                ) + (i === 0 ? -0.2 : 0.2);
                this.projectiles.push({
                  id: `frost_${Date.now()}_${i}`,
                  x: e.x + e.width / 2,
                  y: e.y + e.height / 2,
                  vx: Math.cos(ang) * 4.2,
                  vy: Math.sin(ang) * 4.2,
                  width: 16,
                  height: 16,
                  damage: 22,
                  fromPlayer: false,
                  color: '#38bdf8',
                  type: 'frost',
                  life: 3.0,
                  maxLife: 3.0,
                });
              }

              // Freeze Ground Spikes telegraph with generous 1.1s window
              const groundX = this.player.x;
              e.telegraphWarning = {
                x: groundX - 50,
                y: 500,
                w: 100,
                h: 40,
                timer: 1.1,
              };

              setTimeout(() => {
                if (this.enemies.includes(e)) {
                  e.telegraphWarning = null;
                  if (this.player.isGrounded && Math.abs(this.player.x - groundX) < 55) {
                    this.damagePlayer(25, '絕對零度凍土冰刺');
                    this.player.isFrozen = true;
                    this.player.freezeTimer = 0.8;
                  }
                }
              }, 1100);
            }
          }
          break;
        }

        case 'boss_deadline': {
          // Final Hardcore Boss: Deadline Overlord (專題總評審・死線魔神)
          const isPhase2 = (e.bossPhase || 1) >= 2;
          const cd = isPhase2 ? 1.6 : 2.5;

          if (e.attackTimer > cd) {
            e.attackTimer = 0;
            const roll = Math.random();

            if (isPhase2 && roll < 0.42) {
              // Full Screen Screen-Wipe Nuke: "檔案未儲存！！" (100 DMG)
              soundManager.playBossAlarm();
              e.telegraphWarning = {
                x: this.cameraX,
                y: 0,
                w: this.canvas.width,
                h: this.canvas.height,
                timer: 1.3,
              };
              this.floatingTexts.push({
                id: `nuke_warn_${Date.now()}`,
                x: this.player.x,
                y: this.player.y - 50,
                text: '⚠ 毀滅警報：檔案未儲存！(靠 5090 護盾或按 K 翻滾閃避無敵幀) ⚠',
                color: '#ef4444',
                size: 16,
                life: 1.4,
                vy: -1.0,
              });

              setTimeout(() => {
                if (this.enemies.includes(e)) {
                  e.telegraphWarning = null;
                  this.screenShake = 25;
                  this.damagePlayer(100, '檔案未儲存全螢幕毀滅打擊');
                }
              }, 1300);
            } else if (roll < 0.72) {
              // Revision Paper Hurricane: 5 razor sharp paper sheets
              const dir = e.facingRight ? 1 : -1;
              for (let i = 0; i < 5; i++) {
                this.projectiles.push({
                  id: `rev_${Date.now()}_${i}`,
                  x: e.x + (e.facingRight ? e.width : 0),
                  y: e.y + 15 + i * 20,
                  vx: dir * (6.5 + i * 1.5),
                  vy: (i - 2) * 1.6,
                  width: 24,
                  height: 16,
                  damage: 28,
                  fromPlayer: false,
                  color: '#dc2626',
                  type: 'revision',
                  life: 3.5,
                  maxLife: 3.5,
                });
              }
            } else {
              // Stamp Earth Shockwave (travels in both directions)
              soundManager.playEnemyHit();
              this.screenShake = 14;
              this.floatingTexts.push({
                id: `stamp_${Date.now()}`,
                x: e.x + e.width / 2,
                y: e.y - 20,
                text: '【全班當掉大紅印章！】',
                color: '#ef4444',
                size: 16,
                life: 1.0,
                vy: -1.2,
              });

              [-1, 1].forEach((dir) => {
                this.projectiles.push({
                  id: `shockwave_${Date.now()}_${dir}`,
                  x: e.x + e.width / 2,
                  y: 520,
                  vx: dir * 7.5,
                  vy: 0,
                  width: 32,
                  height: 25,
                  damage: 32,
                  fromPlayer: false,
                  color: '#ef4444',
                  type: 'cross',
                  life: 2.6,
                  maxLife: 2.6,
                });
              });
            }
          }
          break;
        }
      }

      // Physics integration for enemies
      if (e.type === 'boss_aesthetic' || e.type === 'boss_color' || e.type === 'quiz_paper') {
        // Aerial hovering bosses/enemies: don't pull to floor
        e.x += e.vx;
        e.y += e.vy;
      } else {
        e.vy += 0.4;
        e.x += e.vx;
        e.y += e.vy;

        // Enemy ground collision
        if (e.y + e.height > 540) {
          e.y = 540 - e.height;
          e.vy = 0;
        }
      }

      // Enemy touch damage to player
      if (
        !this.player.isDashing &&
        this.player.invulnerableTimer <= 0 &&
        this.checkAABB(this.player.x, this.player.y, this.player.width, this.player.height, e.x, e.y, e.width, e.height)
      ) {
        // Red Syntax Bug freeze
        if (e.type === 'syntax_bug' && !this.player.equippedHardware.includes('ram')) {
          this.player.isFrozen = true;
          this.player.freezeTimer = 1.0;
        }
        this.damagePlayer(e.damage, e.name);

        // Separation knockback to prevent getting stuck
        const knockDir = this.player.x < e.x ? -1 : 1;
        this.player.vx = knockDir * 4.5;
        this.player.vy = -3.2;
      }
    }
  }

  // --- Projectiles Update ---
  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;
      p.x += p.vx;
      p.y += p.vy;

      if (p.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check hit against enemies if from player
      if (p.fromPlayer) {
        for (const e of this.enemies) {
          if (this.checkAABB(p.x, p.y, p.width, p.height, e.x, e.y, e.width, e.height)) {
            this.damageEnemy(e, p.damage, p.type === 'beam');
            if (p.type !== 'beam') {
              this.projectiles.splice(i, 1);
              break;
            }
          }
        }
      } else {
        // From enemy to player
        if (
          !this.player.isDashing &&
          this.checkAABB(p.x, p.y, p.width, p.height, this.player.x, this.player.y, this.player.width, this.player.height)
        ) {
          if (p.type === 'frost') {
            this.player.isFrozen = true;
            this.player.freezeTimer = 0.8;
          }
          const damageReason = p.type === 'frost' ? '極寒冰晶凍結' : p.type === 'revision' ? '改稿裁決' : '魔王彈幕';
          this.damagePlayer(p.damage, damageReason);
          this.projectiles.splice(i, 1);
        }
      }
    }
  }

  // --- Loot Drops Update ---
  private updateLootDrops(dt: number) {
    for (let i = this.lootDrops.length - 1; i >= 0; i--) {
      const d = this.lootDrops[i];
      d.vy += 0.3;
      d.x += d.vx;
      d.y += d.vy;
      if (d.y > 520) {
        d.y = 520;
        d.vy = 0;
        d.vx = 0;
      }

      // Pickup distance
      const dist = Math.hypot(this.player.x + this.player.width / 2 - d.x, this.player.y + this.player.height / 2 - d.y);
      if (dist < 36) {
        soundManager.playLootPickup();
        if (d.type === 'health_coffee') {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + 35);
          this.floatingTexts.push({
            id: `hp_${Date.now()}`,
            x: this.player.x,
            y: this.player.y - 20,
            text: '+35 HP 肝臟新鮮度回滿！',
            color: '#22c55e',
            size: 14,
            life: 1.2,
            vy: -1.5,
          });
        } else if (d.type === 'ram_boost') {
          this.player.mp = this.player.maxMp;
          this.floatingTexts.push({
            id: `mp_${Date.now()}`,
            x: this.player.x,
            y: this.player.y - 20,
            text: '+RAM 記憶體快取釋放完畢！',
            color: '#3b82f6',
            size: 14,
            life: 1.2,
            vy: -1.5,
          });
        } else if (d.type === 'weapon' && d.itemId) {
          const wId = d.itemId as WeaponType;
          if (!this.player.inventoryWeapons.includes(wId)) {
            this.player.inventoryWeapons.push(wId);
          }
          this.player.equippedWeapon = wId;
          this.floatingTexts.push({
            id: `wep_${Date.now()}`,
            x: this.player.x,
            y: this.player.y - 30,
            text: `★ 獲得神兵：${d.name}！`,
            color: d.color,
            size: 16,
            life: 2.0,
            vy: -1.5,
          });
        } else if (d.type === 'hardware' && d.itemId) {
          const hId = d.itemId as HardwareType;
          if (!this.player.inventoryHardware.includes(hId)) {
            this.player.inventoryHardware.push(hId);
          }
          if (!this.player.equippedHardware.includes(hId) && this.player.equippedHardware.length < 2) {
            this.player.equippedHardware.push(hId);
          }
          this.floatingTexts.push({
            id: `hw_${Date.now()}`,
            x: this.player.x,
            y: this.player.y - 30,
            text: `★ 硬體升級完成：${d.name}！`,
            color: d.color,
            size: 16,
            life: 2.0,
            vy: -1.5,
          });
        }

        this.lootDrops.splice(i, 1);
        this.onStateChange();
      }
    }
  }

  // --- Particles & Text ---
  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= 1;
      p.x += p.vx;
      p.y += p.vy;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y += ft.vy;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // --- AABB Collision Check ---
  private checkAABB(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  // --- Weapon / Hardware Switching API ---
  public switchWeapon(weaponId: WeaponType) {
    if (this.player.inventoryWeapons.includes(weaponId)) {
      this.player.equippedWeapon = weaponId;
      soundManager.playAttack(weaponId, 0);
      this.onStateChange();
    }
  }

  public toggleHardware(hardwareId: HardwareType) {
    if (!this.player.inventoryHardware.includes(hardwareId)) return;

    if (this.player.equippedHardware.includes(hardwareId)) {
      this.player.equippedHardware = this.player.equippedHardware.filter((h) => h !== hardwareId);
    } else {
      if (this.player.equippedHardware.length >= 2) {
        this.player.equippedHardware.shift(); // remove oldest to keep max 2
      }
      this.player.equippedHardware.push(hardwareId);
      soundManager.playLootPickup();
    }
    this.onStateChange();
  }

  // --- Engine Start & Render Loop ---
  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      this.update(dt);

      const stageConfig = STAGES[this.currentStageIndex];
      const isBossStage = !!stageConfig.isBossStage;
      const activeBoss = this.enemies.find((e) => e.isBoss) || null;
      const isFinalStage = this.currentStageIndex === STAGES.length - 1;
      const distToPortal = Math.abs(this.player.x - (this.stageWidth - 100));
      const isNearPortal = distToPortal < 90;

      this.renderer.render(
        stageConfig.id,
        this.cameraX,
        this.player,
        this.enemies,
        this.projectiles,
        this.particles,
        this.floatingTexts,
        this.lootDrops,
        this.platforms,
        this.screenShake,
        this.stageWidth,
        this.portalUnlocked,
        isNearPortal,
        isBossStage,
        activeBoss,
        isFinalStage,
        this.bossColorPhase
      );

      if (this.isRunning) {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    soundManager.stopBGM();
  }

  public restart() {
    this.player = this.createInitialPlayer();
    this.loadStage(0);
    this.isPaused = false;
    this.start();
  }
}
