import Phaser from 'phaser';
import { COLORS } from '../constants/GameConstants';
import { SaveService } from '../services/SaveService';
import { AudioService } from '../services/AudioService';
import { LocalizationService } from '../services/LocalizationService';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  create(): void {
    const saveService = SaveService.getInstance();
    const audioService = AudioService.getInstance();
    const loc = LocalizationService.getInstance();
    const settings = saveService.getSettings();
    
    // Background
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, COLORS.background).setOrigin(0);
    
    // Title
    this.add.text(this.scale.width / 2, 50, 'SETTINGS', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Back button
    this.createButton(80, 50, 'BACK', () => {
      this.scene.start('MenuScene');
    });
    
    // Music Volume
    this.createSlider(this.scale.width / 2, 150, 'Music Volume', settings.musicVolume, (value) => {
      audioService.setMusicVolume(value);
      saveService.updateSetting('musicVolume', value);
    });
    
    // SFX Volume
    this.createSlider(this.scale.width / 2, 230, 'SFX Volume', settings.sfxVolume, (value) => {
      audioService.setSFXVolume(value);
      saveService.updateSetting('sfxVolume', value);
    });
    
    // Language
    this.createLanguageSelector(this.scale.width / 2, 310, settings.language, (lang) => {
      loc.setLanguage(lang);
      saveService.updateSetting('language', lang);
    });
    
    // Screen Shake toggle
    this.createToggle(this.scale.width / 2, 390, 'Screen Shake', settings.screenShake, (value) => {
      saveService.updateSetting('screenShake', value);
    });
    
    // Reduced Motion toggle
    this.createToggle(this.scale.width / 2, 470, 'Reduced Motion', settings.reducedMotion, (value) => {
      saveService.updateSetting('reducedMotion', value);
    });
  }

  private createSlider(x: number, y: number, label: string, value: number, onChange: (value: number) => void): void {
    const container = this.add.container(x, y);
    
    this.add.text(-100, 0, label, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    
    const sliderBg = this.add.graphics();
    sliderBg.fillStyle(0x333333, 1);
    sliderBg.fillRoundedRect(0, -10, 200, 20, 10);
    
    const sliderFill = this.add.graphics();
    sliderFill.fillStyle(COLORS.ui.primary, 1);
    sliderFill.fillRoundedRect(0, -10, value * 200, 20, 10);
    
    const handle = this.add.circle(value * 200, 0, 15, 0xffffff);
    handle.setInteractive(new Phaser.Geom.Circle(0, 0, 15), Phaser.Geom.Circle.Contains);
    
    container.add([sliderBg, sliderFill, handle]);
    
    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number) => {
      if (gameObject === handle) {
        const newValue = Math.max(0, Math.min(1, dragX / 200));
        handle.x = newValue * 200;
        sliderFill.clear();
        sliderFill.fillStyle(COLORS.ui.primary, 1);
        sliderFill.fillRoundedRect(0, -10, newValue * 200, 20, 10);
        onChange(newValue);
      }
    });
  }

  private createLanguageSelector(x: number, y: number, currentLang: string, onChange: (lang: string) => void): void {
    const container = this.add.container(x, y);
    
    this.add.text(-100, 0, 'Language', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    
    const languages = ['en', 'ru'];
    let selectedIndex = languages.indexOf(currentLang);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a3a, 0.9);
    bg.fillRoundedRect(0, -20, 150, 40, 8);
    bg.lineStyle(2, COLORS.ui.primary, 0.5);
    bg.strokeRoundedRect(0, -20, 150, 40, 8);
    
    const label = this.add.text(75, 0, currentLang.toUpperCase(), {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    container.add([bg, label]);
    container.setInteractive(new Phaser.Geom.Rectangle(0, -20, 150, 40), Phaser.Geom.Rectangle.Contains);
    
    container.on('pointerdown', () => {
      selectedIndex = (selectedIndex + 1) % languages.length;
      const newLang = languages[selectedIndex];
      label.setText(newLang.toUpperCase());
      onChange(newLang);
    });
  }

  private createToggle(x: number, y: number, label: string, value: boolean, onChange: (value: boolean) => void): void {
    const container = this.add.container(x, y);
    
    this.add.text(-100, 0, label, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    
    const bg = this.add.graphics();
    bg.fillStyle(value ? COLORS.ui.primary : 0x333333, 1);
    bg.fillRoundedRect(0, -15, 50, 30, 15);
    
    const handle = this.add.circle(value ? 35 : 15, 0, 12, 0xffffff);
    
    container.add([bg, handle]);
    container.setInteractive(new Phaser.Geom.Rectangle(0, -15, 50, 30), Phaser.Geom.Rectangle.Contains);
    
    container.on('pointerdown', () => {
      const newValue = !value;
      bg.clear();
      bg.fillStyle(newValue ? COLORS.ui.primary : 0x333333, 1);
      bg.fillRoundedRect(0, -15, 50, 30, 15);
      handle.x = newValue ? 35 : 15;
      onChange(newValue);
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
