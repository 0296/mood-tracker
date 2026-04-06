import { useState } from 'react'
import addIcon from './add.svg'
import graphIcon from './graph.svg'
import cheerfulEmoji from './cheerful-emoji.svg'
import happyEmoji from './happy-emoji.svg'
import sadEmoji from './sad-emoji.svg'
import unhappyEmoji from './unhappy-emoji.svg'
import arrowForwardIcon from './arrow_forward.svg'
import { useEffect } from 'react'

import { getSessionDate, getTimeWindow } from './timeUtils'
import EmotionsScreen from './EmotionsScreen'
import SubEmotionScreen, { SUB_EMOTIONS, SubEmotion } from './SubEmotionScreen'
import SubSubEmotionScreen from './SubSubEmotionScreen'
import MoodScreen from './MoodScreen'
import InputFeelingScreen from './InputFeelingScreen'
import HistoryGraph from './HistoryGraph'
import MoodHistoryScreen from './MoodHistoryScreen'
import MoodDetailSheet from './MoodDetailSheet'

const SCREEN_ORDER = ['home', 'emotions', 'sub-emotion', 'sub-sub-emotion', 'mood', 'input-feeling', 'history'] as const;
type ScreenName = (typeof SCREEN_ORDER)[number];

interface LogEntry {
  id: string;
  timestamp: number;
  emotionId: string;
  subEmotion: string;
  subSubEmotion: string;
  mood: string;
  note?: string;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home')
  const [selectedEmotionId, setSelectedEmotionId] = useState<string>('joyful')
  const [selectedSubEmotion, setSelectedSubEmotion] = useState<SubEmotion | null>(null)
  const [selectedSubSubEmotion, setSelectedSubSubEmotion] = useState<string>('')
  const [wheelRotation, setWheelRotation] = useState<number>(0)
  const [selectedMood, setSelectedMood] = useState<string>('Fine')
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('mood-logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successBannerText, setSuccessBannerText] = useState('Check-in successful!');
  const [pendingLog, setPendingLog] = useState<LogEntry | null>(null);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [targetTimestamp, setTargetTimestamp] = useState<number | null>(null);
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<LogEntry | null>(null);
  const [editMode, setEditMode] = useState<'feeling' | 'mood' | 'note' | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notifications-enabled') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('mood-logs', JSON.stringify(logs));
  }, [logs]);

  // Sync notification state with Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SET_NOTIFICATIONS_ENABLED',
        enabled: notificationsEnabled
      });
    }
  }, [notificationsEnabled, currentScreen]); // Sync on screen change to catch controller ready

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Please enable notification permissions in your browser settings to receive reminders.');
        return;
      }
    }
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    localStorage.setItem('notifications-enabled', String(newState));
  };

  const handleNavigation = (screen: ScreenName, delay = 0) => {
    setSelectedLogForDetail(null);
    if (screen === 'home' || screen === 'history') {
      setTargetTimestamp(null);
      setEditMode(null);
    }
    if (delay > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentScreen(screen);
        setIsTransitioning(false);
      }, delay);
    } else {
      setCurrentScreen(screen);
    }
  };

  const handleMissedCheckin = (timestamp: number) => {
    setTargetTimestamp(timestamp);
    setEditMode(null);
    handleNavigation('emotions');
  };

  const handleEditFeeling = (log: LogEntry) => {
    setTargetTimestamp(log.timestamp);
    setEditMode('feeling');
    setSelectedEmotionId(log.emotionId);
    
    // Restore SubEmotion object from name
    const subs = SUB_EMOTIONS[log.emotionId] || [];
    const subObj = subs.find((s: SubEmotion) => s.name === log.subEmotion) || subs[0];
    setSelectedSubEmotion(subObj);
    
    setSelectedSubSubEmotion(log.subSubEmotion);
    setSelectedMood(log.mood);
    handleNavigation('emotions');
  };

  const handleEditMood = (log: LogEntry) => {
    setTargetTimestamp(log.timestamp);
    setEditMode('mood');
    setSelectedEmotionId(log.emotionId);
    const subs = SUB_EMOTIONS[log.emotionId] || [];
    const subObj = subs.find((s: SubEmotion) => s.name === log.subEmotion) || subs[0];
    setSelectedSubEmotion(subObj);
    setSelectedSubSubEmotion(log.subSubEmotion);
    setSelectedMood(log.mood);
    handleNavigation('mood');
  };

  const handleEditNote = (log: LogEntry) => {
    setTargetTimestamp(log.timestamp);
    setEditMode('note');
    setSelectedEmotionId(log.emotionId);
    const subs = SUB_EMOTIONS[log.emotionId] || [];
    const subObj = subs.find((s: SubEmotion) => s.name === log.subEmotion) || subs[0];
    setSelectedSubEmotion(subObj);
    setSelectedSubSubEmotion(log.subSubEmotion);
    setSelectedMood(log.mood);
    handleNavigation('input-feeling');
  };

  const addLog = (note?: string) => {
    const timestamp = targetTimestamp ?? Date.now();
    const sessionDate = getSessionDate(timestamp);
    const timeWindow = getTimeWindow(timestamp);

    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: timestamp,
      emotionId: selectedEmotionId,
      subEmotion: selectedSubEmotion?.name || '',
      subSubEmotion: selectedSubSubEmotion,
      mood: selectedMood,
      note
    };

    // Check for collision
    const existingIndex = logs.findIndex(log => 
      getSessionDate(log.timestamp) === sessionDate && 
      getTimeWindow(log.timestamp) === timeWindow
    );

    if (editMode && existingIndex !== -1) {
      // In edit mode, we just save over the existing one
      saveLog(newLog, existingIndex);
    } else if (existingIndex !== -1) {
      // Collision detected in normal check-in
      setPendingLog(newLog);
      setShowOverwriteConfirm(true);
    } else {
      // No collision, save directly
      saveLog(newLog);
    }
  };

  const saveLog = (logToSave: LogEntry, overwriteIndex?: number) => {
    if (overwriteIndex !== undefined && overwriteIndex !== -1) {
      setLogs(prev => {
        const newLogs = [...prev];
        newLogs[overwriteIndex] = logToSave;
        return newLogs.sort((a, b) => b.timestamp - a.timestamp);
      });
    } else {
      setLogs(prev => [logToSave, ...prev]);
    }
    
    setSuccessBannerText(editMode ? 'Check-in updated' : 'Check-in successful!');
    setShowSuccess(true);
    setTargetTimestamp(null);
    setEditMode(null);
    handleNavigation('home');
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleConfirmOverwrite = () => {
    if (!pendingLog) return;
    
    const sessionDate = getSessionDate(pendingLog.timestamp);
    const timeWindow = getTimeWindow(pendingLog.timestamp);
    const existingIndex = logs.findIndex(log => 
      getSessionDate(log.timestamp) === sessionDate && 
      getTimeWindow(log.timestamp) === timeWindow
    );

    saveLog(pendingLog, existingIndex);
    setShowOverwriteConfirm(false);
    setPendingLog(null);
  };

  const handleCancelOverwrite = () => {
    setShowOverwriteConfirm(false);
    setPendingLog(null);
    setEditMode(null);
    handleNavigation('home');
  };

  const EMOTION_GRADIENTS: Record<string, string> = {
    joyful: 'linear-gradient(179.83deg, #E8FFF3 3.15%, #F1F5FE 101.91%)',
    surprised: 'linear-gradient(179.83deg, #FFF1E2 3.15%, #F1F5FE 101.91%)',
    angry: 'linear-gradient(179.83deg, #FFE2E2 3.15%, #F1F5FE 101.91%)',
    scared: 'linear-gradient(179.83deg, #FFF7E4 3.15%, #F1F5FE 101.91%)',
    love: 'linear-gradient(179.83deg, #FFE3F7 3.15%, #F1F5FE 101.91%)',
    sad: 'linear-gradient(179.83deg, #E1EAFF 3.15%, #F1F5FE 101.91%)',
  };

  const HOME_GRADIENT = 'linear-gradient(179.83deg, #FCF3F9 3.15%, #F1F5FE 101.91%)';
  const getEmotionGradient = (id: string) => EMOTION_GRADIENTS[id] || EMOTION_GRADIENTS.joyful;

  const getScreenPositionClasses = (screenName: ScreenName) => {
    const activeIndex = SCREEN_ORDER.indexOf(currentScreen);
    const screenIndex = SCREEN_ORDER.indexOf(screenName);

    if (screenIndex === activeIndex) {
      return "opacity-100 translate-x-0 scale-100 z-10 pointer-events-auto";
    } else if (screenIndex < activeIndex) {
      // Behind (Push to left)
      return "opacity-0 -translate-x-20 scale-95 z-0 pointer-events-none";
    } else {
      // Ahead (Wait at right)
      return "opacity-0 translate-x-full scale-100 z-20 pointer-events-none";
    }
  };

  return (
    <div 
      className="relative w-full max-w-[430px] h-screen mx-auto overflow-hidden box-border isolation-isolate bg-white shadow-xl lg:shadow-[0_0_50px_rgba(0,0,0,0.1)]"
    >
      {/* Home Screen Layer */}
      <div 
        className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${getScreenPositionClasses('home')}`}
        style={{ background: HOME_GRADIENT }}
      >
        {/* Background Emojis - Responsive positions */}
        <img src={happyEmoji} className="absolute top-[-2%] right-[-5%] w-[30%] max-w-[116px] aspect-square z-[2] animate-float opacity-60" alt="" />

        <div className="relative z-10 flex flex-col gap-[8%] px-[16px] pb-[60px] pt-[20px] overflow-y-auto h-full">
          {/* Header */}
          <div className="flex flex-row justify-between items-start w-full">
            <div className="flex flex-col gap-1">
              <h1 className="font-semibold text-4xl leading-[45px] bg-gradient-to-r from-purple-gradient-from via-purple-gradient-via to-purple-gradient-to bg-clip-text text-transparent">
                Hi, Ayushi!
              </h1>
              <h2 className="font-normal text-2xl leading-[45px] text-[#151410]">
                What's on your mind?
              </h2>
            </div>
            
            {/* Notification Toggle */}
            <div 
              onClick={handleToggleNotifications}
              className="flex flex-col items-end gap-1 mt-2 cursor-pointer group"
            >
              <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${notificationsEnabled ? 'bg-[#A45EFF]' : 'bg-[#E5E7EB]'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
              <span className="text-[10px] font-medium text-[#5A5959] tracking-wider uppercase">
                Reminders
              </span>
            </div>
          </div>

          {/* Content Container */}
          <div className="flex flex-col gap-8 w-full flex-1 -mt-2">
            {/* Daily Mood Log */}
            <div className="flex flex-col gap-3 w-full">
              <h3 className="font-medium text-lg leading-[25px] tracking-[0.02em] text-[#5A5959]">
                Daily mood log
              </h3>
              <div 
                onClick={() => handleNavigation('emotions', 400)}
                className="w-full h-[164px] p-[2px] rounded-[22px] animate-border-flow transition-all hover:scale-105 group/border cursor-pointer shadow-[0px_10px_30px_rgba(83,73,70,0.05)]"
              >
                <div className="flex flex-col justify-center items-center gap-2 w-full h-[160px] bg-white rounded-[20px] group">
                  <div className="relative w-[40px] h-[40px] flex items-center justify-center transition-transform group-hover:scale-110">
                    <img src={addIcon} className="w-full h-full" alt="Add" />
                  </div>
                  <span className="font-medium text-base leading-[45px] tracking-[0.02em] text-[#605E5C]">
                    Check-in
                  </span>
                </div>
              </div>
            </div>

            {/* Your Mood History */}
            <div className="flex flex-col gap-3 w-full flex-1 min-h-[300px]">
              <div className="flex flex-row justify-between items-center w-full">
                <h3 className="font-medium text-lg leading-[25px] tracking-[0.02em] text-[#5A5959]">
                  Your mood history
                </h3>
                {logs.length > 0 && (
                  <div 
                    className="flex flex-row items-center gap-2 cursor-pointer group/view"
                    onClick={() => handleNavigation('history')}
                  >
                    <span className="font-medium text-base text-[#A45EFF]">View all</span>
                    <div className="flex items-center justify-center transition-transform group-hover/view:translate-x-1">
                       <img src={arrowForwardIcon} className="w-5 h-5" alt="View all" />
                    </div>
                  </div>
                )}
              </div>
              
              {logs.length === 0 ? (
                <div className="flex flex-col justify-center items-center py-[41px] px-[15%] gap-2 w-full flex-1 bg-white border border-[#CAD5E2] shadow-[0px_4px_10px_rgba(83,73,70,0.15)] rounded-[12px]">
                  <div className="relative w-[50px] h-[51px] flex items-center justify-center mb-1">
                     <img src={graphIcon} className="w-full h-full opacity-40" alt="History" />
                  </div>
                  <span className="w-full text-center h-[25px] font-semibold text-lg leading-[25px] tracking-[0.02em] text-[#151410]">
                    No history yet
                  </span>
                  <p className="w-[213px] h-[40px] font-normal text-sm leading-[20px] text-center tracking-[0.02em] text-[#777777]">
                    Start logging your moods to see trends and patterns over time
                  </p>
                </div>
              ) : (
                <div className="w-full bg-white border border-[#CAD5E2] shadow-[0px_4px_10px_rgba(83,73,70,0.15)] rounded-[12px] p-2 flex flex-col items-center justify-center min-h-[342px]">
                   <HistoryGraph 
                     logs={logs} 
                     onMissedCheckin={handleMissedCheckin} 
                     onLogClick={setSelectedLogForDetail}
                   />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emotions Screen Layer */}
      <div 
        className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${getScreenPositionClasses('emotions')}`}
        style={{ background: getEmotionGradient(selectedEmotionId) }}
      >
        <EmotionsScreen 
          initialEmotionId={selectedEmotionId}
          initialRotation={wheelRotation}
          targetTimestamp={targetTimestamp}
          onBack={() => handleNavigation('home')} 
          onEmotionChange={setSelectedEmotionId}
          onNext={(id, rotation) => {
            setSelectedEmotionId(id);
            setWheelRotation(rotation);
            handleNavigation('sub-emotion');
          }} 
        />
      </div>

      {/* Sub-Emotion Screen Layer */}
      <div 
        className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${getScreenPositionClasses('sub-emotion')}`}
        style={{ background: getEmotionGradient(selectedEmotionId) }}
      >
        <SubEmotionScreen 
          emotionId={selectedEmotionId} 
          rotation={wheelRotation}
          targetTimestamp={targetTimestamp}
          onBack={() => {
            handleNavigation('emotions');
          }} 
          onSelect={(sub: SubEmotion) => {
            setSelectedSubEmotion(sub);
            handleNavigation('sub-sub-emotion');
          }}
        />
      </div>

      {/* Sub-Sub-Emotion Screen Layer */}
      <div 
        className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${getScreenPositionClasses('sub-sub-emotion')}`}
        style={{ background: getEmotionGradient(selectedEmotionId) }}
      >
        {selectedSubEmotion && (
          <SubSubEmotionScreen
            emotionId={selectedEmotionId}
            parentSubEmotion={selectedSubEmotion}
            rotation={wheelRotation}
            targetTimestamp={targetTimestamp}
            onBack={() => handleNavigation('sub-emotion')}
            onNext={(subsub: string) => {
              setSelectedSubSubEmotion(subsub);
              if (editMode === 'feeling') {
                // End flow here for feeling edit
                // We construct the log with existing mood/note
                const existingLog = logs.find(l => l.timestamp === targetTimestamp);
                const timestamp = targetTimestamp ?? Date.now();
                const newLog: LogEntry = {
                  id: existingLog?.id || Date.now().toString(),
                  timestamp: timestamp,
                  emotionId: selectedEmotionId,
                  subEmotion: selectedSubEmotion?.name || '',
                  subSubEmotion: subsub,
                  mood: existingLog?.mood || selectedMood,
                  note: existingLog?.note
                };
                const idx = logs.findIndex(l => l.timestamp === targetTimestamp);
                saveLog(newLog, idx);
              } else {
                handleNavigation('mood');
              }
            }}
          />
        )}
      </div>

      {/* Mood Screen Layer */}
      <div 
        className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${getScreenPositionClasses('mood')}`}
        style={{ background: getEmotionGradient(selectedEmotionId) }}
      >
        {selectedSubEmotion && (
          <MoodScreen
            emotionId={selectedEmotionId}
            subEmotionName={selectedSubEmotion.name}
            subSubEmotionName={selectedSubSubEmotion}
            rotation={wheelRotation}
            targetTimestamp={targetTimestamp}
            onBack={() => handleNavigation('sub-sub-emotion')}
            onNext={(mood: string) => {
              setSelectedMood(mood);
              if (editMode === 'mood') {
                const existingLog = logs.find(l => l.timestamp === targetTimestamp);
                const timestamp = targetTimestamp ?? Date.now();
                const newLog: LogEntry = {
                  id: existingLog?.id || Date.now().toString(),
                  timestamp: timestamp,
                  emotionId: selectedEmotionId,
                  subEmotion: selectedSubEmotion?.name || '',
                  subSubEmotion: selectedSubSubEmotion,
                  mood: mood,
                  note: existingLog?.note
                };
                const idx = logs.findIndex(l => l.timestamp === targetTimestamp);
                saveLog(newLog, idx);
              } else {
                handleNavigation('input-feeling');
              }
            }}
          />
        )}
      </div>

      {/* Input Feeling Screen Layer */}
      <div 
        className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${getScreenPositionClasses('input-feeling')}`}
        style={{ background: getEmotionGradient(selectedEmotionId) }}
      >
        {selectedSubEmotion && (
          <InputFeelingScreen
            emotionId={selectedEmotionId}
            subEmotionName={selectedSubEmotion.name}
            subSubEmotionName={selectedSubSubEmotion}
            mood={selectedMood}
            rotation={wheelRotation}
            targetTimestamp={targetTimestamp}
            onBack={() => handleNavigation('mood')}
            onSubmit={addLog}
          />
        )}
      </div>

      {/* Mood History Screen Layer */}
      <div 
        className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${getScreenPositionClasses('history')}`}
        style={{ background: HOME_GRADIENT }}
      >
        <MoodHistoryScreen 
          logs={logs} 
          onBack={() => handleNavigation('home')} 
          onMissedCheckin={handleMissedCheckin}
          onLogClick={setSelectedLogForDetail}
        />
      </div>

      {/* Success Banner */}
      <div 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-out transform ${showSuccess ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
      >
        <div className="max-w-[400px] mx-auto mt-4 px-4">
          <div className="p-4 bg-[#48C786] rounded-2xl shadow-lg flex flex-row items-center gap-3">
             <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-1.5 border-b-2 border-l-2 border-[#48C786] -rotate-45 -mt-0.5"></div>
             </div>
             <span className="font-['Instrument Sans'] font-semibold text-white text-lg">
               {successBannerText}
             </span>
          </div>
        </div>
      </div>

      {/* Overwrite Confirmation Modal */}
      {showOverwriteConfirm && pendingLog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 animate-fade-in">
          <div className="w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-2xl flex flex-col gap-6 animate-scale-in">
            <div className="flex flex-col gap-2 text-center">
              <h3 className="font-semibold text-xl text-[#151410] font-['Instrument Sans']">
                Update {getTimeWindow(pendingLog.timestamp)}?
              </h3>
              <p className="text-sm text-[#777777] leading-relaxed tracking-wide">
                You've already logged a mood for this period. Would you like to overwrite it with your current mood?
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleConfirmOverwrite}
                className="w-full h-[52px] bg-[#A45EFF] hover:bg-[#8d4ee0] text-white rounded-xl font-semibold text-lg transition-colors shadow-md"
              >
                Yes, update it
              </button>
              <button 
                onClick={handleCancelOverwrite}
                className="w-full h-[52px] bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#5A5959] rounded-xl font-medium text-lg transition-colors border border-[#ECECEC]"
              >
                No, cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mood Detail Bottom Sheet */}
      {selectedLogForDetail && (
        <MoodDetailSheet 
          log={selectedLogForDetail} 
          onClose={() => setSelectedLogForDetail(null)} 
          onEditFeeling={handleEditFeeling}
          onEditMood={handleEditMood}
          onEditNote={handleEditNote}
        />
      )}
    </div>
  );
}

export default App
