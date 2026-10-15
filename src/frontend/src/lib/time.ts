/**
 * Motoko `Time.now()` values are nanosecond bigints. Convert through this
 * helper before any JavaScript Date operation.
 */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Compact chat-list timestamp: time today, "Yesterday", weekday, else date. */
export function formatListTimestamp(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "";
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const time = date.getTime();
  const dayMs = 86_400_000;

  if (time >= startOfToday) {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (time >= startOfToday - dayMs) return "Yesterday";
  if (time >= startOfToday - 6 * dayMs) {
    return date.toLocaleDateString(undefined, { weekday: "short" });
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Full clock time shown under each message bubble. */
export function formatMessageTime(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "";
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Day separator label for the message thread. */
export function formatDayLabel(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "";
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const time = date.getTime();
  const dayMs = 86_400_000;
  if (time >= startOfToday) return "Today";
  if (time >= startOfToday - dayMs) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** True when two timestamps fall on different calendar days. */
export function isDifferentDay(a: bigint, b: bigint): boolean {
  const da = timestampToDate(a);
  const db = timestampToDate(b);
  if (!da || !db) return false;
  return da.toDateString() !== db.toDateString();
}
