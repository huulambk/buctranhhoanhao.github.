import React, { useState, useRef, useEffect } from 'react';

interface ImageAreaProps {
  currentHint?: string;
  onGuess: (id: string) => void;
  gameState: {
    correctId: string | null;
    hintId: string | null;
    disabled: boolean;
    status: string;
  };
}

interface ButtonPosition {
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
}

// Preset positions corresponding to the "Airport/Travel" scene analysis
const SCENE_POSITIONS: Record<string, ButtonPosition> = {
  "1": { x: 8, y: 38 },   // agency (Left office)
  "2": { x: 14, y: 45 },  // agent (Woman at counter)
  "3": { x: 28, y: 58 },  // brochure (Girl reading map)
  "4": { x: 12, y: 18 },  // domestic tourism (Sign top left)
  "5": { x: 18, y: 52 },  // estimate (Paper on desk)
  "6": { x: 82, y: 15 },  // fixed (Sign schedule)
  "7": { x: 68, y: 55 },  // food tourism (Girl with noodles)
  "8": { x: 30, y: 25 },  // graveyard (Poster)
  "9": { x: 58, y: 48 },  // holidaymaker (Man green shirt)
  "10": { x: 48, y: 68 }, // homestay (Kiosk machine)
  "11": { x: 88, y: 35 }, // hop-on hop-off (Bus)
  "12": { x: 92, y: 65 }, // hunt (Man searching in back)
  "13": { x: 75, y: 12 }, // itinerary (Sign)
  "14": { x: 38, y: 25 }, // loft (Poster)
  "15": { x: 46, y: 25 }, // low season (Poster)
  "16": { x: 48, y: 60 }, // online app (Screen on Kiosk)
  "17": { x: 54, y: 25 }, // package holiday (Poster)
  "18": { x: 62, y: 25 }, // ruinous (Poster)
  "19": { x: 55, y: 82 }, // self-guided (Suitcase)
  "20": { x: 78, y: 62 }, // shopping tourism (Shopping bags)
  "21": { x: 85, y: 48 }, // smooth (Text on bus)
  "22": { x: 28, y: 88 }, // wander (Walking feet)
  "23": { x: 72, y: 72 }, // world-famous (Bag brand)
  "24": { x: 15, y: 75 }  // work out (Boy on bench)
};

