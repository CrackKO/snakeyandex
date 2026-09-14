import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Update loading progress
    const progressBar = document.getElementById('loading-progress') as HTMLElement;
    const loadingText = document.getElementById('loading-text') as HTMLElement;
    
    if (progressBar) {
      this.load.on('progress', (value: number) => {
        progressBar.style.width = `${value * 100}%`;
      });
    }
    
    if (loadingText) {
      this.load.on('filecomplete', () => {
        loadingText.textContent = 'Loading...';
      });
    }
  }

  create(): void {
    // Transition to menu
    this.scene.start('MenuScene');
  }
}
