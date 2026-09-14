import Phaser from 'phaser';
import { COLORS } from '../constants/GameConstants';
import { SaveService } from '../services/SaveService';
import { LocalizationService } from '../services/LocalizationService';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const saveService = SaveService.getInstance();
    const loc = LocalizationService.getInstance();
    
    // Background with gradient
    const graphics = this.add.graphics();
    graphics.fillStyle(COLORS.background, 1);
    graphics.fillRect(0, 0, this.scale.width, this.scale.height);
    
    // Grid background
    this.drawGrid();
    
    // Title
    const title = this.add.text(this.scale.width / 2, 100, 'NEON SNAKE', {
      fontFamily: 'Arial',
      fontSize: '64px',
      color: '#00ffff',
      fontStyle: 'bold',
      stroke: '#ff00ff',
      strokeThickness: 4,
      shadow: {
        blur: 10,
        color: '#00ffff',
        fill: true,
      },
    }).setOrigin(0.5);
    
    const subtitle = this.add.text(this.scale.width / 2, 170, 'EVOLUTION', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ff00ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Currency display
    const data = saveService.getData();
    this.add.text(20, 20, `💰 ${data.coins}`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffd700',
    });
    
    this.add.text(20, 50, `💎 ${data.crystals}`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ff00ff',
    });
    
    // Main menu buttons
    const buttonY = 280;
    const buttonSpacing = 70;
    
    this.createButton(this.scale.width / 2, buttonY, loc.t('menu.play'), () => {
      this.scene.start('GameScene', { mode: 'evolution' });
    });
    
    this.createButton(this.scale.width / 2, buttonY + buttonSpacing, loc.t('menu.classic'), () => {
      this.scene.start('GameScene', { mode: 'classic' });
    });
    
    this.createButton(this.scale.width / 2, buttonY + buttonSpacing * 2, loc.t('menu.daily'), () => {
      this.scene.start('GameScene', { mode: 'daily' });
    });
    
    this.createButton(this.scale.width / 2, buttonY + buttonSpacing * 3, loc.t('menu.customize'), () => {
      this.scene.start('CustomizationScene');
    });
    
    this.createButton(this.scale.width / 2, buttonY + buttonSpacing * 4, loc.t('menu.leaderboard'), () => {
      this.scene.start('LeaderboardScene');
    });
    
    this.createButton(this.scale.width / 2, buttonY + buttonSpacing * 5, loc.t('menu.settings'), () => {
      this.scene.start('SettingsScene');
    });
    
    // Animated demo snake in background
    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private drawGrid(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, COLORS.grid, 0.3);
    
    const gridSize = 40;
    for (let x = 0; x < this.scale.width; x += gridSize) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, this.scale.height);
    }
    
    for (let y = 0; y < this.scale.height; y += gridSize) {
      graphics.moveTo(0, y);
      graphics.lineTo(this.scale.width, y);
    }
    
    graphics.strokePath();
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a3a, 0.9);
    bg.fillRoundedRect(-150, -25, 300, 50, 10);
    bg.lineStyle(2, COLORS.ui.primary, 0.5);
    bg.strokeRoundedRect(-150, -25, 300, 50, 10);
    
    const label = this.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    container.add([bg, label]);
    container.setSize(300, 50);
    container.setInteractive(new Phaser.Geom.Rectangle(-150, -25, 300, 50), Phaser.Geom.Rectangle.Contains);
    
    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x2a2a5a, 0.9);
      bg.fillRoundedRect(-150, -25, 300, 50, 10);
      bg.lineStyle(2, COLORS.ui.primary, 1);
      bg.strokeRoundedRect(-150, -25, 300, 50, 10);
    });
    
    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x1a1a3a, 0.9);
      bg.fillRoundedRect(-150, -25, 300, 50, 10);
      bg.lineStyle(2, COLORS.ui.primary, 0.5);
      bg.strokeRoundedRect(-150, -25, 300, 50, 10);
    });
    
    container.on('pointerdown', () => {
      callback();
    });
    
    return container;
  }
}
