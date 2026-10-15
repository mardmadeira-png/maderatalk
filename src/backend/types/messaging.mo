import Storage "mo:caffeineai-object-storage/Storage";
import Common "common";

module {
  /// A one-to-one conversation between exactly two participants.
  public type Conversation = {
    id : Nat;
    participantA : Common.UserId;
    participantB : Common.UserId;
    createdAt : Common.Timestamp;
    lastMessageAt : Common.Timestamp;
  };

  /// A single text message inside a conversation.
  public type Message = {
    id : Nat;
    conversationId : Nat;
    sender : Common.UserId;
    body : Text;
    sentAt : Common.Timestamp;
  };

  /// A message as returned to a participant.
  public type MessageView = {
    id : Nat;
    conversationId : Nat;
    sender : Common.UserId;
    body : Text;
    sentAt : Common.Timestamp;
  };

  /// A conversation row for the caller's chat list.
  public type ConversationSummary = {
    id : Nat;
    otherParticipant : Common.UserId;
    otherDisplayName : Text;
    otherPhoto : ?Storage.ExternalBlob;
    lastMessagePreview : ?Text;
    lastMessageAt : Common.Timestamp;
    unreadCount : Nat;
  };
};
