import React, { useState, useEffect } from 'react';
import backIcon from './back.svg';
import emotionWheelBg from './emotion wheel.svg';
import { SubEmotion } from './SubEmotionScreen';
import { useSwipeBack } from './useSwipeBack';
import NavigationHeader from './NavigationHeader';

const GRADIENTS: Record<string, string> = {
  joyful: 'linear-gradient(179.83deg, #E8FFF3 3.15%, #F1F5FE 101.91%)',
  surprised: 'linear-gradient(179.83deg, #FFF1E2 3.15%, #F1F5FE 101.91%)',
  angry: 'linear-gradient(179.83deg, #FFE2E2 3.15%, #F1F5FE 101.91%)',
  scared: 'linear-gradient(179.83deg, #FFF7E4 3.15%, #F1F5FE 101.91%)',
  love: 'linear-gradient(179.83deg, #FFE3F7 3.15%, #F1F5FE 101.91%)',
  sad: 'linear-gradient(179.83deg, #E1EAFF 3.15%, #F1F5FE 101.91%)',
};

const EMOTION_COLORS: Record<string, string> = {
  joyful: '#1D9357',
  surprised: '#C0690C',
  angry: '#D64343',
  scared: '#B78314',
  love: '#E727AE',
  sad: '#2755B7',
};

const SUBSUB_EMOTIONS: Record<string, string[]> = {
  // JOY
  'Enthralled': ['Rapture', 'Enchanted'],
  'Elation': ['Jubilation', 'Euphoric'],
  'Enthusiastic': ['Zeal', 'Excited'],
  'Optimistic': ['Hopeful', 'Eager'],
  'Proud': ['Illustrious', 'Triumphant'],
  'Cheerful': ['Blissful', 'Jovial'],
  'Happy': ['Delighted', 'Amused'],
  'Content': ['Satisfied', 'Pleased'],
  // LOVE
  'Affectionate': ['Adoring', 'Fondness'],
  'Longing': ['Sentimental', 'Romantic'],
  'Desire': ['Passion', 'Infatuation'],
  'Tenderness': ['Caring', 'Compassionate'],
  'Peaceful': ['Relieved', 'Satisfied'],
  // SURPRISE
  'Moved': ['Touched', 'Stimulated'],
  'Overcome': ['Astonished', 'Speechless'],
  'Amazed': ['Awe-struck', 'Astounded'],
  'Confused': ['Perplexed', 'Disillusioned'],
  'Stunned': ['Shocked', 'Dismayed'],
  // SADNESS
  'Despair': ['Powerless', 'Grief'],
  'Neglected': ['Lonely', 'Isolated'],
  'Shameful': ['Guilty', 'Regretful'],
  'Disappointed': ['Displeased', 'Dismayed'],
  'Sadness': ['Sorrow', 'Depressed'],
  'Suffering': ['Agony', 'Hurt'],
  // ANGER
  'Disgust': ['Revolted', 'Contempt'],
  'Envy': ['Jealous', 'Resentful'],
  'Irritable': ['Aggravated', 'Annoyed'],
  'Exasperated': ['Frustrated', 'Agitated'],
  'Rage': ['Hostile', 'Hate'],
  // FEAR
  'Scared': ['Frightened', 'Helpless'],
  'Terror': ['Panic', 'Hysterical'],
  'Insecure': ['Inferior', 'Inadequate'],
  'Nervous': ['Worried', 'Anxious'],
  'Horror': ['Mortified', 'Dread'],
};

interface SubSubEmotionScreenProps {
  emotionId: string;
  parentSubEmotion: SubEmotion;
  rotation: number;
  onBack: () => void;
  onNext: (option: string) => void;
  targetTimestamp?: number | null;
}

const SubSubEmotionScreen: React.FC<SubSubEmotionScreenProps> = ({ 
  emotionId, 
  parentSubEmotion, 
  rotation, 
  onBack,
  onNext,
  targetTimestamp
}) => {
  const { onTouchStart, onTouchEnd } = useSwipeBack(onBack);
  const options = SUBSUB_EMOTIONS[parentSubEmotion.name] || [];
  const emotionColor = EMOTION_COLORS[emotionId] || EMOTION_COLORS.joyful;

  const handleBack = () => {
    onBack();
  };

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
          onBack={handleBack} 
        />
      </div>

      <div className="w-full max-w-[350px] flex flex-col justify-center z-[2]">
        <h1 className="w-full font-['Instrument Sans'] font-normal text-[30px] md:text-[40px] leading-[1.4] text-center tracking-[0.02em] text-[#151410] m-0 text-balance">
          You’re feeling <span className="font-bold" style={{ color: emotionColor }}>{parentSubEmotion.name.toLowerCase()}</span>. Which of these fits&nbsp;best?
        </h1>
      </div>

      {/* Sub-Sub-Emotions Grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-[350px] z-[3] p-2">
        {options.map((opt, index) => {
          const isOddLast = index === options.length - 1 && options.length % 2 !== 0;
          return (
            <button 
              key={index}
              style={{ backgroundColor: parentSubEmotion.bgColor, color: parentSubEmotion.textColor }}
              onClick={() => onNext(opt)}
              className={`flex items-center justify-center p-4 min-h-[5rem] rounded-[19px] border-none cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm ${isOddLast ? 'col-span-2 w-[calc(50%-0.5rem)] justify-self-center' : 'w-full'}`}
            >
              <span className="font-['Instrument Sans'] font-semibold text-base leading-tight text-center">
                {opt}
              </span>
            </button>
          );
        })}
      </div>

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

export default SubSubEmotionScreen;
