module {
  /// A user identity, keyed by the caller's principal.
  public type UserId = Principal;

  /// Nanoseconds since the Unix epoch (signed, as returned by `Time.now()`).
  public type Timestamp = Int;
};
