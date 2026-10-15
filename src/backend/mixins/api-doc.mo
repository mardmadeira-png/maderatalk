mixin () {
  /// Static Markdown documentation of the backend's public API.
  public query func getApiDoc() : async Text {
    "# Messaging Backend API\n\n" #
    "A WhatsApp-style one-to-one messaging backend. It stores user profiles, one-to-one conversations, and text messages, and exposes them through the public methods below.\n\n" #
    "## Authentication and identity\n\n" #
    "- `getMyProfile`, `saveMyProfile`, `listConversations`, `getMessages`, `sendMessage`, `markRead`, and `openConversation` require a signed-in (non-anonymous) caller. Anonymous callers are rejected with a trap (`Sign in to ...`).\n" #
    "- `getProfile` and `searchProfiles` are open queries and may be called by anyone, including anonymous callers.\n" #
    "- The app's frontend pins an Internet Identity derivation origin, published at `/.well-known/ii-derivation-origin` when available. An agent already holding the user's Internet Identity authorization derives the correct per-app principal against that origin (for example `icp identity link web <name> --app <host>`). Such a delegation acts with the user's full authority in this app until it expires.\n" #
    "- Registration happens only when a caller signs in through the app's own frontend. A principal that never did so is unregistered even when it belongs to the app's owner, and a signed-in caller derived against a different origin is a different principal than the one the frontend registered. Unregistered callers can still call the open queries but have no profile and no conversations.\n\n" #
    "## Profiles\n\n" #
    "- `getMyProfile() : ?ProfileView` - the caller's own profile, or `null` if none has been saved yet.\n" #
    "- `saveMyProfile(input : ProfileInput) : ProfileView` - creates or replaces the caller's profile. `ProfileInput` is `{ displayName : Text; photo : ?ExternalBlob }`. The photo is a reference to a file held in platform file storage; the backend stores the reference, never the file bytes.\n" #
    "- `getProfile(user : Principal) : ?ProfileView` - another user's public profile view, or `null` if that user has no profile.\n" #
    "- `searchProfiles(term : Text) : [ProfileView]` - registered users whose display name contains `term` as a case-insensitive substring. An empty `term` matches every registered user.\n" #
    "- `ProfileView` is `{ id : Principal; displayName : Text; photo : ?ExternalBlob }`.\n\n" #
    "## Conversations\n\n" #
    "- `openConversation(other : Principal) : Nat` - returns the id of the existing one-to-one conversation between the caller and `other`, creating one if none exists. Traps when `other` equals the caller (`Cannot open a conversation with yourself`).\n" #
    "- `listConversations() : [ConversationSummary]` - the caller's conversations, ordered by most recent activity (newest first). Each row carries the other participant's principal, display name and photo, the last message preview (`null` when the conversation has no messages), the last activity timestamp, and the caller's unread count.\n" #
    "- `ConversationSummary` is `{ id : Nat; otherParticipant : Principal; otherDisplayName : Text; otherPhoto : ?ExternalBlob; lastMessagePreview : ?Text; lastMessageAt : Timestamp; unreadCount : Nat }`.\n\n" #
    "## Messages\n\n" #
    "- `getMessages(conversationId : Nat) : [MessageView]` - the full message history in chronological order (oldest first). Traps when the caller is not a participant (`Not a participant of this conversation`) or the conversation does not exist (`Conversation not found`).\n" #
    "- `sendMessage(conversationId : Nat, body : Text) : MessageView` - appends a text message and returns the stored message. Traps for non-participants and unknown conversations.\n" #
    "- `markRead(conversationId : Nat) : ()` - records that the caller has read the conversation up to its current message count. Traps for non-participants and unknown conversations.\n" #
    "- `MessageView` is `{ id : Nat; conversationId : Nat; sender : Principal; body : Text; sentAt : Timestamp }`.\n\n" #
    "## Authorization\n\n" #
    "- Only a conversation's two participants may read its messages or send into it. Every message and conversation method enforces this on the backend.\n" #
    "- A caller may only read and update their own profile; `saveMyProfile` always writes under the caller's own principal.\n\n" #
    "## Units and encoding\n\n" #
    "- `Timestamp` is `Int` nanoseconds since the Unix epoch, as returned by `Time.now()`. Convert to milliseconds for display by dividing by 1,000,000.\n" #
    "- `Principal` values are Internet Identity principals; `Nat` ids are monotonic counters assigned by the backend.\n" #
    "- `ExternalBlob` is an opaque platform file-storage reference; it is not the file content.\n\n" #
    "## Lifecycle and polling\n\n" #
    "- There is no push channel. Clients poll `listConversations` and `getMessages` to observe new activity. `listConversations` is the cheapest way to detect change: compare `lastMessageAt` and `unreadCount`.\n" #
    "- `getMessages` returns the entire history each call; there is no incremental cursor.\n\n" #
    "## Mutation retry safety\n\n" #
    "- `sendMessage` is not idempotent: each successful call appends a new message with a fresh id. Retrying after a timeout can duplicate a message.\n" #
    "- `openConversation` is idempotent: it returns the same conversation id for the same pair of users.\n" #
    "- `saveMyProfile` is idempotent for the same input (it replaces the stored profile).\n" #
    "- `markRead` is idempotent: it sets the read count to the current message count.\n\n" #
    "## Errors and gotchas\n\n" #
    "- Authorization and validation failures trap; the frontend receives an opaque reject with the message text above.\n" #
    "- `getMessages` and `markRead` on a conversation the caller is not part of trap rather than returning an empty list.\n" #
    "- Unread counts are derived from the caller's stored read count versus the conversation's message count; they are per-caller and never shared.\n";
  };
};
