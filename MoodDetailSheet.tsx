import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Assets
import closeIcon from './close.svg';
import editIcon from './Edit 5.svg';
import noteIcon from './note.svg';

// Import individual emotion icons
import joyfulIcon from './joyful.svg';
import surprisedIcon from './surprised.svg';
import scaredIcon from './fear.svg';
import sadIcon from './sad.svg';
import loveIcon from './love.svg';
import angryIcon from './angry.svg';

// Import mood SVGs
import greatIcon from './great.svg';
import goodIcon from './good.svg';
import fineIcon from './fine.svg';
import badIcon from './bad.svg';
import awfulIcon from './awful.svg';

interface LogEntry {
  id: string;
  timestamp: number;
  emotionId: string;
  subEmotion: string;
  subSubEmotion: string;
  mood: string;
  note?: string;
}

interface MoodDetailSheetProps {
  log: LogEntry;
  onClose: () => void;
  onEditFeeling?: (log: LogEntry) => void;
  onEditMood?: (log: LogEntry) => void;
  onEditNote?: (log: LogEntry) => void;
}

const EMOTION_ICON_MAP: Record<string, string> = {
  joyful: joyfulIcon,
  surprised: surprisedIcon,
  scared: scaredIcon,
  fear: scaredIcon,
  love: loveIcon,
  sad: sadIcon,
  angry: angryIcon,
};

const MOOD_ICON_MAP: Record<string, string> = {
  'Great': greatIcon,
  'Good': goodIcon,
  'Fine': fineIcon,
  'Bad': badIcon,
  'Awful': awfulIcon,
};

const EMOTION_DISPLAY_NAMES: Record<string, string> = {
  joyful: 'Joyful', surprised: 'Surprised', angry: 'Angry',
  scared: 'Scared', fear: 'Scared', love: 'Love', sad: 'Sad',
};

const MoodDetailSheet: React.FC<MoodDetailSheetProps> = ({ 
  log, 
  onClose, 
  onEditFeeling, 
  onEditMood, 
  onEditNote 
}) => {
  const timeStr = new Date(log.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const emotionDisplayName = EMOTION_DISPLAY_NAMES[log.emotionId] || log.emotionId;
  const emotionIcon = EMOTION_ICON_MAP[log.emotionId] || joyfulIcon;
  const moodIcon = MOOD_ICON_MAP[log.mood] || goodIcon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
        {/* Backdrop */}
        <motion.div 
          className="absolute inset-0 bg-[#151410]/40 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Bottom Sheet */}
        <motion.div 
          className="relative w-full max-w-[390px] h-[421px] bg-white rounded-t-[32px] p-6 pb-[54px] pointer-events-auto shadow-[0px_-4px_20px_rgba(0,0,0,0.15)] flex flex-col items-start gap-4"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          {/* Header Row */}
          <div className="flex flex-row justify-between items-center w-full h-[47px]">
            <h2 className="font-['Instrument Sans'] font-medium text-[20px] leading-[47px] tracking-[0.02em] text-[#151410] m-0">
              Recorded at <span className="font-semibold">{timeStr}</span>
            </h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center p-0 border-none bg-transparent cursor-pointer hover:opacity-70 transition-opacity"
            >
              <img src={closeIcon} className="w-[32px] h-[32px]" alt="Close" />
            </button>
          </div>

          {/* Separator */}
          <div className="w-full h-0 border-b border-[#ECECEC]"></div>

          {/* Content Sections Area */}
          <div className="flex flex-col items-start w-full gap-8 mt-2 overflow-y-auto">
            
            {/* Emotion Section */}
            <div className="flex flex-row items-center w-full gap-5">
              <div className="w-[60px] h-[60px] flex-none relative flex items-center justify-center">
                <img src={emotionIcon} className="w-[44px] h-[44px] object-contain" alt="Feeling" />
              </div>
              <div className="flex flex-col items-start flex-1 gap-1">
                <span className="font-['Instrument Sans'] font-medium text-[14px] leading-[1.2] text-[#5A5959]">
                  Feeling
                </span>
                <span className="font-['Instrument Sans'] font-medium italic text-[16px] leading-[1.2] text-[#151410]">
                  {emotionDisplayName}, {log.subEmotion} & {log.subSubEmotion}!
                </span>
              </div>
              <button 
                onClick={() => onEditFeeling && onEditFeeling(log)}
                className="w-6 h-6 flex-none p-0 border-none bg-transparent cursor-pointer flex items-center justify-center transition-transform active:scale-95"
              >
                <img src={editIcon} className="w-full h-full" alt="Edit" />
              </button>
            </div>

            {/* Mood Section */}
            <div className="flex flex-row items-center w-full gap-5">
              <div className="w-[60px] h-[60px] flex-none flex items-center justify-center">
                <img 
                  src={moodIcon} 
                  className="w-[48px] h-[48px] object-contain" 
                  style={{ mixBlendMode: 'multiply' }} 
                  alt="Mood" 
                />
              </div>
              <div className="flex flex-col items-start flex-1 gap-1">
                <span className="font-['Instrument Sans'] font-medium text-[14px] leading-[1.2] text-[#5A5959]">
                  Mood
                </span>
                <span className="font-['Instrument Sans'] font-medium italic text-[16px] leading-[1.2] text-[#151410]">
                  {log.mood}
                </span>
              </div>
              <button 
                onClick={() => onEditMood && onEditMood(log)}
                className="w-6 h-6 flex-none p-0 border-none bg-transparent cursor-pointer flex items-center justify-center transition-transform active:scale-95"
              >
                <img src={editIcon} className="w-full h-full" alt="Edit" />
              </button>
            </div>

            {/* Context Section */}
            <div className="flex flex-row items-center w-full gap-5">
              <div className="w-[60px] h-[60px] flex-none flex items-center justify-center">
                <img src={noteIcon} className="w-[48px] h-[48px] object-contain" alt="Note" />
              </div>
              <div className="flex flex-col items-start flex-1 gap-1">
                <span className="font-['Instrument Sans'] font-medium text-[14px] leading-[1.2] text-[#5A5959]">
                  Note
                </span>
                <span className="font-['Instrument Sans'] font-medium italic text-[16px] leading-[1.4] text-[#151410] text-balance">
                  {log.note || "No note recorded."}
                </span>
              </div>
              <button 
                onClick={() => onEditNote && onEditNote(log)}
                className="w-6 h-6 flex-none p-0 border-none bg-transparent cursor-pointer flex items-center justify-center mt-1 transition-transform active:scale-95"
              >
                <img src={editIcon} className="w-full h-full" alt="Edit" />
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MoodDetailSheet;
