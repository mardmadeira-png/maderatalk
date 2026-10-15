import { SignInButton } from "@/components/InternetIdentity";
import { UserAvatar } from "@/components/UserAvatar";
import { useMyProfile } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { MessageSquarePlus, Settings2 } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", label: "Chats", icon: MessageSquarePlus },
  { to: "/profile", label: "Profile", icon: Settings2 },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const { data: profile } = useMyProfile();
  const location = useLocation();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card shadow-subtle">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <Link
            to="/"
            data-ocid="nav.home_link"
            className="flex items-center gap-2.5 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <MessageSquarePlus className="size-5" aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">
              Signal
            </span>
          </Link>

          <nav aria-label="Primary" className="flex items-center gap-1">
            {navItems.map((item) => {
              const active =
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  data-ocid={`nav.${item.label.toLowerCase()}_link`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
            {profile && (
              <Link
                to="/profile"
                data-ocid="nav.avatar_link"
                aria-label="Your profile"
                className="ml-1 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <UserAvatar
                  name={profile.displayName}
                  photo={profile.photo}
                  className="size-9"
                />
              </Link>
            )}
            <SignInButton className="ml-1 rounded-full border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60" />
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-background">{children}</main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 text-center text-xs text-muted-foreground md:px-6">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
