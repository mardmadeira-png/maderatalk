import { AuthenticatedApp } from "@/components/InternetIdentity";
import { Layout } from "@/components/Layout";
import { ProfileGate } from "@/components/ProfileGate";
import ChatListPage from "@/pages/ChatListPage";
import ConversationPage from "@/pages/ConversationPage";
import ProfilePage from "@/pages/ProfilePage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const chatListRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/",
  component: ChatListPage,
});

const conversationRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/chat/$conversationId",
  component: ConversationPage,
});

const profileRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/profile",
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  appRoute.addChildren([chatListRoute, conversationRoute, profileRoute]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <AuthenticatedApp
      title="Welcome to Signal"
      description="Sign in with Internet Identity to start messaging. Your conversations stay private to you."
      className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground"
      buttonClassName="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-smooth hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
    >
      <ProfileGate>
        <RouterProvider router={router} />
      </ProfileGate>
    </AuthenticatedApp>
  );
}
