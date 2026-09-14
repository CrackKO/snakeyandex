import Phaser from 'phaser';
import { COLORS } from '../constants/GameConstants';
import { SaveService } from '../services/SaveService';
import { LocalizationService } from '../services/LocalizationService';
import { YandexSDKService } from '../services/YandexSDKService';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  create(data: { score: number; coins: number; xp: number; isNewRecord: boolean; mode: string }): void {
    const saveService = SaveService.getInstance();
    const loc = LocalizationService.getInstance();
    const sdk = YandexSDKService.getInstance();
    
    // Background overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, this.scale.width, this.scale.height);
    
    // Panel
    const panelWidth = 400;
    const panelHeight = 500;
    const panelX = this.scale.width / 2 - panelWidth / 2;
    const panelY = this.scale.height / 2 - panelHeight / 2;
    
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a3a, 0.95);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    panel.lineStyle(3, COLORS.ui.primary, 0.5);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    
    // Title
    const title = data.isNewRecord ? loc.t('result.new_record') : 'GAME OVER';
    this.add.text(this.scale.width / 2, panelY + 50, title, {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: data.isNewRecord ? '#ffd700' : '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Score
    this.add.text(this.scale.width / 2, panelY + 120, `SCORE: ${data.score}`, {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#00ffff',
    }).setOrigin(0.5);
    
    // Coins earned
    this.add.text(this.scale.width / 2, panelY + 170, `${loc.t('result.coins')}: +${data.coins}`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffd700',
    }).setOrigin(0.5);
    
    // XP earned
    this.add.text(this.scale.width / 2, panelY + 210, `XP: +${data.xp}`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ff00ff',
    }).setOrigin(0.5);
    
    // Buttons
    const buttonY = panelY + 300;
    
    // Play Again
    this.createButton(this.scale.width / 2, buttonY, 'PLAY AGAIN', () => {
      this.scene.start('GameScene', { mode: data.mode });
    });
    
    // Menu
    this.createButton(this.scale.width / 2, buttonY + 70, loc.t('result.menu'), () => {
      this.scene.start('MenuScene');
    });
    
    // Show fullscreen ad after delay
    setTimeout(() => {
      sdk.showFullscreenAd();
    }, 2000);
  }

  private createButton(x: number, y: number, text: string, callback: () => void): void {
    const container = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2a2a5a, 0.9);
    bg.fillRoundedRect(-150, -25, 300, 50, 10);
    bg.lineStyle(2, COLORS.ui.primary, 0.5);
    bg.strokeRoundedRect(-150, -25, 300, 50, 10);
    
    const label = this.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    container.add([bg, label]);
    container.setInteractive(new Phaser.Geom.Rectangle(-150, -25, 300, 50), Phaser.Geom.Rectangle.Contains);
    
    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x3a3a7a, 0.9);
      bg.fillRoundedRect(-150, -25, 300, 50, 10);
      bg.lineStyle(2, COLORS.ui.primary, 1);
      bg.strokeRoundedRect(-150, -25, 300, 50, 10);
    });
    
    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x2a2a5a, 0.9);
      bg.fillRoundedRect(-150, -25, 300, 50, 10);
      bg.lineStyle(2, COLORS.ui.primary, 0.5);
      bg.strokeRoundedRect(-150, -25, 300, 50, 10);
    });
    
    container.on('pointerdown', () => {
      callback();
    });
  }
}
