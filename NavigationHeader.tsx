import React from 'react';
import backIcon from './back.svg';

interface NavigationHeaderProps {
  variant: 'left-aligned' | 'centered';
  title: string;
  onBack: () => void;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ variant, title, onBack }) => {
  // Global Text Style
  const titleClasses = "font-['Instrument_Sans'] font-medium text-[20px] leading-[25px] tracking-[0.02em] text-[#605E5C] drop-shadow-none shadow-none filter-none line-clamp-1 m-0 p-0";
  
  // Reusable Back Button
  const backButton = (
    <button 
      onClick={onBack}
      className="w-[44px] h-[44px] bg-[#FFFFFF] rounded-[30px] flex items-center justify-center shrink-0 cursor-pointer shadow-[0px_2px_4px_rgba(0,0,0,0.05)] hover:bg-black/5 transition-colors border-none"
    >
      {/* Boosted arrow size */}
      <img src={backIcon} className="w-[20px] h-[24px]" alt="Back" />
    </button>
  );

  // Unifying to the requested 8px rigid physical gap spacing
  return (
    <div className="w-full h-[44px] flex flex-row items-center gap-[12px] shrink-0 box-border">
      {backButton}
      <h2 className={`${titleClasses} flex-1 text-left`}>
        {title}
      </h2>
    </div>
  );
};

export default NavigationHeader;
