import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMyProfile, useSaveMyProfile } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { ExternalBlob } from "@caffeineai/object-storage";
import { Camera, Check, Loader2 } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/**
 * Edits the signed-in user's display name and profile photo. The photo upload
 * reports progress through the platform file storage extension.
 */
export function ProfileEditor() {
  const { data: profile, isLoading, isError, refetch } = useMyProfile();
  const saveProfile = useSaveMyProfile();

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<ExternalBlob | undefined>(undefined);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seed the draft once from the loaded profile; never overwrite user edits.
  useEffect(() => {
    if (profile) {
      setName(profile.displayName);
      setPhoto(profile.photo);
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div
        data-ocid="profile.editor.loading_state"
        className="rounded-2xl border border-border bg-card p-6 shadow-subtle md:p-8"
      >
        <div className="flex items-center gap-4">
          <div className="size-20 animate-pulse rounded-full bg-secondary" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-ocid="profile.editor.error_state"
        className="rounded-2xl border border-border bg-card p-8 text-center shadow-subtle"
      >
        <h2 className="font-display text-lg font-semibold">
          Couldn’t load your profile
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Something went wrong while fetching your details.
        </p>
        <Button
          type="button"
          data-ocid="profile.editor.retry_button"
          className="mt-5 rounded-full"
          onClick={() => void refetch()}
        >
          Try again
        </Button>
      </div>
    );
  }

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("Photo must be 5 MB or smaller.");
      return;
    }
    setError(null);
    setSaved(false);
    setProgress(0);
    const bytes = new Uint8Array(await file.arrayBuffer());
    setPhoto(
      ExternalBlob.fromBytes(bytes, file.type, file.name).withUploadProgress(
        (pct) => setProgress(pct),
      ),
    );
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a display name.");
      return;
    }
    setError(null);
    setSaved(false);
    saveProfile.mutate(
      { displayName: trimmed, photo },
      {
        onSuccess: () => {
          setSaved(true);
          setProgress(null);
        },
        onError: () => {
          setError("Could not save your profile. Please try again.");
          setProgress(null);
        },
      },
    );
  };

  const uploading = progress !== null && progress < 100;
  const pending = saveProfile.isPending || uploading;

  return (
    <section
      aria-labelledby="profile-editor-heading"
      data-ocid="profile.editor.panel"
      className="rounded-2xl border border-border bg-card p-6 shadow-subtle md:p-8"
    >
      <h2
        id="profile-editor-heading"
        className="font-display text-lg font-semibold tracking-tight"
      >
        Your details
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        This is how you appear to the people you message.
      </p>

      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <UserAvatar
          name={name || "You"}
          photo={photo}
          className="size-24 text-2xl"
        />
        <div className="flex flex-col items-center gap-2 sm:items-start">
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
            disabled={pending}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="size-4" aria-hidden="true" />
            {photo ? "Change photo" : "Add photo"}
          </Button>
          <p className="text-xs text-muted-foreground">
            JPG, PNG or GIF · up to 5 MB
          </p>
        </div>
      </div>

      {progress !== null && (
        <div
          data-ocid="profile.upload_progress"
          className="mt-5"
          aria-live="polite"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{progress < 100 ? "Uploading photo…" : "Photo ready"}</span>
            <span className="font-mono">{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-smooth"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-6 space-y-2">
        <Label htmlFor="profile-display-name">Display name</Label>
        <Input
          id="profile-display-name"
          data-ocid="profile.input"
          value={name}
          maxLength={40}
          placeholder="e.g. Ada Lovelace"
          onChange={(event) => {
            setName(event.target.value);
            setSaved(false);
          }}
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

      <div className="mt-6 flex items-center gap-3">
        <Button
          type="button"
          data-ocid="profile.save_button"
          className="rounded-full"
          disabled={pending || name.trim().length === 0}
          onClick={handleSubmit}
        >
          {pending && (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          )}
          Save changes
        </Button>
        {saved && !pending && (
          <span
            data-ocid="profile.success_state"
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium text-primary",
            )}
          >
            <Check className="size-4" aria-hidden="true" />
            Profile saved
          </span>
        )}
      </div>
    </section>
  );
}
