import Phaser from 'phaser';
import { COLORS } from '../constants/GameConstants';

export class LevelUpScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelUpScene' });
  }

  create(data: { level: number }): void {
    // Background overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
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
    this.add.text(this.scale.width / 2, panelY + 60, `LEVEL ${data.level}`, {
      fontFamily: 'Arial',
      fontSize: '42px',
      color: '#00ffff',
      fontStyle: 'bold',
      shadow: { blur: 10, color: '#00ffff', fill: true },
    }).setOrigin(0.5);
    
    this.add.text(this.scale.width / 2, panelY + 110, 'CHOOSE UPGRADE', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    // Upgrade options (simplified for now)
    const upgrades = [
      { name: 'SPEED UP', desc: '+10% speed' },
      { name: 'SCORE BOOST', desc: '+20% score' },
      { name: 'SHIELD', desc: 'Gain 1 shield' },
    ];
    
    upgrades.forEach((upgrade, index) => {
      const x = panelX + 80 + index * 120;
      const y = panelY + 220;
      
      const container = this.add.container(x, y);
      
      const bg = this.add.graphics();
      bg.fillStyle(0x2a2a5a, 0.9);
      bg.fillRoundedRect(-60, -40, 120, 80, 10);
      bg.lineStyle(2, COLORS.ui.primary, 0.5);
      bg.strokeRoundedRect(-60, -40, 120, 80, 10);
      
      const nameText = this.add.text(0, -10, upgrade.name, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#00ffff',
      }).setOrigin(0.5);
      
      const descText = this.add.text(0, 15, upgrade.desc, {
        fontFamily: 'Arial',
        fontSize: '11px',
        color: '#aaaaaa',
      }).setOrigin(0.5);
      
      container.add([bg, nameText, descText]);
      container.setInteractive(new Phaser.Geom.Rectangle(-60, -40, 120, 80), Phaser.Geom.Rectangle.Contains);
      
      container.on('pointerdown', () => {
        this.scene.stop('LevelUpScene');
      });
    });
  }
}
