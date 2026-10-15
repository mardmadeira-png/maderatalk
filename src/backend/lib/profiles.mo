import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/profiles";
import Common "../types/common";

module {
  /// Read a caller's own profile.
  public func getProfile(
    profiles : Map.Map<Common.UserId, Types.Profile>,
    caller : Common.UserId,
  ) : ?Types.Profile {
    profiles.get(caller);
  };

  /// Create or replace the caller's own profile.
  public func saveProfile(
    profiles : Map.Map<Common.UserId, Types.Profile>,
    caller : Common.UserId,
    input : Types.ProfileInput,
  ) : () {
    profiles.add(caller, { displayName = input.displayName; photo = input.photo });
  };

  /// Search registered users by display name (case-insensitive substring).
  public func searchProfiles(
    profiles : Map.Map<Common.UserId, Types.Profile>,
    term : Text,
  ) : [Types.ProfileView] {
    let needle = term.toLower();
    let matches = profiles.entries().filter(func((id, profile)) {
      profile.displayName.toLower().contains(#text needle)
    });
    matches.map(func((id, profile)) { toView(id, profile) }).toArray();
  };

  /// Look up a single user's public profile.
  public func getProfileView(
    profiles : Map.Map<Common.UserId, Types.Profile>,
    user : Common.UserId,
  ) : ?Types.ProfileView {
    switch (profiles.get(user)) {
      case (?profile) { ?toView(user, profile) };
      case null { null };
    };
  };

  /// Project a stored profile into its public view.
  public func toView(id : Common.UserId, profile : Types.Profile) : Types.ProfileView {
    { id; displayName = profile.displayName; photo = profile.photo };
  };
};
