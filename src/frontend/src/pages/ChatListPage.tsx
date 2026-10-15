import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversations } from "@/hooks/useQueries";
import { formatListTimestamp } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { MessageSquarePlus, RefreshCw } from "lucide-react";

export default function ChatListPage() {
  const {
    data: conversations,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useConversations();

  return (
    <section
      data-ocid="chat_list.page"
      className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8"
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Chats
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your recent conversations, newest first.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          data-ocid="chat_list.refresh_button"
          aria-label="Refresh conversations"
          className="rounded-full"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          <RefreshCw
            className={cn("size-4", isFetching && "animate-spin")}
            aria-hidden="true"
          />
        </Button>
      </div>

      {isLoading && <ChatListSkeleton />}

      {isError && (
        <div
          data-ocid="chat_list.error_state"
          className="rounded-2xl border border-border bg-card p-8 text-center shadow-subtle"
        >
          <h2 className="font-display text-lg font-semibold">
            Couldn’t load your chats
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Something went wrong while fetching your conversations.
          </p>
          <Button
            type="button"
            data-ocid="chat_list.retry_button"
            className="mt-5 rounded-full"
            onClick={() => void refetch()}
          >
            Try again
          </Button>
        </div>
      )}

      {!isLoading &&
        !isError &&
        conversations &&
        conversations.length === 0 && (
          <div
            data-ocid="chat_list.empty_state"
            className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-subtle"
          >
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
              <MessageSquarePlus className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold">
              No conversations yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Start your first chat to see it appear here.
            </p>
            <Button
              type="button"
              data-ocid="chat_list.start_chat_button"
              className="mt-5 rounded-full"
              onClick={() => {
                window.location.assign("/profile");
              }}
            >
              Find someone to message
            </Button>
          </div>
        )}

      {!isLoading && !isError && conversations && conversations.length > 0 && (
        <ul
          data-ocid="chat_list.list"
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-subtle"
        >
          {conversations.map((conversation, index) => (
            <li key={conversation.id.toString()}>
              <Link
                to="/chat/$conversationId"
                params={{ conversationId: conversation.id.toString() }}
                data-ocid={`chat_list.item.${index + 1}`}
                className="flex items-center gap-3 border-b border-border px-4 py-3 transition-smooth last:border-b-0 hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                <UserAvatar
                  name={conversation.otherDisplayName}
                  photo={conversation.otherPhoto}
                  className="size-12"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-display text-sm font-semibold">
                      {conversation.otherDisplayName}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {formatListTimestamp(conversation.lastMessageAt)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-3">
                    <span className="truncate text-sm text-muted-foreground">
                      {conversation.lastMessagePreview ?? "No messages yet"}
                    </span>
                    {conversation.unreadCount > 0n && (
                      <span
                        data-ocid={`chat_list.unread.${index + 1}`}
                        className="grid min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 py-0.5 font-mono text-xs font-semibold text-primary-foreground"
                      >
                        {conversation.unreadCount.toString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ChatListSkeleton() {
  const rows = Array.from({ length: 6 }, (_, i) => `chat-skeleton-${i}`);
  return (
    <div
      data-ocid="chat_list.loading_state"
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-subtle"
    >
      {rows.map((id) => (
        <div
          key={id}
          className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
        >
          <Skeleton className="size-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
