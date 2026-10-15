import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import List "mo:core/List";

module {
  public type OldActor = {};
  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    profiles : Map.Map<Principal, {
      displayName : Text;
      photo : ?Blob;
    }>;
    conversations : Map.Map<Nat, {
      id : Nat;
      participantA : Principal;
      participantB : Principal;
      createdAt : Int;
      lastMessageAt : Int;
    }>;
    messages : Map.Map<Nat, List.List<{
      id : Nat;
      conversationId : Nat;
      sender : Principal;
      body : Text;
      sentAt : Int;
    }>>;
    readState : Map.Map<Principal, Map.Map<Nat, Nat>>;
    nextConversationId : { var value : Nat };
    nextMessageId : { var value : Nat };
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      profiles = Map.empty();
      conversations = Map.empty();
      messages = Map.empty();
      readState = Map.empty();
      nextConversationId = { var value = 0 };
      nextMessageId = { var value = 0 };
    };
  };
};
