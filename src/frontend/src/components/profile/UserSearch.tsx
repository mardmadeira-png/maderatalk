import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useOpenConversation, useSearchProfiles } from "@/hooks/useQueries";
import { Principal } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Search, UserPlus } from "lucide-react";
import { useState } from "react";

/**
 * Searches registered users by display name and opens a one-to-one
 * conversation with the selected result.
 */
export function UserSearch() {
  const [term, setTerm] = useState("");
  const trimmed = term.trim();
  const {
    data: results,
    isLoading,
    isError,
    refetch,
  } = useSearchProfiles(term);
  const openConversation = useOpenConversation();
  const navigate = useNavigate();
  const [openingId, setOpeningId] = useState<string | null>(null);

  const handleSelect = (userId: string) => {
    setOpeningId(userId);
    openConversation.mutate(Principal.fromText(userId), {
      onSuccess: (conversationId) => {
        setOpeningId(null);
        void navigate({
          to: "/chat/$conversationId",
          params: { conversationId: conversationId.toString() },
        });
      },
      onError: () => setOpeningId(null),
    });
  };

  return (
    <section
      aria-labelledby="user-search-heading"
      data-ocid="profile.search.panel"
      className="rounded-2xl border border-border bg-card p-6 shadow-subtle md:p-8"
    >
      <h2
        id="user-search-heading"
        className="font-display text-lg font-semibold tracking-tight"
      >
        Start a new chat
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Find someone by their display name.
      </p>

      <div className="relative mt-5">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          data-ocid="profile.search_input"
          value={term}
          placeholder="Search people…"
          aria-label="Search people by display name"
          className="pl-9"
          onChange={(event) => setTerm(event.target.value)}
        />
      </div>

      <div className="mt-4">
        {trimmed.length === 0 && (
          <p
            data-ocid="profile.search.empty_state"
            className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground"
          >
            Type a name to find people to message.
          </p>
        )}

        {trimmed.length > 0 && isLoading && <SearchSkeleton />}

        {trimmed.length > 0 && isError && (
          <div
            data-ocid="profile.search.error_state"
            className="rounded-xl border border-border px-4 py-6 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Couldn’t search right now.
            </p>
            <Button
              type="button"
              variant="outline"
              data-ocid="profile.search.retry_button"
              className="mt-3 rounded-full"
              onClick={() => void refetch()}
            >
              Try again
            </Button>
          </div>
        )}

        {trimmed.length > 0 &&
          !isLoading &&
          !isError &&
          results &&
          results.length === 0 && (
            <p
              data-ocid="profile.search.no_results_state"
              className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground"
            >
              No one matches “{trimmed}”.
            </p>
          )}

        {trimmed.length > 0 &&
          !isLoading &&
          !isError &&
          results &&
          results.length > 0 && (
            <ul data-ocid="profile.search.list" className="space-y-1">
              {results.map((result, index) => {
                const id = result.id.toText();
                const opening = openingId === id;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      data-ocid={`profile.search.item.${index + 1}`}
                      disabled={openConversation.isPending}
                      onClick={() => handleSelect(id)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-smooth hover:bg-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
                    >
                      <UserAvatar
                        name={result.displayName}
                        photo={result.photo}
                        className="size-11"
                      />
                      <span className="min-w-0 flex-1 truncate font-display text-sm font-semibold">
                        {result.displayName}
                      </span>
                      {opening ? (
                        <Loader2
                          className="size-4 shrink-0 animate-spin text-primary"
                          aria-hidden="true"
                        />
                      ) : (
                        <UserPlus
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
      </div>
    </section>
  );
}

function SearchSkeleton() {
  const rows = Array.from({ length: 3 }, (_, i) => `search-skeleton-${i}`);
  return (
    <div data-ocid="profile.search.loading_state" className="space-y-1">
      {rows.map((id) => (
        <div key={id} className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}
