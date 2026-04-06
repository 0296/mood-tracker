import React, { useEffect, useState } from 'react';
import backIcon from './back.svg';
import emotionWheelBg from './emotion wheel.svg';
import { useSwipeBack } from './useSwipeBack';
import NavigationHeader from './NavigationHeader';

export interface SubEmotion {
  name: string;
  bgColor: string;
  textColor: string;
}

export const SUB_EMOTIONS: Record<string, SubEmotion[]> = {
  joyful: [
    { name: 'Enthralled', bgColor: '#CDF5DA', textColor: '#333333' },
    { name: 'Elation', bgColor: '#B6EBC8', textColor: '#333333' },
    { name: 'Enthusiastic', bgColor: '#7AE6A0', textColor: '#333333' },
    { name: 'Optimistic', bgColor: '#4BDD80', textColor: '#333333' },
    { name: 'Proud', bgColor: '#48C887', textColor: '#EFF8FC' },
    { name: 'Cheerful', bgColor: '#22C55E', textColor: '#EFF8FC' },
    { name: 'Happy', bgColor: '#16A34A', textColor: '#EFF8FC' },
    { name: 'Content', bgColor: '#15803D', textColor: '#EFF8FC' },
  ],
  sad: [
    { name: 'Despair', bgColor: '#F4F7FF', textColor: '#333333' },
    { name: 'Neglected', bgColor: '#DCE6FB', textColor: '#333333' },
    { name: 'Shameful', bgColor: '#BCCFF6', textColor: '#333333' },
    { name: 'Disappointed', bgColor: '#7392D5', textColor: '#EFF8FC' },
    { name: 'Sadness', bgColor: '#5573B8', textColor: '#EFF8FC' },
    { name: 'Suffering', bgColor: '#3A538C', textColor: '#EFF8FC' },
  ],
  angry: [
    { name: 'Disgust', bgColor: '#FFF1F1', textColor: '#333333' },
    { name: 'Envy', bgColor: '#FFC2C2', textColor: '#333333' },
    { name: 'Irritable', bgColor: '#FF7878', textColor: '#EFF8FC' },
    { name: 'Exasperated', bgColor: '#E65A5A', textColor: '#EFF8FC' },
    { name: 'Rage', bgColor: '#992B2B', textColor: '#EFF8FC' },
  ],
  scared: [
    { name: 'Scared', bgColor: '#FFF0CA', textColor: '#333333' },
    { name: 'Terror', bgColor: '#FDE08B', textColor: '#333333' },
    { name: 'Insecure', bgColor: '#FCBC34', textColor: '#333333' },
    { name: 'Nervous', bgColor: '#C9911D', textColor: '#EFF8FC' },
    { name: 'Horror', bgColor: '#8A5F0B', textColor: '#EFF8FC' },
  ],
  love: [
    { name: 'Affectionate', bgColor: '#FDDBF2', textColor: '#333333' },
    { name: 'Longing', bgColor: '#FFB8EA', textColor: '#333333' },
    { name: 'Desire', bgColor: '#FF73D5', textColor: '#EFF8FC' },
    { name: 'Tenderness', bgColor: '#D946A9', textColor: '#EFF8FC' },
    { name: 'Peaceful', bgColor: '#8C1C66', textColor: '#EFF8FC' },
  ],
  surprised: [
    { name: 'Stunned', bgColor: '#FDEBD2', textColor: '#333333' },
    { name: 'Confused', bgColor: '#F6C186', textColor: '#333333' },
    { name: 'Amazed', bgColor: '#D77C1B', textColor: '#EFF8FC' },
    { name: 'Overcome', bgColor: '#A85D10', textColor: '#EFF8FC' },
    { name: 'Moved', bgColor: '#753E08', textColor: '#EFF8FC' },
  ],
};

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

interface SubEmotionScreenProps {
  emotionId: string;
  rotation: number;
  onBack: () => void;
  onSelect: (sub: SubEmotion) => void;
  targetTimestamp?: number | null;
}

const SubEmotionScreen: React.FC<SubEmotionScreenProps> = ({ emotionId, rotation, onBack, onSelect, targetTimestamp }) => {
  const { onTouchStart, onTouchEnd } = useSwipeBack(onBack);
  const subEmotions = SUB_EMOTIONS[emotionId] || SUB_EMOTIONS.joyful;
  const emotionColor = EMOTION_COLORS[emotionId] || '#1D9357';
  const emotionName = emotionId === 'scared' ? 'fear' : emotionId === 'joyful' ? 'joy' : emotionId;

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
      {/* Header Container */}
      <div className="w-full max-w-[350px] z-[10]">
        <NavigationHeader 
          variant="centered" 
          title={targetTimestamp ? `Log for ${new Date(targetTimestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : "Check-in"} 
          onBack={handleBack} 
        />
      </div>

      {/* Main Title */}
      <div className="w-full max-w-[350px] flex flex-col justify-center z-[2]">
        <h1 className="w-full font-['Instrument Sans'] font-normal text-[30px] md:text-[40px] leading-[1.4] text-center tracking-[0.02em] text-[#151410] m-0 text-balance">
          What kind of <span className="font-bold" style={{ color: emotionColor }}>{emotionName}</span> are you&nbsp;feeling?
        </h1>
      </div>

      {/* Sub-Emotions Grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-[350px] z-[3] p-2">
        {subEmotions.map((sub, index) => {
          const isOddLast = index === subEmotions.length - 1 && subEmotions.length % 2 !== 0;
          return (
            <button 
              key={index}
              style={{ backgroundColor: sub.bgColor, color: sub.textColor }}
              onClick={() => onSelect(sub)}
              className={`flex items-center justify-center p-4 min-h-[5rem] rounded-[19px] border-none cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm ${isOddLast ? 'col-span-2 w-[calc(50%-0.5rem)] justify-self-center' : 'w-full'}`}
            >
              <span className="font-['Instrument Sans'] font-semibold text-base text-center leading-tight">
                {sub.name}
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
        <img src={emotionWheelBg} className="w-full h-full pointer-events-none select-none" style={{ transform: `rotate(${rotation}deg)` }} alt="" draggable={false} />
      </div>

    </div>
  );
};

export default SubEmotionScreen;
