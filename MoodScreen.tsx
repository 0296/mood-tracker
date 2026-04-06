import React, { useState, useRef } from 'react';
import backIcon from './back.svg';
import moodRangeSvg from './Mood range.svg';
import moodIndicatorSvg from './mood-Indicator.svg';
import emotionWheelBg from './emotion wheel.svg';
import { useSwipeBack } from './useSwipeBack';
import NavigationHeader from './NavigationHeader';

// The 5 moods mapped to angles on the semicircle (left=-90deg, right=+90deg)
const MOODS = [
  { label: 'Great', angle: -90 },
  { label: 'Good',  angle: -45 },
  { label: 'Fine',  angle: 0   },
  { label: 'Bad',   angle: 45  },
  { label: 'Awful', angle: 90  },
];

// Starting angle for "Fine" (centre)
const DEFAULT_ANGLE = 0;

// Clamp helper
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

// Snap to nearest mood angle
const snapToMood = (angle: number) => {
  let closest = MOODS[0];
  let minDist = Math.abs(angle - MOODS[0].angle);
  for (const mood of MOODS) {
    const dist = Math.abs(angle - mood.angle);
    if (dist < minDist) { minDist = dist; closest = mood; }
  }
  return closest;
};

interface MoodScreenProps {
  emotionId: string;
  subEmotionName: string;
  subSubEmotionName: string;
  rotation: number;
  onBack: () => void;
  onNext: (mood: string) => void;
  targetTimestamp?: number | null;
}

const EMOTION_DISPLAY_NAMES: Record<string, string> = {
  joyful: 'Joyful', surprised: 'Surprised', angry: 'Angry',
  scared: 'Fear',   love: 'Love',            sad: 'Sadness',
};

const MoodScreen: React.FC<MoodScreenProps> = ({
  emotionId, subEmotionName, subSubEmotionName, rotation, onBack, onNext, targetTimestamp
}) => {
  const { onTouchStart, onTouchEnd } = useSwipeBack(onBack);
  const primaryName = EMOTION_DISPLAY_NAMES[emotionId] || 'Feeling';

  // Indicator needle angle state
  const [needleAngle, setNeedleAngle] = useState(DEFAULT_ANGLE);
  const [activeMood, setActiveMood] = useState(MOODS[2]); // "Fine" by default

  // Drag state
  const isDragging = useRef(false);
  const gaugeRef   = useRef<HTMLDivElement>(null);

  // The gauge center in screen coordinates (computed on drag start)
  const gaugeCx = useRef(0);
  const gaugeCy = useRef(0);

  const updateFromPointer = (clientX: number, clientY: number) => {
    const dx = clientX - gaugeCx.current;
    const dy = clientY - gaugeCy.current;

    // atan2: 0° = right, 90° = down. We want 0° = up (12 o'clock) = base of needle.
    // The gauge is a semicircle opening upward, centre at bottom.
    // Needle rotates from -90° (left) to +90° (right).
    // angle from centre: atan2(-dy, dx) gives angle from right-horizontal going CCW.
    // We want angle from straight-up going CW.
    // Actually: pointer angle = atan2(dx, -dy)  => straight up = 0, right = 90.
    const rawAngle = Math.atan2(dx, -dy) * (180 / Math.PI);
    const clamped  = clamp(rawAngle, -90, 90);
    setNeedleAngle(clamped);
    const snapped = snapToMood(clamped);
    setActiveMood(snapped);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    if (gaugeRef.current) {
      const rect = gaugeRef.current.getBoundingClientRect();
      // Centre of the gauge arc: horizontally centre, vertically slightly above bottom
      gaugeCx.current = rect.left + rect.width / 2;
      gaugeCy.current = rect.bottom - 20;
    }
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    // Snap needle to nearest mood
    setNeedleAngle(activeMood.angle);
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden box-border select-none flex flex-col items-center isolation-isolate"
      style={{ padding: '20px 16px 60px', gap: '2.5rem' }}
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

      {/* Content */}
      <div className="flex flex-col items-center gap-10 w-full max-w-[350px] z-[2]">

        {/* Title */}
        <h1 className="w-full font-['Instrument_Sans'] font-normal text-[30px] md:text-[40px] leading-[1.4] text-center tracking-[0.02em] text-[#151410] m-0 text-balance">
          How's your overall&nbsp;mood?
        </h1>

        {/* Mood gauge area */}
        <div className="flex flex-col items-center gap-6 w-full">

          {/* The semicircular gauge */}
          <div
            ref={gaugeRef}
            className="relative w-[340.46px] h-[170.5px] flex-none"
          >
            {/* Mood range SVG arc — also clickable to snap needle */}
            <img
              src={moodRangeSvg}
              className="absolute inset-0 w-full h-full select-none cursor-pointer"
              alt="Mood range"
              draggable={false}
              onClick={(e) => {
                if (!gaugeRef.current) return;
                const rect = gaugeRef.current.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.bottom - 20;
                const dx = e.clientX - cx;
                const dy = e.clientY - cy;
                const rawAngle = Math.atan2(dx, -dy) * (180 / Math.PI);
                const clamped = clamp(rawAngle, -90, 90);
                const snapped = snapToMood(clamped);
                setNeedleAngle(snapped.angle);
                setActiveMood(snapped);
              }}
            />

            {/* Needle indicator — pivots from the bottom-centre of the gauge */}
            {/* The SVG is 32×81: needle tip is at top, pivot circle at bottom (cy=65) */}
            {/* We offset so the pivot (circle centre) sits at the arc centre */}
            <div
              className="absolute cursor-grab active:cursor-grabbing touch-none flex items-start justify-center z-20"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                // Position pivot point (which is at 65px) slightly above the bottom-center 
                left:  '50%',
                top:   'calc(100% - 85px)',
                // Translate so the pivot point aligns
                transform: `translateX(-50%) rotate(${needleAngle}deg)`,
                transformOrigin: '50% 65px', // pivot = circle centre inside the SVG
                transition: isDragging.current ? 'none' : 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                width: '64px',
                height: '81px',
              }}
            >
              <img src={moodIndicatorSvg} className="w-[32px] h-[81px] pointer-events-none" style={{ transform: 'scale(1.15)', transformOrigin: '50% 65px' }} alt="Indicator" draggable={false} />
            </div>
          </div>



          {/* Active Mood label */}
          <p
            className="font-['Instrument_Sans'] font-semibold text-[20px] leading-[47px] text-center text-[#151410] w-full capitalize m-0"
          >
            {activeMood.label}!
          </p>

        </div>

        {/* Submit button */}
        <button
          onClick={() => onNext(activeMood.label)}
          className="box-border flex flex-col items-center py-3 px-4 gap-3 w-full max-w-[310px] h-[46px] bg-white border border-[#C9C9C9] rounded-[34px] cursor-pointer transition-all hover:bg-gray-50 active:scale-95"
        >
          <span className="font-['Instrument_Sans'] font-medium text-lg leading-[22px] text-[#151410]">
            Next
          </span>
        </button>
      </div>

      {/* Blurred wheel decoration at bottom */}
      <div
        className="absolute w-[505px] h-[505px] left-1/2 -translate-x-1/2 pointer-events-none z-0"
        style={{
          top: '80%',
          opacity: 0.3,
          filter: 'blur(2px)'
        }}
      >
        <img src={emotionWheelBg} className="w-full h-full" style={{ transform: `rotate(${rotation}deg)` }} alt="" />
      </div>
    </div>
  );
};

export default MoodScreen;
