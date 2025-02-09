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