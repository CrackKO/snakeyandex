import Phaser from 'phaser';
import { Snake } from '../entities/Snake';
import { GRID_SIZE, BASE_SPEED, COLORS, ARENA_PADDING, GameMode, BASE_FOOD_SCORE, MAX_COMBO, COMBO_DECAY_TIME } from '../constants/GameConstants';
import { AudioService } from '../services/AudioService';
import { SaveService } from '../services/SaveService';

export class GameScene extends Phaser.Scene {
  private snake!: Snake;
  private foodGroup!: Phaser.GameObjects.Group;
  private score: number = 0;
  private combo: number = 1;
  private comboTimer: number = 0;
  private runLevel: number = 1;
  private xp: number = 0;
  private xpToNextLevel: number = 100;
  private mode: GameMode = GameMode.EVOLUTION;
  private lastMoveTime: number = 0;
  private moveInterval: number = BASE_SPEED;
  private isPaused: boolean = false;
  private graphics!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private xpBar!: Phaser.GameObjects.Graphics;
  private dashButton!: Phaser.GameObjects.Container;
  private audioService!: AudioService;
  private saveService!: SaveService;
  private inputBuffer: { x: number; y: number }[] = [];
  private arenaBounds!: Phaser.Geom.Rectangle;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { mode: string }): void {
    this.mode = (data?.mode as GameMode) || GameMode.EVOLUTION;
    this.audioService = AudioService.getInstance();
    this.saveService = SaveService.getInstance();
  }

  create(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    
    this.arenaBounds = new Phaser.Geom.Rectangle(
      ARENA_PADDING,
      ARENA_PADDING,
      this.scale.width - ARENA_PADDING * 2,
      this.scale.height - ARENA_PADDING * 2
    );
    
    this.graphics = this.add.graphics();
    this.drawArena();
    
    this.snake = new Snake(this, centerX, centerY);
    
    this.foodGroup = this.add.group();
    this.spawnFood();
    
    this.createUI();
    this.setupInput();
    
    this.lastMoveTime = Date.now();
  }

  private drawArena(): void {
    this.graphics.fillStyle(COLORS.background, 1);
    this.graphics.fillRect(0, 0, this.scale.width, this.scale.height);
    
    this.graphics.lineStyle(3, COLORS.ui.primary, 0.5);
    this.graphics.strokeRect(
      this.arenaBounds.x,
      this.arenaBounds.y,
      this.arenaBounds.width,
      this.arenaBounds.height
    );
    
    this.graphics.lineStyle(1, COLORS.grid, 0.3);
    for (let x = this.arenaBounds.x; x < this.arenaBounds.right; x += GRID_SIZE) {
      this.graphics.moveTo(x, this.arenaBounds.y);
      this.graphics.lineTo(x, this.arenaBounds.bottom);
    }
    for (let y = this.arenaBounds.y; y < this.arenaBounds.bottom; y += GRID_SIZE) {
      this.graphics.moveTo(this.arenaBounds.x, y);
      this.graphics.lineTo(this.arenaBounds.right, y);
    }
    this.graphics.strokePath();
  }

  private createUI(): void {
    this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
    });
    
    this.comboText = this.add.text(this.scale.width - 20, 20, '', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ff00ff',
    }).setOrigin(1, 0);
    
    this.levelText = this.add.text(this.scale.width / 2, 20, 'LEVEL 1', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#00ffff',
    }).setOrigin(0.5, 0);
    
    this.xpBar = this.add.graphics();
    
    if (this.isMobile()) {
      this.createDashButton();
    }
  }

  private createDashButton(): void {
    const buttonSize = 60;
    const padding = 20;
    const x = this.scale.width - padding - buttonSize;
    const y = this.scale.height - padding - buttonSize;
    
    this.dashButton = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a3a, 0.8);
    bg.fillCircle(0, 0, buttonSize / 2);
    bg.lineStyle(2, COLORS.ui.primary, 0.5);
    bg.strokeCircle(0, 0, buttonSize / 2);
    
    const label = this.add.text(0, 0, 'DASH', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    this.dashButton.add([bg, label]);
    this.dashButton.setInteractive(new Phaser.Geom.Circle(0, 0, buttonSize / 2), Phaser.Geom.Circle.Contains);
    
    this.dashButton.on('pointerdown', () => {
      this.tryDash();
    });
  }

  private setupInput(): void {
    const cursors = this.input.keyboard!.createCursorKeys();
    const wasd = this.input.keyboard!.addKeys('W,A,S,D') as any;
    
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.inputBuffer.push({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.inputBuffer.push({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.inputBuffer.push({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.inputBuffer.push({ x: 1, y: 0 });
          break;
        case 'Space':
          this.tryDash();
          break;
        case 'Escape':
          this.togglePause();
          break;
      }
    });
    
    let touchStartX = 0;
    let touchStartY = 0;
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      touchStartX = pointer.x;
      touchStartY = pointer.y;
    });
    
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const dx = pointer.x - touchStartX;
      const dy = pointer.y - touchStartY;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) this.inputBuffer.push({ x: 1, y: 0 });
        else if (dx < -30) this.inputBuffer.push({ x: -1, y: 0 });
      } else {
        if (dy > 30) this.inputBuffer.push({ x: 0, y: 1 });
        else if (dy < -30) this.inputBuffer.push({ x: 0, y: -1 });
      }
    });
  }

  private tryDash(): void {
    if (this.snake.useDash()) {
      this.audioService.playDash();
    }
  }

  update(time: number): void {
    if (this.isPaused) return;
    
    this.snake.update(time);
    
    if (this.inputBuffer.length > 0) {
      const dir = this.inputBuffer.shift()!;
      this.snake.setDirection(dir.x, dir.y);
    }
    
    if (Date.now() - this.lastMoveTime >= this.moveInterval) {
      this.snake.move();
      this.lastMoveTime = Date.now();
      
      this.checkWallCollision();
      
      if (this.snake.checkSelfCollision()) {
        this.gameOver();
        return;
      }
      
      this.checkFoodCollision();
    }
    
    if (this.combo > 1) {
      this.comboTimer -= 16;
      if (this.comboTimer <= 0) {
        this.combo = 1;
        this.updateComboText();
      }
    }
    
    this.updateXPBar();
    
    if (this.dashButton) {
      const cooldown = this.snake.getDashCooldown();
      this.dashButton.setAlpha(cooldown > 0 ? 0.5 : 1);
    }
  }

  private checkWallCollision(): void {
    const head = this.snake.getHead();
    
    if (head.x < this.arenaBounds.x ||
        head.x > this.arenaBounds.right ||
        head.y < this.arenaBounds.y ||
        head.y > this.arenaBounds.bottom) {
      this.gameOver();
    }
  }

  private checkFoodCollision(): void {
    const head = this.snake.getHead();
    
    this.foodGroup.getChildren().forEach((foodObj) => {
      const food = foodObj as Phaser.GameObjects.Container;
      const fx = food.getData('gridX');
      const fy = food.getData('gridY');
      
      const dist = Phaser.Math.Distance.Between(head.x, head.y, fx * GRID_SIZE + this.arenaBounds.x, fy * GRID_SIZE + this.arenaBounds.y);
      
      if (dist < GRID_SIZE) {
        this.collectFood(food);
      }
    });
  }

  private collectFood(food: Phaser.GameObjects.Container): void {
    const type = food.getData('type');
    let points = BASE_FOOD_SCORE * this.combo;
    let xpGain = 10;
    
    if (type === 'golden') {
      points = 50 * this.combo;
      xpGain = 25;
      this.audioService.playGoldenCollect();
    } else if (type === 'crystal') {
      points = 100 * this.combo;
      xpGain = 50;
    } else {
      this.audioService.playCollect();
    }
    
    if (this.combo < MAX_COMBO) {
      this.combo++;
      this.comboTimer = COMBO_DECAY_TIME;
    }
    
    this.score += points;
    this.xp += xpGain;
    this.snake.grow();
    
    if (this.xp >= this.xpToNextLevel) {
      this.levelUp();
    }
    
    food.destroy();
    this.spawnFood();
    
    this.scoreText.setText(`SCORE: ${this.score}`);
    this.updateComboText();
    
    this.createCollectParticles(food.x, food.y);
  }

  private createCollectParticles(x: number, y: number): void {
    const particles = this.add.particles(x, y, 'particle', {
      speed: { min: 50, max: 100 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 300,
      quantity: 10,
      tint: COLORS.food.energy,
    });
    
    setTimeout(() => particles.destroy(), 300);
  }

  private levelUp(): void {
    this.runLevel++;
    this.xp = 0;
    this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
    
    this.levelText.setText(`LEVEL ${this.runLevel}`);
    this.audioService.playLevelUp();
    
    this.moveInterval = Math.max(80, this.moveInterval - 5);
    
    this.scene.launch('LevelUpScene', { level: this.runLevel });
  }

  private updateComboText(): void {
    if (this.combo > 1) {
      this.comboText.setText(`COMBO x${this.combo}`);
    } else {
      this.comboText.setText('');
    }
  }

  private updateXPBar(): void {
    const barWidth = 200;
    const barHeight = 8;
    const x = this.scale.width / 2 - barWidth / 2;
    const y = 50;
    
    this.xpBar.clear();
    this.xpBar.fillStyle(0x333333, 1);
    this.xpBar.fillRect(x, y, barWidth, barHeight);
    
    const fillPercent = this.xp / this.xpToNextLevel;
    this.xpBar.fillStyle(COLORS.ui.primary, 1);
    this.xpBar.fillRect(x, y, barWidth * fillPercent, barHeight);
  }

  private spawnFood(): void {
    if (this.foodGroup.getLength() >= 5) return;
    
    const gridWidth = Math.floor(this.arenaBounds.width / GRID_SIZE);
    const gridHeight = Math.floor(this.arenaBounds.height / GRID_SIZE);
    
    let gx = 0;
    let gy = 0;
    let valid = false;
    
    while (!valid) {
      gx = Phaser.Math.Between(0, gridWidth - 1);
      gy = Phaser.Math.Between(0, gridHeight - 1);
      
      const segments = this.snake.getSegments();
      valid = !segments.some(s => 
        Math.abs(s.x - (gx * GRID_SIZE + this.arenaBounds.x)) < GRID_SIZE &&
        Math.abs(s.y - (gy * GRID_SIZE + this.arenaBounds.y)) < GRID_SIZE
      );
    }
    
    const x = gx * GRID_SIZE + this.arenaBounds.x + GRID_SIZE / 2;
    const y = gy * GRID_SIZE + this.arenaBounds.y + GRID_SIZE / 2;
    
    const rand = Math.random();
    let type = 'energy';
    let color = COLORS.food.energy;
    
    if (rand < 0.02) {
      type = 'crystal';
      color = COLORS.food.crystal;
    } else if (rand < 0.12) {
      type = 'golden';
      color = COLORS.food.golden;
    }
    
    const food = this.add.container(x, y);
    const circle = this.add.graphics();
    circle.fillStyle(color, 1);
    circle.fillCircle(0, 0, GRID_SIZE / 2 - 2);
    circle.lineStyle(2, color, 0.8);
    circle.strokeCircle(0, 0, GRID_SIZE / 2);
    
    food.add(circle);
    food.setData('type', type);
    food.setData('gridX', gx);
    food.setData('gridY', gy);
    
    this.foodGroup.add(food);
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.scene.launch('PauseScene');
    } else {
      this.scene.stop('PauseScene');
    }
  }

  private gameOver(): void {
    this.audioService.playDeath();
    
    const data = this.saveService.getData();
    this.saveService.updateStatistics({
      totalRuns: data.statistics.totalRuns + 1,
      totalScore: data.statistics.totalScore + this.score,
      maxCombo: Math.max(data.statistics.maxCombo, this.combo),
    });
    
    const modeStr = this.mode === GameMode.EVOLUTION ? 'evolution' : this.mode === GameMode.CLASSIC ? 'classic' : 'daily';
    const isNewRecord = this.saveService.updateBestScore(modeStr, this.score);
    
    const coins = Math.floor(this.score / 100) + 10;
    const xp = Math.floor(this.score / 50);
    
    this.saveService.updateCoins(coins);
    this.saveService.addAccountXP(xp);
    
    this.scene.start('ResultScene', {
      score: this.score,
      coins,
      xp,
      isNewRecord,
      mode: this.mode,
    });
  }

  private isMobile(): boolean {
    return /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
}
