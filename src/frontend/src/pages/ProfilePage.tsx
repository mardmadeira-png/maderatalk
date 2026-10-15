import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { UserSearch } from "@/components/profile/UserSearch";

export default function ProfilePage() {
  return (
    <section
      data-ocid="profile.page"
      className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8"
    >
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage how you appear and find people to message.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileEditor />
        <UserSearch />
      </div>
    </section>
  );
}
