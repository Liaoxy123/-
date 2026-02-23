export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const ROCKET_SPEED_MIN = 0.0013;
export const ROCKET_SPEED_MAX = 0.002;

export const INTERCEPTOR_SPEED = 0.04;

export const EXPLOSION_MAX_RADIUS = 40;
export const EXPLOSION_DURATION = 60; // frames

export const WIN_SCORE = 1000;
export const ROCKET_SCORE = 20;

export const BATTERY_CONFIGS = [
  { x: 100, maxMissiles: 20 },
  { x: 400, maxMissiles: 40 },
  { x: 700, maxMissiles: 20 },
];

export const CITY_COUNT = 6;

export const COLORS = {
  BACKGROUND: '#02040a',
  ROCKET: '#ff4444',
  INTERCEPTOR: '#44ff44',
  EXPLOSION: 'rgba(255, 255, 255, 0.8)',
  CITY: '#4444ff',
  BATTERY: '#aaaaaa',
  TEXT: '#ffffff',
};

export const TRANSLATIONS = {
  en: {
    title: 'Jiawen Nova Defense',
    start: 'Start Game',
    restart: 'Play Again',
    win: 'Mission Accomplished!',
    lose: 'Defeat: All Batteries Destroyed',
    score: 'Score',
    missiles: 'Missiles',
    instructions: 'Click anywhere to intercept incoming rockets. Predict their path!',
    winMsg: 'You have successfully defended the cities!',
    loseMsg: 'The defense has fallen.',
  },
  zh: {
    title: '嘉文新星防御',
    start: '开始游戏',
    restart: '再玩一次',
    win: '任务完成！',
    lose: '失败：所有炮台已被摧毁',
    score: '得分',
    missiles: '导弹',
    instructions: '点击屏幕任何位置发射拦截导弹。预判敌方路径！',
    winMsg: '你成功保卫了城市！',
    loseMsg: '防线已崩溃。',
    trackingMissile: '追踪弹',
  }
};
