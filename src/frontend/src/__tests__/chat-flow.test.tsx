import { setIdentityForTest } from "@/__tests__/setup";
import { renderWithActor } from "@/__tests__/test-utils";
import type {
  ConversationSummary,
  MessageView,
  ProfileView,
  backendInterface,
} from "@/backend";
import { ProfileGate } from "@/components/ProfileGate";
import { UserSearch } from "@/components/profile/UserSearch";
import ChatListPage from "@/pages/ChatListPage";
import ConversationPage from "@/pages/ConversationPage";
import { Principal } from "@icp-sdk/core/principal";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

const ALICE = Principal.fromText("2vxsx-fae");
const BOB = Principal.fromText("aaaaa-aa");

function profile(id: Principal, displayName: string): ProfileView {
  return { id, displayName };
}

function message(
  id: bigint,
  conversationId: bigint,
  sender: Principal,
  body: string,
  sentAt: bigint,
): MessageView {
  return { id, conversationId, sender, body, sentAt };
}

function summary(
  id: bigint,
  other: Principal,
  otherDisplayName: string,
  unreadCount: bigint,
  lastMessageAt: bigint,
  lastMessagePreview?: string,
): ConversationSummary {
  return {
    id,
    otherParticipant: other,
    otherDisplayName,
    unreadCount,
    lastMessageAt,
    lastMessagePreview,
  };
}

/** A typed fake actor exposing only the methods the tested tree calls. */
type Actor = Pick<
  backendInterface,
  | "getMyProfile"
  | "listConversations"
  | "getMessages"
  | "sendMessage"
  | "markRead"
  | "searchProfiles"
  | "openConversation"
>;

function makeActor(overrides: {
  getMyProfile?: backendInterface["getMyProfile"];
  listConversations?: backendInterface["listConversations"];
  getMessages?: backendInterface["getMessages"];
  sendMessage?: backendInterface["sendMessage"];
  markRead?: backendInterface["markRead"];
  searchProfiles?: backendInterface["searchProfiles"];
  openConversation?: backendInterface["openConversation"];
}): Actor {
  return {
    getMyProfile: vi.fn<backendInterface["getMyProfile"]>(
      overrides.getMyProfile ?? (async () => null),
    ),
    listConversations: vi.fn<backendInterface["listConversations"]>(
      overrides.listConversations ?? (async () => []),
    ),
    getMessages: vi.fn<backendInterface["getMessages"]>(
      overrides.getMessages ?? (async () => []),
    ),
    sendMessage: vi.fn<backendInterface["sendMessage"]>(
      overrides.sendMessage ??
        (async (conversationId, body) =>
          message(1n, conversationId, ALICE, body, 1_700_000_000_000_000_000n)),
    ),
    markRead: vi.fn<backendInterface["markRead"]>(
      overrides.markRead ?? (async () => undefined),
    ),
    searchProfiles: vi.fn<backendInterface["searchProfiles"]>(
      overrides.searchProfiles ?? (async () => []),
    ),
    openConversation: vi.fn<backendInterface["openConversation"]>(
      overrides.openConversation ?? (async () => 1n),
    ),
  };
}

/**
 * Renders a component inside a real memory router that mirrors the app's route
 * tree, so router hooks (Link, useParams, useNavigate) resolve.
 */
