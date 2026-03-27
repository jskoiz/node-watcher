# BRDG — Design Review Brief

> **Storybook (live):** https://brdg-storybook.vercel.app
> **Repo:** https://github.com/jskoiz/brdg
> **Stack:** Expo 54 + React Native 0.81 + React 19 | NestJS 11 + Prisma 5 + Postgres

---

## 1. What BRDG Is

A fitness-oriented social/dating mobile app. Users discover each other through shared fitness interests, match via swipe, chat, and organize workout events together.

**Core user flows:**
1. **Sign up → Onboard** (11-step flow: intent, environment, frequency, schedule, activities, social style, fitness level, photos)
2. **Discover** — Swipe deck of candidates filtered by distance, age, fitness goals, intensity
3. **Match** — Mutual likes create a match (auto-classified as dating/workout/friend)
4. **Chat** — Message matches, suggest workout plans, send event invites
5. **Events** — Browse/create group fitness events, RSVP, invite matches

---

## 2. Navigation Structure

```
RootStack
├── Main (5-tab bottom navigator)
│   ├── Discover — Swipe deck + quick filters
│   ├── Explore — Event discovery grid
│   ├── Create — Event creation form
│   ├── Inbox — Match photo grid
│   └── You — Profile editor
│
├── Chat (modal) — Message thread
├── ProfileDetail (modal) — View other user
├── EventDetail (modal) — Event info + RSVP
├── MyEvents (modal) — User's events
├── Notifications (modal) — Alert history
├── Onboarding (modal) — 11-step flow
├── Login (auth) — Email/password
└── Signup (auth) — Account creation
```

---

## 3. Design System

### Color Palette (Light-only — no dark mode)

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#C4A882` (warm gold) | CTAs, interactive states, focus borders |
| `accent` | `#8B7A9C` (muted lavender) | Secondary emphasis |
| `energy` | `#D4A59A` (soft blush) | Notifications, energy states |
| `background` | `#FDFBF8` (cream) | App background |
| `backgroundSoft` | `#F7F4F0` | Subtle panels |
| `surface` | `#FFFFFF` | Cards, inputs |
| `textPrimary` | `#2C2420` (dark brown) | Body text |
| `textSecondary` | `#5C544C` | Supporting text |
| `textMuted` | `#6B6159` | Labels, captions |
| `danger` | `#C97070` | Destructive actions |
| `success` | `#8BAA7A` | Positive states |
| `border` | `#E8E2DA` | Default borders |
| `borderFocus` | `#C4A882` | Focus state |

**Design intent:** Warm, wellness-inspired palette. Intentionally NOT dark/gaming aesthetic.

### Typography

| Style | Size | Weight |
|-------|------|--------|
| Display | 42px | — |
| H1 | 30px | — |
| H2 | 24px | — |
| H3 | 20px | — |
| Body | 16px | 600 |
| Body Small | 14px | — |
| Caption | 12px | — |

### Spacing Scale

| Token | Value |
|-------|-------|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px (default screen/card padding) |
| `xl` | 20px |
| `xxl` | 24px (section spacing) |
| `xxxl` | 32px |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 12px | Small elements |
| `md` | 16px | Cards |
| `lg` | 22px | Glass surfaces |
| `xl` | 28px | Large cards |
| `sheet` | 38px | Bottom sheets |
| `pill` | 999px | Buttons, chips |

### Shadows

- **Soft:** opacity 0.08, radius 12 — default cards
- **Medium:** opacity 0.10, radius 24 — elevated surfaces
- **Card:** opacity 0.12, radius 30 — prominent cards
- **Glow:** primary-colored, opacity 0.08 — interactive focus

### Glass Material System (Apple Liquid Glass-inspired)

Five tiers: `thin` (12% opacity, 8px blur) → `light` (20%, 20px) → `medium` (35%, 24px) → `thick` (82%, 40px) → `frosted` (72%, 40px)

Tinted variants: `tintedPrimary` (gold), `tintedAccent` (lavender). Accessibility fallback to solid colors when Reduce Transparency is enabled.

