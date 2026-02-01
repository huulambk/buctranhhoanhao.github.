import React from 'react';
import { GameLevel } from '../types';

interface LevelIndicatorProps {
  level: GameLevel;
  streak: number;
  score: number;
}

const LevelIndicator: React.FC<LevelIndicatorProps> = ({ level, streak, score }) => {
  const steps = [
    { id: 1, short: 'VN', label: 'Vietnamese', desc: 'Match meaning' },
    { id: 2, short: 'EN', label: 'English', desc: 'Match word' },
    { id: 3, short: 'IPA', label: 'IPA', desc: 'Match sound' },
  ];

  return (
    <div className="flex flex-col gap-3 w-full max-w-2xl mx-auto mb-4">
      {/* Overall Level Progress Bar */}
      <div className="flex items-center justify-between relative px-2 sm:px-4 mt-2">
        {/* Connecting Line background */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded z-0"></div>
        
        {/* Connecting Line progress */}
        <div 
          className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 rounded z-0 transition-all duration-500 ease-out"
          style={{ width: `calc(${((level - 1) / (steps.length - 1)) * 100}% - 2rem)` }}
        ></div>

        {steps.map((step) => {
          const isCompleted = level > step.id;
          const isCurrent = level === step.id;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 
                  ${isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : 
                    isCurrent ? 'bg-white border-indigo-600 text-indigo-600 scale-125 shadow-md' : 
                    'bg-slate-100 border-slate-300 text-slate-400'}`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  step.short
                )}
              </div>
              <div className={`absolute top-full mt-2 text-xs font-medium whitespace-nowrap transition-colors duration-300
                  ${isCurrent ? 'text-indigo-700 font-bold' : isCompleted ? 'text-indigo-600/70' : 'text-slate-400'}`}>
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.short}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Card */}
      <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-slate-100 mt-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white px-3 py-1 rounded-md font-bold text-sm shadow-sm">
            Level {level}
          </div>
          <span className="text-slate-600 text-sm font-medium hidden sm:inline">
            {level === 1 && "Vietnamese → Number"}
            {level === 2 && "English → Number"}
            {level === 3 && "IPA → Number"}
          </span>
        </div>
        
        <div className="flex items-center gap-6 pr-2">
           <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Streak</span>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div 
                    key={i} 
                    className={`h-2 w-3 sm:w-4 rounded-full transition-all duration-300 ${i <= streak ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-sm' : 'bg-slate-200'}`}
                  />
                ))}
              </div>
           </div>
           <div className="flex flex-col items-end min-w-[60px]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Score</span>
              <span className="font-mono font-bold text-xl text-slate-800 leading-none mt-1">{score}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LevelIndicator;