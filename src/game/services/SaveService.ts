import { STORAGE_KEYS } from '../constants/GameConstants';

export interface GameSaveData {
  saveVersion: number;
  coins: number;
  crystals: number;
  accountXP: number;
  accountLevel: number;
  bestScores: {
    evolution: number;
    classic: number;
    daily: Record<string, number>;
  };
  settings: {
    musicVolume: number;
    sfxVolume: number;
    language: string;
    particlesQuality: number;
    screenShake: boolean;
    reducedMotion: boolean;
    mobileControls: boolean;
    vibration: boolean;
  };
  selectedCosmetics: {
    skin: string;
    trail: string;
    arena: string;
  };
  unlockedCosmetics: string[];
  unlockedUpgrades: string[];
  achievements: string[];
  questProgress: Record<string, number>;
  statistics: {
    totalRuns: number;
    totalScore: number;
    totalOrbs: number;
    totalGoldenOrbs: number;
    maxCombo: number;
    totalTimePlayed: number;
  };
  dailyReward: {
    streak: number;
    lastClaimed: number;
  };
  lastDailyChallenge: string;
  tutorialCompleted: boolean;
  lastUpdatedAt: number;
}

const DEFAULT_SAVE: GameSaveData = {
  saveVersion: 1,
  coins: 0,
  crystals: 0,
  accountXP: 0,
  accountLevel: 1,
  bestScores: {
    evolution: 0,
    classic: 0,
    daily: {},
  },
  settings: {
    musicVolume: 0.7,
    sfxVolume: 0.8,
    language: 'en',
    particlesQuality: 1,
    screenShake: true,
    reducedMotion: false,
    mobileControls: true,
    vibration: true,
  },
  selectedCosmetics: {
    skin: 'neon_blue',
    trail: 'default',
    arena: 'default',
  },
  unlockedCosmetics: ['neon_blue', 'default'],
  unlockedUpgrades: [],
  achievements: [],
  questProgress: {},
  statistics: {
    totalRuns: 0,
    totalScore: 0,
    totalOrbs: 0,
    totalGoldenOrbs: 0,
    maxCombo: 0,
    totalTimePlayed: 0,
  },
  dailyReward: {
    streak: 0,
    lastClaimed: 0,
  },
  lastDailyChallenge: '',
  tutorialCompleted: false,
  lastUpdatedAt: Date.now(),
};

export class SaveService {
  private static instance: SaveService;
  private data: GameSaveData = { ...DEFAULT_SAVE };
  private saveDebounce: number | null = null;

  private constructor() {}

  static getInstance(): SaveService {
    if (!SaveService.instance) {
      SaveService.instance = new SaveService();
    }
    return SaveService.instance;
  }

  load(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVE_DATA);
      if (saved) {
        const parsed = JSON.parse(saved) as GameSaveData;
        this.data = this.migrate(parsed);
      } else {
        this.data = { ...DEFAULT_SAVE };
      }
    } catch (error) {
      console.error('Failed to load save data:', error);
      this.data = { ...DEFAULT_SAVE };
    }
  }

  save(): void {
    if (this.saveDebounce) {
      clearTimeout(this.saveDebounce);
    }
    
    this.saveDebounce = window.setTimeout(() => {
      try {
        this.data.lastUpdatedAt = Date.now();
        localStorage.setItem(STORAGE_KEYS.SAVE_DATA, JSON.stringify(this.data));
      } catch (error) {
        console.error('Failed to save data:', error);
      }
    }, 500);
  }

  private migrate(data: GameSaveData): GameSaveData {
    // Version migration logic here
    if (data.saveVersion < 1) {
      // Migration from version 0 to 1
    }
    return data;
  }

  getData(): GameSaveData {
    return { ...this.data };
  }

  updateCoins(amount: number): void {
    this.data.coins = Math.max(0, this.data.coins + amount);
    this.save();
  }

  updateCrystals(amount: number): void {
    this.data.crystals = Math.max(0, this.data.crystals + amount);
    this.save();
  }

  addAccountXP(amount: number): void {
    this.data.accountXP += amount;
    const xpForNextLevel = this.data.accountLevel * 100;
    if (this.data.accountXP >= xpForNextLevel) {
      this.data.accountXP -= xpForNextLevel;
      this.data.accountLevel++;
    }
    this.save();
  }

  updateBestScore(mode: string, score: number): boolean {
    let isNewRecord = false;
    if (mode === 'evolution' && score > this.data.bestScores.evolution) {
      this.data.bestScores.evolution = score;
      isNewRecord = true;
    } else if (mode === 'classic' && score > this.data.bestScores.classic) {
      this.data.bestScores.classic = score;
      isNewRecord = true;
    } else if (mode === 'daily') {
      const date = new Date().toISOString().split('T')[0];
      if (!this.data.bestScores.daily[date] || score > this.data.bestScores.daily[date]) {
        this.data.bestScores.daily[date] = score;
        isNewRecord = true;
      }
    }
    if (isNewRecord) this.save();
    return isNewRecord;
  }

  unlockCosmetic(id: string): void {
    if (!this.data.unlockedCosmetics.includes(id)) {
      this.data.unlockedCosmetics.push(id);
      this.save();
    }
  }

  selectCosmetic(category: 'skin' | 'trail' | 'arena', id: string): void {
    this.data.selectedCosmetics[category] = id;
    this.save();
  }

  hasCosmetic(id: string): boolean {
    return this.data.unlockedCosmetics.includes(id);
  }

  addAchievement(id: string): boolean {
    if (!this.data.achievements.includes(id)) {
      this.data.achievements.push(id);
      this.save();
      return true;
    }
    return false;
  }

  hasAchievement(id: string): boolean {
    return this.data.achievements.includes(id);
  }

  updateStatistics(stats: Partial<GameSaveData['statistics']>): void {
    Object.assign(this.data.statistics, stats);
    this.save();
  }

  setTutorialCompleted(): void {
    this.data.tutorialCompleted = true;
    this.save();
  }

  isTutorialCompleted(): boolean {
    return this.data.tutorialCompleted;
  }

  getSettings(): GameSaveData['settings'] {
    return { ...this.data.settings };
  }

  updateSetting<K extends keyof GameSaveData['settings']>(key: K, value: GameSaveData['settings'][K]): void {
    this.data.settings[key] = value;
    this.save();
  }
}
