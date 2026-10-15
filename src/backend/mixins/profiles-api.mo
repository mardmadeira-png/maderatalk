import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import ProfilesLib "../lib/profiles";
import Types "../types/profiles";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, Types.Profile>,
) {
  /// Read the caller's own profile.
  public query ({ caller }) func getMyProfile() : async ?Types.ProfileView {
    ProfilesLib.getProfileView(profiles, caller);
  };

  /// Create or replace the caller's own profile.
  public shared ({ caller }) func saveMyProfile(input : Types.ProfileInput) : async Types.ProfileView {
    if (caller.isAnonymous()) {
      Runtime.trap("Sign in to save your profile");
    };
    ProfilesLib.saveProfile(profiles, caller, input);
    ProfilesLib.toView(caller, { displayName = input.displayName; photo = input.photo });
  };

  /// Look up a single user's public profile.
  public query func getProfile(user : Common.UserId) : async ?Types.ProfileView {
    ProfilesLib.getProfileView(profiles, user);
  };

  /// Search registered users by display name (case-insensitive substring).
  public query func searchProfiles(term : Text) : async [Types.ProfileView] {
    ProfilesLib.searchProfiles(profiles, term);
  };
};
