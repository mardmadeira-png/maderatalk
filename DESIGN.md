# Design Brief

## Direction

Signal Ink — a dark, confident one-to-one messaging workspace with an editorial split-pane layout and a single vivid teal accent.

## Tone

Refined dark product design (Linear/Vercel restraint) pushed with a warm-cool teal signature — calm surfaces, decisive accent, zero decoration for decoration's sake.

## Differentiation

The teal "ink" accent threads continuously through own-message bubbles, unread pills, the send button, and active-row indicators — one color that reads as the app's voice, on a near-black canvas instead of WhatsApp's bright chrome.

## Color Palette

| Token      | OKLCH         | Role                                     |
| ---------- | ------------- | ---------------------------------------- |
| background | 0.155 0.012 240 | App canvas, deep ink slate            |
| foreground | 0.95 0.008 220  | Primary text, near-white              |
| card       | 0.2 0.014 240   | Panels, list rows, incoming bubbles   |
| primary    | 0.72 0.14 175   | Teal accent: CTAs, own bubbles, badges |
| accent     | 0.72 0.14 175   | Active states, focus rings, links     |
| muted      | 0.26 0.016 240  | Inactive surfaces, input backgrounds  |
| destructive| 0.6 0.2 25      | Send failures, destructive actions    |
| success    | 0.72 0.15 155   | Confirmation, delivered states        |

## Typography

- Display: Space Grotesk — wordmark, contact names, conversation headers, section titles
- Body: General Sans — message text, previews, labels, buttons
- Mono: Geist Mono — timestamps and numeric metadata
- Scale: hero `text-4xl md:text-6xl font-bold tracking-tight`, h2 `text-2xl md:text-3xl font-bold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase`, body `text-sm md:text-base`

## Elevation & Depth

Three-tier surface hierarchy (background → card → popover) with soft, low-opacity ink shadows (`shadow-subtle`, `shadow-elevated`, `shadow-bubble`) — depth from layered slate surfaces, never glow.

## Structural Zones

| Zone          | Background        | Border        | Notes                                          |
| ------------- | ----------------- | ------------- | ---------------------------------------------- |
| App header    | `bg-card`         | `border-b`    | Wordmark left, compose action right            |
| List column   | `bg-sidebar`      | `border-r`    | Rows alternate `bg-card` / hover `bg-muted/50` |
| Chat header   | `bg-card`         | `border-b`    | Avatar + name + status line                    |
| Message thread| `bg-background`   | —             | Incoming `bg-card`, own `bg-primary` bubbles   |
| Composer      | `bg-card`         | `border-t`    | Pill input, circular teal send button          |

## Spacing & Rhythm

Generous list rows (`px-4 py-3`, `gap-3`); message thread uses `space-y-2` with `px-4 md:px-6` gutters; section gaps `gap-6`; micro-spacing multiples of 4px throughout.

## Component Patterns

- Buttons: pill (`rounded-full`) primary teal for send/compose; ghost icon buttons for secondary actions; hover brightens via `--transition-smooth`
- Cards: `rounded-2xl`, `bg-card`, `shadow-subtle`; avatars circular with `ring-1 ring-border`
- Badges: circular teal unread pills (`bg-primary text-primary-foreground`), small mono numerals
- Bubbles: `rounded-2xl` with a flattened corner on the sender side; incoming `bg-card`, own `bg-primary`

## Motion

- Entrance: message bubbles `animate-message-in` (280ms ease-out, 6px rise + scale); panels `animate-fade-in` (400ms)
- Hover: rows and buttons shift background/brightness over 300ms `--transition-smooth`
- Decorative: `pulse-ring` on the send button while a message is in flight; no ambient motion otherwise

## Constraints

- Dark theme is primary; light mode is a tuned companion, never a naive inversion
- Teal accent is the only saturated color in the chrome — used sparingly for emphasis
- No purple gradients, no glassmorphism, no neon glow shadows
- No raw color literals or arbitrary Tailwind color classes; semantic tokens only
- Text must hold AA+ contrast in both modes
- No voice/video call, group chat, status, attachments, read receipts, presence, or search UI

## Signature Detail

The flattened-corner message bubble with a teal "ink" accent that recurs across bubbles, unread pills, and the send button — a single-color identity system (typographic + material category).
