export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST',
}

export interface Point {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
}

export interface Rocket extends Entity {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  speed: number;
  progress: number; // 0 to 1
}

export interface Interceptor extends Entity {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  speed: number;
  progress: number; // 0 to 1
  targetRocketId?: string; // For tracking missiles
}

export interface Explosion extends Entity {
  radius: number;
  maxRadius: number;
  duration: number; // in frames or ms
  elapsed: number;
}

export interface City extends Entity {
  active: boolean;
  health: number;
  maxHealth: number;
}

export interface Battery extends Entity {
  active: boolean;
  missiles: number;
  maxMissiles: number;
  health: number;
  maxHealth: number;
}

export interface GameState {
  status: GameStatus;
  score: number;
  rockets: Rocket[];
  interceptors: Interceptor[];
  explosions: Explosion[];
  cities: City[];
  batteries: Battery[];
  level: number;
  trackingMissiles: number;
  stage: number;
  stageScore: number;
  stageLimit: number;
  isTransitioning: boolean;
  transitionTimer: number;
}
