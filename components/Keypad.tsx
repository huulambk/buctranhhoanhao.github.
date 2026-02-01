import React from 'react';

interface KeypadProps {
  onNumberClick: (num: string) => void;
  disabled: boolean;
  correctId?: string | null;
  hintId?: string | null;
}

const Keypad: React.FC<KeypadProps> = ({ onNumberClick, disabled, correctId, hintId }) => {
  const numbers = Array.from({ length: 24 }, (_, i) => (i + 1).toString());

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 w-full max-w-2xl mx-auto p-4 bg-white rounded-xl shadow-sm border border-slate-200">
      {numbers.map((num) => {
        const isCorrect = correctId === num;
        const isHint = hintId === num;
        
        let buttonClass = "aspect-square flex items-center justify-center text-lg font-bold rounded-lg transition-all transform duration-300 ";
        
        if (isCorrect) {
          // Success state - Green (overrides disabled styles)
          buttonClass += "bg-green-500 text-white shadow-md scale-110 ring-4 ring-green-200 z-10";
        } else if (isHint) {
          // Hint/Incorrect reveal state - Orange Outline (overrides disabled styles)
          buttonClass += "bg-orange-50 text-orange-600 border-2 border-orange-400 shadow-md scale-105 ring-4 ring-orange-100 z-10";
        } else if (disabled) {
          // Disabled state
          buttonClass += "bg-slate-100 text-slate-400 cursor-not-allowed";
        } else {
          // Default active state
          buttonClass += "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-sm hover:scale-105 active:scale-95";
        }

        return (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            disabled={disabled}
            className={buttonClass}
          >
            {num}
          </button>
        );
      })}
    </div>
  );
};

export default Keypad;