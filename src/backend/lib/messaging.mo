import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Types "../types/messaging";
import ProfileTypes "../types/profiles";
import Common "../types/common";

module {
  /// True when `caller` is one of the conversation's two participants.
  func isParticipant(conversation : Types.Conversation, caller : Common.UserId) : Bool {
    Principal.equal(conversation.participantA, caller) or Principal.equal(conversation.participantB, caller);
  };

  /// The other participant of a one-to-one conversation.
  func otherParticipant(conversation : Types.Conversation, caller : Common.UserId) : Common.UserId {
    if (Principal.equal(conversation.participantA, caller)) {
      conversation.participantB;
    } else {
      conversation.participantA;
    };
  };

  /// The caller's conversations, most recent activity first.
  public func listConversations(
    conversations : Map.Map<Nat, Types.Conversation>,
    messages : Map.Map<Nat, List.List<Types.Message>>,
    readState : Map.Map<Common.UserId, Map.Map<Nat, Nat>>,
    profiles : Map.Map<Common.UserId, ProfileTypes.Profile>,
    caller : Common.UserId,
  ) : [Types.ConversationSummary] {
    let mine = conversations.values().filter(func(conversation) {
      isParticipant(conversation, caller)
    });
    let summaries = mine.map(func(conversation) {
      let other = otherParticipant(conversation, caller);
      let (otherName, otherPhoto) = switch (profiles.get(other)) {
        case (?profile) { (profile.displayName, profile.photo) };
        case null { ("", null) };
      };
      let history = messages.get(conversation.id);
      let lastPreview = switch (history) {
        case (?list) {
          switch (list.get(list.size() - 1)) {
            case (?message) { ?message.body };
            case null { null };
          };
        };
        case null { null };
      };
      let lastRead = switch (readState.get(caller)) {
        case (?perConversation) { perConversation.get(conversation.id) ?? 0 };
        case null { 0 };
      };
      let total = switch (history) {
        case (?list) { list.size() };
        case null { 0 };
      };
      let unread = if (total > lastRead) { total - lastRead } else { 0 };
      {
        id = conversation.id;
        otherParticipant = other;
        otherDisplayName = otherName;
        otherPhoto;
        lastMessagePreview = lastPreview;
        lastMessageAt = conversation.lastMessageAt;
        unreadCount = unread;
      };
    });
    summaries.toArray().sort(func(a, b) {
      if (a.lastMessageAt > b.lastMessageAt) { #less } else if (a.lastMessageAt < b.lastMessageAt) {
        #greater;
      } else { #equal };
    });
  };

  /// Full message history of a conversation in chronological order.
  /// Traps when the caller is not a participant.
  public func getMessages(
    conversations : Map.Map<Nat, Types.Conversation>,
    messages : Map.Map<Nat, List.List<Types.Message>>,
    caller : Common.UserId,
    conversationId : Nat,
  ) : [Types.MessageView] {
    let conversation = conversations.get(conversationId)
      ?? Runtime.trap("Conversation not found");
    if (not isParticipant(conversation, caller)) {
      Runtime.trap("Not a participant of this conversation");
    };
    let history = messages.get(conversationId) ?? List.empty<Types.Message>();
    history.toArray().map(func(message) { toView(message) });
  };

  /// Send a text message into a conversation. Traps when the caller is not a
  /// participant. Returns the stored message.
  public func sendMessage(
    conversations : Map.Map<Nat, Types.Conversation>,
    messages : Map.Map<Nat, List.List<Types.Message>>,
    nextMessageId : { var value : Nat },
    caller : Common.UserId,
    conversationId : Nat,
    body : Text,
  ) : Types.MessageView {
    let conversation = conversations.get(conversationId)
      ?? Runtime.trap("Conversation not found");
    if (not isParticipant(conversation, caller)) {
      Runtime.trap("Not a participant of this conversation");
    };
    let now = Time.now();
    let message : Types.Message = {
      id = nextMessageId.value;
      conversationId;
      sender = caller;
      body;
      sentAt = now;
    };
    nextMessageId.value += 1;
    let history = switch (messages.get(conversationId)) {
      case (?list) { list };
      case null {
        let list = List.empty<Types.Message>();
        messages.add(conversationId, list);
        list;
      };
    };
    history.add(message);
    conversations.add(conversationId, { conversation with lastMessageAt = now });
    toView(message);
  };

  /// Mark a conversation as read for the caller. Traps when the caller is not
  /// a participant.
  public func markRead(
    conversations : Map.Map<Nat, Types.Conversation>,
    messages : Map.Map<Nat, List.List<Types.Message>>,
    readState : Map.Map<Common.UserId, Map.Map<Nat, Nat>>,
    caller : Common.UserId,
    conversationId : Nat,
  ) : () {
    let conversation = conversations.get(conversationId)
      ?? Runtime.trap("Conversation not found");
    if (not isParticipant(conversation, caller)) {
      Runtime.trap("Not a participant of this conversation");
    };
    let total = switch (messages.get(conversationId)) {
      case (?list) { list.size() };
      case null { 0 };
    };
    let perConversation = switch (readState.get(caller)) {
      case (?map) { map };
      case null {
        let map = Map.empty<Nat, Nat>();
        readState.add(caller, map);
        map;
      };
    };
    perConversation.add(conversationId, total);
  };

  /// Find an existing one-to-one conversation between two users, or create one.
  public func openConversation(
    conversations : Map.Map<Nat, Types.Conversation>,
    messages : Map.Map<Nat, List.List<Types.Message>>,
    nextConversationId : { var value : Nat },
    caller : Common.UserId,
    other : Common.UserId,
  ) : Nat {
    if (Principal.equal(caller, other)) {
      Runtime.trap("Cannot open a conversation with yourself");
    };
    let existing = conversations.values().find(func(conversation) {
      let a = conversation.participantA;
      let b = conversation.participantB;
      (Principal.equal(a, caller) and Principal.equal(b, other)) or (Principal.equal(a, other) and Principal.equal(b, caller))
    });
    switch (existing) {
      case (?conversation) { conversation.id };
      case null {
        let now = Time.now();
        let id = nextConversationId.value;
        nextConversationId.value += 1;
        conversations.add(id, {
          id;
          participantA = caller;
          participantB = other;
          createdAt = now;
          lastMessageAt = now;
        });
        messages.add(id, List.empty<Types.Message>());
        id;
      };
    };
  };

  /// Project a stored message into its public view.
  public func toView(message : Types.Message) : Types.MessageView {
    {
      id = message.id;
      conversationId = message.conversationId;
      sender = message.sender;
      body = message.body;
      sentAt = message.sentAt;
    };
  };
};
