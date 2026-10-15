import type { ExternalBlob, UserId } from "@/backend";

export type { ConversationSummary, MessageView, ProfileView } from "@/backend";

/** A user's public profile as rendered in the UI. */
export interface Profile {
  id: UserId;
  displayName: string;
  photo?: ExternalBlob;
}

/** Resolve an optional profile photo to a displayable URL. */
export function photoUrl(photo?: ExternalBlob): string | undefined {
  if (!photo) return undefined;
  try {
    return photo.getDirectURL();
  } catch {
    return undefined;
  }
}

/** Deterministic initials for avatar fallbacks. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
