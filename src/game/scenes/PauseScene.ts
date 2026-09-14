import Phaser from 'phaser';
import { COLORS } from '../constants/GameConstants';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create(): void {
    // Background overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, this.scale.width, this.scale.height);
    
    // Panel
    const panelWidth = 300;
    const panelHeight = 250;
    const panelX = this.scale.width / 2 - panelWidth / 2;
    const panelY = this.scale.height / 2 - panelHeight / 2;
    
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a3a, 0.95);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    panel.lineStyle(3, COLORS.ui.primary, 0.5);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    
    // Title
    this.add.text(this.scale.width / 2, panelY + 60, 'PAUSED', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Resume button
    this.createButton(this.scale.width / 2, panelY + 130, 'RESUME', () => {
      this.scene.stop('PauseScene');
    });
    
    // Quit button
    this.createButton(this.scale.width / 2, panelY + 190, 'QUIT', () => {
      this.scene.start('MenuScene');
    });
  }

  private createButton(x: number, y: number, text: string, callback: () => void): void {
    const container = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2a2a5a, 0.9);
    bg.fillRoundedRect(-100, -20, 200, 40, 10);
    bg.lineStyle(2, COLORS.ui.primary, 0.5);
    bg.strokeRoundedRect(-100, -20, 200, 40, 10);
    
    const label = this.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    container.add([bg, label]);
    container.setInteractive(new Phaser.Geom.Rectangle(-100, -20, 200, 40), Phaser.Geom.Rectangle.Contains);
    
    container.on('pointerdown', () => {
      callback();
    });
  }
}
