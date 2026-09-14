import Phaser from 'phaser';
import { BootScene } from './game/scenes/BootScene';
import { MenuScene } from './game/scenes/MenuScene';
import { GameScene } from './game/scenes/GameScene';
import { ResultScene } from './game/scenes/ResultScene';
import { CustomizationScene } from './game/scenes/CustomizationScene';
import { LeaderboardScene } from './game/scenes/LeaderboardScene';
import { SettingsScene } from './game/scenes/SettingsScene';
import { QuestsScene } from './game/scenes/QuestsScene';
import { AchievementsScene } from './game/scenes/AchievementsScene';
import { DailyRewardScene } from './game/scenes/DailyRewardScene';
import { LevelUpScene } from './game/scenes/LevelUpScene';
import { PauseScene } from './game/scenes/PauseScene';
import { YandexSDKService } from './game/services/YandexSDKService';
import { SaveService } from './game/services/SaveService';
import { AudioService } from './game/services/AudioService';
import { LocalizationService } from './game/services/LocalizationService';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#0a0a1a',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    MenuScene,
    GameScene,
    ResultScene,
    CustomizationScene,
    LeaderboardScene,
    SettingsScene,
    QuestsScene,
    AchievementsScene,
    DailyRewardScene,
    LevelUpScene,
    PauseScene,
  ],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
};

// Initialize services
const sdkService = YandexSDKService.getInstance();
const saveService = SaveService.getInstance();
const audioService = AudioService.getInstance();
const localizationService = LocalizationService.getInstance();

// Make services globally accessible
declare global {
  interface Window {
    gameServices: {
      sdk: YandexSDKService;
      save: SaveService;
      audio: AudioService;
      localization: LocalizationService;
    };
  }
}

window.gameServices = {
  sdk: sdkService,
  save: saveService,
  audio: audioService,
  localization: localizationService,
};

// Initialize SDK first
sdkService.init().then(() => {
  // Get language from SDK
  const lang = sdkService.getLanguage();
  localizationService.setLanguage(lang);
  
  // Load saved data
  saveService.load();
  
  // Create game
  new Phaser.Game(config);
  
  // Update loading screen
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.remove();
    }, 500);
  }
  
  // Signal game ready to Yandex
  sdkService.gameReady();
});

// Handle resize
window.addEventListener('resize', () => {
  const gameElement = document.querySelector('canvas');
  if (gameElement) {
    window.dispatchEvent(new Event('phaser-resize'));
  }
});

// Handle visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    audioService.pauseAll();
  } else {
    audioService.resumeAll();
  }
});

export default config;
