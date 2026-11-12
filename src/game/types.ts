export type WeaponType = 'ruler' | 'compass' | 'marker' | 'stylus';
export type HardwareType = 'mouse' | 'ram' | 'monitor' | 'gpu';

export interface WeaponInfo {
  id: WeaponType;
  name: string;
  subname: string;
  desc: string;
  baseDamage: number;
  attackSpeed: number; // in seconds
  range: number;
  color: string;
}

export interface HardwareInfo {
  id: HardwareType;
  name: string;
  subname: string;
  desc: string;
  iconName: string;
  color: string;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  mp: number; // RAM usage / stamina
  maxMp: number;
  isGrounded: boolean;
  jumpCount: number;
  maxJumps: number;
  facingRight: boolean;
  isDashing: boolean;
  dashTimer: number;
  dashCooldown: number;
  invulnerableTimer: number;
  isAttacking: boolean;
  attackTimer: number;
  attackCooldown: number;
  comboIndex: number;
  isCharging: boolean;
  chargeTime: number;
  skillCooldown: number;
  ultimateCharge: number;
  maxUltimateCharge: number;
  ultimateCooldown: number;
  equippedWeapon: WeaponType;
  inventoryWeapons: WeaponType[];
  equippedHardware: HardwareType[];
  inventoryHardware: HardwareType[];
  shieldReady: boolean;
  shieldCooldown: number;
  creditScore: number; // 0 to 100
  isFrozen: boolean;
  freezeTimer: number;
}

export type EnemyType =
  | 'quiz_paper'
  | 'midterm_paper'
  | 'draft_paper_ball'
  | 'syntax_bug'
  | 'infinite_loop_slime'
  | 'golden_ratio'
  | 'cmyk_slime'
  | 'bsod_golem'
  | 'boss_aesthetic'
  | 'boss_color'
  | 'boss_deadline';

export interface Enemy {
  id: string;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  damage: number;
  isBoss?: boolean;
  isElite?: boolean;
  facingRight: boolean;
  spawnX: number;
  patrolRadius: number;
  patrolDir: number;
  pauseTimer: number;
  stateTimer: number;
  attackTimer: number;
  isStunned: boolean;
  stunTimer: number;
  reviveTimer?: number; // For infinite loop slime
  colorPhase?: 'warm' | 'cold'; // For boss_color
  bossPhase?: number; // For deadline overlord phase 1 / 2
  pillarHealthLeft?: number; // For boss_aesthetic
  pillarHealthRight?: number;
  telegraphWarning?: { x: number; y: number; w: number; h: number; timer: number } | null;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  damage: number;
  fromPlayer: boolean;
  color: string;
  type: 'slash' | 'wind' | 'ink' | 'beam' | 'cross' | 'geometry' | 'fire' | 'clock_hand' | 'revision' | 'frost';
  life: number;
  maxLife: number;
}

export interface LootDrop {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'weapon' | 'hardware' | 'health_coffee' | 'ram_boost';
  itemId?: WeaponType | HardwareType;
  name: string;
  color: string;
  life: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'one_way' | 'eraser_bounce' | 'swatch_boost' | 'missing_texture' | 'fps_drop';
  active?: boolean;
  color?: string;
  label?: string;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  life: number;
  vy: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface GameStageConfig {
  id: number;
  name: string;
  discipline: string;
  subtitle: string;
  width: number;
  bgTheme: string;
  platforms: Platform[];
  spawnEnemies: { type: EnemyType; x: number; y: number }[];
  elite?: { type: EnemyType; x: number; y: number };
  boss?: { type: EnemyType; x: number; y: number };
  nextStageX: number;
  isBossStage?: boolean;
}
