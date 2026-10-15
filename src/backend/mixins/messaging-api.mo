import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import MessagingLib "../lib/messaging";
import Types "../types/messaging";
import ProfileTypes "../types/profiles";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  conversations : Map.Map<Nat, Types.Conversation>,
  messages : Map.Map<Nat, List.List<Types.Message>>,
  readState : Map.Map<Common.UserId, Map.Map<Nat, Nat>>,
  profiles : Map.Map<Common.UserId, ProfileTypes.Profile>,
  nextConversationId : { var value : Nat },
  nextMessageId : { var value : Nat },
) {
  /// The caller's conversations, most recent activity first.
  public query ({ caller }) func listConversations() : async [Types.ConversationSummary] {
    MessagingLib.listConversations(conversations, messages, readState, profiles, caller);
  };

  /// Full message history of a conversation in chronological order.
  public query ({ caller }) func getMessages(conversationId : Nat) : async [Types.MessageView] {
    MessagingLib.getMessages(conversations, messages, caller, conversationId);
  };

  /// Send a text message into a conversation.
  public shared ({ caller }) func sendMessage(conversationId : Nat, body : Text) : async Types.MessageView {
    if (caller.isAnonymous()) {
      Runtime.trap("Sign in to send messages");
    };
    MessagingLib.sendMessage(conversations, messages, nextMessageId, caller, conversationId, body);
  };

  /// Mark a conversation as read for the caller.
  public shared ({ caller }) func markRead(conversationId : Nat) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Sign in to update read state");
    };
    MessagingLib.markRead(conversations, messages, readState, caller, conversationId);
  };

  /// Find an existing one-to-one conversation between the caller and another
  /// user, or create one.
  public shared ({ caller }) func openConversation(other : Common.UserId) : async Nat {
    if (caller.isAnonymous()) {
      Runtime.trap("Sign in to start a conversation");
    };
    MessagingLib.openConversation(conversations, messages, nextConversationId, caller, other);
  };
};
