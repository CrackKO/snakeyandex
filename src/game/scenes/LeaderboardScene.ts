import Phaser from 'phaser';
import { COLORS } from '../constants/GameConstants';
import { YandexSDKService } from '../services/YandexSDKService';

export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  async create(): Promise<void> {
    const sdk = YandexSDKService.getInstance();
    
    // Background
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, COLORS.background).setOrigin(0);
    
    // Title
    this.add.text(this.scale.width / 2, 50, 'LEADERBOARD', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Back button
    this.createButton(80, 50, 'BACK', () => {
      this.scene.start('MenuScene');
    });
    
    // Evolution leaderboard
    this.add.text(this.scale.width / 2, 120, 'EVOLUTION MODE', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ff00ff',
    }).setOrigin(0.5);
    
    // Classic leaderboard
    this.add.text(this.scale.width / 2, 350, 'CLASSIC MODE', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffd700',
    }).setOrigin(0.5);
    
    // Mock leaderboard data (will be replaced with real SDK data)
    this.displayLeaderboard('evolution_score', 150);
    this.displayLeaderboard('classic_score', 380);
  }

  private async displayLeaderboard(name: string, y: number): Promise<void> {
    const sdk = YandexSDKService.getInstance();
    const entries = await sdk.getLeaderboard(name, 5);
    
    entries.forEach((entry, index) => {
      const x = this.scale.width / 2;
      const rowY = y + 40 + index * 35;
      
      this.add.text(x - 150, rowY, `#${entry.rank}`, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff',
      }).setOrigin(0, 0.5);
      
      this.add.text(x, rowY, entry.player.name || `Player${index + 1}`, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff',
      }).setOrigin(0.5);
      
      this.add.text(x + 150, rowY, `${entry.score}`, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#00ffff',
      }).setOrigin(1, 0.5);
    });
  }

  private createButton(x: number, y: number, text: string, callback: () => void): void {
    const container = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a3a, 0.9);
    bg.fillRoundedRect(-60, -20, 120, 40, 8);
    bg.lineStyle(2, COLORS.ui.primary, 0.5);
    bg.strokeRoundedRect(-60, -20, 120, 40, 8);
    
    const label = this.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    container.add([bg, label]);
    container.setInteractive(new Phaser.Geom.Rectangle(-60, -20, 120, 40), Phaser.Geom.Rectangle.Contains);
    
    container.on('pointerdown', () => {
      callback();
    });
  }
}
