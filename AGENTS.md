# Project Guidance

## User Preferences

- WhatsApp-style messaging experience: familiar chat list and conversation layout
- Responsive design that works well on mobile and desktop

## Accepted Requirements

- Social messaging app with WhatsApp-style one-to-one chat
- Send and receive text messages between users
- Chat list showing conversations
- User profile with display name and photo

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Backend exports for this app: getMyProfile, saveMyProfile, getProfile, searchProfiles, listConversations, getMessages, sendMessage, markRead, openConversation, getApiDoc.
- Frontend routes: / (chat list), /chat/$conversationId (conversation), /profile (profile and people search). Route params are strings; convert conversation IDs with BigInt().
- Shared frontend helpers live in src/frontend/src/types/index.ts (photoUrl, initials), src/frontend/src/lib/time.ts (timestamp formatters), and src/frontend/src/hooks/useQueries.ts (React Query hooks).
- Profile photos use ExternalBlob.getDirectURL() wrapped in the photoUrl() helper; uploads use ExternalBlob.fromBytes(bytes, type, name).withUploadProgress(cb) from the object-storage extension.
- OQL: a Map keyed by Principal whose record has no id field needs OQL.Entity.manual over .entries() with a .payload promoting the key; a ?Storage.ExternalBlob field is not auto-derivable and must be omitted from the manual payload.
- Motoko text literals reject backslash-newline continuations; author long Markdown in api-doc.mo as "line\n" # "line\n" concatenation.
- The pending migration 00000000_000000.mo must initialize every final stable actor field or the build fails with M0254/M0267; migration files may only import mo:core and other mops packages, never project modules.
- caffeineai-object-storage must be listed in mops.toml [dependencies] when main.mo or types import it.
- biome useExhaustiveDependencies is satisfied when an effect body reads the dependency behind an early-return guard, so no suppression is needed.
