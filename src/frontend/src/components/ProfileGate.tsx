import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMyProfile, useSaveMyProfile } from "@/hooks/useQueries";
import { ExternalBlob } from "@caffeineai/object-storage";
import { Camera, Loader2 } from "lucide-react";
import { type ChangeEvent, type ReactNode, useRef, useState } from "react";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/**
 * Blocks the app until the signed-in user has a display name. First-time users
 * set a name and optional photo before any chat content is reachable.
 */
export function ProfileGate({ children }: { children: ReactNode }) {
  const { data: profile, isLoading } = useMyProfile();
  const saveProfile = useSaveMyProfile();
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<ExternalBlob | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return (
      <output
        data-ocid="profile.loading_state"
        className="grid min-h-dvh place-items-center bg-background text-muted-foreground"
      >
        Loading your profile…
      </output>
    );
  }

  if (profile) return <>{children}</>;

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      setError("Photo must be 5 MB or smaller.");
      return;
    }
    setError(null);
    const bytes = new Uint8Array(await file.arrayBuffer());
    setPhoto(ExternalBlob.fromBytes(bytes, file.type, file.name));
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a display name.");
      return;
    }
    setError(null);
    saveProfile.mutate(
      { displayName: trimmed, photo },
      {
        onError: () =>
          setError("Could not save your profile. Please try again."),
      },
    );
  };

  return (
    <section
      aria-label="Set up your profile"
      data-ocid="profile.setup_panel"
      className="grid min-h-dvh place-items-center bg-background px-4 py-10"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-elevated md:p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Set up your profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose how you appear to the people you message.
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <UserAvatar
            name={name || "You"}
            photo={photo}
            className="size-24 text-2xl"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFile}
          />
          <Button
            type="button"
            variant="outline"
            data-ocid="profile.upload_button"
            className="rounded-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="size-4" aria-hidden="true" />
            {photo ? "Change photo" : "Add photo"}
          </Button>
        </div>

        <div className="mt-6 space-y-2">
          <Label htmlFor="display-name">Display name</Label>
          <Input
            id="display-name"
            data-ocid="profile.input"
            value={name}
            maxLength={40}
            placeholder="e.g. Ada Lovelace"
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSubmit();
            }}
          />
        </div>

        {error && (
          <p
            role="alert"
            data-ocid="profile.error_state"
            className="mt-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <Button
          type="button"
          data-ocid="profile.submit_button"
          className="mt-6 w-full rounded-full"
          disabled={saveProfile.isPending || name.trim().length === 0}
          onClick={handleSubmit}
        >
          {saveProfile.isPending && (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          )}
          Continue to chats
        </Button>
      </div>
    </section>
  );
}
