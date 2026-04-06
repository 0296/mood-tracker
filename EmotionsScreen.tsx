import React, { useState, useRef, useEffect } from 'react';
import backIcon from './back.svg';
import emotionWheelBg from './emotion wheel.svg';
import indicatorIcon from './Indicator.svg';
import EmotionIcon from './EmotionIcon';
import { useSwipeBack } from './useSwipeBack';
import NavigationHeader from './NavigationHeader';

interface Emotion {
  id: string;
  name: string;
  color: string;
  bgGradient: string;
  icon: string;
  angle: number;
}

const EMOTIONS: Emotion[] = [
  { id: 'joyful', name: 'Joyful', color: '#48C887', bgGradient: 'linear-gradient(179.83deg, #E8FFF3 3.15%, #F1F5FE 101.91%)', icon: '', angle: 0 },
  { id: 'surprised', name: 'Surprised', color: '#D77C1B', bgGradient: 'linear-gradient(179.83deg, #FFF1E2 3.15%, #F1F5FE 101.91%)', icon: '', angle: 60 },
  { id: 'angry', name: 'Angry', color: '#FF7878', bgGradient: 'linear-gradient(179.83deg, #FFE2E2 3.15%, #F1F5FE 101.91%)', icon: '', angle: 120 },
  { id: 'scared', name: 'Scared', color: '#FCBC34', bgGradient: 'linear-gradient(179.83deg, #FFF7E4 3.15%, #F1F5FE 101.91%)', icon: '', angle: 180 },
  { id: 'love', name: 'Love', color: '#FF73D5', bgGradient: 'linear-gradient(179.83deg, #FFE3F7 3.15%, #F1F5FE 101.91%)', icon: '', angle: 240 },
  { id: 'sad', name: 'Sad', color: '#7392D5', bgGradient: 'linear-gradient(179.83deg, #E1EAFF 3.15%, #F1F5FE 101.91%)', icon: '', angle: 300 },
];

interface EmotionsScreenProps {
  onBack: () => void;
  onNext: (id: string, rotation: number) => void;
  onEmotionChange?: (id: string) => void;
  initialEmotionId?: string;
  initialRotation?: number;
  targetTimestamp?: number | null;
}

const EmotionsScreen: React.FC<EmotionsScreenProps> = ({ 
  onBack, 
  onNext,
  onEmotionChange,
  initialEmotionId,
  initialRotation = 0,
  targetTimestamp
}) => {
  const { onTouchStart: onSwipeStart, onTouchEnd: onSwipeEnd } = useSwipeBack(onBack);
  const [rotation, setRotation] = useState(initialRotation);
  const initialIndex = initialEmotionId 
    ? EMOTIONS.findIndex(e => e.id === initialEmotionId) 
    : 0;
  const [activeEmotionIndex, setActiveEmotionIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const wheelRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startAngle = useRef(0);
  const currentRotation = useRef(initialRotation);

  const activeEmotion = EMOTIONS[activeEmotionIndex];

  // Calculate angle between mouse/touch position and center of wheel
  const getAngle = (clientX: number, clientY: number) => {
    if (!wheelRef.current) return 0;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const handleStart = (clientX: number, clientY: number) => {
    isDragging.current = true;
    startAngle.current = getAngle(clientX, clientY) - currentRotation.current;
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging.current) return;
    const angle = getAngle(clientX, clientY);
    const newRotation = angle - startAngle.current;
    
    // Smoothly normalize rotation between 0 and 360
    let normalized = ((newRotation % 360) + 360) % 360;
    currentRotation.current = newRotation;
    setRotation(newRotation);

    // We'll calculate index by finding the nearest 60-degree segment
    const index = Math.round((-newRotation % 360 + 360) % 360 / 60) % 6;
    if (index !== activeEmotionIndex) {
      setActiveEmotionIndex(index);
      onEmotionChange?.(EMOTIONS[index].id);
    }
  };

  const handleEnd = () => {
    isDragging.current = false;
    // Snap to the nearest 60 deg
    const snapped = Math.round(currentRotation.current / 60) * 60;
    currentRotation.current = snapped;
    setRotation(snapped);
    
    const index = Math.round((-snapped % 360 + 360) % 360 / 60) % 6;
    setActiveEmotionIndex(index);
    onEmotionChange?.(EMOTIONS[index].id);
  };

  const [isExiting, setIsExiting] = useState(false);
  const handleNext = () => {
    onNext(activeEmotion.id, rotation);
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden box-border select-none flex flex-col items-center isolation-isolate"
      style={{ 
        padding: '20px 16px 60px',
        gap: '2.5rem'
      }}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={onSwipeStart}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={(e) => {
        handleEnd();
        onSwipeEnd(e);
      }}
    >
      {/* Header Container */}
      <div className="w-full max-w-[350px] z-[1]">
        <NavigationHeader 
          variant="centered" 
          title={targetTimestamp ? `Log for ${new Date(targetTimestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : "Check-in"} 
          onBack={onBack} 
        />
      </div>

      {/* Content Container */}
      <div className="flex flex-col items-center w-full max-w-[350px] z-[2]" style={{ gap: '34px' }}>
        <h1 className="w-full font-['Instrument Sans'] font-normal text-[30px] md:text-[40px] leading-[1.4] text-center tracking-[0.02em] text-[#151410] m-0 text-balance">
          How were you feeling then?
        </h1>

        {/* Emotion Detail */}
        <div className="flex flex-col items-center w-full" style={{ gap: '26px' }}>
          <div className="relative w-[80px] h-[80px] flex items-center justify-center">
            <EmotionIcon emotionId={activeEmotion.id} />
          </div>
          <span className="w-full font-['Instrument Sans'] font-semibold text-[20px] leading-normal text-center text-[#151410] capitalize">
            {
              activeEmotion.id === 'scared' ? 'fear' : 
              activeEmotion.id === 'love' ? 'loved' : 
              activeEmotion.id === 'joyful' ? 'joyful' :
              activeEmotion.id === 'surprised' ? 'surprised' :
              activeEmotion.name
            }!
          </span>
        </div>

        {/* Next Button */}
        <button 
          onClick={handleNext}
          className="box-border flex flex-col items-center py-3 px-4 gap-3 w-full max-w-[310px] h-[46px] bg-white border border-[#C9C9C9] rounded-[34px] cursor-pointer transition-all hover:bg-gray-50 active:scale-95"
        >
          <span className="font-['Instrument Sans'] font-medium text-lg leading-[22px] text-[#151410]">
            Next
          </span>
        </button>
      </div>

      {/* Interactive Emotion Wheel */}
      <div 
        className="absolute w-[505px] h-[505px] left-1/2 -translate-x-1/2 flex-none z-0"
        style={{ top: '62%' }}
      >
        <div 
          ref={wheelRef}
          className="w-full h-full relative cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
          style={{ transform: `rotate(${rotation}deg)`, transition: isDragging.current ? 'none' : 'transform 0.3s ease-out' }}
        >
          <img src={emotionWheelBg} className="w-full h-full pointer-events-none select-none" alt="" draggable={false} />
        </div>
      </div>

      {/* Indicator */}
      <div className="absolute w-[42px] h-[55px] left-1/2 -translate-x-1/2 flex-none z-[3] pointer-events-none" style={{ top: 'calc(77% - 4px)' }}>
        <img src={indicatorIcon} className="w-full h-full" alt="Pointer" />
      </div>

    </div>
  );
};

export default EmotionsScreen;
