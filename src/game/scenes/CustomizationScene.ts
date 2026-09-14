import Phaser from 'phaser';
import { COLORS } from '../constants/GameConstants';
import { SaveService } from '../services/SaveService';

export class CustomizationScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CustomizationScene' });
  }

  create(): void {
    const saveService = SaveService.getInstance();
    const data = saveService.getData();
    
    // Background
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, COLORS.background).setOrigin(0);
    
    // Title
    this.add.text(this.scale.width / 2, 50, 'CUSTOMIZATION', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Back button
    this.createButton(80, 50, 'BACK', () => {
      this.scene.start('MenuScene');
    });
    
    // Skins section
    this.add.text(this.scale.width / 2, 120, 'SKINS', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    const skins = ['neon_blue', 'toxic_green', 'cyber_pink', 'golden', 'void', 'ice'];
    let skinX = this.scale.width / 2 - ((skins.length - 1) * 70) / 2;
    
    skins.forEach((skin, index) => {
      const isUnlocked = data.unlockedCosmetics.includes(skin);
      const isSelected = data.selectedCosmetics.skin === skin;
      
      const container = this.add.container(skinX + index * 70, 200);
      
      const bg = this.add.graphics();
      bg.fillStyle(isSelected ? 0x00ffff : 0x1a1a3a, 0.9);
      bg.fillCircle(0, 0, 30);
      bg.lineStyle(2, isUnlocked ? COLORS.ui.primary : 0x666666, 1);
      bg.strokeCircle(0, 0, 30);
      
      if (isUnlocked) {
        const color = this.getSkinColor(skin);
        bg.fillStyle(color, 1);
        bg.fillCircle(0, 0, 20);
      } else {
        // Lock icon
        this.add.text(0, 0, '🔒', { fontSize: '16px' }).setOrigin(0.5);
      }
      
      container.add([bg]);
      container.setInteractive(new Phaser.Geom.Circle(-30, -30, 60), Phaser.Geom.Circle.Contains);
      
      container.on('pointerdown', () => {
        if (isUnlocked) {
          saveService.selectCosmetic('skin', skin);
          this.scene.restart();
        }
      });
    });
  }

  private getSkinColor(skin: string): number {
    const colors: Record<string, number> = {
      neon_blue: 0x00ffff,
      toxic_green: 0x00ff88,
      cyber_pink: 0xff00ff,
      golden: 0xffd700,
      void: 0x6600ff,
      ice: 0x88ffff,
    };
    return colors[skin] || 0xffffff;
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
