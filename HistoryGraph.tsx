import React from 'react';
import { TIME_WINDOWS, getSessionDate, getTimeWindow } from './timeUtils';

// ── Combined emotion-mood icons from assets ─────────────────────────────────
// Joy
import joyGreat   from './joy-great.svg';
import joyGood    from './joy-good.svg';
import joyFine    from './joy-fine.svg';
import joyBad     from './joy-bad.svg';
import joyAwful   from './joy-awful.svg';

// Surprise
import surpriseGreat  from './surprise-great.svg';
import surpriseGood   from './surprise-good.svg';
import surpriseFine   from './surprise-fine.svg';
import surpriseBad    from './surprise-bad.svg';
import surpriseAwful  from './surprise-awful.svg';

// Fear / Scared
import fearGreat  from './fear-great.svg';
import fearGood   from './fear-good.svg';
import fearFine   from './fear-fine.svg';
import fearBad    from './fear-bad.svg';
import fearAwful  from './fear-awful.svg';

// Love
import loveGreat  from './love-great.svg';
import loveGood   from './love-good.svg';
import loveFine   from './love-fine.svg';
import loveBad    from './love-bad.svg';
import loveAwful  from './love-awful.svg';

// Sad
import sadGreat   from './sad-great.svg';
import sadGood    from './sad-good.svg';
import sadFine    from './sad-fine.svg';
import sadBad     from './sad-bad.svg';
import sadAwful   from './sad-awful.svg';

// Angry
import angryGreat from './angry-great.svg';
import angryGood  from './angry-good.svg';
import angryFine  from './angry-fine.svg';
import angryBad   from './angry-bad.svg';
import angryAwful from './angry-awful.svg';

// ── Icon lookup map: emotionId → mood → combined SVG ───────────────────────
const ICON_MAP: Record<string, Record<string, string>> = {
  joyful:    { Great: joyGreat,     Good: joyGood,     Fine: joyFine,     Bad: joyBad,     Awful: joyAwful     },
  surprised: { Great: surpriseGreat, Good: surpriseGood, Fine: surpriseFine, Bad: surpriseBad, Awful: surpriseAwful },
  scared:    { Great: fearGreat,    Good: fearGood,    Fine: fearFine,    Bad: fearBad,    Awful: fearAwful    },
  fear:      { Great: fearGreat,    Good: fearGood,    Fine: fearFine,    Bad: fearBad,    Awful: fearAwful    },
  love:      { Great: loveGreat,    Good: loveGood,    Fine: loveFine,    Bad: loveBad,    Awful: loveAwful    },
  sad:       { Great: sadGreat,     Good: sadGood,     Fine: sadFine,     Bad: sadBad,     Awful: sadAwful     },
  angry:     { Great: angryGreat,   Good: angryGood,   Fine: angryFine,   Bad: angryBad,   Awful: angryAwful   },
};

const getFallbackIcon = () => joyFine;

interface LogEntry {
  id: string;
  timestamp: number;
  emotionId: string;
  subEmotion: string;
  subSubEmotion: string;
  mood: string;
  note?: string;
}

interface HistoryGraphProps {
  logs: LogEntry[];
  isExpandedView?: boolean;
  onMissedCheckin?: (timestamp: number) => void;
  onLogClick?: (log: LogEntry) => void;
}

