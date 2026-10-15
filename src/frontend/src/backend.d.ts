import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
import type { ExternalBlob } from "@caffeineai/object-storage";
export type { ExternalBlob } from "@caffeineai/object-storage";
export interface Cell {
    value: Value;
    name: string;
}
export interface ConversationSummary {
    id: bigint;
    otherParticipant: UserId;
    lastMessageAt: Timestamp;
    lastMessagePreview?: string;
    otherPhoto?: ExternalBlob;
    unreadCount: bigint;
    otherDisplayName: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface MessageView {
    id: bigint;
    body: string;
    sender: UserId;
    sentAt: Timestamp;
    conversationId: bigint;
}
export interface ProfileInput {
    displayName: string;
    photo?: ExternalBlob;
}
export interface ProfileView {
    id: UserId;
    displayName: string;
    photo?: ExternalBlob;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Timestamp = bigint;
export type UserId = Principal;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Static Markdown documentation of the backend's public API.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Full message history of a conversation in chronological order.
     */
    getMessages(conversationId: bigint): Promise<Array<MessageView>>;
    /**
     * / Read the caller's own profile.
     */
    getMyProfile(): Promise<ProfileView | null>;
    /**
     * / Look up a single user's public profile.
     */
    getProfile(user: UserId): Promise<ProfileView | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / The caller's conversations, most recent activity first.
     */
    listConversations(): Promise<Array<ConversationSummary>>;
    /**
     * / Mark a conversation as read for the caller.
     */
    markRead(conversationId: bigint): Promise<void>;
    /**
     * / Find an existing one-to-one conversation between the caller and another
     * / user, or create one.
     */
    openConversation(other: UserId): Promise<bigint>;
    /**
     * / Create or replace the caller's own profile.
     */
    saveMyProfile(input: ProfileInput): Promise<ProfileView>;
    schema(): Promise<string>;
    /**
     * / Search registered users by display name (case-insensitive substring).
     */
    searchProfiles(term: string): Promise<Array<ProfileView>>;
    /**
     * / Send a text message into a conversation.
     */
    sendMessage(conversationId: bigint, body: string): Promise<MessageView>;
}
