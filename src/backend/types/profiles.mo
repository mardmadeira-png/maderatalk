import Storage "mo:caffeineai-object-storage/Storage";
import Common "common";

module {
  /// A registered user's profile.
  public type Profile = {
    displayName : Text;
    /// Reference to a photo stored through the platform file storage
    /// extension. The backend stores the reference, never the bytes.
    photo : ?Storage.ExternalBlob;
  };

  /// Fields a caller may set on their own profile.
  public type ProfileInput = {
    displayName : Text;
    photo : ?Storage.ExternalBlob;
  };

  /// A profile as returned to other users (no private fields exist today).
  public type ProfileView = {
    id : Common.UserId;
    displayName : Text;
    photo : ?Storage.ExternalBlob;
  };
};
