import Phaser from 'phaser';
import { COLORS } from '../constants/GameConstants';

export class QuestsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'QuestsScene' });
  }

  create(): void {
    // Background
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, COLORS.background).setOrigin(0);
    
    // Title
    this.add.text(this.scale.width / 2, 50, 'DAILY QUESTS', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Back button
    this.createButton(80, 50, 'BACK', () => {
      this.scene.start('MenuScene');
    });
    
    // Mock quests
    const quests = [
      { name: 'Collect 100 orbs', progress: 45, target: 100, reward: '50 coins' },
      { name: 'Reach Combo x10', progress: 1, target: 1, reward: '30 coins' },
      { name: 'Score 10000 points', progress: 5430, target: 10000, reward: '100 coins' },
    ];
    
    quests.forEach((quest, index) => {
      const y = 150 + index * 100;
      
      // Quest name
      this.add.text(this.scale.width / 2, y - 20, quest.name, {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff',
      }).setOrigin(0.5);
      
      // Progress bar background
      const barBg = this.add.graphics();
      barBg.fillStyle(0x333333, 1);
      barBg.fillRoundedRect(this.scale.width / 2 - 150, y, 300, 20, 10);
      
      // Progress bar fill
      const progress = Math.min(1, quest.progress / quest.target);
      const barFill = this.add.graphics();
      barFill.fillStyle(COLORS.ui.primary, 1);
      barFill.fillRoundedRect(this.scale.width / 2 - 150, y, 300 * progress, 20, 10);
      
      // Progress text
      this.add.text(this.scale.width / 2, y + 35, `${quest.progress} / ${quest.target}`, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#aaaaaa',
      }).setOrigin(0.5);
      
      // Reward
      this.add.text(this.scale.width / 2, y + 55, `Reward: ${quest.reward}`, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffd700',
      }).setOrigin(0.5);
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
