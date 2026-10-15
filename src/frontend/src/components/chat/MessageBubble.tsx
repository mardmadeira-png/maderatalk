import type { MessageView } from "@/backend";
import { formatMessageTime } from "@/lib/time";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: MessageView;
  /** True when the signed-in user is the sender. */
  own: boolean;
  /** Position within a same-sender run, for tighter grouping. */
  grouped: boolean;
}

/**
 * A single chat message. Own messages sit right in the teal accent; the other
 * participant's messages sit left on the muted surface.
 */
export function MessageBubble({ message, own, grouped }: MessageBubbleProps) {
  return (
    <li
      data-ocid={
        own ? "conversation.message.own" : "conversation.message.other"
      }
      className={cn(
        "flex w-full animate-message-in",
        own ? "justify-end" : "justify-start",
        grouped ? "mt-1" : "mt-3",
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] flex-col sm:max-w-[70%]",
          own ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-bubble",
            own
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md bg-secondary text-secondary-foreground",
          )}
        >
          {message.body}
        </div>
        <time
          dateTime={new Date(Number(message.sentAt / 1_000_000n)).toISOString()}
          className="mt-1 px-1 font-mono text-[11px] text-muted-foreground"
        >
          {formatMessageTime(message.sentAt)}
        </time>
      </div>
    </li>
  );
}
