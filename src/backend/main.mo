import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import ProfileTypes "types/profiles";
import MessageTypes "types/messaging";
import Common "types/common";
import ProfilesApi "mixins/profiles-api";
import MessagingApi "mixins/messaging-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);
  include MixinObjectStorage();

  let profiles : Map.Map<Common.UserId, ProfileTypes.Profile>;
  let conversations : Map.Map<Nat, MessageTypes.Conversation>;
  let messages : Map.Map<Nat, List.List<MessageTypes.Message>>;
  let readState : Map.Map<Common.UserId, Map.Map<Nat, Nat>>;
  let nextConversationId : { var value : Nat };
  let nextMessageId : { var value : Nat };

  include ProfilesApi(accessControlState, profiles);
  include MessagingApi(
    accessControlState,
    conversations,
    messages,
    readState,
    profiles,
    nextConversationId,
    nextMessageId,
  );

  transient let samplePrincipal = Principal.fromText("aaaaa-aa");

  include Expose({
    entities = [
      OQL.Entity.manual<(Common.UserId, ProfileTypes.Profile)>(
        "profile",
        func () = profiles.entries(),
        "Profile",
        "id",
      )
        .sample((samplePrincipal, { displayName = ""; photo = null }))
        .payload("id", func ((id, _)) = id)
        .payload("displayName", func ((_, profile)) = profile.displayName)
        .public_()
        .build(),
      conversations.toEntity("conversation", "Conversation", "id")
        .sample({
          id = 0;
          participantA = samplePrincipal;
          participantB = samplePrincipal;
          createdAt = 0;
          lastMessageAt = 0;
        })
        .controllerOnly()
        .build(),
    ];
  });

  include ApiDocMixin();
};
