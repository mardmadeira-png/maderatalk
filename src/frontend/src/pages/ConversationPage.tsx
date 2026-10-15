import type { MessageView } from "@/backend";
import { ConversationHeader } from "@/components/chat/ConversationHeader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageComposer } from "@/components/chat/MessageComposer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useConversations,
  useMarkRead,
  useMessages,
  useSendMessage,
} from "@/hooks/useQueries";
import { formatDayLabel, isDifferentDay } from "@/lib/time";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { AlertCircle, MessageSquare } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef } from "react";

/** How often the thread polls for new incoming messages. */
const REFRESH_INTERVAL_MS = 5_000;

export default function ConversationPage() {
  const { conversationId } = useParams({ from: "/app/chat/$conversationId" });
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal().toText();

  const id = useMemo(() => {
    try {
      return BigInt(conversationId);
    } catch {
      return undefined;
    }
  }, [conversationId]);

  const { data: messages, isLoading, isError, refetch } = useMessages(id);
  const { data: conversations } = useConversations();
  const sendMessage = useSendMessage();
  const markRead = useMarkRead();

  const conversation = conversations?.find((c) => c.id === id);

  // Poll for new incoming messages without a manual reload.
  useEffect(() => {
    if (id === undefined) return;
    const interval = window.setInterval(() => {
      void queryClient.invalidateQueries({
        queryKey: ["messages", id.toString()],
      });
    }, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [id, queryClient]);

  // Clear the unread count once the thread is open.
  const markReadRef = useRef(markRead.mutate);
  markReadRef.current = markRead.mutate;
  useEffect(() => {
    if (id === undefined) return;
    markReadRef.current(id);
  }, [id]);

  // Keep the newest message in view as the thread grows.
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageId = messages?.[messages.length - 1]?.id;
  useEffect(() => {
    if (lastMessageId === undefined) return;
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lastMessageId]);

  const handleSend = (body: string, options: { onError: () => void }) => {
    if (id === undefined) return;
    sendMessage.mutate(
      { conversationId: id, body },
      { onError: options.onError },
    );
  };

  return (
    <section
      data-ocid="conversation.page"
      className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col overflow-hidden bg-background md:h-[calc(100dvh-4rem)]"
    >
      <ConversationHeader
        name={conversation?.otherDisplayName ?? "Conversation"}
        photo={conversation?.otherPhoto}
      />

      <div
        data-ocid="conversation.thread"
        className="flex-1 overflow-y-auto px-3 py-4 md:px-6"
      >
        {isLoading && <ThreadSkeleton />}

        {isError && (
          <div
            data-ocid="conversation.error_state"
            className="mx-auto mt-10 max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-subtle"
          >
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-destructive">
              <AlertCircle className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold">
              Couldn’t load this conversation
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Something went wrong while fetching the messages.
            </p>
            <Button
              type="button"
              data-ocid="conversation.retry_button"
              className="mt-5 rounded-full"
              onClick={() => void refetch()}
            >
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !isError && messages && messages.length === 0 && (
          <div
            data-ocid="conversation.empty_state"
            className="mx-auto mt-10 max-w-sm rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-subtle"
          >
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
              <MessageSquare className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold">
              No messages yet
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Say hello to start the conversation.
            </p>
          </div>
        )}

        {!isLoading && !isError && messages && messages.length > 0 && (
          <ol data-ocid="conversation.message_list" className="flex flex-col">
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const own = isOwnMessage(message, myPrincipal);
              const showDay =
                !previous || isDifferentDay(previous.sentAt, message.sentAt);
              const grouped =
                !showDay &&
                !!previous &&
                isOwnMessage(previous, myPrincipal) === own;
              return (
                <Fragment key={message.id.toString()}>
                  {showDay && (
                    <li
                      data-ocid="conversation.day_separator"
                      className="my-4 flex justify-center"
                    >
                      <span className="rounded-full bg-secondary px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {formatDayLabel(message.sentAt)}
                      </span>
                    </li>
                  )}
                  <MessageBubble
                    message={message}
                    own={own}
                    grouped={grouped}
                  />
                </Fragment>
              );
            })}
          </ol>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageComposer onSend={handleSend} isSending={sendMessage.isPending} />
    </section>
  );
}

function isOwnMessage(message: MessageView, myPrincipal?: string): boolean {
  if (!myPrincipal) return false;
  return message.sender.toText() === myPrincipal;
}

function ThreadSkeleton() {
  const rows = Array.from({ length: 6 }, (_, i) => `thread-skeleton-${i}`);
  return (
    <div data-ocid="conversation.loading_state" className="space-y-4">
      {rows.map((id, index) => (
        <div
          key={id}
          className={
            index % 2 === 0 ? "flex justify-start" : "flex justify-end"
          }
        >
          <Skeleton
            className={
              index % 2 === 0
                ? "h-12 w-2/3 rounded-2xl rounded-bl-md"
                : "h-12 w-1/2 rounded-2xl rounded-br-md"
            }
          />
        </div>
      ))}
    </div>
  );
}
