import Phaser from 'phaser';
import { COLORS } from '../constants/GameConstants';

export class AchievementsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AchievementsScene' });
  }

  create(): void {
    // Background
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, COLORS.background).setOrigin(0);
    
    // Title
    this.add.text(this.scale.width / 2, 50, 'ACHIEVEMENTS', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Back button
    this.createButton(80, 50, 'BACK', () => {
      this.scene.start('MenuScene');
    });
    
    // Mock achievements
    const achievements = [
      { id: 'first_bite', name: 'First Bite', desc: 'Collect your first orb', unlocked: true },
      { id: 'long_boi', name: 'Long Boi', desc: 'Reach length 50', unlocked: true },
      { id: 'combo_master', name: 'Combo Master', desc: 'Reach Combo x10', unlocked: false },
      { id: 'gold_hunter', name: 'Gold Hunter', desc: 'Collect 25 Golden Orbs', unlocked: false },
      { id: 'untouchable', name: 'Untouchable', desc: 'Survive 5 minutes', unlocked: false },
    ];
    
    achievements.forEach((ach, index) => {
      const y = 130 + index * 70;
      
      const container = this.add.container(this.scale.width / 2, y);
      
      // Background
      const bg = this.add.graphics();
      bg.fillStyle(ach.unlocked ? 0x1a1a3a : 0x0f0f1f, 0.9);
      bg.fillRoundedRect(-200, -25, 400, 50, 10);
      if (ach.unlocked) {
        bg.lineStyle(2, COLORS.ui.primary, 0.3);
        bg.strokeRoundedRect(-200, -25, 400, 50, 10);
      }
      
      // Icon
      const icon = ach.unlocked ? '🏆' : '🔒';
      this.add.text(-180, 0, icon, { fontSize: '24px' }).setOrigin(0, 0.5);
      
      // Name
      this.add.text(-140, -10, ach.name, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: ach.unlocked ? '#ffffff' : '#666666',
      }).setOrigin(0, 0.5);
      
      // Description
      this.add.text(-140, 12, ach.desc, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#888888',
      }).setOrigin(0, 0.5);
      
      container.add([bg]);
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
