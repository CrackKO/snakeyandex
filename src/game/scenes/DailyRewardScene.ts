import Phaser from 'phaser';
import { COLORS } from '../constants/GameConstants';

export class DailyRewardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DailyRewardScene' });
  }

  create(): void {
    // Background overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, this.scale.width, this.scale.height);
    
    // Panel
    const panelWidth = 500;
    const panelHeight = 400;
    const panelX = this.scale.width / 2 - panelWidth / 2;
    const panelY = this.scale.height / 2 - panelHeight / 2;
    
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a3a, 0.95);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    panel.lineStyle(3, COLORS.ui.primary, 1);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    
    // Title
    this.add.text(this.scale.width / 2, panelY + 60, 'DAILY REWARD', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Day indicators
    const rewards = [100, 150, 200, 250, 300, '💎', '🎁'];
    const currentDay = 3; // Mock
    
    rewards.forEach((reward, index) => {
      const x = panelX + 70 + index * 55;
      const y = panelY + 150;
      
      const isToday = index === currentDay;
      const isPast = index < currentDay;
      
      const bg = this.add.graphics();
      bg.fillStyle(isPast ? COLORS.ui.primary : (isToday ? 0xffd700 : 0x333333), 1);
      bg.fillCircle(x, y, 25);
      
      if (isToday) {
        bg.lineStyle(3, 0xffffff, 1);
        bg.strokeCircle(x, y, 25);
      }
      
      const label = typeof reward === 'number' ? `${reward}` : reward;
      this.add.text(x, y, label, {
        fontFamily: 'Arial',
        fontSize: index === currentDay ? '16px' : '12px',
        color: isPast || isToday ? '#000000' : '#666666',
        fontStyle: isToday ? 'bold' : 'normal',
      }).setOrigin(0.5);
    });
    
    // Reward text
    this.add.text(this.scale.width / 2, panelY + 230, `Day ${currentDay + 1}`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    this.add.text(this.scale.width / 2, panelY + 270, '+200 Coins', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Claim button
    this.createButton(this.scale.width / 2, panelY + 340, 'CLAIM', () => {
      this.scene.stop('DailyRewardScene');
    });
  }

  private createButton(x: number, y: number, text: string, callback: () => void): void {
    const container = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2a2a5a, 0.9);
    bg.fillRoundedRect(-100, -25, 200, 50, 10);
    bg.lineStyle(2, COLORS.ui.primary, 0.5);
    bg.strokeRoundedRect(-100, -25, 200, 50, 10);
    
    const label = this.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    container.add([bg, label]);
    container.setInteractive(new Phaser.Geom.Rectangle(-100, -25, 200, 50), Phaser.Geom.Rectangle.Contains);
    
    container.on('pointerdown', () => {
      callback();
    });
  }
}
