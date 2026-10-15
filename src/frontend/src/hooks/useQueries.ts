import { createActor } from "@/backend";
import type { ProfileInput } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** The caller's own profile, or null when they have not set one up yet. */
export function useMyProfile() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Create or replace the caller's profile. */
export function useSaveMyProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProfileInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.saveMyProfile(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

/** The caller's conversations, most recent activity first. */
export function useConversations() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listConversations();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Full message history of a conversation, chronological. */
export function useMessages(conversationId: bigint | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["messages", conversationId?.toString()],
    queryFn: async () => {
      if (!actor || conversationId === undefined) return [];
      return actor.getMessages(conversationId);
    },
    enabled: !!actor && !isFetching && conversationId !== undefined,
  });
}

/** Send a text message into a conversation. */
export function useSendMessage() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { conversationId: bigint; body: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.sendMessage(vars.conversationId, vars.body);
    },
    onSuccess: (_message, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ["messages", vars.conversationId.toString()],
      });
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

/** Mark a conversation as read for the caller. */
export function useMarkRead() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.markRead(conversationId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

/** Find or create a one-to-one conversation with another user. */
export function useOpenConversation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      other: Parameters<NonNullable<typeof actor>["openConversation"]>[0],
    ) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.openConversation(other);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

/** Search registered users by display name. */
export function useSearchProfiles(term: string) {
  const { actor, isFetching } = useActor(createActor);
  const trimmed = term.trim();
  return useQuery({
    queryKey: ["profiles", "search", trimmed],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchProfiles(trimmed);
    },
    enabled: !!actor && !isFetching && trimmed.length > 0,
  });
}

/** Look up a single user's public profile. */
export function useProfile(userId: string | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getProfile(Principal.fromText(userId));
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}
