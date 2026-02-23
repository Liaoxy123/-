/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Skull, Target, Shield, Info, Languages } from 'lucide-react';
import { 
  GameStatus, 
  GameState, 
  Rocket, 
  Interceptor, 
  Explosion, 
  City, 
  Battery 
} from './types';
import { 
  GAME_WIDTH, 
  GAME_HEIGHT, 
  ROCKET_SPEED_MIN, 
  ROCKET_SPEED_MAX, 
  INTERCEPTOR_SPEED, 
  EXPLOSION_MAX_RADIUS, 
  EXPLOSION_DURATION, 
  WIN_SCORE, 
  ROCKET_SCORE, 
  BATTERY_CONFIGS, 
  CITY_COUNT, 
  COLORS, 
  TRANSLATIONS 
} from './constants';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uiState, setUiState] = useState({
    score: 0,
    status: GameStatus.START,
    cities: [] as City[],
    batteries: [] as Battery[],
    trackingMissiles: 0,
  });
  const [lang, setLang] = useState<'en' | 'zh'>('zh');
  const t = TRANSLATIONS[lang] as any;

  const gameRef = useRef<GameState>({
    status: GameStatus.START,
    score: 0,
    rockets: [],
    interceptors: [],
    explosions: [],
    cities: [],
    batteries: [],
    level: 1,
    trackingMissiles: 0,
  });

  const lastSpawnTimeRef = useRef<number>(0);
  const lastTrackingAwardTimeRef = useRef<number>(0);

  const initGame = useCallback(() => {
    const cities: City[] = Array.from({ length: CITY_COUNT }).map((_, i) => ({
      id: `city-${i}`,
      x: (GAME_WIDTH / (CITY_COUNT + 1)) * (i + 1),
      y: GAME_HEIGHT - 30,
      active: true,
    }));

    const batteries: Battery[] = BATTERY_CONFIGS.map((config, i) => ({
      id: `battery-${i}`,
      x: config.x,
      y: GAME_HEIGHT - 40,
      active: true,
      missiles: config.maxMissiles,
      maxMissiles: config.maxMissiles,
    }));

    const newState: GameState = {
      status: GameStatus.PLAYING,
      score: 0,
      rockets: [],
      interceptors: [],
      explosions: [],
      cities,
      batteries,
      level: 1,
      trackingMissiles: 1,
    };

    gameRef.current = newState;
    lastSpawnTimeRef.current = Date.now();
    lastTrackingAwardTimeRef.current = Date.now();
    setUiState({
      score: 0,
      status: GameStatus.PLAYING,
      cities,
      batteries,
      trackingMissiles: 1,
    });
  }, []);

  const starsRef = useRef<{x: number, y: number, size: number, opacity: number}[]>([]);

  useEffect(() => {
    // Generate static stars once
    const stars = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        size: Math.random() * 2,
        opacity: Math.random()
      });
    }
    starsRef.current = stars;
  }, []);

  // Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const draw = (state: GameState) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear
      ctx.fillStyle = COLORS.BACKGROUND;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Draw Skyline Background
      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath();
      ctx.moveTo(0, GAME_HEIGHT);
      ctx.lineTo(0, GAME_HEIGHT - 100);
      ctx.lineTo(50, GAME_HEIGHT - 150);
      ctx.lineTo(100, GAME_HEIGHT - 120);
      ctx.lineTo(150, GAME_HEIGHT - 180);
      ctx.lineTo(200, GAME_HEIGHT - 140);
      ctx.lineTo(250, GAME_HEIGHT - 200);
      ctx.lineTo(300, GAME_HEIGHT - 160);
      ctx.lineTo(350, GAME_HEIGHT - 220);
      ctx.lineTo(400, GAME_HEIGHT - 180);
      ctx.lineTo(450, GAME_HEIGHT - 240);
      ctx.lineTo(500, GAME_HEIGHT - 190);
      ctx.lineTo(550, GAME_HEIGHT - 210);
      ctx.lineTo(600, GAME_HEIGHT - 150);
      ctx.lineTo(650, GAME_HEIGHT - 180);
      ctx.lineTo(700, GAME_HEIGHT - 130);
      ctx.lineTo(750, GAME_HEIGHT - 160);
      ctx.lineTo(800, GAME_HEIGHT - 110);
      ctx.lineTo(800, GAME_HEIGHT);
      ctx.closePath();
      ctx.fill();

      // Draw some windows in the background skyline
      ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
      for (let i = 0; i < 800; i += 40) {
        for (let j = 0; j < 100; j += 20) {
          if (Math.random() > 0.7) {
            ctx.fillRect(i + 10, GAME_HEIGHT - 100 + j, 5, 5);
          }
        }
      }

      // Draw Cities
      state.cities.forEach(c => {
        if (!c.active) return;
        ctx.fillStyle = COLORS.CITY;
        ctx.beginPath();
        ctx.rect(c.x - 15, c.y - 10, 30, 20);
        ctx.fill();
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(c.x - 10, c.y - 5, 5, 5);
        ctx.fillRect(c.x + 5, c.y - 5, 5, 5);
      });

      // Draw Batteries
      state.batteries.forEach(b => {
        if (!b.active) return;
        ctx.fillStyle = COLORS.BATTERY;
        ctx.beginPath();
        ctx.moveTo(b.x - 50, b.y + 20);
        ctx.lineTo(b.x + 50, b.y + 20);
        ctx.lineTo(b.x, b.y - 40);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = COLORS.TEXT;
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(b.missiles.toString(), b.x, b.y + 40);
      });

      // Draw Rockets (ICBM Style)
      state.rockets.forEach(r => {
        // Trail
        ctx.strokeStyle = 'rgba(255, 68, 68, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(r.startX, r.startY);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();
        
        // ICBM Body
        const angle = Math.atan2(r.targetY - r.startY, r.targetX - r.startX);
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate(angle);
        
        // Body
        ctx.fillStyle = '#888888';
        ctx.fillRect(-15, -4, 20, 8);
        
        // Nose cone
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(5, -4);
        ctx.lineTo(15, 0);
        ctx.lineTo(5, 4);
        ctx.closePath();
        ctx.fill();
        
        // Fins
        ctx.fillStyle = '#444444';
        ctx.beginPath();
        ctx.moveTo(-15, -4);
        ctx.lineTo(-20, -8);
        ctx.lineTo(-10, -4);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-15, 4);
        ctx.lineTo(-20, 8);
        ctx.lineTo(-10, 4);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        
        // Glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = COLORS.ROCKET;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Interceptors
      state.interceptors.forEach(i => {
        ctx.strokeStyle = i.targetRocketId ? '#ff00ff' : COLORS.INTERCEPTOR;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(i.startX, i.startY);
        ctx.lineTo(i.x, i.y);
        ctx.stroke();

        if (!i.targetRocketId) {
          ctx.strokeStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(i.targetX - 5, i.targetY - 5);
          ctx.lineTo(i.targetX + 5, i.targetY + 5);
          ctx.moveTo(i.targetX + 5, i.targetY - 5);
          ctx.lineTo(i.targetX - 5, i.targetY + 5);
          ctx.stroke();
        } else {
          // Draw tracking indicator
          ctx.strokeStyle = '#ff00ff';
          ctx.beginPath();
          ctx.arc(i.targetX, i.targetY, 10, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Draw Explosions
      state.explosions.forEach(e => {
        const gradient = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.radius);
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(0.4, 'yellow');
        gradient.addColorStop(0.7, 'orange');
        gradient.addColorStop(1, 'rgba(255, 68, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const update = () => {
      const state = gameRef.current;
      if (state.status !== GameStatus.PLAYING) {
        draw(state);
        animationFrameId = requestAnimationFrame(update);
        return;
      }

      const now = Date.now();
      const nextState = { ...state };

      // 0. Award tracking missiles every 10s
      if (now - lastTrackingAwardTimeRef.current > 10000) {
        nextState.trackingMissiles += 1;
        lastTrackingAwardTimeRef.current = now;
      }

      // 1. Spawn rockets
      const spawnInterval = 3000 / (1 + state.score / 500);
      if (now - lastSpawnTimeRef.current > spawnInterval) {
        const id = Math.random().toString(36).substr(2, 9);
        const startX = Math.random() * GAME_WIDTH;
        const targetX = Math.random() * GAME_WIDTH;
        const speed = ROCKET_SPEED_MIN + Math.random() * (ROCKET_SPEED_MAX - ROCKET_SPEED_MIN);
        
        const newRocket: Rocket = {
          id,
          startX,
          startY: 0,
          x: startX,
          y: 0,
          targetX,
          targetY: GAME_HEIGHT,
          speed,
          progress: 0,
        };
        nextState.rockets = [...state.rockets, newRocket];
        lastSpawnTimeRef.current = now;
      } else {
        nextState.rockets = [...state.rockets];
      }

      // 2. Update Rockets
      nextState.rockets = nextState.rockets.map(r => {
        const progress = r.progress + r.speed;
        const x = r.startX + (r.targetX - r.startX) * progress;
        const y = r.startY + (r.targetY - r.startY) * progress;
        return { ...r, progress, x, y };
      }).filter(r => {
        if (r.progress >= 1) {
          nextState.cities = nextState.cities.map(c => {
            const dist = Math.abs(c.x - r.targetX);
            if (dist < 30) return { ...c, active: false };
            return c;
          });
          nextState.batteries = nextState.batteries.map(b => {
            const dist = Math.abs(b.x - r.targetX);
            if (dist < 80) return { ...b, active: false };
            return b;
          });
          nextState.explosions = [...nextState.explosions, {
            id: `exp-impact-${Math.random()}`,
            x: r.targetX,
            y: r.targetY,
            radius: 0,
            maxRadius: EXPLOSION_MAX_RADIUS,
            duration: EXPLOSION_DURATION,
            elapsed: 0,
          }];
          return false;
        }
        return true;
      });

      // 3. Update Interceptors
      nextState.interceptors = state.interceptors.map(i => {
        let targetX = i.targetX;
        let targetY = i.targetY;

        // If tracking, update target to rocket position
        if (i.targetRocketId) {
          const targetRocket = nextState.rockets.find(r => r.id === i.targetRocketId);
          if (targetRocket) {
            targetX = targetRocket.x;
            targetY = targetRocket.y;
          } else {
            // Rocket gone, explode where we are
            return { ...i, progress: 1 };
          }
        }

        const progress = i.progress + i.speed;
        const x = i.startX + (targetX - i.startX) * progress;
        const y = i.startY + (targetY - i.startY) * progress;
        return { ...i, progress, x, y, targetX, targetY };
      }).filter(i => {
        if (i.progress >= 1) {
          nextState.explosions = [...nextState.explosions, {
            id: `exp-${i.id}`,
            x: i.targetX,
            y: i.targetY,
            radius: 0,
            maxRadius: EXPLOSION_MAX_RADIUS,
            duration: EXPLOSION_DURATION,
            elapsed: 0,
          }];
          return false;
        }
        return true;
      });

      // 4. Update Explosions
      nextState.explosions = nextState.explosions.map(e => {
        const elapsed = e.elapsed + 1;
        const radius = e.maxRadius * Math.sin((elapsed / e.duration) * Math.PI);
        return { ...e, elapsed, radius };
      }).filter(e => e.elapsed < e.duration);

      // 5. Collision Detection
      const rocketsBefore = nextState.rockets.length;
      nextState.rockets = nextState.rockets.filter(r => {
        const hit = nextState.explosions.some(e => {
          const dx = r.x - e.x;
          const dy = r.y - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          return dist < e.radius;
        });
        return !hit;
      });
      const rocketsAfter = nextState.rockets.length;
      nextState.score += (rocketsBefore - rocketsAfter) * ROCKET_SCORE;

      // 6. Check Win/Loss
      if (nextState.score >= WIN_SCORE) {
        nextState.status = GameStatus.WON;
      } else if (nextState.batteries.every(b => !b.active)) {
        nextState.status = GameStatus.LOST;
      }

      gameRef.current = nextState;
      
      // Sync UI state occasionally or on important changes
      if (nextState.score !== state.score || nextState.status !== state.status || nextState.trackingMissiles !== state.trackingMissiles) {
        setUiState({
          score: nextState.score,
          status: nextState.status,
          cities: nextState.cities,
          batteries: nextState.batteries,
          trackingMissiles: nextState.trackingMissiles,
        });
      }

      draw(nextState);
      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    const state = gameRef.current;
    if (state.status !== GameStatus.PLAYING) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = GAME_WIDTH / rect.width;
    const scaleY = GAME_HEIGHT / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const availableBatteries = state.batteries.filter(b => b.active && b.missiles > 0);
    if (availableBatteries.length === 0) return;

    const battery = availableBatteries.reduce((prev, curr) => {
      const distPrev = Math.abs(prev.x - x);
      const distCurr = Math.abs(curr.x - x);
      return distCurr < distPrev ? curr : prev;
    });

    const id = Math.random().toString(36).substr(2, 9);
    const newInterceptor: Interceptor = {
      id,
      startX: battery.x,
      startY: battery.y,
      x: battery.x,
      y: battery.y,
      targetX: x,
      targetY: y,
      speed: INTERCEPTOR_SPEED,
      progress: 0,
    };

    gameRef.current = {
      ...state,
      interceptors: [...state.interceptors, newInterceptor],
      batteries: state.batteries.map(b => 
        b.id === battery.id ? { ...b, missiles: b.missiles - 1 } : b
      ),
    };
    
    setUiState(prev => ({
      ...prev,
      batteries: gameRef.current.batteries,
    }));
  };

  const fireTrackingMissile = () => {
    const state = gameRef.current;
    if (state.status !== GameStatus.PLAYING || state.trackingMissiles <= 0) return;
    if (state.rockets.length === 0) return;

    // Find closest rocket to any active battery
    const availableBatteries = state.batteries.filter(b => b.active);
    if (availableBatteries.length === 0) return;

    // Just pick the lowest rocket for now or closest to center
    const targetRocket = state.rockets.reduce((prev, curr) => {
      return curr.y > prev.y ? curr : prev;
    });

    const battery = availableBatteries[1] && availableBatteries[1].active ? availableBatteries[1] : availableBatteries[0];

    const id = Math.random().toString(36).substr(2, 9);
    const newInterceptor: Interceptor = {
      id,
      startX: battery.x,
      startY: battery.y,
      x: battery.x,
      y: battery.y,
      targetX: targetRocket.x,
      targetY: targetRocket.y,
      speed: INTERCEPTOR_SPEED * 1.5,
      progress: 0,
      targetRocketId: targetRocket.id,
    };

    gameRef.current = {
      ...state,
      trackingMissiles: state.trackingMissiles - 1,
      interceptors: [...state.interceptors, newInterceptor],
    };

    setUiState(prev => ({
      ...prev,
      trackingMissiles: gameRef.current.trackingMissiles,
    }));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Header */}
      <div className="w-full max-w-[800px] flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Target className="text-red-500 w-8 h-8" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tighter uppercase italic">
            {t.title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fireTrackingMissile}
            disabled={uiState.trackingMissiles <= 0 || uiState.status !== GameStatus.PLAYING}
            className={`flex items-center gap-2 px-4 py-1 rounded-full border transition-all text-sm font-bold ${
              uiState.trackingMissiles > 0 
                ? 'border-magenta-500 bg-magenta-500/20 text-magenta-400 hover:bg-magenta-500/40 animate-pulse' 
                : 'border-white/10 text-white/20 cursor-not-allowed'
            }`}
            style={{ borderColor: uiState.trackingMissiles > 0 ? '#ff00ff' : undefined }}
          >
            <Target size={16} />
            {t.trackingMissile}: {uiState.trackingMissiles}
          </button>
          <button 
            onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-sm"
          >
            <Languages size={16} />
            {lang === 'en' ? '中文' : 'EN'}
          </button>
          <div className="bg-white/10 px-4 py-1 rounded-full border border-white/20">
            <span className="text-xs uppercase opacity-50 mr-2">{t.score}</span>
            <span className="font-mono font-bold text-xl">{uiState.score}</span>
          </div>
        </div>
      </div>

      {/* Game Container */}
      <div className="relative w-full max-w-[800px] aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          onClick={handleCanvasClick}
          onTouchStart={handleCanvasClick}
          className="w-full h-full cursor-crosshair touch-none"
        />

        {/* Overlays */}
        <AnimatePresence>
          {uiState.status === GameStatus.START && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-md"
              >
                <Target className="w-16 h-16 text-red-500 mx-auto mb-6 animate-pulse" />
                <h2 className="text-4xl font-black mb-4 uppercase italic tracking-tighter">
                  {t.title}
                </h2>
                <p className="text-white/60 mb-8 leading-relaxed">
                  {t.instructions}
                </p>
                <button
                  onClick={initGame}
                  className="group relative px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  <span className="relative z-10 uppercase tracking-widest">{t.start}</span>
                  <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </motion.div>
            </motion.div>
          )}

          {uiState.status === GameStatus.WON && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-green-900/40 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
            >
              <Trophy className="w-20 h-20 text-yellow-400 mb-6" />
              <h2 className="text-5xl font-black mb-2 uppercase italic">{t.win}</h2>
              <p className="text-xl mb-8 opacity-80">{t.winMsg}</p>
              <div className="text-3xl font-mono mb-8">
                {t.score}: {uiState.score}
              </div>
              <button
                onClick={initGame}
                className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest"
              >
                {t.restart}
              </button>
            </motion.div>
          )}

          {uiState.status === GameStatus.LOST && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-red-900/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
            >
              <Skull className="w-20 h-20 text-white mb-6" />
              <h2 className="text-4xl font-black mb-2 uppercase italic">{t.lose}</h2>
              <p className="text-xl mb-8 opacity-80">{t.loseMsg}</p>
              <div className="text-3xl font-mono mb-8">
                {t.score}: {uiState.score}
              </div>
              <button
                onClick={initGame}
                className="px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-all uppercase tracking-widest"
              >
                {t.restart}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD Mini Info */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
          <div className="flex gap-2">
            {uiState.cities.map((c, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-sm transition-colors ${c.active ? 'bg-blue-500' : 'bg-red-900/50'}`} 
              />
            ))}
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex gap-1">
              <Shield size={14} className="text-white/40" />
              <div className="text-[10px] uppercase font-bold text-white/40">{t.missiles}</div>
            </div>
            {uiState.batteries.map((b, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-1 h-4 ${b.active ? 'bg-white' : 'bg-red-500/20'}`} />
                <span className={`text-[10px] font-mono ${b.active ? 'text-white' : 'text-red-500'}`}>
                  {b.missiles}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Instructions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[800px] opacity-40 hover:opacity-100 transition-opacity">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/5 rounded-lg">
            <Info size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase mb-1">How to Play</h4>
            <p className="text-[11px] leading-tight">Click to fire interceptors. They explode at your cursor. Destroy rockets before they hit cities.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/5 rounded-lg">
            <Target size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase mb-1">Prediction</h4>
            <p className="text-[11px] leading-tight">Rockets move fast. Aim ahead of their current position to catch them in the explosion.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/5 rounded-lg">
            <Shield size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase mb-1">Victory</h4>
            <p className="text-[11px] leading-tight">Reach 1000 points to win. Each rocket destroyed is worth 20 points. Don't let all batteries fall!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
