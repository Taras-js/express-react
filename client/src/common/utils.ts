import moment from 'moment';
import { datePickerFormat } from '../constants';


export function getFirstDayOfMonth() {
  return moment().startOf('month').format('YYYY-MM-DD');
}

export function isLastDayOfMonth(d: Date) {
  return new Date(d.getTime() + 86400000).getDate() === 1;
}

export function getLastSaturday() {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday of this week
  const saturday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 2);
  return moment(saturday.toDateString()).format('YYYY-MM-DD');
}

export function formatDateTime(date: string | Date, format = 'lll'): string | undefined {
  return date ? moment(date).format(format) : undefined;
}

export function formatDate(date: string | Date, format = datePickerFormat): string | undefined {
  return date ? moment(date).format(format) : undefined;
}

export function formatCurrency(value: number): string {
  return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
}

export function getWeekDays(startDate?: string): string[] {
  let days: string[] = [];
  for (let i = 0; i <= 6; i++) {
    days.push(moment(startDate).add(i, 'days').format(datePickerFormat));
  }

  return days;
}

export function displayNumberFromHours(timeString: string): number {
  if (typeof timeString === 'number') return timeString;

  const timeStringSplit = timeString.split(':');
  if (timeStringSplit.length === 1) {
    return Number(timeString);
  }
  const dec = parseInt(((Number(timeStringSplit[1]) / 6) * 10).toString(), 10);

  return parseFloat(parseInt(timeStringSplit[0], 10) + '.' + (dec < 10 ? '0' : '') + dec);
}

export function displayHoursFromNumber(hours: number): string {
  const hour = Math.floor(hours);
  const decimal = hours - hour;
  const min = 1 / 60;
  const calculateDecimal = min * Math.round(decimal / min);
  let calculateMinute = Math.floor(calculateDecimal * 60).toString();
  if (calculateMinute.length < 2) {
    calculateMinute = '0' + calculateMinute;
  }

  return `${hour}:${calculateMinute}`;
}


export function nullableDataSorter(a?: Date | string | null | number, b?: Date | string | null | number): number {
  if (a && b && a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  } else if (a && b && typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  } else if (a && b && typeof a === 'number' && typeof b === 'number') {
    return a - b;
  } else if (a) {
    return -1;
  } else if (b) {
    return 1;
  }

  return 0;
}
