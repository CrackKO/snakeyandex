import { GameMode } from '../constants/GameConstants';

declare global {
  interface Window {
    YaGames?: {
      init: () => Promise<YandexSDK>;
    };
  }
}

interface YandexSDK {
  features?: {
    LoadingAPI?: {
      ready: () => void;
    };
    GameplayAPI?: {
      start: () => void;
      stop: () => void;
    };
  };
  adv?: {
    showFullscreenAdv: (options: { callbacks?: Record<string, () => void> }) => void;
    showRewardedVideo: (options: { callbacks?: Record<string, () => void> }) => void;
  };
  player?: Promise<Player>;
  serverTime?: () => number;
  environment?: {
    i18n: {
      lang: string;
    };
  };
  deviceInfo?: {
    type: 'desktop' | 'mobile' | 'tablet';
  };
}

interface Player {
  getData: () => Promise<Record<string, unknown>>;
  setData: (data: Record<string, unknown>) => Promise<void>;
  getLeaderboards: () => Promise<Leaderboard[]>;
}

interface Leaderboard {
  name: string;
  setLeaderboardScore: (score: number) => void;
  getLeaderboardData: (options?: Record<string, unknown>) => Promise<LeaderboardEntry[]>;
}

interface LeaderboardEntry {
  rank: number;
  score: number;
  player: {
    name: string;
    photo: string;
  };
}

export class YandexSDKService {
  private static instance: YandexSDKService;
  private sdk: YandexSDK | null = null;
  private player: Player | null = null;
  private isInitialized = false;
  private isMock = true;
  private mockData: Record<string, unknown> = {};
  private fullscreenCooldown = 0;
  private readonly COOLDOWN_MS = 90000;

  private constructor() {}

  static getInstance(): YandexSDKService {
    if (!YandexSDKService.instance) {
      YandexSDKService.instance = new YandexSDKService();
    }
    return YandexSDKService.instance;
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (window.YaGames) {
        this.sdk = await window.YaGames.init();
        this.isMock = false;
        console.log('Yandex SDK initialized');
        
        // Try to get player
        try {
          if (this.sdk.player) {
            this.player = await this.sdk.player;
          }
        } catch (e) {
          console.log('Player not available:', e);
        }
      } else {
        console.warn('Yandex SDK not found, using mock mode');
        this.isMock = true;
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Yandex SDK:', error);
      this.isMock = true;
      this.isInitialized = true;
    }
  }

  gameReady(): void {
    try {
      if (!this.isMock && this.sdk?.features?.LoadingAPI) {
        this.sdk.features.LoadingAPI.ready();
      }
      console.log('Game ready');
    } catch (error) {
      console.error('Error calling gameReady:', error);
    }
  }

  gameplayStart(): void {
    try {
      if (!this.isMock && this.sdk?.features?.GameplayAPI) {
        this.sdk.features.GameplayAPI.start();
      }
    } catch (error) {
      console.error('Error starting gameplay:', error);
    }
  }

  gameplayStop(): void {
    try {
      if (!this.isMock && this.sdk?.features?.GameplayAPI) {
        this.sdk.features.GameplayAPI.stop();
      }
    } catch (error) {
      console.error('Error stopping gameplay:', error);
    }
  }

  getLanguage(): string {
    if (!this.isMock && this.sdk?.environment?.i18n?.lang) {
      return this.sdk.environment.i18n.lang;
    }
    return 'en';
  }

  getServerTime(): number {
    if (!this.isMock && this.sdk?.serverTime) {
      return this.sdk.serverTime();
    }
    return Date.now();
  }

  getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    if (!this.isMock && this.sdk?.deviceInfo?.type) {
      return this.sdk.deviceInfo.type;
    }
    
    // Simple detection
    const ua = navigator.userAgent;
    if (/tablet/i.test(ua)) return 'tablet';
    if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  async loadPlayerData(): Promise<Record<string, unknown>> {
    try {
      if (!this.isMock && this.player) {
        const data = await this.player.getData();
        return data;
      }
    } catch (error) {
      console.error('Error loading player data:', error);
    }
    return { ...this.mockData };
  }

  async savePlayerData(data: Record<string, unknown>): Promise<void> {
    try {
      if (!this.isMock && this.player) {
        await this.player.setData(data);
      } else {
        this.mockData = { ...data };
        localStorage.setItem('neon_snake_mock_save', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving player data:', error);
      // Fallback to local storage
      try {
        this.mockData = { ...data };
        localStorage.setItem('neon_snake_mock_save', JSON.stringify(data));
      } catch (e) {
        console.error('Fallback save also failed:', e);
      }
    }
  }

  async showFullscreenAd(): Promise<boolean> {
    const now = Date.now();
    if (now - this.fullscreenCooldown < this.COOLDOWN_MS) {
      console.log('Fullscreen ad on cooldown');
      return false;
    }

    try {
      if (!this.isMock && this.sdk?.adv) {
        this.gameplayStop();
        await new Promise<void>((resolve) => {
          this.sdk!.adv!.showFullscreenAdv({
            callbacks: {
              onClose: () => {
                this.fullscreenCooldown = Date.now();
                resolve();
              },
              onError: () => {
                this.fullscreenCooldown = Date.now();
                resolve();
              },
            },
          });
        });
        return true;
      }
    } catch (error) {
      console.error('Error showing fullscreen ad:', error);
    }
    return false;
  }

  async showRewardedAd(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        if (!this.isMock && this.sdk?.adv) {
          this.sdk.adv.showRewardedVideo({
            callbacks: {
              onRewarded: () => {
                console.log('Rewarded ad completed');
                resolve(true);
              },
              onClose: () => {
                resolve(false);
              },
              onError: () => {
                resolve(false);
              },
            },
          });
        } else {
          // Mock for development
          console.log('Mock rewarded ad');
          setTimeout(() => resolve(true), 1000);
        }
      } catch (error) {
        console.error('Error showing rewarded ad:', error);
        resolve(false);
      }
    });
  }

  async submitScore(leaderboardName: string, score: number): Promise<void> {
    try {
      if (!this.isMock && this.player) {
        const leaderboards = await this.player.getLeaderboards();
        const lb = leaderboards.find((l) => l.name === leaderboardName);
        if (lb) {
          lb.setLeaderboardScore(score);
        }
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  }

  async getLeaderboard(leaderboardName: string, count: number = 10): Promise<LeaderboardEntry[]> {
    try {
      if (!this.isMock && this.player) {
        const leaderboards = await this.player.getLeaderboards();
        const lb = leaderboards.find((l) => l.name === leaderboardName);
        if (lb) {
          return await lb.getLeaderboardData({ max: count });
        }
      }
    } catch (error) {
      console.error('Error getting leaderboard:', error);
    }
    
    // Mock data
    return Array.from({ length: count }, (_, i) => ({
      rank: i + 1,
      score: Math.floor(Math.random() * 100000),
      player: {
        name: `Player${i + 1}`,
        photo: '',
      },
    }));
  }

  isAvailable(): boolean {
    return !this.isMock;
  }

  isLoggedIn(): boolean {
    return this.player !== null;
  }
}
