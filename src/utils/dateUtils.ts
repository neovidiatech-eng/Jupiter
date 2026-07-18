export const formatDateLocal = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getLocalDateKey = (isoString: string | undefined): string => {
  if (!isoString) return "";
  const date = new Date(isoString);
  // Ensure it's a valid date
  if (isNaN(date.getTime())) return "";
  return formatDateLocal(date);
};

export const parseCairoTime = (dateStr: string | null | undefined): number => {
  if (!dateStr) return 0;
  if (/(Z|[+-]\d{2}:?\d{2})$/.test(dateStr)) return new Date(dateStr).getTime();
  
  const localDate = new Date(dateStr.replace(' ', 'T'));
  const cairoStr = localDate.toLocaleString('en-US', { timeZone: 'Africa/Cairo', timeZoneName: 'shortOffset' });
  
  const match = cairoStr.match(/GMT([+-])(\d+)(?::(\d+))?/);
  let offsetStr = '+02:00'; 
  if (match) {
    const sign = match[1];
    const hours = match[2].padStart(2, '0');
    const mins = match[3] || '00';
    offsetStr = sign + hours + ":" + mins;
  }
  
  const finalStr = dateStr.replace(' ', 'T') + offsetStr;
  return new Date(finalStr).getTime();
};
