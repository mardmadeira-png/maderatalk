import type { ExternalBlob } from "@/backend";
import { UserAvatar } from "@/components/UserAvatar";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

interface ConversationHeaderProps {
  name: string;
  photo?: ExternalBlob;
}

/** Sticky header for the active conversation: back link, avatar, and name. */
export function ConversationHeader({ name, photo }: ConversationHeaderProps) {
  return (
    <header
      data-ocid="conversation.header"
      className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card px-3 py-3 shadow-subtle md:px-4"
    >
      <Link
        to="/"
        data-ocid="conversation.back_link"
        aria-label="Back to chats"
        className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:hidden"
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
      </Link>
      <UserAvatar name={name} photo={photo} className="size-10" />
      <div className="min-w-0">
        <h1 className="truncate font-display text-base font-semibold tracking-tight">
          {name}
        </h1>
        <p className="text-xs text-muted-foreground">One-to-one chat</p>
      </div>
    </header>
  );
}
