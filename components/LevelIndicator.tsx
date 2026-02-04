import React, { useState } from 'react';
import { GameLevel } from '../types';

interface LevelIndicatorProps {
  level: GameLevel;
  streak: number;
  score: number;
  lives: number;
  maxLives: number;
  onLevelChange: (level: GameLevel) => void;
}

const LevelIndicator: React.FC<LevelIndicatorProps> = ({ level, streak, score, lives, maxLives, onLevelChange }) => {
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  const steps = [
    { id: GameLevel.VietnameseToNumber, short: 'VN', label: 'MEANING', desc: 'Match meaning' },
    { id: GameLevel.EnglishToNumber, short: 'EN', label: 'WORD', desc: 'Match word' },
    { id: GameLevel.IPAToNumber, short: 'IPA', label: 'SOUND', desc: 'Match sound' },
  ];

  return (
    <div className="flex flex-col gap-3 w-full max-w-2xl mx-auto mb-2">
      {/* Overall Level Progress Bar / Mode Switcher */}
      <div className="flex items-center justify-between relative px-2 sm:px-4 mt-2">
        {/* Connecting Line background */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-neutral-800 rounded z-0 border border-white/5"></div>
        
        {/* Connecting Line progress */}
        <div 
          className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded z-0 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          style={{ width: `calc(${((level - 1) / (steps.length - 1)) * 100}% - 3rem)` }}
        ></div>

        {steps.map((step) => {
          const isCompleted = level > step.id;
          const isCurrent = level === step.id;
          
          return (
            <button 
              key={step.id} 
              onClick={() => onLevelChange(step.id)}
              className="relative z-10 flex flex-col items-center group focus:outline-none"
              title={`Switch to ${step.label} mode`}
            >
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-300 border-2 
                  ${isCompleted ? 'bg-blue-950 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 
                    isCurrent ? 'bg-yellow-400 border-yellow-400 text-black scale-110 shadow-[0_0_20px_rgba(250,204,21,0.5)] rotate-3' : 
                    'bg-neutral-900 border-neutral-700 text-neutral-600 hover:border-neutral-500 hover:text-neutral-400'}`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  step.short
                )}
              </div>
              <div className={`absolute top-14 mt-1 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap transition-colors duration-300
                  ${isCurrent ? 'text-yellow-400' : isCompleted ? 'text-blue-500' : 'text-neutral-600'}`}>
                {step.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Stats Card */}
      <div className="flex items-center justify-between glass-panel p-4 rounded-2xl mt-8 bg-neutral-900/50 border-neutral-800">
        <div className="flex items-center gap-4">
           {/* Hearts Display */}
           <div className="flex flex-col gap-1">
             <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">LIVES</span>
             <div className="flex gap-1">
                {Array.from({ length: maxLives }).map((_, i) => (
                  <svg 
                    key={i}
                    className={`w-6 h-6 transition-all duration-300 ${i < lives ? 'text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'text-neutral-800 fill-transparent'}`}
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ))}
             </div>
           </div>
        </div>
        
        <div className="flex items-center gap-6 pr-2">
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Streak</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                  <div 
                    key={i} 
                    className={`h-2 w-2 sm:w-3 rounded-sm transition-all duration-300 ${i <= streak ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)] animate-pop' : 'bg-neutral-800'}`}
                  />
                ))}
              </div>
           </div>
           
           <div className="flex flex-col items-end min-w-[60px] relative">
              <div className="flex items-center gap-1 mb-0.5">
                 <button 
                    onClick={() => setShowScoreInfo(!showScoreInfo)}
                    onMouseEnter={() => setShowScoreInfo(true)}
                    onMouseLeave={() => setShowScoreInfo(false)}
                    className="text-neutral-500 hover:text-blue-400 transition-colors cursor-help focus:outline-none"
                    aria-label="Score info"
                 >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </button>
                 <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Score</span>
              </div>
              <span key={score} className="font-mono font-bold text-xl text-white leading-none tracking-tight animate-pop">{score}</span>
              
              {showScoreInfo && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-neutral-900/95 backdrop-blur-md text-slate-200 text-[10px] p-3 rounded-xl border border-neutral-700 shadow-xl z-50 animate-fade-in pointer-events-none">
                      <div className="font-bold text-blue-400 mb-1 border-b border-white/10 pb-1 tracking-wider">SCORING RULES</div>
                      <div className="flex justify-between py-0.5"><span>Correct</span> <span className="text-emerald-400 font-mono font-bold">+20</span></div>
                      <div className="flex justify-between py-0.5"><span>Level Up</span> <span className="text-blue-400 font-mono font-bold">+50</span></div>
                      <div className="flex justify-between py-0.5"><span>Victory</span> <span className="text-yellow-400 font-mono font-bold">+100</span></div>
                      <div className="flex justify-between py-0.5 border-t border-white/5 mt-1 pt-1"><span>Wrong</span> <span className="text-red-400 font-mono font-bold">-10</span></div>
                      <div className="flex justify-between py-0.5"><span>Game Over</span> <span className="text-red-500 font-mono font-bold">-50</span></div>
                  </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default LevelIndicator;