import { Enemy, FloatingText, LootDrop, Particle, Platform, PlayerState, Projectile } from './types';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  public render(
    stageId: number,
    cameraX: number,
    player: PlayerState,
    enemies: Enemy[],
    projectiles: Projectile[],
    particles: Particle[],
    floatingTexts: FloatingText[],
    lootDrops: LootDrop[],
    platforms: Platform[],
    screenShake: number,
    stageWidth: number,
    portalUnlocked: boolean,
    isNearPortal: boolean,
    isBossStage: boolean,
    activeBoss: Enemy | null,
    isFinalStage: boolean,
    bossColorPhase?: 'warm' | 'cold'
  ) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.save();

    // Screen Shake
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake;
      const shakeY = (Math.random() - 0.5) * screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw Parallax Background
    this.drawBackground(stageId, cameraX, width, height, bossColorPhase);

    // Apply Camera translation for world space objects
    ctx.save();
    ctx.translate(-cameraX, 0);

    // 2. Draw Platforms & Level Elements
    this.drawPlatforms(platforms, cameraX, width);

    // 3. Draw Loot Drops
    this.drawLootDrops(lootDrops);

    // 4. Draw Telegraph Warning Zones (from Monitor or Boss)
    this.drawTelegraphWarnings(enemies);

    // 5. Draw Enemies
    this.drawEnemies(enemies);

    // 6. Draw Player
    this.drawPlayer(player);

    // 7. Draw Projectiles
    this.drawProjectiles(projectiles);

    // 8. Draw Particles
    this.drawParticles(particles);

    // 9. Draw Floating Numbers
    this.drawFloatingTexts(floatingTexts);

    // 10. Draw Next Stage Exit Portal (Interactive: Press S)
    this.drawExitPortal(stageWidth - 100, 430, portalUnlocked, isNearPortal, isFinalStage, isBossStage);

    ctx.restore(); // Restore camera translation

    // 11. Dedicated Boss Health Bar & Phase Indicator (if in Boss Stage)
    if (activeBoss) {
      this.drawDedicatedBossBar(activeBoss, width);
    }

    // 12. Overlays (Flash, Freeze vignette)
    if (player.isFrozen) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ 語法錯誤！系統凍結中 (SYNTAX ERROR FROZEN) ⚠', width / 2, 90);
    }

    ctx.restore(); // Restore screen shake
  }

  // --- Background Drawing ---
  private drawBackground(
    stageId: number,
    cameraX: number,
    width: number,
    height: number,
    bossColorPhase?: 'warm' | 'cold'
  ) {
    const ctx = this.ctx;

    if (stageId === 1) {
      // Stage 1: Line & Composition (Drafting Paper Grid)
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      const gridSize = 32;
      const offsetX = -(cameraX * 0.2) % gridSize;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = offsetX; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Faint golden ratio spirals & pencil sketches in distance
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)';
      ctx.lineWidth = 1.5;
      const bgSpiralX = 350 - (cameraX * 0.1) % 1200;
      ctx.beginPath();
      ctx.arc(bgSpiralX, 220, 90, 0, Math.PI * 1.5);
      ctx.stroke();

      // Ruler edge at bottom
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, height - 12, width, 12);
      ctx.strokeStyle = '#64748b';
      for (let rx = 0; rx < width; rx += 16) {
        ctx.beginPath();
        ctx.moveTo(rx, height - 12);
        ctx.lineTo(rx, height - (rx % 64 === 0 ? 0 : 6));
        ctx.stroke();
      }
    } else if (stageId === 2) {
      // Stage 2: Pantone Swatch Forest (Dynamic Cold/Warm Phase)
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      if (bossColorPhase === 'cold') {
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#0369a1');
        grad.addColorStop(1, '#0e7490');
      } else if (bossColorPhase === 'warm') {
        grad.addColorStop(0, '#431407');
        grad.addColorStop(0.5, '#c2410c');
        grad.addColorStop(1, '#f97316');
      } else {
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(0.5, '#4c1d95');
        grad.addColorStop(1, '#be185d');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Floating giant color swatch bars in background
      const swatchColors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
      for (let i = 0; i < 7; i++) {
        const sx = (i * 240 - cameraX * 0.15) % (width + 300) - 100;
        ctx.fillStyle = swatchColors[i % swatchColors.length];
        ctx.globalAlpha = 0.15;
        ctx.fillRect(sx, 120 + (i % 3) * 60, 90, 220);
        ctx.globalAlpha = 1.0;
      }
    } else {
      // Stage 3: Engine Temple (Wireframes, XYZ Gizmo, Missing Texture)
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Coordinate axes & blueprint lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      const ox = -(cameraX * 0.3) % 60;
      ctx.beginPath();
      for (let x = ox; x < width; x += 60) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 60) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // XYZ Gizmo in top background
      ctx.save();
      ctx.translate(120, 80);
      // X axis (Red)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(35, 0);
      ctx.stroke();
      // Y axis (Green)
      ctx.strokeStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -35);
      ctx.stroke();
      // Z axis (Blue)
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-20, 20);
      ctx.stroke();
      ctx.restore();

      // Floating code strings
      ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.font = '12px monospace';
      ctx.fillText('void Update() { CheckDeadlines(); }', 300 - (cameraX * 0.1) % 800, 140);
      ctx.fillText('Shader "Compile/FinalPass" { ... }', 550 - (cameraX * 0.15) % 900, 260);
    }
  }

  // --- Platforms Drawing ---
  private drawPlatforms(platforms: Platform[], cameraX: number, screenWidth: number) {
    const ctx = this.ctx;

    for (const p of platforms) {
      // Culling
      if (p.x + p.width < cameraX - 100 || p.x > cameraX + screenWidth + 100) continue;

      if (p.type === 'eraser_bounce') {
        // Pink eraser with white label
        ctx.fillStyle = p.color || '#fb7185';
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.width, p.height, 6);
        ctx.fill();

        // Eraser band
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(p.x + 10, p.y + 4, p.width - 20, p.height - 8);
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('彈力橡皮', p.x + p.width / 2, p.y + p.height / 2 + 3);
      } else if (p.type === 'swatch_boost') {
        // Color boost pad
        ctx.fillStyle = p.color || '#ec4899';
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▲ SPEED ▲', p.x + p.width / 2, p.y + p.height / 2 + 4);
      } else if (p.type === 'missing_texture') {
        // Purple & Black Checkerboard (blinking)
        const size = 14;
        const cols = Math.ceil(p.width / size);
        const rows = Math.ceil(p.height / size);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            ctx.fillStyle = (r + c) % 2 === 0 ? '#d946ef' : '#000000';
            ctx.fillRect(p.x + c * size, p.y + r * size, Math.min(size, p.width - c * size), Math.min(size, p.height - r * size));
          }
        }
        ctx.strokeStyle = '#a855f7';
        ctx.strokeRect(p.x, p.y, p.width, p.height);
      } else if (p.type === 'fps_drop') {
        // Red warning fps drop zone
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.fillStyle = '#fee2e2';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ 掉幀泥沼 (FPS DROP)', p.x + p.width / 2, p.y + p.height / 2 + 3);
      } else {
        // Standard Solid / One-way platform
        ctx.fillStyle = p.color || '#334155';
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.width, p.height, 4);
        ctx.fill();

        // Platform top border highlight
        ctx.fillStyle = '#64748b';
        ctx.fillRect(p.x, p.y, p.width, 3);

        if (p.label) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(p.label, p.x + p.width / 2, p.y + 16);
        }
      }
    }
  }

  // --- Player Drawing ---
  private drawPlayer(player: PlayerState) {
    const ctx = this.ctx;
    const px = player.x;
    const py = player.y;
    const w = player.width;
    const h = player.height;

    ctx.save();

    // Invulnerability blink
    if (player.invulnerableTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Ultimate Ready Aura
    if (player.ultimateCharge >= 100) {
      ctx.save();
      const pulse = Math.sin(Date.now() / 120) * 4;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.beginPath();
      ctx.ellipse(px + w / 2, py + h + 2, 22 + pulse, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // RTX 5090 Ray Tracing Shield Orbit
    if (player.shieldReady) {
      const angle = Date.now() / 400;
      const shieldX = px + w / 2 + Math.cos(angle) * 36;
      const shieldY = py + h / 2 + Math.sin(angle) * 22;

      ctx.save();
      ctx.strokeStyle = '#ec4899';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Draw spinning hexagon
      for (let i = 0; i < 6; i++) {
        const hAngle = (i * Math.PI) / 3 + angle * 2;
        const hx = shieldX + Math.cos(hAngle) * 12;
        const hy = shieldY + Math.sin(hAngle) * 12;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = 'rgba(236, 72, 153, 0.25)';
      ctx.fill();
      ctx.restore();
    }

    // Direction flip
    if (!player.facingRight) {
      ctx.translate(px + w / 2, py + h / 2);
      ctx.scale(-1, 1);
      ctx.translate(-(px + w / 2), -(py + h / 2));
    }

    // Dashing trail shadow
    if (player.isDashing) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.fillRect(px - 10, py, w, h);
    }

    // 1. Student Canvas Bag (Slung on back)
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.roundRect(px - 4, py + 18, 14, 20, 3);
    ctx.fill();
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Student Legs / Pants
    ctx.fillStyle = '#1e293b';
    const legOffset = player.vx !== 0 ? Math.sin(Date.now() / 80) * 6 : 0;
    // Left leg
    ctx.fillRect(px + 8, py + 34, 8, 18 + legOffset);
    // Right leg
    ctx.fillRect(px + 18, py + 34, 8, 18 - legOffset);
    // Shoes (Casual sneakers)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px + 6, py + 50 + legOffset, 12, 5);
    ctx.fillRect(px + 16, py + 50 - legOffset, 12, 5);

    // 3. Student Hoodie (Dark navy / charcoal)
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(px + 4, py + 14, 26, 22, 5);
    ctx.fill();

    // Hoodie pocket with fine-liner pen sticking out
    ctx.fillStyle = '#475569';
    ctx.fillRect(px + 10, py + 24, 14, 10);
    // Pen (Black barrel, silver clip)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px + 12, py + 18, 3, 10);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(px + 11, py + 20, 2, 4);

    // 4. Head & Face (Tired High School Art Student)
    // Skin
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(px + 17, py + 10, 11, 0, Math.PI * 2);
    ctx.fill();

    // Messy hair
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(px + 17, py + 8, 12, Math.PI, Math.PI * 2);
    ctx.fill();
    // Hair tufts
    ctx.beginPath();
    ctx.moveTo(px + 7, py + 6);
    ctx.lineTo(px + 3, py + 1);
    ctx.lineTo(px + 12, py + 3);
    ctx.fill();

    // Deep Dark Circles (relatable熬夜黑眼圈)
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.ellipse(px + 21, py + 13, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye (Sleepy yet determined)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(px + 21, py + 11, 2, 0, Math.PI * 2);
    ctx.fill();

    // 5. Weapon Drawing
    this.drawPlayerWeapon(player, px, py);

    ctx.restore();
  }

  // Draw currently held weapon in student's hand
  private drawPlayerWeapon(player: PlayerState, px: number, py: number) {
    const ctx = this.ctx;
    const handX = px + 26;
    const handY = py + 25;

    ctx.save();
    ctx.translate(handX, handY);

    // Attack swing rotation
    if (player.isAttacking) {
      const swingAngle = Math.PI / 4 + Math.sin(player.attackTimer * 10) * 1.2;
      ctx.rotate(swingAngle);
    }

    if (player.equippedWeapon === 'ruler') {
      // 塑膠三角板 (Cyan transparent triangle with measurement marks)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(32, -14);
      ctx.lineTo(32, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Hollow center of set square
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(24, -7);
      ctx.lineTo(24, 7);
      ctx.closePath();
      ctx.fill();
    } else if (player.equippedWeapon === 'compass') {
      // 德制圓規 (Precision metal compass)
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(26, -10);
      ctx.moveTo(0, 0);
      ctx.lineTo(32, 4);
      ctx.stroke();
      // Needle tip
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(32, 3, 6, 2);
    } else if (player.equippedWeapon === 'marker') {
      // 雙頭麥克筆 (Chisel tip dual-end marker)
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(0, -5, 34, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, -5, 14, 10);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText('COPIC', 12, 2);
      // Nib
      ctx.fillStyle = '#be123c';
      ctx.beginPath();
      ctx.moveTo(34, -4);
      ctx.lineTo(42, 0);
      ctx.lineTo(34, 4);
      ctx.fill();
    } else if (player.equippedWeapon === 'stylus') {
      // 感壓繪圖筆 (Wacom Pro Pen stylus)
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(38, -2);
      ctx.lineTo(46, 0); // nib
      ctx.lineTo(38, 2);
      ctx.lineTo(0, 3);
      ctx.closePath();
      ctx.fill();
      // Silver button ring
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(16, -4, 8, 8);

      // Charge aura glow
      if (player.isCharging || player.chargeTime > 0) {
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#e9d5ff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // --- Telegraph Warnings ---
  private drawTelegraphWarnings(enemies: Enemy[]) {
    const ctx = this.ctx;
    for (const e of enemies) {
      if (e.telegraphWarning) {
        const tw = e.telegraphWarning;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.fillRect(tw.x, tw.y, tw.w, tw.h);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(tw.x, tw.y, tw.w, tw.h);
        ctx.setLineDash([]);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚠ DANGER / 致命範圍 ⚠', tw.x + tw.w / 2, tw.y - 8);
      }
    }
  }

  // --- Enemies & Bosses Drawing ---
  private drawEnemies(enemies: Enemy[]) {
    const ctx = this.ctx;
    for (const e of enemies) {
      ctx.save();
      ctx.translate(e.x + e.width / 2, e.y + e.height / 2);
      if (!e.facingRight) {
        ctx.scale(-1, 1);
      }

      switch (e.type) {
        case 'quiz_paper':
          this.drawQuizPaper(e);
          break;
        case 'midterm_paper':
          this.drawMidtermPaper(e);
          break;
        case 'draft_paper_ball':
          this.drawDraftPaperBall(e);
          break;
        case 'syntax_bug':
          this.drawSyntaxBug(e);
          break;
        case 'infinite_loop_slime':
          this.drawInfiniteLoopSlime(e);
          break;
        case 'golden_ratio':
          this.drawGoldenRatio(e);
          break;
        case 'cmyk_slime':
          this.drawCmykSlime(e);
          break;
        case 'bsod_golem':
          this.drawBsodGolem(e);
          break;
        case 'boss_aesthetic':
          this.drawBossAesthetic(e);
          break;
        case 'boss_color':
          this.drawBossColor(e);
          break;
        case 'boss_deadline':
          this.drawBossDeadline(e);
          break;
      }

      ctx.restore();

      // Draw HP Bar over enemy
      this.drawEnemyHpBar(e);
    }
  }

  // 1. 隨堂小考卷
  private drawQuizPaper(e: Enemy) {
    const ctx = this.ctx;
    const flap = Math.sin(Date.now() / 90) * 8;

    // Wings
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    // Left Wing
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-24, -14 + flap);
    ctx.lineTo(-18, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Right Wing
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(24, -14 + flap);
    ctx.lineTo(18, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Paper Body
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.roundRect(-14, -16, 28, 32, 2);
    ctx.fill();
    ctx.stroke();

    // Question lines
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-10, -10, 16, 2);
    ctx.fillRect(-10, -5, 20, 2);
    ctx.fillRect(-10, 0, 14, 2);

    // Red Grade Mark (C- / 59)
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('59', 2, 10);
  }

  // 2. 期中考卷 (Folded paper airplane)
  private drawMidtermPaper(e: Enemy) {
    const ctx = this.ctx;
    // Origami jet shape
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(-20, -16);
    ctx.lineTo(-12, 0);
    ctx.lineTo(-20, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Center fold
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(22, 0);
    ctx.stroke();

    // Red big X mark on wing
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(-2, -2);
    ctx.moveTo(-2, -10);
    ctx.lineTo(-10, -2);
    ctx.stroke();
  }

  // 3. 退件草稿團 (Crumpled paper ball)
  private drawDraftPaperBall(e: Enemy) {
    const ctx = this.ctx;
    const rot = (e.x / 12) % (Math.PI * 2);
    ctx.rotate(rot);

    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // Wrinkle lines
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.lineTo(-2, 4);
    ctx.lineTo(8, -8);
    ctx.moveTo(-6, 8);
    ctx.lineTo(6, 6);
    ctx.stroke();
  }

  // 4. 紅色報錯蟲 (Syntax Bug)
  private drawSyntaxBug(e: Enemy) {
    const ctx = this.ctx;
    // Red Beetle Body
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(0, 2, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shell line
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.lineTo(16, 2);
    ctx.stroke();

    // Mechanical legs
    const legWiggle = Math.sin(Date.now() / 60) * 4;
    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 2;
    for (let lx of [-8, 0, 8]) {
      ctx.beginPath();
      ctx.moveTo(lx, 10);
      ctx.lineTo(lx + 4, 18 + legWiggle);
      ctx.stroke();
    }

    // Glowing Exclamation Antenna (!)
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('!', 4, -14);
  }

  // 5. 無限迴圈史萊姆 (Infinite Loop Slime)
  private drawInfiniteLoopSlime(e: Enemy) {
    const ctx = this.ctx;
    const squash = Math.sin(Date.now() / 120) * 2;

    // Green translucent slime body
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(0, 4, 18 + squash, 14 - squash, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing infinity symbol (∞)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('∞', 0, 8);

    // If downed, show recompiling status
    if (e.reviveTimer && e.reviveTimer > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`編譯復活 ${Math.ceil(e.reviveTimer)}s`, 0, -18);
    }
  }

  // 6. 第一關菁英：黃金比例螺線怪 (Golden Ratio Spiral)
  private drawGoldenRatio(e: Enemy) {
    const ctx = this.ctx;
    const rot = Date.now() / 300;
    ctx.rotate(rot);

    // Glowing golden shell
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fill();

    // Golden spiral curve
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let t = 0; t < 12; t += 0.2) {
      const r = 2.5 * Math.exp(0.22 * t);
      const sx = r * Math.cos(t);
      const sy = r * Math.sin(t);
      if (t === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Phi symbol (Φ)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px serif';
    ctx.textAlign = 'center';
    ctx.fillText('Φ', 0, 5);
  }

  // 7. 第二關菁英：CMYK 溢色史萊姆
  private drawCmykSlime(e: Enemy) {
    const ctx = this.ctx;
    const squash = Math.sin(Date.now() / 100) * 3;

    // 4-Color Gradient
    const grad = ctx.createLinearGradient(-30, -25, 30, 25);
    grad.addColorStop(0, '#06b6d4'); // Cyan
    grad.addColorStop(0.33, '#ec4899'); // Magenta
    grad.addColorStop(0.66, '#eab308'); // Yellow
    grad.addColorStop(1, '#0f172a'); // blacK

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 6, 32 + squash, 26 - squash, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dripping droplets
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(-16, 28, 5, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-8, 2, 4, 0, Math.PI * 2);
    ctx.arc(8, 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-7, 2, 2, 0, Math.PI * 2);
    ctx.arc(9, 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8. 第三關菁英：算圖死當魔像 (BSOD Render Crash Golem)
  private drawBsodGolem(e: Enemy) {
    const ctx = this.ctx;

    // Heavy Robot Body / Metal Chassis
    ctx.fillStyle = '#334155';
    ctx.fillRect(-28, -20, 56, 60);

    // Glowing Red Cooling Fan (Spins!)
    const fanRot = Date.now() / 40;
    ctx.save();
    ctx.translate(0, 18);
    ctx.rotate(fanRot);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos((i * Math.PI) / 2) * 14, Math.sin((i * Math.PI) / 2) * 14);
      ctx.stroke();
    }
    ctx.restore();

    // Head: BSOD Blue Screen CRT
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-22, -48, 44, 28);
    ctx.strokeStyle = '#60a5fa';
    ctx.strokeRect(-22, -48, 44, 28);

    // White BSOD error text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(': ( CRASH', 0, -32);
    ctx.font = '5px monospace';
    ctx.fillText('MEMORY_DUMP', 0, -24);

    // Trailing power cables
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-20, -10);
    ctx.quadraticCurveTo(-34, 10, -24, 30);
    ctx.stroke();
  }

  // 9. 第一關 BOSS：律動與平衡之靈・美學妖精 (動態懸浮、光束蓄力、天秤雙柱)
  private drawBossAesthetic(e: Enemy) {
    const ctx = this.ctx;
    const time = Date.now();
    const hover = Math.sin(time / 140) * 10;
    const wingFlap = Math.sin(time / 80) * 0.35;
    const isChargingLaser = !!e.telegraphWarning;

    // Golden Fibonacci Halo (Sacred Geometry Ring)
    ctx.save();
    ctx.translate(0, -22 + hover);
    ctx.rotate(time / 800);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.stroke();
    // Inner triangle
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const x = Math.cos(a) * 26;
      const y = Math.sin(a) * 26;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Floating Corinthian Marble Pillars on left & right
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    // Left Pillar with Ionic scroll
    ctx.fillRect(-62, -55 + hover * 0.5, 18, 105);
    ctx.strokeRect(-62, -55 + hover * 0.5, 18, 105);
    // Right Pillar
    ctx.fillRect(44, -55 + hover * 0.5, 18, 105);
    ctx.strokeRect(44, -55 + hover * 0.5, 18, 105);

    // Fairy Body in Center
    ctx.save();
    ctx.translate(0, hover);

    // Multi-layered Glowing Ethereal Wings (Animated Flapping)
    ctx.save();
    // Left Wing
    ctx.translate(-14, -14);
    ctx.scale(1 + wingFlap, 1);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 14, -Math.PI / 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-6, -4, 20, 8, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right Wing
    ctx.save();
    ctx.translate(14, -14);
    ctx.scale(1 + wingFlap, 1);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 14, Math.PI / 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
    ctx.beginPath();
    ctx.ellipse(6, -4, 20, 8, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Fairy Flowing Dress (Greek Chiton with cyan gradient)
    const dressGrad = ctx.createLinearGradient(0, -18, 0, 32);
    dressGrad.addColorStop(0, '#f8fafc');
    dressGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = dressGrad;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(-18, 32);
    ctx.quadraticCurveTo(0, 36, 18, 32);
    ctx.closePath();
    ctx.fill();

    // Golden Belt
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-10, -2, 20, 3);

    // Head & Cyan Flowing Fairy Hair
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -26, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(0, -30, 11, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();

    // Glowing Eyes
    ctx.fillStyle = isChargingLaser ? '#ef4444' : '#38bdf8';
    ctx.beginPath();
    ctx.arc(3, -26, 2, 0, Math.PI * 2);
    ctx.fill();

    // Balance Scales in Hands (Tilted slightly)
    const scaleTilt = Math.sin(time / 200) * 0.2;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    // Scale bar
    ctx.beginPath();
    ctx.moveTo(-24, -4 - scaleTilt * 15);
    ctx.lineTo(24, -4 + scaleTilt * 15);
    ctx.stroke();
    // Left scale pan
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(-24, 6 - scaleTilt * 15, 6, 0, Math.PI);
    ctx.fill();
    // Right scale pan
    ctx.beginPath();
    ctx.arc(24, 6 + scaleTilt * 15, 6, 0, Math.PI);
    ctx.fill();

    // Beam Charging Orb Visual
    if (isChargingLaser) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(0, -4, 14 + Math.sin(time / 30) * 4, 0, Math.PI * 2);
      ctx.fill();

      // Energy Sparks
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const sa = (i * Math.PI) / 2 + time / 60;
        ctx.beginPath();
        ctx.moveTo(Math.cos(sa) * 16, -4 + Math.sin(sa) * 16);
        ctx.lineTo(Math.cos(sa) * 32, -4 + Math.sin(sa) * 32);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  // 10. 第二關 BOSS：三原色幻象師・色相魔導
  private drawBossColor(e: Enemy) {
    const ctx = this.ctx;
    const hover = Math.sin(Date.now() / 160) * 6;

    // Wizard Robe (Deep blue with gold trim)
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(0, -24 + hover);
    ctx.lineTo(-24, 38 + hover);
    ctx.lineTo(24, 38 + hover);
    ctx.closePath();
    ctx.fill();

    // Wizard Hat
    ctx.fillStyle = '#312e81';
    ctx.beginPath();
    ctx.moveTo(-16, -26 + hover);
    ctx.lineTo(0, -56 + hover);
    ctx.lineTo(16, -26 + hover);
    ctx.closePath();
    ctx.fill();

    // Juggling 6 Color Spheres in Orbit!
    const sphereColors = ['#ef4444', '#22c55e', '#3b82f6', '#06b6d4', '#ec4899', '#eab308'];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + Date.now() / 250;
      const sx = Math.cos(angle) * 44;
      const sy = Math.sin(angle) * 34 + hover;

      ctx.fillStyle = sphereColors[i];
      ctx.shadowColor = sphereColors[i];
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // 11. 最終 BOSS：專題總評審・死線魔神 (Deadline Overlord)
  private drawBossDeadline(e: Enemy) {
    const ctx = this.ctx;
    const isBerserk = (e.bossPhase || 1) >= 2;

    // Steam & Flame venting in Phase 2
    if (isBerserk) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, 75, 0, Math.PI * 2);
      ctx.fill();
    }

    // Heavy Brass Mechanical Body
    ctx.fillStyle = '#854d0e';
    ctx.beginPath();
    ctx.roundRect(-42, -50, 84, 100, 12);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Abdomen: Glowing Digital Countdown LED (00:01:00)
    ctx.fillStyle = '#000000';
    ctx.fillRect(-26, 16, 52, 18);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('00:01:00', 0, 30);

    // Chest: Massive Analog Clock Face with ticking hands
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, -18, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Clock ticking hands
    const secondHandAngle = Date.now() / 150;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(Math.cos(secondHandAngle) * 20, -18 + Math.sin(secondHandAngle) * 20);
    ctx.stroke();

    // Right Hand: Giant Revision Scissors (手持改稿大剪刀)
    ctx.save();
    ctx.translate(56, -20);
    const snip = Math.sin(Date.now() / 80) * 0.3;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    // Blade 1
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(38 * Math.cos(snip), 38 * Math.sin(snip));
    ctx.stroke();
    // Blade 2
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(38 * Math.cos(-snip), 38 * Math.sin(-snip));
    ctx.stroke();
    // Scissor red handles
    ctx.strokeStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(-8, -8, 8, 0, Math.PI * 2);
    ctx.arc(-8, 8, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Left Hand: Giant F Grade Stamp (手持當掉大印章)
    ctx.save();
    ctx.translate(-58, 10);
    // Wooden handle
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-8, -32, 16, 32);
    // Stamp base with red ink
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-14, 0, 28, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('F', 0, 13);
    ctx.restore();
  }

  // Enemy Health Bar
  private drawEnemyHpBar(e: Enemy) {
    const ctx = this.ctx;
    const hpRatio = Math.max(0, e.hp / e.maxHp);
    const barWidth = e.isBoss ? 90 : 36;
    const barHeight = e.isBoss ? 8 : 4;
    const bx = e.x + e.width / 2 - barWidth / 2;
    const by = e.y - (e.isBoss ? 24 : 12);

    // Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(bx, by, barWidth, barHeight);

    // Foreground Fill
    ctx.fillStyle = e.isBoss ? '#ef4444' : e.isElite ? '#f59e0b' : '#38bdf8';
    ctx.fillRect(bx, by, barWidth * hpRatio, barHeight);

    // Border
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, barWidth, barHeight);

    // Name over boss/elite
    if (e.isBoss || e.isElite) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(e.name, e.x + e.width / 2, by - 4);
    }
  }

  // --- Projectiles Drawing ---
  private drawProjectiles(projectiles: Projectile[]) {
    const ctx = this.ctx;
    for (const p of projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.type === 'cross') {
        // Red 'X' projectile
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-6, -6);
        ctx.lineTo(6, 6);
        ctx.moveTo(6, -6);
        ctx.lineTo(-6, 6);
        ctx.stroke();
      } else if (p.type === 'ink') {
        // Splashing ink drop
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'beam') {
        // High-Energy Arcade Laser Beam with pure white core & colored outer bloom
        ctx.save();
        // Outer glowing aura
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.width, p.height, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner searing white core
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.width * 0.9, p.height * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Electric discharge arcs along beam
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-p.width * 0.6, (Math.random() - 0.5) * p.height * 0.6);
        ctx.lineTo(0, (Math.random() - 0.5) * p.height * 0.6);
        ctx.lineTo(p.width * 0.6, (Math.random() - 0.5) * p.height * 0.6);
        ctx.stroke();

        ctx.restore();
      } else if (p.type === 'wind') {
        // Wind crescent
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 14, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();
      } else if (p.type === 'geometry') {
        // Geometric triangle/circle bullet
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'revision') {
        // Floating "修改意見" Paper Sheet
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-12, -8, 24, 16);
        ctx.strokeRect(-12, -8, 24, 16);
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
      } else if (p.type === 'frost') {
        // Absolute zero ice shard
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.lineTo(6, 0);
        ctx.lineTo(0, 9);
        ctx.lineTo(-6, 0);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // --- Loot Drops Drawing ---
  private drawLootDrops(drops: LootDrop[]) {
    const ctx = this.ctx;
    const bounce = Math.sin(Date.now() / 150) * 5;

    for (const d of drops) {
      ctx.save();
      ctx.translate(d.x, d.y + bounce);

      // Light beam column
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(-10, -60, 20, 60);

      if (d.type === 'health_coffee') {
        // Coffee Cup (Caffeine fresh liver restore!)
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.roundRect(-8, -12, 16, 18, 2);
        ctx.fill();
        // Coffee lid
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-9, -14, 18, 3);
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+HP 咖啡', 0, -18);
      } else if (d.type === 'ram_boost') {
        // RAM Stick
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(-12, -8, 24, 12);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('RAM', 0, 0);
      } else {
        // Golden treasure equipment card
        ctx.fillStyle = d.color;
        ctx.shadowColor = d.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(-16, -20, 32, 28, 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.name, 0, -26);
      }

      ctx.restore();
    }
  }

  // --- Exit Portal (Interactive: Walk near and press S) ---
  private drawExitPortal(
    x: number,
    y: number,
    unlocked: boolean,
    isNear: boolean,
    isFinalStage: boolean,
    isBossStage: boolean
  ) {
    const ctx = this.ctx;
    const rot = Date.now() / 250;

    ctx.save();
    ctx.translate(x, y);

    if (unlocked) {
      // Swirling portal rings
      ctx.save();
      ctx.rotate(rot);

      ctx.strokeStyle = isFinalStage ? '#fbbf24' : '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = isFinalStage ? '#f59e0b' : '#a855f7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // Title & Interaction Prompt
      const promptText = isFinalStage
        ? '【 按 S 鍵進入 · 返回現實世界 】'
        : isBossStage
        ? '【 按 S 鍵進入下一大關 】'
        : '【 按 S 鍵進入 BOSS 決戰殿堂 】';

      ctx.fillStyle = isNear ? '#fde047' : '#38bdf8';
      ctx.font = `bold ${isNear ? 14 : 12}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText(isNear ? `▼ ${promptText} ▼` : '▼ 傳送門已開啟 ▼', 0, -54);

      if (isNear) {
        // Floating action badge
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-85, -86, 170, 24, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('⚡ 按 [ S ] 鍵進入 ⚡', 0, -70);
      }
    } else {
      // Locked Portal
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔒 傳送門封印中', 0, -48);
      ctx.font = '9px sans-serif';
      ctx.fillText(isBossStage ? '請先討伐本關魔王！' : '請先消滅本關菁英怪！', 0, -34);
    }

    ctx.restore();
  }

  // --- Dedicated Boss Health Bar & Phase Indicator ---
  private drawDedicatedBossBar(boss: Enemy, screenWidth: number) {
    const ctx = this.ctx;
    const barWidth = Math.min(540, screenWidth - 100);
    const barHeight = 16;
    const bx = (screenWidth - barWidth) / 2;
    const by = 58;

    const hpRatio = Math.max(0, boss.hp / boss.maxHp);
    const isPhase2 = (boss.bossPhase || 1) >= 2;

    ctx.save();
    // Backdrop
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = isPhase2 ? '#ef4444' : '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bx - 12, by - 22, barWidth + 24, barHeight + 36, 10);
    ctx.fill();
    ctx.stroke();

    // Boss Name & Phase
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`👑 ${boss.name}`, bx, by - 6);

    ctx.textAlign = 'right';
    ctx.fillStyle = isPhase2 ? '#ef4444' : '#f59e0b';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(isPhase2 ? '⚡ PHASE 2: 狂暴死線 ⚡' : 'PHASE 1', bx + barWidth, by - 6);

    // HP Bar background
    ctx.fillStyle = '#020617';
    ctx.fillRect(bx, by, barWidth, barHeight);

    // HP Bar foreground
    const grad = ctx.createLinearGradient(bx, 0, bx + barWidth, 0);
    if (isPhase2) {
      grad.addColorStop(0, '#dc2626');
      grad.addColorStop(1, '#f97316');
    } else {
      grad.addColorStop(0, '#e11d48');
      grad.addColorStop(1, '#f43f5e');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(bx, by, barWidth * hpRatio, barHeight);

    // HP Numerical text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(`${Math.ceil(boss.hp)} / ${boss.maxHp}`, bx + barWidth / 2, by + 12);

    ctx.restore();
  }

  // --- Particles Drawing ---
  private drawParticles(particles: Particle[]) {
    const ctx = this.ctx;
    for (const p of particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1.0;
  }

  // --- Floating Texts Drawing ---
  private drawFloatingTexts(floatingTexts: FloatingText[]) {
    const ctx = this.ctx;
    for (const ft of floatingTexts) {
      ctx.save();
      ctx.fillStyle = ft.color;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.font = `bold ${ft.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
