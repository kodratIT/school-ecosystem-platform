import { format as dateFnsFormat, formatDistance, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format date to Indonesian format
 * @example formatDate(new Date(), 'dd MMM yyyy') // "25 Des 2024"
 */
export function formatDate(
  date: Date | string,
  formatStr: string = 'dd MMMM yyyy'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsFormat(dateObj, formatStr, { locale: id });
}

/**
 * Format date to time string
 * @example formatTime(new Date()) // "14:30"
 */
export function formatTime(date: Date | string): string {
  return formatDate(date, 'HH:mm');
}

/**
 * Format date to datetime string
 * @example formatDateTime(new Date()) // "25 Des 2024, 14:30"
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'dd MMM yyyy, HH:mm');
}

/**
 * Get relative time from now
 * @example timeAgo(new Date(Date.now() - 3600000)) // "1 jam yang lalu"
 */
export function timeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), {
    addSuffix: true,
    locale: id,
  });
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
}

/**
 * Get academic year from date (July - June)
 * @example getAcademicYear(new Date('2024-08-15')) // "2024/2025"
 */
export function getAcademicYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  // Academic year starts in July (month 6)
  if (month >= 6) {
    return `${year}/${year + 1}`;
  }
  return `${year - 1}/${year}`;
}
