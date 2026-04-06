import React from 'react';
import backIcon from './back.svg';
import emotionWheelBg from './emotion wheel.svg';
import { useSwipeBack } from './useSwipeBack';
import NavigationHeader from './NavigationHeader';

const EMOTION_DISPLAY_NAMES: Record<string, string> = {
  joyful: 'Joyful',
  surprised: 'Surprised',
  angry: 'Angry',
  scared: 'Fear',
  love: 'Love',
  sad: 'Sadness',
};

const EMOTION_COLORS: Record<string, string> = {
  joyful: '#1D9357',
  surprised: '#C0690C',
  angry: '#D64343',
  scared: '#B78314',
  love: '#E727AE',
  sad: '#2755B7',
};

interface InputFeelingScreenProps {
  emotionId: string;
  subEmotionName: string;
  subSubEmotionName: string;
  mood: string;
  rotation: number;
  onBack: () => void;
  onSubmit: (note: string) => void;
  targetTimestamp?: number | null;
}

const InputFeelingScreen: React.FC<InputFeelingScreenProps> = ({ 
  emotionId, 
  subEmotionName, 
  subSubEmotionName,
  mood,
  rotation, 
  onBack,
  onSubmit,
  targetTimestamp
}) => {
  const [note, setNote] = React.useState('');
  const { onTouchStart, onTouchEnd } = useSwipeBack(onBack);
  const primaryName = EMOTION_DISPLAY_NAMES[emotionId] || 'Feeling';
  const emotionColor = EMOTION_COLORS[emotionId] || '#151410';

  return (
    <div 
      className="relative w-full h-full overflow-hidden box-border select-none flex flex-col items-center isolation-isolate"
      style={{ 
        padding: '20px 16px 60px',
        gap: '2.5rem'
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div className="w-full max-w-[350px] z-[10]">
        <NavigationHeader 
          variant="centered" 
          title={targetTimestamp ? `Log for ${new Date(targetTimestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : "Check-in"} 
          onBack={onBack} 
        />
      </div>

      {/* Content Container */}
      <div className="flex flex-col items-center gap-8 w-full max-w-[350px] z-[2]">
        <div className="flex flex-col items-center gap-5 w-full">
          <h1 className="w-full font-['Instrument Sans'] font-normal text-[30px] md:text-[40px] leading-[1.4] text-center tracking-[0.02em] text-[#151410] m-0 text-balance">
            {targetTimestamp ? "Why were you feeling this way?" : "Why are you feeling this way?"}
          </h1>
          <h2 className="w-full font-['Instrument Sans'] font-semibold text-lg leading-tight text-center text-[#151410] m-0">
            {primaryName}, {subEmotionName}, <span style={{ color: emotionColor }}>{subSubEmotionName}</span>,&nbsp;{mood}!
          </h2>
        </div>

        <div className="box-border flex flex-col items-start p-4 w-full h-[202px] bg-white border border-[#C9C9C9] rounded-lg shadow-sm">
          <textarea 
            className="w-full h-full border-none outline-none resize-none font-['Instrument Sans'] font-normal text-base leading-5 text-[#333] placeholder:text-[#AAAAAA]"
            placeholder="Start typing..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button 
          className="box-border flex flex-col items-center py-3 px-4 gap-3 w-full max-w-[310px] h-[46px] bg-white border border-[#C9C9C9] rounded-[34px] cursor-pointer transition-all hover:bg-gray-50 active:scale-95"
          onClick={() => onSubmit(note)}
        >
          <span className="h-[22px] font-['Instrument Sans'] font-medium text-lg leading-[22px] text-[#151410]">
            Submit
          </span>
        </button>
      </div>

      {/* Blurred Wheel at Bottom */}
      <div 
        className="absolute w-[505px] h-[505px] left-1/2 -translate-x-1/2 flex-none z-0"
        style={{ 
          top: '80%',
          opacity: 0.3,
          filter: 'blur(2px)'
        }}
      >
        <img src={emotionWheelBg} className="w-full h-full pointer-events-none" style={{ transform: `rotate(${rotation}deg)` }} alt="" />
      </div>
    </div>
  );
};

export default InputFeelingScreen;