function renderInRouter(ui: ReactElement, actor: Actor, initialPath = "/") {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const appRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: "app",
    component: () => <Outlet />,
  });
  const chatListRoute = createRoute({
    getParentRoute: () => appRoute,
    path: "/",
    component: () => ui,
  });
  const conversationRoute = createRoute({
    getParentRoute: () => appRoute,
    path: "/chat/$conversationId",
    component: () => ui,
  });
  const profileRoute = createRoute({
    getParentRoute: () => appRoute,
    path: "/profile",
    component: () => ui,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([
      appRoute.addChildren([chatListRoute, conversationRoute, profileRoute]),
    ]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
  return renderWithActor(<RouterProvider router={router} />, actor);
}

describe("ChatListPage", () => {
  it("shows the empty state when the user has no conversations", async () => {
    const actor = makeActor({ listConversations: async () => [] });
    renderInRouter(<ChatListPage />, actor);

    expect(
      await screen.findByTestId("chat_list.empty_state"),
    ).toBeInTheDocument();
    expect(screen.getByText("No conversations yet")).toBeInTheDocument();
  });

  it("lists conversations with an unread indicator for unread ones", async () => {
    const actor = makeActor({
      listConversations: async () => [
        summary(1n, BOB, "Bob", 3n, 1_700_000_000_000_000_000n, "hey"),
        summary(2n, ALICE, "Alice", 0n, 1_600_000_000_000_000_000n, "hi"),
      ],
    });
    renderInRouter(<ChatListPage />, actor);

    const list = await screen.findByTestId("chat_list.list");
    expect(within(list).getByText("Bob")).toBeInTheDocument();
    expect(within(list).getByText("Alice")).toBeInTheDocument();
    expect(screen.getByTestId("chat_list.unread.1")).toHaveTextContent("3");
    expect(screen.queryByTestId("chat_list.unread.2")).not.toBeInTheDocument();
  });

  it("shows an error state with retry when loading fails", async () => {
    const listConversations = vi
      .fn<backendInterface["listConversations"]>()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce([]);
    const actor = makeActor({ listConversations });
    renderInRouter(<ChatListPage />, actor);

    expect(
      await screen.findByTestId("chat_list.error_state"),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("chat_list.retry_button"));

    expect(
      await screen.findByTestId("chat_list.empty_state"),
    ).toBeInTheDocument();
  });
});

describe("ConversationPage", () => {
  it("renders history chronologically and distinguishes own vs other messages", async () => {
    setIdentityForTest({ identity: { getPrincipal: () => ALICE } as never });
    const actor = makeActor({
      listConversations: async () => [summary(1n, BOB, "Bob", 0n, 1n)],
      getMessages: async () => [
        message(1n, 1n, BOB, "hello there", 1_700_000_000_000_000_000n),
        message(2n, 1n, ALICE, "hi bob", 1_700_000_060_000_000_000n),
      ],
    });
    renderInRouter(<ConversationPage />, actor, "/chat/1");

    await screen.findByTestId("conversation.message_list");
    const bubbles = screen.getAllByTestId(/^conversation\.message\./);
    expect(bubbles).toHaveLength(2);
    expect(screen.getByTestId("conversation.message.other")).toHaveTextContent(
      "hello there",
    );
    expect(screen.getByTestId("conversation.message.own")).toHaveTextContent(
      "hi bob",
    );
  });

  it("sends a message and shows it in the thread", async () => {
    setIdentityForTest({ identity: { getPrincipal: () => ALICE } as never });
    const sent: MessageView[] = [];
    const sendMessage = vi.fn<backendInterface["sendMessage"]>(
      async (conversationId, body) => {
        const m = message(
          2n,
          conversationId,
          ALICE,
          body,
          1_700_000_060_000_000_000n,
        );
        sent.push(m);
        return m;
      },
    );
    const actor = makeActor({
      listConversations: async () => [summary(1n, BOB, "Bob", 0n, 1n)],
      getMessages: async () => [
        message(1n, 1n, BOB, "hello there", 1_700_000_000_000_000_000n),
        ...sent,
      ],
      sendMessage,
    });
    renderInRouter(<ConversationPage />, actor, "/chat/1");

    await screen.findByTestId("conversation.message_list");
    await userEvent.type(
      screen.getByTestId("conversation.input"),
      "how are you",
    );
    await userEvent.click(screen.getByTestId("conversation.send_button"));

    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith(1n, "how are you"),
    );
    expect(await screen.findByText("how are you")).toBeInTheDocument();
  });

  it("marks the conversation read when opened", async () => {
    setIdentityForTest({ identity: { getPrincipal: () => ALICE } as never });
    const markRead = vi.fn<backendInterface["markRead"]>(async () => undefined);
    const actor = makeActor({
      listConversations: async () => [summary(1n, BOB, "Bob", 2n, 1n)],
      getMessages: async () => [],
      markRead,
    });
    renderInRouter(<ConversationPage />, actor, "/chat/1");

    await waitFor(() => expect(markRead).toHaveBeenCalledWith(1n));
  });

  it("shows an error state with retry when messages fail to load", async () => {
    setIdentityForTest({ identity: { getPrincipal: () => ALICE } as never });
    const getMessages = vi
      .fn<backendInterface["getMessages"]>()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce([]);
    const actor = makeActor({
      listConversations: async () => [summary(1n, BOB, "Bob", 0n, 1n)],
      getMessages,
    });
    renderInRouter(<ConversationPage />, actor, "/chat/1");

    expect(
      await screen.findByTestId("conversation.error_state"),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("conversation.retry_button"));

    expect(
      await screen.findByTestId("conversation.empty_state"),
    ).toBeInTheDocument();
  });
});

describe("UserSearch", () => {
  it("searches by display name and opens a conversation with the result", async () => {
    const searchProfiles = vi.fn<backendInterface["searchProfiles"]>(
      async () => [profile(BOB, "Bob")],
    );
    const openConversation = vi.fn<backendInterface["openConversation"]>(
      async () => 7n,
    );
    const actor = makeActor({ searchProfiles, openConversation });
    renderInRouter(<UserSearch />, actor, "/");

    await userEvent.type(
      await screen.findByTestId("profile.search_input"),
      "Bob",
    );

    const item = await screen.findByTestId("profile.search.item.1");
    expect(item).toHaveTextContent("Bob");

    await userEvent.click(item);

    await waitFor(() => expect(openConversation).toHaveBeenCalledWith(BOB));
  });

  it("shows a no-results state when nothing matches", async () => {
    const actor = makeActor({ searchProfiles: async () => [] });
    renderInRouter(<UserSearch />, actor, "/");

    await userEvent.type(
      await screen.findByTestId("profile.search_input"),
      "nobody",
    );

    expect(
      await screen.findByTestId("profile.search.no_results_state"),
    ).toBeInTheDocument();
  });
});

describe("ProfileGate", () => {
  it("blocks chat content until a display name is saved", async () => {
    const saveMyProfile = vi.fn<backendInterface["saveMyProfile"]>(
      async (input) => profile(ALICE, input.displayName),
    );
    const actor = {
      ...makeActor({ getMyProfile: async () => null }),
      saveMyProfile,
    };
    renderWithActor(
      <ProfileGate>
        <div data-ocid="chat-content">secret chats</div>
      </ProfileGate>,
      actor,
    );

    expect(
      await screen.findByTestId("profile.setup_panel"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("chat-content")).not.toBeInTheDocument();

    await userEvent.type(screen.getByTestId("profile.input"), "Alice");
    await userEvent.click(screen.getByTestId("profile.submit_button"));

    await waitFor(() =>
      expect(saveMyProfile).toHaveBeenCalledWith({
        displayName: "Alice",
        photo: undefined,
      }),
    );
  });

  it("renders children when the user already has a profile", async () => {
    const actor = makeActor({
      getMyProfile: async () => profile(ALICE, "Alice"),
    });
    renderWithActor(
      <ProfileGate>
        <div data-ocid="chat-content">secret chats</div>
      </ProfileGate>,
      actor,
    );

    expect(await screen.findByTestId("chat-content")).toBeInTheDocument();
  });
});