---

## 4. Component Primitives

### Button
7 variants: `primary` | `secondary` | `accent` | `energy` | `ghost` | `danger` | `glass` | `glassProminent`

2 sizes: `default` | `sm`

Spring-based press animation (0.97 scale), respects Reduce Motion. Loading state shows spinner.

### Card
5 variants: `default` | `elevated` | `flat` | `glass` | `imageCard`

Optional `accent` left strip, optional `onPress` for interactivity. Glass variant uses native BlurView.

### Input
Animated focus glow, uppercase labels, red error messages (accessible announcements). Multiline mode with 110px min height.

### Chip
Active/inactive toggle. Active state shows tinted background, inactive shows frosted overlay.

### GlassView
5 blur tiers, optional specular highlight (subtle top-edge reflection). Falls back to solid on Android.

### StatePanel
Empty/loading/error states with icon, title, description, optional action button.

### Skeleton
`SkeletonBox`, `SkeletonCircle`, `SkeletonTextLine` with shimmer animation.

### Bottom Sheet
@gorhom/bottom-sheet with 4 preset snap points: compact (50%), standard (62%), form (72%), tall (82%).

---

## 5. Screen-by-Screen Inventory

### Auth
- **LoginScreen** — BRDG branding, tagline ("Connect through movement"), value props (Discovery/Pace), email/password form, signup link
- **SignupScreen** — Multi-step account creation

### Onboarding (11 steps)
Welcome → Intent → Environment → Frequency → Schedule → Activities → Social → Fitness Builder → Fitness Level → Photos → Ready

### Home (Discover Tab)
- Hero with greeting + notification bell
- Quick filter chips (All, Strength, Cardio, Flexibility, Outdoor, Social)
- Swipe deck (card-based, photo + name + distance)
- Filter sheet (age, distance, goals, intensity, availability)
- Nudge card for incomplete profiles

### Explore Tab
- Category tabs for event types
- Event card grid (image, title, time, location)
- Quick actions sheet per event
- Create event shortcut

### Create Tab
- Multi-section form: Activity selection, Timing (date/time pickers), Location, Participants (stepper), Notes
- Zod-validated

### Inbox (Matches) Tab
- Photo grid of matches with hash-based accent colors
- Tap → ProfileDetail or Chat

### You (Profile) Tab
- Profile hero (avatar, name, edit bar)
- Photo management (upload, reorder, set primary, hide)
- Sections: Bio, Fitness goals, Interests, Settings
- Completeness bar

### Chat
- Message thread (FlashList optimized)
- Composer with send button + activity tag
- Quick actions: Suggest plan, share event, block, report
- Event invite cards inline
- Match picker sheet
- Suggest plan sheet

### ProfileDetail
- View-only profile with photos, fitness build, interests
- Block/report via moderation sheet

### EventDetail
- Event info: title, category, time, location, attendees
- RSVP action
- Invite to matches

### Notifications
- Chronological list of alerts (matches, messages, events, system)
- Mark all read

---

## 6. Data Model (what shapes the UI)

| Entity | Key Fields | UI Location |
|--------|-----------|-------------|
| **User** | name, birthdate, gender, pronouns, isOnboarded | Profile, cards |
| **UserProfile** | bio, city, intent (dating/workout/friends), showMe, age/distance filters | Profile editor, discovery filters |
| **UserFitnessProfile** | intensity, frequency, goals, training style, time preferences | Onboarding, profile sections |
| **UserPhoto** | storageKey, isPrimary, sortOrder, isHidden | Photo grid, swipe cards |
| **Like/Pass** | from → to, isSuperLike | Swipe deck |
| **Match** | userA ↔ userB, isDatingMatch, isWorkoutMatch | Inbox grid, chat |
| **Message** | matchId, body, type (text/image/system/event_invite) | Chat thread |
| **Event** | title, category, location, startsAt, hostId | Explore grid, detail |
| **EventRsvp** | eventId ↔ userId | Attendee count |
| **EventInvite** | eventId, inviter, invitee, status | Chat inline cards |
| **Notification** | type, title, body, read, data (deep-link JSON) | Notifications screen |
| **Report** | category (harassment/spam/inappropriate/block) | Moderation sheet |

