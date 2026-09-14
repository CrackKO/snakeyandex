// Grid and Movement
export const GRID_SIZE = 20;
export const BASE_SPEED = 150; // ms per tick
export const MIN_SPEED = 80;
export const MAX_SPEED = 200;

// Snake
export const INITIAL_SNAKE_LENGTH = 3;
export const GROWTH_PER_FOOD = 1;

// Score
export const BASE_FOOD_SCORE = 10;
export const BASE_GOLDEN_SCORE = 50;
export const BASE_CRYSTAL_SCORE = 100;
export const COMBO_DECAY_TIME = 3000; // ms
export const MAX_COMBO = 50;

// XP and Leveling
export const BASE_XP_TO_LEVEL = 100;
export const XP_GROWTH_FACTOR = 1.5;

// Food Spawn
export const MAX_FOOD_ON_FIELD = 5;
export const FOOD_SPAWN_INTERVAL = 2000; // ms
export const GOLDEN_ORB_CHANCE = 0.1;
export const CRYSTAL_CHANCE = 0.02;

// Arena
export const ARENA_PADDING = 60;

// Events
export const EVENT_CHECK_INTERVAL = 30000; // ms
export const EVENT_MIN_DURATION = 10000;
export const EVENT_MAX_DURATION = 20000;

// Dash
export const DASH_COOLDOWN = 5000; // ms
export const DASH_DURATION = 300; // ms
export const DASH_SPEED_MULTIPLIER = 2;

// Shield
export const MAX_SHIELDS = 2;

// Revive
export const REVIVE_INVULNERABILITY_TIME = 3000; // ms

// Economy
export const COINS_PER_RUN_BASE = 10;
export const CRYSTALS_PER_RUN_BASE = 1;

// Daily Reward
export const DAILY_REWARD_CYCLE = 7;

// Leaderboard
export const LEADERBOARD_EVOLUTION = 'evolution_score';
export const LEADERBOARD_CLASSIC = 'classic_score';

// Game Modes
export enum GameMode {
  EVOLUTION = 'evolution',
  CLASSIC = 'classic',
  DAILY = 'daily',
}

// Rarity
export enum Rarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

// Colors
export const COLORS = {
  background: 0x0a0a1a,
  grid: 0x1a1a3a,
  snake: {
    common: 0x00ffff,
    rare: 0x00ff88,
    epic: 0xff00ff,
    legendary: 0xffd700,
  },
  food: {
    energy: 0x00ff88,
    golden: 0xffd700,
    crystal: 0xff00ff,
    cluster: 0x00ffff,
  },
  hazard: 0xff3333,
  ui: {
    primary: 0x00ffff,
    secondary: 0xff00ff,
    text: 0xffffff,
    disabled: 0x666666,
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  SETTINGS: 'neon_snake_settings',
  SAVE_DATA: 'neon_snake_save',
  TUTORIAL: 'neon_snake_tutorial',
};
