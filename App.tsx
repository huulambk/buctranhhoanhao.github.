import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GameLevel, VocabItem, DifficultyLevel, VocabMap } from './types';
import { VOCAB_DATA as DEFAULT_VOCAB_DATA, LIBRARY_DATA } from './constants';
import ImageArea from './components/ImageArea';
import LevelIndicator from './components/LevelIndicator';
import { speakText, detectNumberPositions, parseVocabularyFromImage } from './services/geminiService';
import { playCorrectSound, playIncorrectSound, playLevelCompleteSound } from './services/audioService';

const DIFFICULTY_SETTINGS = {
  easy: { time: 30, lives: 5, label: "DỄ", color: "text-emerald-400 bg-emerald-950/40 border-emerald-500/30 hover:bg-emerald-500/20 shadow-emerald-500/10" },
  medium: { time: 15, lives: 3, label: "VỪA", color: "text-blue-400 bg-blue-950/40 border-blue-500/30 hover:bg-blue-500/20 shadow-blue-500/10" },
  hard: { time: 8, lives: 3, label: "KHÓ", color: "text-red-400 bg-red-950/40 border-red-500/30 hover:bg-red-500/20 shadow-red-500/10" }
};

const getQuestionPrompt = (level: GameLevel, item: VocabItem): string => {
  switch (level) {
    case GameLevel.VietnameseToNumber: return `Tìm hình ảnh có nghĩa là '${item.vn}'?`;
    case GameLevel.EnglishToNumber: return `Where is the '${item.word}'?`;
    case GameLevel.IPAToNumber: return `Listen and find the matching word`;
    default: return "";
  }
};

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_SETTINGS['medium'].time);
  const [totalTime, setTotalTime] = useState(0);
  const [showDifficultyPopup, setShowDifficultyPopup] = useState(false);
  
  const [vocabData, setVocabData] = useState<VocabMap>(DEFAULT_VOCAB_DATA);
  const [todoList, setTodoList] = useState<string[]>([]); 

  const [gameState, setGameState] = useState<GameState>({
    level: GameLevel.VietnameseToNumber,
    streak: 0,
    lives: DIFFICULTY_SETTINGS['medium'].lives,
    currentQuestionId: null,
    wrongId: null,
    score: 300, 
    message: "Welcome to DayhocvaLuyenthi.com!", 
    status: 'idle', 
  });
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, {x: number, y: number}>>({});
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzingVocab, setIsAnalyzingVocab] = useState(false); 
  const [loadingAudio, setLoadingAudio] = useState(false);
  const transitionTimeoutRef = useRef<number | null>(null);
  const lastPlayedQuestionIdRef = useRef<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const vocabInputRef = useRef<HTMLInputElement>(null);
  const vocabImageInputRef = useRef<HTMLInputElement>(null); 
  const videoRef = useRef<HTMLVideoElement>(null);

  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    const savedImg = localStorage.getItem('travelGameImage');
    const savedPos = localStorage.getItem('travelGameButtonPositions');
    const savedVocab = localStorage.getItem('travelGameVocabData');

    if (savedImg) setImageSrc(savedImg);
    if (savedPos) setPositions(JSON.parse(savedPos));
    if (savedVocab) {
        try {
            const parsedVocab = JSON.parse(savedVocab);
            setVocabData(parsedVocab);
            setTodoList(Object.keys(parsedVocab));
        } catch (e) {
            console.error("Failed to load saved vocab", e);
        }
    } else {
        setTodoList(Object.keys(DEFAULT_VOCAB_DATA));
    }
  }, []);

  useEffect(() => {
     setTodoList(Object.keys(vocabData));
  }, [vocabData]);

  // Audio Auto-play effect for Level 3
  useEffect(() => {
    if (gameState.level === GameLevel.IPAToNumber && gameState.status === 'playing' && gameState.currentQuestionId) {
       // Check if we haven't played this question yet to avoid loops
       if (lastPlayedQuestionIdRef.current !== gameState.currentQuestionId) {
          lastPlayedQuestionIdRef.current = gameState.currentQuestionId;
          
          const item = vocabData[gameState.currentQuestionId];
          if (item) {
              // Slight delay to ensure UI is ready
              const timer = setTimeout(() => {
                speakText(item.word).catch(() => {});
              }, 500);
              return () => clearTimeout(timer);
          }
       }
    }
  }, [gameState.level, gameState.status, gameState.currentQuestionId, vocabData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const clearTransitionTimeout = () => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  };

  const pickNewQuestion = useCallback((customList?: string[]) => {
    const allKeys = Object.keys(vocabData);
    if (allKeys.length === 0) return;

    let currentPool = customList !== undefined ? customList : todoList;
    if (currentPool.length === 0) currentPool = [...allKeys];

    const randomIndex = Math.floor(Math.random() * currentPool.length);
    const randomKey = currentPool[randomIndex];
    const newPool = currentPool.filter((_, i) => i !== randomIndex);
    setTodoList(newPool);

    setGameState(prev => {
        return {
          ...prev,
          currentQuestionId: randomKey,
          wrongId: null,
          status: 'playing',
          message: getQuestionPrompt(prev.level, vocabData[randomKey]),
        };
    });
    setTimeLeft(DIFFICULTY_SETTINGS[difficulty].time);
  }, [difficulty, vocabData, todoList]);

  const handleStartGame = (selectedDifficulty?: DifficultyLevel) => {
    if (Object.keys(vocabData).length === 0) {
      alert("Vui lòng nạp dữ liệu từ vựng trước!");
      return;
    }
    if (!imageSrc) {
      alert("Vui lòng chọn ảnh bản đồ trước!");
      return;
    }

    if (selectedDifficulty) {
      setDifficulty(selectedDifficulty);
    }

    setTotalTime(0);
    setShowDifficultyPopup(false);
    lastPlayedQuestionIdRef.current = null; // Reset audio tracker
    
    const fullDeck = Object.keys(vocabData);
    setTodoList(fullDeck);
    
    setGameState(prev => ({ 
      ...prev, 
      status: 'playing',
      lives: DIFFICULTY_SETTINGS[selectedDifficulty || difficulty].lives,
      streak: 0,
      score: 300
    }));

    pickNewQuestion(fullDeck);
  };

  const handleStartPractice = () => {
    if (Object.keys(vocabData).length === 0) {
      alert("Vui lòng nạp dữ liệu từ vựng trước!");
      return;
    }
    if (!imageSrc) {
      alert("Vui lòng chọn ảnh bản đồ trước!");
      return;
    }
    setGameState(prev => ({
      ...prev,
      status: 'practice',
      currentQuestionId: null,
      message: "Chế độ luyện tập: Nhấn vào các số trên bản đồ để học từ vựng."
    }));
  };

  const processAndSaveImage = async (imgElement: HTMLImageElement, skipScan: boolean = false) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const MAX_WIDTH = 1200; 
    const MAX_HEIGHT = 1200;
    let width = imgElement.width;
    let height = imgElement.height;

    if (width > height) {
        if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
        }
    } else {
        if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
        }
    }

    canvas.width = width;
    canvas.height = height;
    ctx?.drawImage(imgElement, 0, 0, width, height);
    
    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

    try {
        localStorage.setItem('travelGameImage', compressedBase64);
    } catch (err) {
        console.warn("Storage Quota Exceeded", err);
    }
    
    setImageSrc(compressedBase64);
    
    if (skipScan) return;

    setIsScanning(true);
    try {
      const count = Object.keys(vocabData).length;
      const newPositions = await detectNumberPositions(compressedBase64, count);
      setPositions(newPositions);
      localStorage.setItem('travelGameButtonPositions', JSON.stringify(newPositions));
    } catch (error) {
      console.error("AI Alignment failed", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleLibrarySelect = (unitNum: number) => {
    const unitData = LIBRARY_DATA[unitNum];
    if (!unitData || !unitData.imageUrl) {
        alert("Thông tin Unit " + unitNum + " chưa được cập nhật.");
        return;
    }

    const imagePath = unitData.imageUrl;
    clearTransitionTimeout();
    window.speechSynthesis.cancel();
    
    const img = new Image();
    img.crossOrigin = "anonymous"; 
    img.src = imagePath;
    img.onload = () => {
        if (unitData.vocab && Object.keys(unitData.vocab).length > 0) {
            setVocabData(unitData.vocab);
            setPositions(unitData.positions);
            localStorage.setItem('travelGameVocabData', JSON.stringify(unitData.vocab));
            localStorage.setItem('travelGameButtonPositions', JSON.stringify(unitData.positions));
            processAndSaveImage(img, true);
            setShowLibraryModal(false);
        } else {
            setVocabData({});
            setPositions({});
            processAndSaveImage(img, true);
            localStorage.removeItem('travelGameVocabData');
            localStorage.removeItem('travelGameButtonPositions');
            setShowLibraryModal(false);
            alert("Bản đồ đã tải. Hãy nạp file JSON hoặc quét ảnh từ vựng để bắt đầu!");
        }
    };
    img.onerror = () => {
        alert("Lỗi: Không thể tải ảnh. Kiểm tra kết nối mạng.");
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => processAndSaveImage(img);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
        setShowCamera(true);
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    } catch (err) {
        console.error("Camera Error", err);
        alert("Không thể truy cập camera. Vui lòng cấp quyền.");
        setShowCamera(false);
    }
  };

  const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
      }
      setShowCamera(false);
  };

  const capturePhoto = () => {
      if (videoRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
          const img = new Image();
          img.src = canvas.toDataURL('image/jpeg');
          img.onload = () => processAndSaveImage(img);
          stopCamera();
      }
  };

  const handleVocabJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target?.result as string);
            if (typeof json === 'object' && json !== null) {
                const keys = Object.keys(json);
                if (keys.length > 0 && json[keys[0]].word) {
                    setVocabData(json);
                    localStorage.setItem('travelGameVocabData', JSON.stringify(json));
                    setPositions({}); 
                    localStorage.removeItem('travelGameButtonPositions');
                    alert(`Đã tải ${keys.length} từ vựng từ JSON!`);
                }
            }
        } catch (error) {
            alert("Lỗi đọc file JSON.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleVocabImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        setIsAnalyzingVocab(true);
        try {
            const img = new Image();
            img.src = result;
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const MAX_DIM = 1500;
                let w = img.width, h = img.height;
                if (w > h && w > MAX_DIM) { h *= MAX_DIM/w; w=MAX_DIM; }
                else if (h > w && h > MAX_DIM) { w *= MAX_DIM/h; h=MAX_DIM; }
                canvas.width = w; canvas.height = h;
                ctx?.drawImage(img, 0, 0, w, h);
                const compressed = canvas.toDataURL('image/jpeg', 0.8);
                const extractedVocab = await parseVocabularyFromImage(compressed);
                setVocabData(extractedVocab);
                localStorage.setItem('travelGameVocabData', JSON.stringify(extractedVocab));
                setPositions({});
                localStorage.removeItem('travelGameButtonPositions');
                alert(`Thành công! AI đã đọc được ${Object.keys(extractedVocab).length} từ vựng.`);
                setIsAnalyzingVocab(false);
            }
        } catch (error) {
            console.error("Vocab Scan Error", error);
            alert("Không thể đọc từ vựng từ ảnh.");
            setIsAnalyzingVocab(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEndGame = () => {
    clearTransitionTimeout();
    window.speechSynthesis.cancel();
    setGameState(prev => ({
      ...prev,
      status: 'idle',
      currentQuestionId: null,
      message: "Welcome to DayhocvaLuyenthi.com!"
    }));
    setTotalTime(0);
    setShowDifficultyPopup(false);
  };

  const handleIncorrect = useCallback((clickedId: string | null, isTimeout: boolean) => {
    playIncorrectSound();
    if (gameState.status === 'game_over' || gameState.status === 'idle') return;

    const newLives = gameState.lives - 1;
    const correctWord = gameState.currentQuestionId ? vocabData[gameState.currentQuestionId]?.word : '';
    const isGameOver = newLives <= 0;

    setGameState(prev => ({
        ...prev,
        lives: isGameOver ? 0 : newLives,
        streak: 0,
        wrongId: clickedId,
        score: Math.max(0, prev.score - (isGameOver ? 50 : 10)),
        status: isGameOver ? 'game_over' : 'incorrect',
        message: isGameOver 
            ? "Hết mạng! Trò chơi kết thúc."
            : (isTimeout
                ? `Hết giờ! Đáp án: ${prev.currentQuestionId} (${correctWord})`
                : `Sai! Còn ${newLives} tim. Đáp án: ${prev.currentQuestionId}`),
    }));
    
    clearTransitionTimeout();
    if (!isGameOver) {
        transitionTimeoutRef.current = window.setTimeout(() => {
            pickNewQuestion();
        }, 2500); 
    }
  }, [pickNewQuestion, vocabData, gameState.lives, gameState.status, gameState.currentQuestionId]);

  const togglePause = () => {
    setGameState(prev => {
      if (prev.status === 'playing') {
        clearTransitionTimeout(); 
        window.speechSynthesis.cancel(); 
        return { ...prev, status: 'paused', message: "Trò chơi tạm dừng" };
      } else if (prev.status === 'paused') {
        const item = prev.currentQuestionId ? vocabData[prev.currentQuestionId] : null;
        return { 
          ...prev, 
          status: 'playing', 
          message: item ? getQuestionPrompt(prev.level, item) : "Đang tiếp tục..." 
        };
      }
      return prev;
    });
  };

  const handleRestart = () => {
    const isGameOver = gameState.status === 'game_over' || gameState.status === 'game_complete';
    if (isGameOver || window.confirm("Bắt đầu lại màn chơi này?")) {
      clearTransitionTimeout();
      window.speechSynthesis.cancel();
      lastPlayedQuestionIdRef.current = null;
      
      if (isGameOver) {
          setTotalTime(0);
      }
      setGameState(prev => ({
        ...prev,
        streak: 0,
        lives: DIFFICULTY_SETTINGS[difficulty].lives,
        wrongId: null,
        status: 'playing',
        score: isGameOver ? 300 : prev.score, 
      }));
      const fullDeck = Object.keys(vocabData);
      setTodoList(fullDeck);
      pickNewQuestion(fullDeck);
    }
  };

  const handleLevelChange = (newLevel: GameLevel) => {
    if (gameState.level === newLevel) return;
    if (gameState.streak > 0 && gameState.status === 'playing') {
      if (!window.confirm("Chuyển chế độ sẽ làm mất chuỗi thắng hiện tại. Tiếp tục?")) return;
    }
    clearTransitionTimeout();
    window.speechSynthesis.cancel();
    lastPlayedQuestionIdRef.current = null;
    
    const fullDeck = Object.keys(vocabData);
    setTodoList(fullDeck);
    const randomIndex = Math.floor(Math.random() * fullDeck.length);
    const randomKey = fullDeck[randomIndex];

    setGameState(prev => ({
          ...prev,
          level: newLevel,
          streak: 0,
          lives: DIFFICULTY_SETTINGS[difficulty].lives,
          currentQuestionId: randomKey,
          wrongId: null,
          status: 'playing',
          message: getQuestionPrompt(newLevel, vocabData[randomKey]),
    }));
    setTimeLeft(DIFFICULTY_SETTINGS[difficulty].time);
  };

  const handleSpeak = async (text: string) => {
    setLoadingAudio(true);
    try { await speakText(text); } catch (e) {} finally { setLoadingAudio(false); }
  };

  const handleSuccess = (item: VocabItem) => {
    const newStreak = gameState.streak + 1;
    handleSpeak(item.word);
    
    if (newStreak >= 10) { 
      playLevelCompleteSound(); 
      if (gameState.level < 3) {
        setGameState(prev => ({ 
            ...prev, 
            score: prev.score + 50, 
            streak: 0, 
            status: 'level_complete', 
            message: `Level ${prev.level} Complete! +50 Bonus` 
        }));
        clearTransitionTimeout();
        transitionTimeoutRef.current = window.setTimeout(() => {
           const fullDeck = Object.keys(vocabData);
           const randomIndex = Math.floor(Math.random() * fullDeck.length);
           const nextId = fullDeck[randomIndex];
           
           lastPlayedQuestionIdRef.current = null; // Reset for new level

           setGameState(prev => ({ 
                   ...prev, 
                   level: prev.level + 1, 
                   streak: 0, 
                   status: 'playing', 
                   currentQuestionId: nextId, 
                   wrongId: null,
                   lives: DIFFICULTY_SETTINGS[difficulty].lives, 
                   message: getQuestionPrompt(prev.level + 1, vocabData[nextId])
           }));
           setTimeLeft(DIFFICULTY_SETTINGS[difficulty].time);
        }, 3000);
      } else {
        setGameState(prev => ({ 
            ...prev, 
            score: prev.score + 100, 
            streak: newStreak, 
            status: 'game_complete', 
            message: "All Levels Cleared!" 
        }));
      }
    } else {
      playCorrectSound(); 
      setGameState(prev => ({ 
          ...prev, 
          score: prev.score + 20, 
          streak: newStreak, 
          status: 'correct', 
          message: "Chính xác! +20 điểm" 
      }));
      clearTransitionTimeout();
      transitionTimeoutRef.current = window.setTimeout(() => pickNewQuestion(), 1500);
    }
  };

  const handleGuess = (number: string) => {
    if (gameState.status === 'practice') {
      const item = vocabData[number];
      if (item) {
        handleSpeak(item.word);
        setGameState(prev => ({
          ...prev,
          currentQuestionId: number,
          message: `Luyện tập: ${item.word} (${item.vn})`
        }));
      }
      return;
    }
    if (gameState.status !== 'playing' || !gameState.currentQuestionId) return;
    if (number === gameState.currentQuestionId) handleSuccess(vocabData[gameState.currentQuestionId]);
    else handleIncorrect(number, false);
  };

  useEffect(() => {
    let interval: number;
    if (gameState.status === 'playing') {
      if (timeLeft > 0) {
        interval = window.setInterval(() => {
            setTimeLeft(t => t - 1);
            setTotalTime(t => t + 1);
        }, 1000);
      } else {
        handleIncorrect(null, true);
      }
    }
    return () => clearInterval(interval);
  }, [gameState.status, timeLeft, handleIncorrect]);

  const currentItem = gameState.currentQuestionId ? vocabData[gameState.currentQuestionId] : null;

  if (gameState.status === 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        {/* Difficulty Selection Popup */}
        {showDifficultyPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-fade-in">
             <div className="bg-neutral-900 p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-500"></div>
                <div className="w-16 h-16 bg-yellow-400 text-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/20">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">Chọn Độ Khó</h3>
                <p className="text-neutral-400 text-sm mb-8 font-medium">Lựa chọn mức độ thử thách cho bạn</p>
                <div className="flex flex-col gap-3">
                   {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => (
                     <button 
                        key={level}
                        onClick={() => handleStartGame(level)}
                        className={`py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] border transition-all transform hover:scale-[1.03] active:scale-95 flex items-center justify-between group ${DIFFICULTY_SETTINGS[level].color}`}
                     >
                        <span>{DIFFICULTY_SETTINGS[level].label}</span>
                        <div className="flex gap-1">
                          {Array.from({length: DIFFICULTY_SETTINGS[level].lives}).map((_, i) => (
                            <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                          ))}
                        </div>
                     </button>
                   ))}
                </div>
                <button onClick={() => setShowDifficultyPopup(false)} className="mt-8 text-neutral-500 font-black text-xs uppercase hover:text-white transition-colors tracking-widest">Quay lại</button>
             </div>
          </div>
        )}

        {showLibraryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-neutral-900 p-6 rounded-3xl w-full max-w-lg border border-neutral-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-500"></div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Thư viện bản đồ</h3>
                        <button onClick={() => setShowLibraryModal(false)} className="text-neutral-400 hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto pr-2">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                            <button 
                                key={num}
                                onClick={() => handleLibrarySelect(num)}
                                className="aspect-[4/3] bg-neutral-800 hover:bg-blue-900/40 rounded-xl border border-neutral-700 hover:border-blue-500/50 transition-all flex flex-col items-center justify-center group"
                            >
                                <div className="text-[10px] font-black text-neutral-500 group-hover:text-blue-400 mb-0.5">UNIT</div>
                                <div className="text-3xl font-black text-white group-hover:scale-110 transition-transform">{num}</div>
                                <div className="text-[8px] text-neutral-500 font-bold mt-1 uppercase">Chọn Bản Đồ</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        <div className="glass-panel max-w-md w-full rounded-[3rem] p-10 text-center relative z-10 animate-fade-in border-neutral-800 shadow-2xl shadow-black">
          {(isScanning || isAnalyzingVocab) && (
            <div className="absolute inset-0 z-[110] bg-black/90 flex flex-col items-center justify-center text-white animate-fade-in backdrop-blur-md rounded-[3rem]">
              <div className="w-20 h-20 border-4 border-yellow-500/20 border-t-yellow-400 rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-black uppercase tracking-widest animate-pulse text-yellow-400">
                {isAnalyzingVocab ? "Đang đọc từ vựng..." : "Đang chuẩn bị bản đồ..."}
              </h3>
            </div>
          )}

          <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-amber-500 text-black rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-yellow-500/30 neon-glow transform -rotate-3">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2 2 2 0 012 2v.65m2.82 2.03A9.967 9.967 0 0112 21a9.967 9.967 0 01-7.83-3.83m15.66 0A9.967 9.967 0 0112 3a9.967 9.967 0 017.83 3.83" />
            </svg>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tighter">Dayhocva<span className="text-yellow-400">Luyenthi</span></h1>
          <p className="text-blue-400 font-bold mb-10 tracking-[0.3em] uppercase text-[10px]">Interactive Map Learning</p>
          
          <div className="space-y-4 mb-10">
            <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-3xl border border-white/5">
                <div className="flex items-center justify-between">
                    <div className="text-left text-xs text-neutral-400">
                        <span className="font-bold text-white block text-sm">Nguồn dữ liệu</span>
                        <span>{Object.keys(vocabData).length} từ vựng đã tải</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => vocabInputRef.current?.click()} className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-[10px] font-black uppercase text-neutral-200 transition-all border border-neutral-700">JSON</button>
                        <button onClick={() => vocabImageInputRef.current?.click()} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-black uppercase text-white transition-all flex items-center gap-1 shadow-lg shadow-blue-500/20">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg> SCAN
                        </button>
                    </div>
                </div>
            </div>

            {imageSrc ? (
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-3xl flex flex-col items-center gap-2 animate-pop">
                <div className="flex items-center gap-2 text-blue-400 font-black text-sm uppercase tracking-widest"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Bản đồ đã sẵn sàng</div>
                <button onClick={() => setImageSrc(null)} className="text-[10px] text-yellow-400 font-black uppercase hover:underline tracking-widest">Đổi bản đồ khác</button>
              </div>
            ) : (
              <div className="w-full grid grid-cols-3 gap-3">
                 <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-4 bg-neutral-800 hover:bg-neutral-700 rounded-3xl border border-neutral-700 hover:border-white/20 transition-all gap-2 group">
                    <div className="p-3 bg-neutral-700 rounded-2xl group-hover:scale-110 transition-transform text-blue-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></div>
                    <span className="text-[10px] font-black uppercase text-neutral-400 group-hover:text-neutral-200">Tải lên</span>
                 </button>
                 <button onClick={startCamera} className="flex flex-col items-center justify-center p-4 bg-neutral-800 hover:bg-neutral-700 rounded-3xl border border-neutral-700 hover:border-white/20 transition-all gap-2 group">
                    <div className="p-3 bg-neutral-700 rounded-2xl group-hover:scale-110 transition-transform text-red-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg></div>
                    <span className="text-[10px] font-black uppercase text-neutral-400 group-hover:text-neutral-200">Máy ảnh</span>
                 </button>
                 <button onClick={() => setShowLibraryModal(true)} className="flex flex-col items-center justify-center p-4 bg-neutral-800 hover:bg-neutral-700 rounded-3xl border border-neutral-700 hover:border-white/20 transition-all gap-2 group">
                    <div className="p-3 bg-neutral-700 rounded-2xl group-hover:scale-110 transition-transform text-yellow-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /></svg></div>
                    <span className="text-[10px] font-black uppercase text-neutral-400 group-hover:text-neutral-200">Thư viện</span>
                 </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => imageSrc ? setShowDifficultyPopup(true) : alert("Vui lòng chọn ảnh bản đồ trước!")}
              className={`w-full py-5 bg-yellow-400 hover:bg-yellow-300 text-black rounded-[2rem] font-black text-xl shadow-lg shadow-yellow-500/20 transition-all transform hover:scale-[1.02] active:scale-95 uppercase tracking-[0.2em] flex items-center justify-center gap-3 ${!imageSrc ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Bắt đầu chơi
            </button>
            <button 
              onClick={() => imageSrc ? handleStartPractice() : alert("Vui lòng chọn ảnh bản đồ trước!")}
              className={`w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-[1.5rem] font-bold text-sm border border-white/10 transition-all transform hover:scale-[1.02] active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2 ${!imageSrc ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              Luyện tập tự do
            </button>
          </div>
          
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          <input type="file" ref={vocabInputRef} onChange={handleVocabJsonUpload} accept=".json" className="hidden" />
          <input type="file" ref={vocabImageInputRef} onChange={handleVocabImageUpload} accept="image/*" className="hidden" />
        </div>
      </div>
    );
  }

  const isPractice = gameState.status === 'practice';

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 max-w-5xl mx-auto animate-fade-in text-slate-100">
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-2 cursor-pointer" onClick={handleEndGame}>
            Dayhocva<span className="text-yellow-400">Luyenthi</span>
          </h1>
          <div className="flex items-center gap-3 text-neutral-500 mt-1 text-[10px] font-black uppercase tracking-widest">
             <span>{isPractice ? "Mode: Luyện tập" : `Mode: ${DIFFICULTY_SETTINGS[difficulty].label}`}</span>
             <div className="w-1 h-1 bg-neutral-700 rounded-full"></div>
             <span className="text-blue-500">{todoList.length} Câu còn lại</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          {!isPractice && (
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900/80 rounded-2xl border border-neutral-800 text-blue-300 font-mono font-bold text-sm shadow-sm backdrop-blur-sm">
              <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3" /></svg>
              {formatTime(totalTime)}
            </div>
          )}
          <div className="flex glass-panel rounded-2xl p-1.5 gap-1 shadow-xl bg-neutral-900/50 border-neutral-800">
             {!isPractice && (
               <button onClick={togglePause} className={`p-2.5 rounded-xl transition-all ${gameState.status === 'paused' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'text-neutral-400 hover:bg-white/10 hover:text-white'}`}>
                {gameState.status === 'paused' ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 9v6m4-6v6" /></svg>}
               </button>
             )}
             {!isPractice && <div className="w-px bg-white/5 my-1 mx-1"></div>}
             {!isPractice && (
               <button onClick={handleRestart} className="p-2.5 text-neutral-400 hover:bg-white/10 hover:text-white rounded-xl transition-all" title="Bắt đầu lại">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581" /></svg>
               </button>
             )}
             {!isPractice && <div className="w-px bg-white/5 my-1 mx-1"></div>}
             <button onClick={handleEndGame} className="p-2.5 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all" title="Thoát">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
             </button>
          </div>
        </div>
      </header>

      {!isPractice && (
        <LevelIndicator 
          level={gameState.level} streak={gameState.streak} score={gameState.score} 
          lives={gameState.lives} maxLives={DIFFICULTY_SETTINGS[difficulty].lives}
          onLevelChange={handleLevelChange} 
        />
      )}

      <div className="flex flex-col gap-6 mt-2">
        <ImageArea 
          vocabData={vocabData} imageSrc={imageSrc} positions={positions}
          onUpdatePositions={(p) => { setPositions(p); localStorage.setItem('travelGameButtonPositions', JSON.stringify(p)); }}
          currentHint={gameState.status === 'incorrect' ? currentItem?.hint : undefined} 
          onGuess={handleGuess}
          gameState={{
            correctId: (gameState.status === 'correct' || gameState.status === 'level_complete' || gameState.status === 'incorrect') ? gameState.currentQuestionId : null,
            wrongId: gameState.wrongId,
            hintId: gameState.status === 'incorrect' ? gameState.currentQuestionId : null,
            disabled: gameState.status === 'paused',
            status: gameState.status
          }}
        />
        
        <div className={`p-8 rounded-[2rem] transition-all shadow-2xl text-center relative overflow-hidden backdrop-blur-md border
          ${gameState.status === 'correct' ? 'bg-emerald-950/50 border-emerald-500/50 animate-pop' : 
            gameState.status === 'incorrect' ? 'bg-red-950/50 border-red-500/50 animate-shake' : 
            gameState.status === 'game_over' ? 'bg-neutral-900/90 border-red-600 animate-fade-in' :
            gameState.status === 'level_complete' ? 'bg-blue-950/50 border-blue-500/50 animate-celebrate' : 
            isPractice ? 'bg-blue-950/20 border-blue-500/30' : 'glass-panel bg-neutral-900/60 border-neutral-800'}`}>
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] text-left">
              {isPractice ? "Thông tin luyện tập" : "Thử thách hiện tại"}
            </h2>
            {!isPractice && (gameState.status === 'playing' || gameState.status === 'paused') && (
              <div className="flex items-center gap-3 text-sm font-mono font-black text-neutral-400">
                <div className="w-32 h-1 bg-neutral-800 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 5 ? 'bg-red-500' : 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]'}`} style={{ width: `${(timeLeft / DIFFICULTY_SETTINGS[difficulty].time) * 100}%` }} />
                </div>
                <span className={timeLeft < 5 ? 'text-red-400 animate-pulse' : 'text-blue-400'}>{timeLeft}s</span>
              </div>
            )}
          </div>
          
          <div className="min-h-[160px] flex flex-col items-center justify-center relative">
            {gameState.status === 'paused' && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-[2rem]">
                <span className="text-2xl font-black text-yellow-400 tracking-[0.4em] uppercase">Tạm dừng</span>
              </div>
            )}

            {isPractice ? (
              <div className="flex flex-col items-center gap-4 animate-fade-in">
                {currentItem ? (
                  <>
                    <div className="text-5xl font-black text-white drop-shadow-xl mb-2">{currentItem.word}</div>
                    <div className="text-xl text-yellow-400 font-mono font-black bg-yellow-400/10 px-4 py-1 rounded-xl border border-yellow-400/20">{currentItem.ipa}</div>
                    <div className="text-neutral-400 font-bold uppercase tracking-widest">{currentItem.vn}</div>
                    <button onClick={() => handleSpeak(currentItem.word)} className="mt-4 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-yellow-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center opacity-40">
                    <div className="text-6xl mb-4">🗺️</div>
                    <p className="text-neutral-500 font-black uppercase tracking-widest text-sm">Nhấn vào một số trên bản đồ để bắt đầu học</p>
                  </div>
                )}
              </div>
            ) : gameState.status === 'game_complete' ? (
              <div className="flex flex-col items-center animate-pop py-2">
                <div className="text-6xl mb-6 drop-shadow-2xl">👑</div>
                <div className="text-3xl font-black text-white uppercase tracking-widest">HOÀN THÀNH</div>
                <div className="mt-4 text-2xl font-mono text-yellow-400 font-black">ĐIỂM: {gameState.score}</div>
                <button onClick={handleRestart} className="mt-8 px-10 py-4 bg-yellow-400 text-black font-black rounded-3xl hover:bg-yellow-300 transition-all shadow-2xl">CHƠI LẠI</button>
              </div>
            ) : gameState.status === 'game_over' ? (
              <div className="flex flex-col items-center animate-pop py-2">
                <div className="text-6xl mb-6 grayscale opacity-50">💀</div>
                <div className="text-3xl font-black text-red-500 uppercase tracking-[0.2em]">Game Over</div>
                <div className="mt-4 text-xl font-mono text-white/50 font-bold uppercase tracking-widest">Điểm cuối: {gameState.score}</div>
                <button onClick={handleRestart} className="mt-8 px-10 py-4 bg-red-500 text-white font-black rounded-3xl hover:bg-red-600 transition-all shadow-xl">THỬ LẠI</button>
              </div>
            ) : currentItem ? (
              <div className="flex flex-col items-center animate-fade-in">
                <button onClick={() => !loadingAudio && handleSpeak(currentItem.word)} className="group flex flex-col items-center gap-4">
                  <span className="text-5xl sm:text-6xl font-black text-white group-hover:text-yellow-400 transition-all drop-shadow-2xl text-center leading-tight">
                    {gameState.level === 1 && currentItem.vn}
                    {gameState.level === 2 && currentItem.word}
                    {gameState.level === 3 && (
                        ['playing', 'paused'].includes(gameState.status) 
                            ? <span className="text-yellow-400 animate-pulse">🔊 Listen...</span> 
                            : currentItem.ipa
                    )}
                  </span>
                  
                  <span className={`inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full border transition-all ${loadingAudio ? 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10' : 'text-neutral-500 border-neutral-700 bg-neutral-800/50 group-hover:text-yellow-400 group-hover:border-yellow-400/50'}`}>
                    {loadingAudio ? "Đang đọc..." : "Chạm để nghe"}
                  </span>
                </button>
                <div className={`text-sm font-black mt-8 uppercase tracking-[0.4em] transition-all ${gameState.status === 'correct' ? 'text-emerald-400 scale-110' : gameState.status === 'incorrect' ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>{gameState.message}</div>
              </div>
            ) : <div className="animate-pulse bg-neutral-800/50 h-20 w-64 rounded-3xl"></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;