---

## 7. API Endpoints (grouped by UI flow)

### Auth
- `POST /auth/signup` — Create account
- `POST /auth/login` — Issue JWT
- `GET /auth/me` — Current user
- `DELETE /auth/me` — Delete account

### Profile
- `GET/PATCH /profile` — Read/update profile + fitness
- `POST/PATCH/DELETE /profile/photos` — Photo management (max 8MB; JPEG/PNG/WebP/HEIC/HEIF)

### Discovery
- `GET /discovery/feed` — Ranked candidates (filters: distance, age, goals, intensity, availability)
- `POST /discovery/like/:id` — Swipe right (triggers match on mutual)
- `POST /discovery/pass/:id` — Swipe left
- `POST /discovery/undo` — Revert last swipe
- `GET /discovery/profile-completeness` — % filled

### Matches & Chat
- `GET /matches` — List with last message preview
- `GET/POST /matches/:id/messages` — Read/send messages (cursor-paginated)

### Events
- `GET /events` — Browse public events
- `POST /events` — Create event
- `POST /events/:id/rsvp` — Join
- `POST /events/:id/invite` — Send to match (creates in-chat invite card)

### Notifications
- `GET /notifications` — Paginated list
- `GET /notifications/unread-count` — Badge
- `PATCH /notifications/mark-all-read`

### Moderation
- `POST /moderation/report` — Report user
- `POST /moderation/block` — Block user

---

## 8. Storybook Coverage

**44 story files** covering ~80% of the UI. Organized by category:

### Design Primitives (11 stories)
Button, Card, Input, Chip, GlassView, Skeleton, StatePanel, BottomSheet, Feedback, Toast, Primitives (combined)

### Screens (10 stories)
Login, Signup, HomeScreenContent, ExploreScreenContent, MyEvents, Notifications, ProfileScreenContent, ProfileDetailSections, ChatThread, EventDetail

### Feature Components (16 stories)
DiscoveryHero, DiscoveryQuickFilters, DiscoveryFilterSheet, DiscoverySwipeDeck, ExploreEventCard, ExploreQuickActionsSheet, ProfileBuildInfo, ProfileSections, CreatePlanSummaryCard, CreateTimingSection, EventInviteCard, ChatComposer, ChatQuickActionsSheet, MatchPickerSheet, SuggestPlanSheet, ReportSheet

### UI/Form/Auth (5 stories)
AppUi, AppSelect, RetryableError, FormFields, AuthScreenShell

### Onboarding (2 stories)
OnboardingFlowShell, OnboardingSteps

---

## 9. Form Patterns

- **Library:** react-hook-form + Zod validation
- **Field components:** ControlledInputField, SheetSelectField, DateField, LocationField, StepperField
- **Pattern:** `useForm({ resolver: zodResolver(schema) })` → controlled fields → `handleSubmit`
- **Errors:** Inline red text, announced for screen readers

---

## 10. Accessibility

- All interactive elements have `accessibilityRole` and `accessibilityState`
- Error states announce via accessible text
- Press animations respect `reduceMotionEnabled`
- Glass materials fall back to solid when Reduce Transparency is on
- Color is never sole indicator — always paired with icons/text

---

## 11. Key Design Decisions

1. **Light-only** — No dark mode by design. Warm, airy wellness aesthetic.
2. **Glass as material system** — 5 tiers with accessibility fallbacks. Not decorative — structural.
3. **Pill-shaped buttons** — 999px radius across all button variants.
4. **Spring animations** — All press feedback uses spring physics, not linear timing.
5. **Hash-based accent colors** — Match grid assigns consistent colors per user from a curated palette.
6. **Event invites live in chat** — Not a separate tab. Identified by message type marker.
7. **Onboarding gates discovery** — Non-onboarded users are hidden from the feed.
8. **Photos are hideable, not just deletable** — `isHidden` flag preserves upload history.
