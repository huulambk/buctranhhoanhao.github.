import React, { useState, useRef } from 'react';
import { VocabMap } from '../types';
import { detectNumberPositions } from '../services/geminiService';

interface ImageAreaProps {
  vocabData: VocabMap;
  imageSrc: string | null;
  positions: Record<string, { x: number, y: number }>;
  onUpdatePositions: (positions: Record<string, { x: number, y: number }>) => void;
  currentHint?: string;
  onGuess: (id: string) => void;
  gameState: {
    correctId: string | null;
    wrongId: string | null;
    hintId: string | null;
    disabled: boolean;
    status: string;
  };
}

const ImageArea: React.FC<ImageAreaProps> = ({ 
  vocabData,
  imageSrc, 
  positions, 
  onUpdatePositions, 
  currentHint, 
  onGuess, 
  gameState 
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isScanning, setIsScanning] = useState(false);
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [draggingBtnId, setDraggingBtnId] = useState<string | null>(null);
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAutoAlign = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageSrc) return;
    setIsScanning(true);
    try {
      const count = Object.keys(vocabData).length;
      const newPositions = await detectNumberPositions(imageSrc, count);
      onUpdatePositions(newPositions);
    } catch (error) {
      alert("AI không thể quét lúc này. Vui lòng thử lại hoặc xếp thủ công.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleGridAlign = (e: React.MouseEvent) => {
    e.stopPropagation();
    const count = Object.keys(vocabData).length || 24;
    const cols = 6;
    const rows = Math.ceil(count / cols);
    const newPos: Record<string, {x: number, y: number}> = {};
    
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const id = (i + 1).toString();
      
      const xStep = cols > 1 ? 80 / (cols - 1) : 0;
      const yStep = rows > 1 ? 70 / (rows - 1) : 0;

      newPos[id] = { 
        x: 10 + (col * xStep), 
        y: 15 + (row * yStep) 
      };
    }
    onUpdatePositions(newPos);
    setIsEditingLayout(true);
  };

  const toggleZoom = () => {
    if (isEditingLayout || isScanning) return; 
    setZoom(prev => {
      const newZoom = prev === 1 ? 2.5 : 1;
      if (newZoom === 1) setOffset({ x: 0, y: 0 });
      return newZoom;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditingLayout || isScanning) return; 
    if (zoom > 1) {
      setIsDraggingImage(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingImage && zoom > 1) {
      e.preventDefault();
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      return;
    }
    if (isEditingLayout && draggingBtnId && containerRef.current) {
        e.preventDefault();
        const rect = containerRef.current.getBoundingClientRect();
        const perX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const perY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        onUpdatePositions({ ...positions, [draggingBtnId]: { x: perX, y: perY } });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingImage(false);
    setDraggingBtnId(null);
  };

  if (!imageSrc) return null;

  return (
    <div className="w-full select-none">
      <div className="relative w-full aspect-[16/9] md:aspect-[2/1] bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl group z-10 ring-1 ring-white/10">
        <div 
          className={`w-full h-full flex items-center justify-center overflow-hidden 
            ${isScanning ? 'cursor-wait' : isEditingLayout ? 'cursor-crosshair' : (zoom > 1 ? 'cursor-move touch-none' : 'cursor-zoom-in')}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={(e) => {
            if (isEditingLayout || isScanning) return;
            if (zoom > 1) {
              setIsDraggingImage(true);
              setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
            }
          }}
          onTouchMove={(e) => {
            if (isDraggingImage && zoom > 1) {
              setOffset({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
            }
          }}
          onTouchEnd={() => setIsDraggingImage(false)}
        >
          {isScanning && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
              <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin"></div>
              <p className="mt-4 font-black uppercase tracking-widest animate-pulse text-yellow-400">Scanning...</p>
            </div>
          )}

          <div 
            ref={containerRef}
            className={`relative transition-transform duration-200 ease-out will-change-transform ${isScanning ? 'blur-md' : ''}`}
            style={{ 
               transform: `scale(${isEditingLayout ? 1 : zoom}) translate(${isEditingLayout ? 0 : offset.x / zoom}px, ${isEditingLayout ? 0 : offset.y / zoom}px)`,
               width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}
          >
            <img src={imageSrc} alt="Game Board" className="max-w-full max-h-full object-contain pointer-events-none" draggable={false} />
            
            {Object.keys(positions).map(key => {
              const pos = positions[key];
              const isCorrect = gameState.correctId === key;
              const isWrong = gameState.wrongId === key;
              const isHint = gameState.hintId === key;
              const isPractice = gameState.status === 'practice';
              const revealAll = gameState.status === 'level_complete' || gameState.status === 'game_complete' || gameState.status === 'game_over' || (isPractice && lastClickedId === key);
              const vocab = vocabData[key];
              
              let btnClass = "absolute flex items-center justify-center rounded-full text-[10px] sm:text-xs font-bold shadow-lg transition-all duration-300 backdrop-blur-sm ";
              
              if (isCorrect) {
                btnClass += "bg-emerald-500 text-black border-2 border-white z-20 scale-125 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pop ";
              } else if (isWrong) {
                btnClass += "bg-red-500 text-white border-2 border-red-300 z-20 animate-[shake_0.5s_ease-in-out] shadow-[0_0_15px_rgba(239,68,68,0.8)] ";
              } else if (isHint) {
                btnClass += "bg-yellow-400 text-black border-2 border-white z-20 animate-bounce shadow-[0_0_15px_rgba(250,204,21,0.8)] ";
              } else if (isPractice && lastClickedId === key) {
                btnClass += "bg-blue-400 text-black border-2 border-white z-20 scale-110 shadow-[0_0_10px_rgba(96,165,250,0.6)] ";
              } else {
                btnClass += "bg-neutral-900/80 text-neutral-300 border border-neutral-600 hover:bg-yellow-400 hover:text-black hover:border-yellow-200 hover:scale-110 ";
              }

              if (isEditingLayout) {
                btnClass += "cursor-grab active:cursor-grabbing border-dashed border-yellow-400 bg-yellow-400/20 text-yellow-200 ";
                if (draggingBtnId === key) btnClass += "scale-150 z-50 ring-4 ring-yellow-400/30 ";
              } else btnClass += "cursor-pointer ";

              return (
                <div
                  key={key}
                  onMouseDown={(e) => isEditingLayout && (e.stopPropagation(), setDraggingBtnId(key))}
                  onClick={(e) => {
                    if (!isEditingLayout && !isScanning) {
                      if (isPractice) setLastClickedId(key);
                      onGuess(key);
                    }
                  }}
                  className={btnClass}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: '28px', height: '28px', transform: `translate(-50%, -50%)` }}
                >
                  {key}
                  {revealAll && vocab && (
                    <div className={`absolute top-full mt-1.5 px-3 py-1 bg-black/90 text-[10px] rounded-lg whitespace-nowrap shadow-xl border font-bold z-50 backdrop-blur-md ${isPractice ? 'text-blue-300 border-blue-500/30' : gameState.status === 'game_over' ? 'text-red-300 border-red-500/30' : 'text-emerald-300 border-emerald-500/30'}`}>
                      {vocab.word}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {currentHint && zoom === 1 && !isEditingLayout && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-xl p-3 text-slate-200 text-sm text-center border border-yellow-500/30 rounded-xl z-20 animate-fade-in-up shadow-2xl flex items-center justify-center gap-3">
            <span className="inline-block px-2 py-0.5 bg-yellow-400 text-black rounded font-black text-[10px] uppercase tracking-wider">Hint</span> 
            <span>{currentHint}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 px-1">
         <div className="text-xs font-bold text-neutral-500 flex-1 min-w-[120px]">
            {isEditingLayout ? (
                <span className="text-yellow-400 flex items-center gap-2 bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-400/20 w-fit animate-pulse">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                   Kéo số để sửa vị trí
                </span>
            ) : (
                <span className="text-neutral-600 uppercase tracking-wider text-[10px]">Tools</span>
            )}
         </div>

         <div className="flex gap-2 overflow-x-auto pb-1">
             <button 
               onClick={handleAutoAlign} 
               disabled={isScanning} 
               className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-400 bg-blue-950/30 hover:bg-blue-900/50 rounded-lg transition-all border border-blue-500/20 hover:border-blue-400/50 shadow-sm whitespace-nowrap"
               title="Dùng AI quét lại vị trí các số"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
               AI Quét
             </button>

             <button 
               onClick={handleGridAlign}
               className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all border border-neutral-700 hover:border-neutral-500 shadow-sm whitespace-nowrap"
               title="Sắp xếp các số theo dạng lưới"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
               Lưới
             </button>

             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 if (!isEditingLayout) {
                   setZoom(1);
                   setOffset({x:0, y:0});
                 }
                 setIsEditingLayout(!isEditingLayout);
               }}
               className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all border shadow-sm whitespace-nowrap ${
                 isEditingLayout 
                   ? 'bg-yellow-400 text-black border-yellow-500 shadow-[0_0_10px_rgba(250,204,21,0.4)]' 
                   : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border-neutral-700'
               }`}
               title="Kéo thả thủ công các số"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
               Sửa
             </button>

             <button 
               onClick={toggleZoom}
               className={`flex items-center gap-2 px-4 py-2 text-xs font-bold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all border border-neutral-700 shadow-sm whitespace-nowrap ${zoom > 1 ? 'bg-blue-950 text-blue-400 border-blue-800' : ''}`}
               title="Phóng to để nhìn rõ hơn"
             >
               {zoom === 1 ? (
                 <>
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                   Zoom
                 </>
               ) : (
                 <>
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
                   Reset
                 </>
               )}
             </button>
         </div>
      </div>
    </div>
  );
};

export default ImageArea;