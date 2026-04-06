import HistoryGraph from './HistoryGraph';
import NavigationHeader from './NavigationHeader';
import downloadIcon from './download.svg';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface LogEntry {
  id: string;
  timestamp: number;
  emotionId: string;
  subEmotion: string;
  subSubEmotion: string;
  mood: string;
  note?: string;
}

interface MoodHistoryScreenProps {
  logs: LogEntry[];
  onBack: () => void;
  onMissedCheckin?: (timestamp: number) => void;
  onLogClick?: (log: LogEntry) => void;
}

const MoodHistoryScreen: React.FC<MoodHistoryScreenProps> = ({ logs, onBack, onMissedCheckin, onLogClick }) => {
  const handleExportPDF = () => {
    console.log('Exporting PDF...', logs);
    try {
      const doc = new jsPDF();
      const tableData = [...logs].sort((a, b) => b.timestamp - a.timestamp).map(log => [
        new Date(log.timestamp).toLocaleString('en-GB'),
        log.emotionId,
        log.subEmotion,
        log.subSubEmotion,
        log.mood,
        log.note || 'NA'
      ]);

      autoTable(doc, {
        head: [['Timestamp', 'Emotion', 'Sub emotion', 'Sub Sub emotion', 'Mood', 'Note']],
        body: tableData,
        headStyles: { fillColor: [164, 94, 255], textColor: [255, 255, 255] }, // Use purple theme
        styles: { font: 'helvetica', fontSize: 10 },
        margin: { top: 20 }
      });

      doc.save('mood-history.pdf');
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-[20px] px-[16px] pb-[60px] overflow-hidden box-border">
      {/* Header Container */}
      <NavigationHeader 
        variant="left-aligned" 
        title="Mood history" 
        onBack={onBack} 
      />

      <div className="flex flex-col gap-3 w-full flex-1 mt-[40px]">
        {logs.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-[41px] px-[15%] gap-2 w-full bg-white border border-[#CAD5E2] shadow-[0px_4px_10px_rgba(83,73,70,0.15)] rounded-[12px]">
            <span className="w-full text-center h-[25px] font-semibold text-lg leading-[25px] tracking-[0.02em] text-[#151410]">
               No history yet
            </span>
          </div>
        ) : (
          <>
            {/* Export Link */}
            <div 
              onClick={handleExportPDF}
              className="flex flex-row items-center gap-[4px] w-[119px] h-[25px] mb-[16px] cursor-pointer self-end"
            >
              <span className="font-['Instrument Sans'] font-medium text-[16px] leading-[25px] tracking-[0.02em] text-[#A45EFF]">
                Export data
              </span>
              <img src={downloadIcon} alt="Download" className="w-[24px] h-[24px]" />
            </div>

            <div className="w-full bg-white border border-[#CAD5E2] shadow-[0px_4px_10px_rgba(83,73,70,0.15)] rounded-[12px] p-2 flex flex-col items-center justify-center z-[21]">
              <HistoryGraph 
                logs={logs} 
                isExpandedView={true} 
                onMissedCheckin={onMissedCheckin} 
                onLogClick={onLogClick}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MoodHistoryScreen;
