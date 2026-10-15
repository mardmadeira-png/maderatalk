import { Button } from "@/components/ui/button";
import { Loader2, SendHorizontal } from "lucide-react";
import { type FormEvent, useState } from "react";

interface MessageComposerProps {
  onSend: (body: string, options: { onError: () => void }) => void;
  isSending: boolean;
}

/**
 * Message input pinned to the bottom of the conversation. Keeps the draft on a
 * failed send so the user can retry, and disables the control while in flight.
 */
export function MessageComposer({ onSend, isSending }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const trimmed = text.trim();
  const canSend = trimmed.length > 0 && !isSending;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    const captured = text;
    setText("");
    setError(null);
    onSend(captured.trim(), {
      onError: () => {
        setError("Message didn’t send. Check your connection and try again.");
        setText((current) => (current === "" ? captured : current));
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-ocid="conversation.composer"
      className="border-t border-border bg-card px-3 py-3 md:px-4"
    >
      {error && (
        <p
          role="alert"
          data-ocid="conversation.send_error_state"
          className="mb-2 text-xs text-destructive"
        >
          {error}
        </p>
      )}
      <div className="flex items-end gap-2">
        <label htmlFor="message-input" className="sr-only">
          Message
        </label>
        <textarea
          id="message-input"
          data-ocid="conversation.input"
          value={text}
          rows={1}
          placeholder="Message composer…"
          disabled={isSending}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit(event);
            }
          }}
          className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
        />
        <Button
          type="submit"
          size="icon"
          data-ocid="conversation.send_button"
          aria-label={isSending ? "Sending message" : "Send message"}
          disabled={!canSend}
          className="size-11 shrink-0 rounded-full"
        >
          {isSending ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <SendHorizontal className="size-5" aria-hidden="true" />
          )}
        </Button>
      </div>
    </form>
  );
}