const ImageArea: React.FC<ImageAreaProps> = ({ currentHint, onGuess, gameState }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Keypad Overlay State
  const [positions, setPositions] = useState<Record<string, ButtonPosition>>({});
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [draggingBtnId, setDraggingBtnId] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Default Positions (Grid fallback)
  const initGridPositions = () => {
    const newPositions: Record<string, ButtonPosition> = {};
    const cols = 8;
    const rows = 3;
    const xStep = 100 / (cols + 1);
    const yStep = 100 / (rows + 1);
    
    for (let i = 1; i <= 24; i++) {
       const col = (i - 1) % cols;
       const row = Math.floor((i - 1) / cols);
       newPositions[i.toString()] = {
         x: xStep * (col + 1),
         y: yStep * (row + 1)
       };
    }
    return newPositions;
  };

  // Load image and positions from localStorage on mount
  useEffect(() => {
    try {
      const savedImg = localStorage.getItem('travelGameImage');
      if (savedImg) setImageSrc(savedImg);

      const savedPos = localStorage.getItem('travelGameButtonPositions');
      if (savedPos) {
        setPositions(JSON.parse(savedPos));
      } else {
        // Use SCENE_POSITIONS by default if no local save exists
        setPositions(SCENE_POSITIONS);
      }
    } catch (e) {
      console.error("Failed to load from storage", e);
      setPositions(SCENE_POSITIONS);
    }
  }, []);

  const savePositions = (newPos: Record<string, ButtonPosition>) => {
    setPositions(newPos);
    localStorage.setItem('travelGameButtonPositions', JSON.stringify(newPos));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImageSrc(result);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        try {
          localStorage.setItem('travelGameImage', result);
        } catch (e) {
          console.warn("Image too large to save to localStorage");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Remove the current image?")) {
      setImageSrc(null);
      localStorage.removeItem('travelGameImage');
    }
  };

  const handleResetLayout = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Reset button positions to default scene layout?")) {
      savePositions(SCENE_POSITIONS);
    }
  };

  const handlePlaceholderClick = () => {
    fileInputRef.current?.click();
  };

  const toggleZoom = () => {
    if (isEditingLayout) return; // Disable zoom while editing layout
    setZoom(prev => {
      const newZoom = prev === 1 ? 2.5 : 1;
      if (newZoom === 1) setOffset({ x: 0, y: 0 });
      return newZoom;
    });
  };

  // --- Image Drag Logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditingLayout) return; // Don't drag image in edit mode
    if (zoom > 1) {
      setIsDraggingImage(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Image Dragging
    if (isDraggingImage && zoom > 1) {
      e.preventDefault();
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }
    
    // Button Dragging
    if (isEditingLayout && draggingBtnId && containerRef.current) {
        e.preventDefault();
        const rect = containerRef.current.getBoundingClientRect();
        
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        
        // Clamp to 0-100
        const perX = Math.max(0, Math.min(100, (relX / rect.width) * 100));
        const perY = Math.max(0, Math.min(100, (relY / rect.height) * 100));
        
        setPositions(prev => ({
            ...prev,
            [draggingBtnId]: { x: perX, y: perY }
        }));
    }
  };

  const handleMouseUp = () => {
    if (draggingBtnId) {
        savePositions(positions); // Save on release
    }
    setIsDraggingImage(false);
    setDraggingBtnId(null);
  };

  const handleMouseLeave = () => {
    if (draggingBtnId) savePositions(positions);
    setIsDraggingImage(false);
    setDraggingBtnId(null);
  };

  // --- Touch Logic ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isEditingLayout) return;
    if (zoom > 1) {
      setIsDraggingImage(true);
      setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingImage && zoom > 1) {
      setOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  // --- Button Drag Start ---
  const handleButtonMouseDown = (e: React.MouseEvent, id: string) => {
     if (isEditingLayout) {
         e.stopPropagation(); // Prevent image drag start
         setDraggingBtnId(id);
     }
  };

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[2/1] bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-300 shadow-inner group select-none">
      {imageSrc ? (
        <div 
          className={`w-full h-full flex items-center justify-center overflow-hidden 
            ${isEditingLayout ? 'cursor-crosshair' : (zoom > 1 ? 'cursor-move touch-none' : 'cursor-zoom-in')}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setIsDraggingImage(false)}
          onClick={(e) => {
            if (!isDraggingImage && !isEditingLayout) {
               // Click on background logic if needed
            }
          }}
        >
          {/* Transform Container: Holds Image AND Buttons */}
          <div 
            ref={containerRef}
            className="relative transition-transform duration-200 ease-out will-change-transform"
            style={{ 
               transform: `scale(${isEditingLayout ? 1 : zoom}) translate(${isEditingLayout ? 0 : offset.x / zoom}px, ${isEditingLayout ? 0 : offset.y / zoom}px)`,
               width: zoom === 1 ? '100%' : 'auto', 
               height: zoom === 1 ? '100%' : 'auto',
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center'
            }}
          >
              <img 
                src={imageSrc} 
                alt="Game Board" 
                className="max-w-none pointer-events-none"
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
                draggable={false}
              />
              
              {/* Overlay Buttons */}
              {Object.keys(positions).map(key => {
                  const pos = positions[key];
                  const isCorrect = gameState.correctId === key;
                  const isHint = gameState.hintId === key;
                  const revealAll = gameState.status === 'level_complete' || gameState.status === 'game_complete';
                  
                  // Style Logic
                  let btnClass = "absolute flex items-center justify-center rounded-full text-xs font-bold shadow-md transition-all duration-200 ";
                  
                  // Base State
                  if (isCorrect || (revealAll && isCorrect)) { 
                      btnClass += "bg-green-500 text-white border-2 border-green-300 z-20 scale-125 ";
                  } else if (isHint) {
                      btnClass += "bg-orange-500 text-white border-2 border-orange-300 z-20 animate-bounce ";
                  } else if (revealAll) {
                      btnClass += "bg-white/90 text-slate-800 border border-slate-300 ";
                  } else {
                      btnClass += "bg-white/80 text-slate-700 border border-slate-200 hover:bg-white hover:scale-110 hover:text-indigo-600 hover:border-indigo-400 ";
                  }

                  if (isEditingLayout) {
                      btnClass += "cursor-grab active:cursor-grabbing border-dashed border-slate-500 bg-yellow-100 text-slate-900 ";
                      if (draggingBtnId === key) btnClass += "scale-110 z-50 ";
                  } else if (gameState.disabled && !revealAll && !isCorrect) {
                      btnClass += "opacity-50 cursor-not-allowed ";
                  } else {
                      btnClass += "cursor-pointer ";
                  }

                  return (
                      <div
                        key={key}
                        onMouseDown={(e) => handleButtonMouseDown(e, key)}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isEditingLayout && !gameState.disabled) {
                                onGuess(key);
                            }
                        }}
                        className={btnClass}
                        style={{
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            width: '28px',
                            height: '28px',
                            transform: `translate(-50%, -50%)`, 
                        }}
                      >
                          {key}
                      </div>
                  );
              })}
          </div>

          {/* Controls Overlay */}
          <div className="absolute top-4 right-4 flex gap-2 z-30">
             {/* Edit Layout Toggle */}
             <button
                onClick={(e) => { 
                    e.stopPropagation(); 
                    if (!isEditingLayout) {
                        setZoom(1); 
                        setOffset({x:0, y:0});
                    }
                    setIsEditingLayout(!isEditingLayout); 
                }}
                className={`p-2 rounded-lg shadow-lg backdrop-blur-sm transition-all border
                    ${isEditingLayout ? 'bg-yellow-400 text-black border-yellow-500' : 'bg-white/90 hover:bg-white text-slate-800 border-transparent'}`}
                title={isEditingLayout ? "Save Layout" : "Move Buttons"}
             >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
             </button>
             
             {/* Reset Layout */}
             {isEditingLayout && (
                 <button
                    onClick={handleResetLayout}
                    className="bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-lg shadow-lg backdrop-blur-sm transition-all"
                    title="Reset to Scene Layout"
                 >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                 </button>
             )}

             {/* Zoom Toggle */}
             {!isEditingLayout && (
                 <button
                   onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
                   className="bg-white/90 hover:bg-white text-slate-800 p-2 rounded-lg shadow-lg backdrop-blur-sm transition-all"
                   title={zoom === 1 ? "Zoom In" : "Zoom Out"}
                 >
                   {zoom === 1 ? (
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                   ) : (
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
                   )}
                 </button>
             )}

             {/* Clear Image */}
             <button 
                onClick={handleClearImage}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm transition-all"
                title="Change Image"
             >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
             </button>
          </div>

          {/* Zoom Hint */}
          {zoom === 1 && !isEditingLayout && (
             <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
               Click to Zoom
             </div>
          )}
          
          {/* Edit Mode Hint */}
          {isEditingLayout && (
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg z-40 animate-pulse">
               EDIT MODE: Drag buttons to match image
             </div>
          )}
        </div>
      ) : (
        <div 
          onClick={handlePlaceholderClick}
          className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-slate-100 hover:bg-slate-200 transition-colors p-6 text-center border-dashed border-2 border-slate-300"
        >
          <div className="bg-white p-4 rounded-full shadow-sm mb-3">
            <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-800 font-bold text-lg">Upload "Airport Vocabulary" Image</p>
          <p className="text-slate-500 text-sm mt-1">Please upload the image to set up your game board.</p>
          <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-indigo-700">
            Select Image
          </button>
        </div>
      )}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      {/* Floating Hint Overlay - Only visible when NOT zooming or at bottom */}
      {imageSrc && currentHint && zoom === 1 && !isEditingLayout && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-md p-3 text-white text-sm text-center border-t border-white/10 z-10 animate-fade-in">
          <span className="font-bold text-yellow-400 mr-2">HINT:</span> 
          {currentHint}
        </div>
      )}
    </div>
  );
};

export default ImageArea;