const HistoryGraph: React.FC<HistoryGraphProps> = ({ logs, isExpandedView, onMissedCheckin, onLogClick }) => {
  const now = Date.now();
  const currentSessionDateStr = getSessionDate(now);
  const currentSessionDateObj = new Date(currentSessionDateStr);
  const currentTimeWindow = getTimeWindow(now);
  const windowOrder = ['Morn', 'Aftn', 'Eve', 'Night'];

  // Start date for expanded history: March 27, 2026
  const START_DATE_HISTORY = new Date('2026-03-27T12:00:00Z');
  
  const calculateDaysSinceStart = () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const diffTime = today.getTime() - START_DATE_HISTORY.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both ends
    return Math.max(diffDays, 1);
  };

  const rowCount = isExpandedView ? calculateDaysSinceStart() : 4;

  const rows = Array.from({ length: rowCount }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(12, 0, 0, 0);
    const sessionDateString = getSessionDate(d.getTime());
    const label = i === 0
      ? 'Today'
      : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return { sessionDateString, label };
  });

  return (
    <div className={`w-full h-full bg-white select-none flex flex-col items-center ${isExpandedView ? 'overflow-y-auto max-h-[60vh] custom-scrollbar' : 'overflow-hidden'}`}>
      <div className="grid grid-cols-[60px_repeat(4,60px)] w-fit pb-4">


        {/* ── Header row ─────────────────────────────────────────────────── */}
        <div className="h-10 border-b border-r border-[#ECECEC]" />
        {TIME_WINDOWS.map(window => (
          <div
            key={window.label}
            className="h-10 border-b border-[#ECECEC] font-['Instrument_Sans'] font-medium text-[12px] text-[#5A5959] flex items-center justify-center"
          >
            {window.label}
          </div>
        ))}

        {/* ── Data rows ──────────────────────────────────────────────────── */}
        {rows.map(row => (
          <React.Fragment key={row.label}>
            {/* Date label */}
            <div className="w-[60px] h-16 border-r border-b border-r-[#ECECEC] border-b-[#ECECEC]/30 font-['Instrument_Sans'] font-medium text-[12px] text-[#5A5959] flex items-center justify-center">
              {row.label}
            </div>

            {/* Window cells — always 4 for grid stability */}
            {TIME_WINDOWS.map(window => {
              const log = logs.find(l =>
                getSessionDate(l.timestamp) === row.sessionDateString &&
                getTimeWindow(l.timestamp) === window.label
              );

              // ── Placeholder (no log) ───────────────────────────────────
              if (!log) {
                const isPast = (() => {
                  const rowSessionObj = new Date(row.sessionDateString);
                  if (rowSessionObj.getTime() < currentSessionDateObj.getTime()) return true;
                  if (rowSessionObj.getTime() > currentSessionDateObj.getTime()) return false;
                  return windowOrder.indexOf(window.label) < windowOrder.indexOf(currentTimeWindow);
                })();

                const isClickable =
                  isPast ||
                  (row.sessionDateString === currentSessionDateStr &&
                    windowOrder.indexOf(window.label) === windowOrder.indexOf(currentTimeWindow));

                const handleCheckin = () => {
                  if (onMissedCheckin && isClickable) {
                    const rowDate = new Date(row.sessionDateString);
                    const wDef = TIME_WINDOWS.find(w => w.label === window.label);
                    if (wDef) {
                      rowDate.setHours(wDef.startHour + 1, 0, 0, 0);
                      onMissedCheckin(rowDate.getTime());
                    }
                  }
                };

                return (
                  <div key={window.label} className="border-b border-[#ECECEC]/30 h-16 flex items-center justify-center p-0">
                    {/* Always render 64×64 container so columns never collapse */}
                    <div className="w-16 h-16 flex items-center justify-center">
                      <div
                        onClick={isClickable ? handleCheckin : undefined}
                        className={`border border-dashed border-[#E2E8F0] rounded-[8px] transition-colors flex items-center justify-center
                          ${isClickable ? 'cursor-pointer hover:bg-[#F8FAFC]' : 'opacity-30 cursor-default'}`}
                        style={{ width: '36px', height: '36px' }}
                      >
                        <span className="text-[#94A3B8] text-[20px] font-medium leading-none">+</span>
                      </div>
                    </div>
                  </div>
                );
              }

              // ── Logged entry — use combined icon at native 57×44px ──
              const icon =
                ICON_MAP[log.emotionId]?.[log.mood] ?? getFallbackIcon();

              return (
                <div
                  key={window.label}
                  className="border-b border-[#ECECEC]/30 h-16 flex items-center justify-center p-0 cursor-pointer active:bg-gray-50 transition-colors overflow-visible"
                  onClick={() => onLogClick?.(log)}
                >
                  {/* Shift icon so emotion face center lands at cell center (+7px, -6px compensates the face's offset within the 57×44 canvas) */}
                  <div
                    className="hover:scale-105 transition-transform duration-200"
                    style={{ lineHeight: 0, transform: 'translate(7px, -6px)' }}
                  >
                    <img
                      src={icon}
                      alt={`${log.emotionId}-${log.mood}`}
                      style={{ width: '57px', height: '44px', display: 'block' }}
                    />
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default HistoryGraph;
