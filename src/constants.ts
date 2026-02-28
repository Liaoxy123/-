export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const ROCKET_SPEED_MIN = 0.001;
export const ROCKET_SPEED_MAX = 0.0015;

export const INTERCEPTOR_SPEED = 0.05;

export const EXPLOSION_MAX_RADIUS = 50;
export const EXPLOSION_DURATION = 70; // frames

export const ROCKET_SCORE = 100;

export const BATTERY_CONFIGS = [
  { x: 100, maxMissiles: 30 },
  { x: 400, maxMissiles: 60 },
  { x: 700, maxMissiles: 30 },
];

export const CITY_COUNT = 6;

export const COLORS = {
  BACKGROUND: '#050508',
  ROCKET: '#00ffcc', // Plasma cyan
  INTERCEPTOR: '#ff00ff', // Laser magenta
  EXPLOSION: 'rgba(0, 255, 255, 0.8)',
  CITY: '#3b82f6',
  BATTERY: '#6366f1',
  TEXT: '#ffffff',
  SHIELD: 'rgba(0, 255, 255, 0.3)',
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
    trackingMissile: 'Tracking Missile',
    defenseNetwork: 'Defense Network Active (+20 Ammo)',
    stage: 'Stage',
    stageProgress: 'Stage Progress',
    stageTransition: 'Stage {n} is about to start...',
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
    defenseNetwork: '防御网激活 (+20 弹药)',
    stage: '阶段',
    stageProgress: '阶段进度',
    stageTransition: '第 {n} 阶段即将开始...',
  }
};
