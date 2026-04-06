export type TimeWindow = 'Morn' | 'Aftn' | 'Eve' | 'Night';

export const TIME_WINDOWS: { label: TimeWindow; startHour: number; endHour: number }[] = [
  { label: 'Morn', startHour: 6, endHour: 11 },       // 6:00 AM - 11:59 AM
  { label: 'Aftn', startHour: 12, endHour: 16 }, // 12:00 PM - 4:59 PM
  { label: 'Eve', startHour: 17, endHour: 20 },     // 5:00 PM - 8:59 PM
  { label: 'Night', startHour: 21, endHour: 5 }       // 9:00 PM - 5:59 AM (wraps around)
];

/**
 * Returns the logical "session date" for a timestamp.
 * If the time is between 12:00 AM and 5:59 AM, it logically belongs to the
 * "Night" of the previous calendar day.
 */
export const getSessionDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  
  if (hours >= 0 && hours < 6) {
    // Treat as previous day for the "Night" window
    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);
    return prevDay.toDateString();
  }
  
  return date.toDateString();
};

/**
 * Returns the TimeWindow for a given timestamp.
 */
export const getTimeWindow = (timestamp: number): TimeWindow => {
  const date = new Date(timestamp);
  const hours = date.getHours();

  if (hours >= 6 && hours < 12) return 'Morn';
  if (hours >= 12 && hours < 17) return 'Aftn';
  if (hours >= 17 && hours < 21) return 'Eve';
  return 'Night'; // 21 - 23 (9 PM - 11 PM) or 0 - 5 (12 AM - 5 AM)
};

