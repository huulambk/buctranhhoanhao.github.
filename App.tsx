import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GameLevel, VocabItem } from './types';
import { VOCAB_DATA } from './constants';
import ImageArea from './components/ImageArea';
import LevelIndicator from './components/LevelIndicator';
import { speakText } from './services/geminiService';
import { playCorrectSound, playIncorrectSound, playLevelCompleteSound } from './services/audioService';

const QUESTION_TIMER = 20; // Seconds per question

const getQuestionPrompt = (level: GameLevel, item: VocabItem): string => {
  switch (level) {
    case GameLevel.VietnameseToNumber: return `Tìm hình ảnh có nghĩa là '${item.vn}'?`;
    case GameLevel.EnglishToNumber: return `Where is the '${item.word}'?`;
    case GameLevel.IPAToNumber: return `Find the word sounding like ${item.ipa}`;
    default: return "";
  }
};

const getRandomQuestionId = () => {
  const keys = Object.keys(VOCAB_DATA);
  return keys[Math.floor(Math.random() * keys.length)];
};

const App: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIMER);
  const [gameState, setGameState] = useState<GameState>({
    level: GameLevel.VietnameseToNumber,
    streak: 0,
    currentQuestionId: null,
    score: 300, // Initial score set to 300
    message: "Welcome to the A-Z Travel Vocabulary Game! Let's start.",
    status: 'idle',
    skipsUsed: 0,
  });
  
  const [loadingAudio, setLoadingAudio] = useState(false);
  const transitionTimeoutRef = useRef<number | null>(null);

  const clearTransitionTimeout = () => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  };

  const pickNewQuestion = useCallback(() => {
    const randomKey = getRandomQuestionId();
    setGameState(prev => ({
      ...prev,
      currentQuestionId: randomKey,
      status: 'playing',
      message: getQuestionPrompt(prev.level, VOCAB_DATA[randomKey]),
    }));
    setTimeLeft(QUESTION_TIMER);
  }, []);

  // Handle Incorrect Answer (both manual and timeout)
  const handleIncorrect = useCallback((isTimeout: boolean) => {
    playIncorrectSound();
    
    setGameState(prev => {
      // Prevent handling if already processed (e.g. race condition)
      if (prev.status !== 'playing') return prev;
      
      const correctWord = prev.currentQuestionId ? VOCAB_DATA[prev.currentQuestionId].word : '';

      return {
        ...prev,
        streak: 0,
        score: Math.max(0, prev.score - 10), // Deduct 10 points
        status: 'incorrect',
        message: isTimeout
          ? `Time's up! The answer was number ${prev.currentQuestionId} (${correctWord}).`
          : `Oops! The correct answer was number ${prev.currentQuestionId} (${correctWord}).`,
      };
    });
    
    clearTransitionTimeout();
    // Auto-advance after showing the answer
    transitionTimeoutRef.current = window.setTimeout(() => pickNewQuestion(), 2500);
  }, [pickNewQuestion]);

  const togglePause = () => {
    setGameState(prev => {
      if (prev.status === 'playing') {
        clearTransitionTimeout(); // Pause any pending transitions if caught in weird state
        window.speechSynthesis.cancel(); // Stop speaking on pause
        return { ...prev, status: 'paused', message: "Game Paused" };
      } else if (prev.status === 'paused') {
        const item = prev.currentQuestionId ? VOCAB_DATA[prev.currentQuestionId] : null;
        return { 
          ...prev, 
          status: 'playing', 
          message: item ? getQuestionPrompt(prev.level, item) : "Resuming..." 
        };
      }
      return prev;
    });
  };

  const handleRestart = () => {
    if (window.confirm("Restart the entire game? Your progress will be lost and score reset.")) {
      clearTransitionTimeout();
      window.speechSynthesis.cancel(); // Immediately stop any TTS
      
      setGameState({
        level: GameLevel.VietnameseToNumber,
        streak: 0,
        currentQuestionId: null,
        score: 300, // Reset score to 300
        message: "Game Restarted! Let's go.",
        status: 'idle', // Will trigger effect to pick new question
        skipsUsed: 0,
      });
      setTimeLeft(QUESTION_TIMER);
    }
  };

  const handleLevelChange = (newLevel: GameLevel) => {
    if (gameState.level === newLevel) return;

    // Optional: Warn if mid-streak
    if (gameState.streak > 0 && gameState.status === 'playing') {
      if (!window.confirm("Switching modes will reset your current streak. Continue?")) {
        return;
      }
    }

    clearTransitionTimeout();
    window.speechSynthesis.cancel();

    // Pick a new question immediately for the new level
    const randomKey = getRandomQuestionId();

    setGameState(prev => ({
      ...prev,
      level: newLevel,
      streak: 0,
      currentQuestionId: randomKey,
      status: 'playing',
      message: getQuestionPrompt(newLevel, VOCAB_DATA[randomKey]),
      // Score is preserved
    }));
    setTimeLeft(QUESTION_TIMER);
  };

  const handleSkipLevel = () => {
    // Allow skipping during playing, correct, or incorrect states
    const allowedStates = ['playing', 'correct', 'incorrect'];
    if (!allowedStates.includes(gameState.status)) return;

    const canAfford = gameState.score >= 100;
    
    // Feature: Warn user based on affordability
    const confirmMessage = canAfford 
      ? "Skip this level? It will cost 100 points."
      : "You don't have enough points (100). Skip anyway and reset score to 0?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    // Stop any pending auto-advance and audio
    clearTransitionTimeout();
    window.speechSynthesis.cancel();

    playLevelCompleteSound();

    // Determine logic based on current level
    if (gameState.level < 3) {
      // Advance to next level logic
      setGameState(prev => ({
        ...prev,
        score: canAfford ? prev.score - 100 : 0, // Deduct 100 or floor at 0
        streak: 5, // Fill streak visually
        status: 'level_complete',
        message: "Level Skipped! Answers Revealed.",
        skipsUsed: prev.skipsUsed + 1,
      }));

      // Give slightly more time (4s) to process the skip/revealed state
      transitionTimeoutRef.current = window.setTimeout(() => {
        setGameState(prev => {
           const nextLevel = prev.level + 1;
           const nextId = getRandomQuestionId();
           return {
            ...prev,
            level: nextLevel,
            streak: 0,
            status: 'playing',
            currentQuestionId: nextId,
            message: getQuestionPrompt(nextLevel, VOCAB_DATA[nextId]),
           };
        });
        setTimeLeft(QUESTION_TIMER);
      }, 4000);

    } else {
      // Game Complete logic
      setGameState(prev => ({
        ...prev,
        score: canAfford ? prev.score - 100 : 0,
        streak: 5,
        status: 'game_complete',
        message: "Game Completed! (Skipped)",
        skipsUsed: prev.skipsUsed + 1,
      }));
    }
  };

  // Timer Effect
  useEffect(() => {
    let interval: number;
    if (gameState.status === 'playing') {
      if (timeLeft > 0) {
        interval = window.setInterval(() => {
          setTimeLeft(t => t - 1);
        }, 1000);
      } else {
        handleIncorrect(true);
      }
    }
    return () => clearInterval(interval);
  }, [gameState.status, timeLeft, handleIncorrect]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => clearTransitionTimeout();
  }, []);

  // Start game on mount
  useEffect(() => {
    if (gameState.status === 'idle') {
      pickNewQuestion();
    }
  }, [gameState.status, pickNewQuestion]);

  const handleSpeak = async (text: string) => {
    setLoadingAudio(true);
    try {
      await speakText(text);
    } catch (error) {
      console.error("TTS Error", error);
    } finally {
      setLoadingAudio(false);
    }
  };

  const handleGuess = (number: string) => {
    if (gameState.status !== 'playing' || !gameState.currentQuestionId) return;

    const isCorrect = number === gameState.currentQuestionId;
    const currentItem = VOCAB_DATA[gameState.currentQuestionId];

    if (isCorrect) {
      const newStreak = gameState.streak + 1;
      let newLevel = gameState.level;
      let newScore = gameState.score; // Score remains unchanged for correct answers
      
      // Speak the word on correct answer
      handleSpeak(currentItem.word);

      // Check Level Up Condition
      if (newStreak >= 5) { // Requirement is 5
        playLevelCompleteSound(); // Fanfare
        
        if (gameState.level < 3) {
          // INTERMEDIATE STATE: LEVEL COMPLETE
          setGameState(prev => ({
            ...prev,
            streak: 0,
            score: newScore,
            status: 'level_complete',
            message: `Level ${prev.level} Complete!`,
          }));

          // Transition to next level
          clearTransitionTimeout();
          transitionTimeoutRef.current = window.setTimeout(() => {
             const nextId = getRandomQuestionId();
             setGameState(prev => {
                 const nextLvl = prev.level + 1;
                 return {
                    ...prev,
                    level: nextLvl,
                    streak: 0,
                    status: 'playing',
                    currentQuestionId: nextId,
                    message: getQuestionPrompt(nextLvl, VOCAB_DATA[nextId]),
                 };
             });
             setTimeLeft(QUESTION_TIMER);
          }, 3000);

        } else {
          // GAME COMPLETE
          setGameState(prev => ({
             ...prev,
             streak: newStreak,
             score: newScore,
             status: 'game_complete',
             message: "Congratulations! You've mastered all levels!",
          }));
        }
      } else {
        // STANDARD CORRECT ANSWER
        playCorrectSound(); // Simple ding
        
        setGameState(prev => ({
          ...prev,
          streak: newStreak,
          score: newScore,
          status: 'correct',
          message: "Correct! Great job. 🎉",
        }));

        clearTransitionTimeout();
        transitionTimeoutRef.current = window.setTimeout(() => pickNewQuestion(), 1500);
      }

    } else {
      handleIncorrect(false);
    }
  };

  const currentItem = gameState.currentQuestionId ? VOCAB_DATA[gameState.currentQuestionId] : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">A-Z Travel Vocabulary Game</h1>
          <p className="text-slate-500">Travel English Challenge</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Game Controls */}
          <div className="flex bg-white rounded-lg shadow-sm border border-slate-200 p-1">
             <button
               onClick={togglePause}
               disabled={gameState.status !== 'playing' && gameState.status !== 'paused'}
               className={`p-2 rounded-md transition-colors ${
                 gameState.status === 'paused' 
                   ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                   : 'text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'
               }`}
               title={gameState.status === 'paused' ? "Resume Game" : "Pause Game"}
             >
               {gameState.status === 'paused' ? (
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               ) : (
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               )}
             </button>
             <div className="w-px bg-slate-200 mx-1"></div>
             <button
               onClick={handleRestart}
               className="p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
               title="Restart Game"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             </button>
             <div className="w-px bg-slate-200 mx-1"></div>
             <button
               onClick={handleSkipLevel}
               // Allow skip in playing or feedback states
               disabled={!['playing', 'correct', 'incorrect'].includes(gameState.status)}
               className="p-2 flex items-center gap-1 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               title={`Reveal & Skip Level (-100 pts) • Used: ${gameState.skipsUsed} times`}
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
               <span className="text-xs font-bold text-slate-500">-100</span>
             </button>
          </div>
        </div>
      </header>

      <LevelIndicator 
        level={gameState.level} 
        streak={gameState.streak} 
        score={gameState.score}
        onLevelChange={handleLevelChange}
      />

      <div className="flex flex-col gap-6">
        {/* Main Game Area (Image + Buttons) */}
        <div className="w-full">
           <ImageArea 
              currentHint={gameState.status === 'incorrect' ? currentItem?.hint : undefined} 
              onGuess={handleGuess}
              gameState={{
                correctId: (gameState.status === 'correct' || gameState.status === 'level_complete') ? gameState.currentQuestionId : null,
                hintId: gameState.status === 'incorrect' ? gameState.currentQuestionId : null,
                disabled: gameState.status !== 'playing',
                status: gameState.status
              }}
           />
           
           {/* Question Card */}
           <div className={`mt-4 p-6 rounded-xl border-2 transition-all shadow-md text-center relative overflow-hidden
              ${gameState.status === 'correct' ? 'bg-green-50 border-green-200' : 
                gameState.status === 'incorrect' ? 'bg-red-50 border-red-200' : 
                gameState.status === 'level_complete' ? 'bg-indigo-50 border-indigo-200' :
                'bg-white border-blue-100'}
           `}>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                  Current Challenge
                </h2>
                {(gameState.status === 'playing' || gameState.status === 'paused') && (
                    <div className="flex items-center gap-2 text-sm font-mono font-bold text-slate-500">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 5 ? 'bg-red-500' : 'bg-indigo-500'}`}
                            style={{ width: `${(timeLeft / QUESTION_TIMER) * 100}%` }}
                          />
                      </div>
                      <span>{timeLeft}s</span>
                    </div>
                )}
              </div>
              
              <div className="min-h-[120px] flex flex-col items-center justify-center relative">
                {gameState.status === 'paused' ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
                    <span className="text-2xl font-bold text-slate-500 tracking-widest border-2 border-slate-300 px-6 py-2 rounded-lg">PAUSED</span>
                  </div>
                ) : null}

                {gameState.status === 'game_complete' ? (
                  <div className="flex flex-col items-center animate-bounce-in">
                    <div className="text-5xl mb-2">🏆</div>
                    <div className="text-2xl font-bold text-slate-800">Congratulations!</div>
                    <div className="text-slate-600 mt-1">You've mastered all levels!</div>
                    <div className="mt-4 text-xl font-mono text-indigo-600 font-bold">Final Score: {gameState.score}</div>
                    <p className="text-sm text-slate-400 mt-2">Skips used: {gameState.skipsUsed}</p>
                    <button 
                      onClick={() => {
                        clearTransitionTimeout();
                        setGameState({
                          level: GameLevel.VietnameseToNumber,
                          streak: 0,
                          currentQuestionId: null,
                          score: 300, // Reset score to 300 on play again
                          message: "Game Restarted! Let's go.",
                          status: 'idle',
                          skipsUsed: 0,
                        });
                        setTimeLeft(QUESTION_TIMER);
                      }}
                      className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                      Play Again
                    </button>
                  </div>
                ) : gameState.status === 'level_complete' ? (
                  <div className="flex flex-col items-center animate-fade-in-up">
                    <div className="text-5xl mb-2">⭐</div>
                    <h3 className="text-2xl font-bold text-indigo-700">Level {gameState.level} Complete!</h3>
                    <p className="text-indigo-500 mt-1">Get ready for the next challenge...</p>
                  </div>
                ) : currentItem ? (
                  <>
                     <button
                        onClick={(e) => {
                          if (!loadingAudio) {
                            handleSpeak(currentItem.word);
                          }
                        }}
                        className={`group relative text-3xl sm:text-4xl font-bold text-slate-800 mb-2 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:text-indigo-600 hover:scale-105`}
                        title="Click to hear pronunciation"
                     >
                        {gameState.level === 1 && currentItem.vn}
                        {gameState.level === 2 && currentItem.word}
                        {gameState.level === 3 && currentItem.ipa}
                        
                        {/* Interactive Hint/Loading Icon */}
                        <span className={`inline-block ml-2 text-slate-400 group-hover:text-indigo-500 transition-colors ${loadingAudio ? 'animate-pulse text-indigo-500' : ''}`}>
                             {loadingAudio ? (
                               <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             ) : (
                               <svg className="w-6 h-6 opacity-50 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                             )}
                        </span>
                     </button>
                     
                     {/* Feedback Message */}
                     <div className={`text-lg font-medium 
                        ${gameState.status === 'correct' ? 'text-green-600' : 
                          gameState.status === 'incorrect' ? 'text-red-600' : 'text-blue-600'}
                     `}>
                       {gameState.message}
                     </div>

                     {/* Audio Button (Secondary) */}
                     {(gameState.status === 'playing' || gameState.status === 'correct') && (
                       <button
                         onClick={(e) => { e.stopPropagation(); handleSpeak(currentItem.word); }}
                         disabled={loadingAudio}
                         className="mt-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium px-4 py-2 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-colors text-sm"
                       >
                         {loadingAudio ? (
                           <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                         ) : (
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                         )}
                         Replay Pronunciation
                       </button>
                     )}
                  </>
                ) : (
                  <div className="animate-pulse bg-slate-200 h-8 w-48 rounded"></div>
                )}
              </div>
           </div>
           
           <div className="mt-4 bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
              <h4 className="font-bold mb-1">How to play:</h4>
              <ul className="list-disc pl-4 space-y-1 text-blue-700">
                <li>Look at the image (upload one for best experience).</li>
                <li><strong>Drag the numbers (using the pencil icon)</strong> to match your image if needed.</li>
                <li>Read the word in the "Current Challenge" box.</li>
                <li>Click the matching number bubble on the image.</li>
                <li>Get 5 correct in a row to level up!</li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;