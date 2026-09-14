type Language = 'en' | 'ru' | 'tr';

interface LocalizationDict {
  [key: string]: {
    en: string;
    ru: string;
    tr?: string;
  };
}

const DICT: LocalizationDict = {
  // Menu
  'menu.play': { en: 'PLAY', ru: 'ИГРАТЬ' },
  'menu.classic': { en: 'CLASSIC', ru: 'КЛАССИКА' },
  'menu.daily': { en: 'DAILY', ru: 'ЕЖЕДНЕВНО' },
  'menu.customize': { en: 'CUSTOMIZE', ru: 'НАСТРОЙКИ' },
  'menu.leaderboard': { en: 'LEADERBOARD', ru: 'ТАБЛИЦА' },
  'menu.settings': { en: 'SETTINGS', ru: 'НАСТРОЙКИ' },
  'menu.achievements': { en: 'ACHIEVEMENTS', ru: 'ДОСТИЖЕНИЯ' },
  'menu.quests': { en: 'QUESTS', ru: 'ЗАДАНИЯ' },
  
  // Game
  'game.score': { en: 'SCORE', ru: 'СЧЁТ' },
  'game.combo': { en: 'COMBO', ru: 'КОМБО' },
  'game.level': { en: 'LEVEL', ru: 'УРОВЕНЬ' },
  'game.dash': { en: 'DASH', ru: 'РЫВОК' },
  
  // Result
  'result.new_record': { en: 'NEW RECORD!', ru: 'НОВЫЙ РЕКОРД!' },
  'result.play_again': { en: 'PLAY AGAIN', ru: 'ИГРАТЬ СНОВА' },
  'result.menu': { en: 'MENU', ru: 'МЕНЮ' },
  'result.revive': { en: 'REVIVE', ru: 'ВОЗРОДИТЬ' },
  'result.coins': { en: 'COINS', ru: 'МОНЕТЫ' },
  
  // Settings
  'settings.music': { en: 'Music', ru: 'Музыка' },
  'settings.sfx': { en: 'SFX', ru: 'Звуки' },
  'settings.language': { en: 'Language', ru: 'Язык' },
  'settings.particles': { en: 'Particles', ru: 'Частицы' },
  'settings.shake': { en: 'Screen Shake', ru: 'Тряска экрана' },
  
  // Cosmetics
  'cosmetics.skins': { en: 'SKINS', ru: 'СКИНЫ' },
  'cosmetics.trails': { en: 'TRAILS', ru: 'СЛЕДЫ' },
  'cosmetics.arenas': { en: 'ARENAS', ru: 'АРены' },
  'cosmetics.select': { en: 'SELECT', ru: 'ВЫБРАТЬ' },
  'cosmetics.locked': { en: 'LOCKED', ru: 'ЗАКРЫТО' },
  
  // Common
  'common.coins': { en: 'Coins', ru: 'Монеты' },
  'common.crystals': { en: 'Crystals', ru: 'Кристаллы' },
  'common.close': { en: 'CLOSE', ru: 'ЗАКРЫТЬ' },
  'common.claim': { en: 'CLAIM', ru: 'ПОЛУЧИТЬ' },
};

export class LocalizationService {
  private static instance: LocalizationService;
  private currentLanguage: Language = 'en';

  private constructor() {}

  static getInstance(): LocalizationService {
    if (!LocalizationService.instance) {
      LocalizationService.instance = new LocalizationService();
    }
    return LocalizationService.instance;
  }

  setLanguage(lang: string): void {
    if (['en', 'ru', 'tr'].includes(lang)) {
      this.currentLanguage = lang as Language;
    } else {
      this.currentLanguage = 'en';
    }
  }

  get(key: string): string {
    const entry = DICT[key];
    if (!entry) return key;
    
    return entry[this.currentLanguage] || entry.en;
  }

  t(key: string): string {
    return this.get(key);
  }
}
