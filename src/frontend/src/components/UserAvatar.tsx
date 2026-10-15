import type { ExternalBlob } from "@/backend";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { initials, photoUrl } from "@/types";

interface UserAvatarProps {
  name: string;
  photo?: ExternalBlob;
  className?: string;
  /** Renders a small teal dot for the active conversation header. */
  online?: boolean;
}

export function UserAvatar({
  name,
  photo,
  className,
  online,
}: UserAvatarProps) {
  const url = photoUrl(photo);
  return (
    <span className="relative inline-flex shrink-0">
      <Avatar className={cn("ring-1 ring-border", className)}>
        {url && <AvatarImage src={url} alt="" />}
        <AvatarFallback className="bg-secondary font-display text-sm font-semibold text-secondary-foreground">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      {online && (
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-primary"
        />
      )}
    </span>
  );
}
