import { isSameWeek, parseISO, startOfWeek, endOfWeek, eachWeekOfInterval } from 'date-fns';
type SortOrder = "asc" | "desc";

type SortCriteria<T> = {
  key: keyof T;
  order: SortOrder;
}[];

export function sortByMultipleProperties<T>(array: T[], criteria: SortCriteria<T>): T[] {
  return array.sort((a, b) => {
    for (const { key, order } of criteria) {
      const multiplier = order === "asc" ? 1 : -1;
      if (a[key] < b[key]) return -1 * multiplier;
      if (a[key] > b[key]) return 1 * multiplier;
    }
    return 0;
  });
}

export function formatDuration(duration: number) {
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);
  return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`
}

type DateEntry = {
  date: string;
}

export function calculateWeeklyStreak(entries: DateEntry[], currentDate: Date = new Date()): number {
  if (entries.length === 0) {
    return 0;
  }

  // Parse and sort the entry dates in ascending order
  const sortedEntries = entries
    .map(entry => new Date(entry.date))
    .sort((a, b) => a.getTime() - b.getTime());

  // Get the earliest and latest dates in the dataset
  const earliestDate = sortedEntries[0];
  const latestDate = currentDate;

  // Generate all the weeks in the range from the earliest to the current date
  const weeks = eachWeekOfInterval({
    start: startOfWeek(earliestDate),
    end: endOfWeek(latestDate),
  });

  // Track streak
  let currentStreak = 0;
  let maxStreak = 0;

  weeks.forEach(week => {
    const hasEntryThisWeek = sortedEntries.some(entryDate => isSameWeek(entryDate, week));
    if (hasEntryThisWeek) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0; // Reset streak if no entry for the week
    }
  });

  return currentStreak;
}

export function calculateAverageEntriesPerWeek(entries: DateEntry[], currentDate: Date = new Date()): number {
  if (entries.length === 0) {
    return 0;
  }
  // Parse and sort the entry dates
  const sortedEntries = entries
  .map(entry => new Date(entry.date))
  .sort((a, b) => a.getTime() - b.getTime());
  
  // Get the earliest and latest dates in the dataset
  const earliestDate = sortedEntries[0];
  const latestDate = currentDate;

  // Generate all the weeks in the range from the earliest to the current date
  const weeks = eachWeekOfInterval({
    start: startOfWeek(earliestDate),
    end: endOfWeek(latestDate),
  });

  // Create a map to count entries for each week
  const weeklyEntryCounts: Map<string, number> = new Map();

  weeks.forEach(week => {
    const weekKey = startOfWeek(week).toISOString(); // Use ISO string for consistent keys
    weeklyEntryCounts.set(weekKey, 0);
  });

  // Count entries for each week
  sortedEntries.forEach(entryDate => {
    weeks.forEach(week => {
      if (
        entryDate >= startOfWeek(week) &&
        entryDate <= endOfWeek(week)
      ) {
        const weekKey = startOfWeek(week).toISOString();
        weeklyEntryCounts.set(weekKey, (weeklyEntryCounts.get(weekKey) || 0) + 1);
      }
    });
  });

  // Calculate the average
  const totalEntries = Array.from(weeklyEntryCounts.values()).reduce((sum, count) => sum + count, 0);
  const averageEntries = totalEntries / weeks.length;

  return averageEntries;
}
