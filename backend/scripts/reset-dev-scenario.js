const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { PrismaClient } = require("@prisma/client");
const {
  UI_PREVIEW_PASSWORD,
  UI_PREVIEW_USERS,
  getUiPreviewEventWindow,
} = require("../src/dev-preview/ui-preview");

function loadLocalEnvFile() {
  for (const fileName of [".env", ".env.example"]) {
    const filePath = path.join(__dirname, "..", fileName);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const contents = fs.readFileSync(filePath, "utf8");
    for (const line of contents.split(/\r?\n/u)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      if (!key || process.env[key] !== undefined) {
        continue;
      }

      let value = trimmed.slice(separatorIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }

    return filePath;
  }

  return null;
}

const loadedEnvPath = loadLocalEnvFile();
const prisma = new PrismaClient();

const DEFAULT_PORT = process.env.PORT || "3010";
const API_BASE_URL =
  process.env.API_BASE_URL || `http://127.0.0.1:${DEFAULT_PORT}`;
const REQUEST_TIMEOUT_MS = Number(process.env.SCENARIO_REQUEST_TIMEOUT_MS || "10000");

const SCENARIOS = {
  "ui-preview": {
    password: UI_PREVIEW_PASSWORD,
    users: UI_PREVIEW_USERS,
  },
};

// ── Stable UUID (matches seed.ts pattern) ──────────────────────────
function stableUuid(...parts) {
  const hash = crypto.createHash("sha1").update(parts.join(":")).digest("hex").slice(0, 32);
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

async function request(pathname, { method = "GET", token, body } = {}) {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${pathname}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${method} ${pathname} failed (${response.status}): ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function cleanupPreviewUsers() {
  const deleted = await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: "preview.",
      },
    },
  });

  return deleted.count;
}

async function createUser(definition, password) {
  const signup = await request("/auth/signup", {
    method: "POST",
    body: {
      email: definition.email,
      password,
      firstName: definition.firstName,
      birthdate: definition.birthdate,
      gender: definition.gender,
    },
  });

  const token = signup.access_token;
  const userId = signup.user.id;

  await prisma.user.update({
    where: { id: userId },
    data: {
      hasVerifiedEmail: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { userId },
    update: definition.profile,
    create: {
      userId,
      ...definition.profile,
    },
  });

  await request("/profile/fitness", {
    method: "PATCH",
    token,
    body: definition.fitness,
  });

  const photoSources = definition.photoUrls || [];
  if (photoSources.length) {
    await prisma.userPhoto.createMany({
      data: photoSources.map((url, index) => ({
        userId,
        storageKey: url,
        isPrimary: index === 0,
        sortOrder: index,
      })),
    });
  }

  return {
    ...definition,
    token,
    userId,
  };
}

async function expectNotification(userId, predicate, description) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const match = notifications.find(predicate);
  if (!match) {
    throw new Error(
      `${description} missing. Notifications for ${userId}: ${JSON.stringify(
        notifications.map((notification) => ({
          type: notification.type,
          title: notification.title,
          data: notification.data,
          read: notification.read,
        })),
        null,
        2,
      )}`,
    );
  }

  return match;
}

async function summarizeNotifications(userId) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return notifications.map((notification) => ({
    type: notification.type,
    read: notification.read,
    createdAt: notification.createdAt.toISOString(),
    data: notification.data,
  }));
}

// ════════════════════════════════════════════════════════════════════
// Weave preview users into the seed social graph
// ════════════════════════════════════════════════════════════════════

// Seed user slugs to connect with each preview user
const SEED_MATCHES = {
  lana: [
    { slug: "kai",     messages: ["The sunrise sets here are unreal. You ever run Ala Moana?", "Every morning! It's my favorite route.", "We should pace together sometime — I'm usually out by 6.", "I'll be there Wednesday. Look for the blue cap."] },
    { slug: "jordan",  messages: ["Just saw you're into tempo runs too.", "Diamond Head loop is my go-to. You?", "Same! Thursday mornings are my speed days."] },
    { slug: "rafael",  messages: ["Your bio says beach workouts — Magic Island?", "Yes! Nothing beats sand circuits at dawn.", "I host a small group Saturdays if you want in.", "Count me in. What time?", "6:30. Bring water and good vibes."] },
    { slug: "luca",    messages: ["Fellow yoga person! What studio do you go to?", "Mostly outdoor stuff — Kapiolani Park.", "That's way better honestly."] },
    { slug: "beck",    messages: ["Running + yoga combo is elite.", "It's the only thing keeping me sane.", "Ha, same. Want to try a partner session?"] },
  ],
  mason: [
    { slug: "leilani", messages: ["Your training style sounds intense. I'm into it.", "Ha, I promise I'm friendly! Just competitive.", "That's the best combo.", "Beach workout Saturday?", "Let's do it."] },
    { slug: "malia",   messages: ["Surfing AND strength training? Respect.", "You can't have one without the other here.", "Totally agree. Ever try paddling?"] },
    { slug: "tessa",   messages: ["Saw you're advanced level — what's your split look like?", "Push/pull/legs, 5 days. You?", "Similar but I throw in a surf day.", "Smart. Recovery in the ocean."] },
    { slug: "isla",    messages: ["Your boxing background is cool.", "Thanks! Been at it 3 years now.", "I've been wanting to learn. Any gym recs?"] },
    { slug: "june",    messages: ["Fellow evening workout person!", "Night sessions just hit different.", "Especially when it cools down. Way more energy."] },
  ],
  niko: [
    { slug: "sasha",   messages: ["Trail runner? Which ones do you hit?", "Manoa Falls trail mostly, plus Kuliouou.", "Kuliouou is so underrated.", "Right? And the view at the top is worth every step."] },
    { slug: "alana",   messages: ["Climbing crew! Where do you boulder?", "Volcanic Rock Gym plus some outdoor stuff.", "We should hit Mokuleia sometime."] },
    { slug: "priya",   messages: ["Your mobility focus is smart. I need to work on that.", "It changed my climbing so much.", "Any stretches you swear by?", "Hip openers and shoulder CARs, every single day."] },
    { slug: "noa",     messages: ["Hiking buddies? I know all the Manoa trails.", "Yes! I've been looking for someone who knows the area.", "Let's plan a Wa'ahila Ridge hike this weekend."] },
    { slug: "ivy",     messages: ["Your adventure goal resonates with me.", "Life's too short for boring workouts!", "Exactly. Variety is everything."] },
  ],
};

const SEED_LIKES_TO_PREVIEW = {
  lana: [
    { slug: "devon",  isSuperLike: false },
    { slug: "cole",   isSuperLike: false },
    { slug: "keoni",  isSuperLike: true },
    { slug: "eli",    isSuperLike: false },
    { slug: "rowan",  isSuperLike: false },
    { slug: "cameron", isSuperLike: true },
    { slug: "omar",   isSuperLike: false },
  ],
  mason: [
    { slug: "nia",     isSuperLike: false },
    { slug: "alana",   isSuperLike: false },
    { slug: "priya",   isSuperLike: true },
    { slug: "maren",   isSuperLike: false },
    { slug: "hazel",   isSuperLike: false },
    { slug: "celine",  isSuperLike: false },
    { slug: "nora",    isSuperLike: true },
  ],
  niko: [
    { slug: "malia",  isSuperLike: false },
    { slug: "tessa",  isSuperLike: true },
    { slug: "june",   isSuperLike: false },
    { slug: "isla",   isSuperLike: false },
    { slug: "mae",    isSuperLike: false },
    { slug: "yara",   isSuperLike: true },
  ],
};

// Events for preview users to RSVP to (these are slug references to seed events)
const SEED_EVENT_RSVPS = {
  lana: ["ala-moana-sunrise-run", "diamond-head-tempo-run", "waikiki-longboard-session", "kapiolani-track-night"],
  mason: ["diamond-head-tempo-run", "kapiolani-track-night", "waikiki-longboard-session"],
  niko: ["ala-moana-sunrise-run", "kapiolani-track-night", "waikiki-longboard-session"],
};

async function weavePreviewIntoSeedGraph(createdUsers) {
  // Check if seed data exists
  const seedUserCount = await prisma.user.count({
    where: { email: { endsWith: "@seed.brdg.app" } },
  });

  if (seedUserCount === 0) {
    console.log("⚠ No seed users found (@seed.brdg.app). Skipping seed graph integration.");
    console.log("  Run `npm run db:seed` first, then re-run the scenario for a rich preview.");
    return { matches: 0, likes: 0, rsvps: 0, notifications: 0 };
  }

  console.log(`Found ${seedUserCount} seed users. Weaving preview users into social graph...`);

  const now = new Date();
  let matchCount = 0;
  let messageCount = 0;
  let likeCount = 0;
  let rsvpCount = 0;
  let notificationCount = 0;

  // ── 1. Create matches with messages ─────────────────────────────
  for (const [previewKey, matchDefs] of Object.entries(SEED_MATCHES)) {
    const previewUser = createdUsers[previewKey];
    if (!previewUser) continue;

    for (const matchDef of matchDefs) {
      const seedUser = await prisma.user.findFirst({
        where: { email: `${matchDef.slug}@seed.brdg.app` },
        select: { id: true, firstName: true },
      });
      if (!seedUser) continue;

      const [userAId, userBId] = [previewUser.userId, seedUser.id].sort();
      const matchCreatedAt = new Date(now.getTime() - (matchDefs.indexOf(matchDef) + 1) * 24 * 60 * 60 * 1000);
      const matchId = stableUuid("preview-match", previewKey, matchDef.slug);

      // Create reciprocal likes (needed so they don't appear in discovery again)
      await prisma.like.createMany({
        data: [
          {
            id: stableUuid("preview-like", previewKey, matchDef.slug),
            fromUserId: previewUser.userId,
            toUserId: seedUser.id,
            createdAt: new Date(matchCreatedAt.getTime() - 2 * 60 * 60 * 1000),
          },
          {
            id: stableUuid("preview-like", matchDef.slug, previewKey),
            fromUserId: seedUser.id,
            toUserId: previewUser.userId,
            createdAt: new Date(matchCreatedAt.getTime() - 1 * 60 * 60 * 1000),
          },
        ],
        skipDuplicates: true,
      });

      await prisma.match.create({
        data: {
          id: matchId,
          createdAt: matchCreatedAt,
          updatedAt: matchCreatedAt,
          userAId,
          userBId,
          isDatingMatch: true,
          isWorkoutMatch: true,
          isArchived: false,
          isBlocked: false,
        },
      });
      matchCount++;

      // Match notification for preview user
      await prisma.notification.create({
        data: {
          id: stableUuid("preview-notif-match", previewKey, matchDef.slug),
          userId: previewUser.userId,
          type: "match_created",
          title: `You matched with ${seedUser.firstName}!`,
          body: `You and ${seedUser.firstName} liked each other.`,
          data: { matchId, withUserId: seedUser.id },
          read: matchDefs.indexOf(matchDef) > 1, // first 2 matches unread
          readAt: matchDefs.indexOf(matchDef) > 1 ? matchCreatedAt : null,
          createdAt: matchCreatedAt,
        },
      });
      notificationCount++;

      // Create messages
      let lastMsgTime = matchCreatedAt;
      for (let i = 0; i < matchDef.messages.length; i++) {
        const msgBody = matchDef.messages[i];
        const isFromPreview = i % 2 === 1; // alternate: seed starts, preview replies
        const senderId = isFromPreview ? previewUser.userId : seedUser.id;
        lastMsgTime = new Date(lastMsgTime.getTime() + (15 + Math.floor(i * 20)) * 60 * 1000);

        await prisma.message.create({
          data: {
            id: stableUuid("preview-msg", previewKey, matchDef.slug, String(i)),
            matchId,
            senderId,
            body: msgBody,
            type: "TEXT",
            isRead: i < matchDef.messages.length - 1, // last message unread
            readAt: i < matchDef.messages.length - 1 ? lastMsgTime : null,
            createdAt: lastMsgTime,
          },
        });
        messageCount++;
      }

      // Update match timestamp to last message
      await prisma.match.update({
        where: { id: matchId },
        data: { updatedAt: lastMsgTime },
      });

      // Message notification for the last unread message (from seed user)
      const lastMsg = matchDef.messages[matchDef.messages.length - 1];
      const lastMsgFromSeed = matchDef.messages.length % 2 === 1; // odd count means last is from seed
      if (lastMsgFromSeed) {
        await prisma.notification.create({
          data: {
            id: stableUuid("preview-notif-msg", previewKey, matchDef.slug),
            userId: previewUser.userId,
            type: "message_received",
            title: `${seedUser.firstName} sent a message`,
            body: lastMsg.length > 60 ? lastMsg.slice(0, 57) + "..." : lastMsg,
            data: { matchId, senderId: seedUser.id },
            read: matchDefs.indexOf(matchDef) > 0,
            readAt: matchDefs.indexOf(matchDef) > 0 ? lastMsgTime : null,
            createdAt: lastMsgTime,
          },
        });
        notificationCount++;
      }
    }
  }

  // ── 2. Create incoming likes from seed users ─────────────────────
  for (const [previewKey, likeDefs] of Object.entries(SEED_LIKES_TO_PREVIEW)) {
    const previewUser = createdUsers[previewKey];
    if (!previewUser) continue;

    for (let i = 0; i < likeDefs.length; i++) {
      const likeDef = likeDefs[i];
      const seedUser = await prisma.user.findFirst({
        where: { email: `${likeDef.slug}@seed.brdg.app` },
        select: { id: true, firstName: true },
      });
      if (!seedUser) continue;

      const likeCreatedAt = new Date(now.getTime() - (i + 1) * 3 * 60 * 60 * 1000);

      await prisma.like.create({
        data: {
          id: stableUuid("preview-incoming-like", likeDef.slug, previewKey),
          fromUserId: seedUser.id,
          toUserId: previewUser.userId,
          isSuperLike: likeDef.isSuperLike,
          createdAt: likeCreatedAt,
        },
      });
      likeCount++;

      // Like notification
      await prisma.notification.create({
        data: {
          id: stableUuid("preview-notif-like", likeDef.slug, previewKey),
          userId: previewUser.userId,
          type: "like_received",
          title: likeDef.isSuperLike
            ? "Someone super liked you!"
            : "Someone liked you!",
          body: "Open the app to find out who.",
          data: { fromUserId: seedUser.id, isSuperLike: likeDef.isSuperLike },
          read: i > 2, // first 3 likes unread
          readAt: i > 2 ? likeCreatedAt : null,
          createdAt: likeCreatedAt,
        },
      });
      notificationCount++;
    }
  }

  // ── 3. RSVP preview users to seed events ─────────────────────────
  for (const [previewKey, eventSlugs] of Object.entries(SEED_EVENT_RSVPS)) {
    const previewUser = createdUsers[previewKey];
    if (!previewUser) continue;

    for (const eventSlug of eventSlugs) {
      const seedEvent = await prisma.event.findFirst({
        where: {
          id: stableUuid("seed-event", eventSlug),
          startsAt: { gte: now },
        },
        select: { id: true, title: true, hostId: true },
      });
      if (!seedEvent) continue;

      await prisma.eventRsvp.create({
        data: {
          eventId: seedEvent.id,
          userId: previewUser.userId,
        },
      }).catch(() => {
        // skip if duplicate
      });
      rsvpCount++;

      // RSVP notification for the event host
      await prisma.notification.create({
        data: {
          id: stableUuid("preview-notif-rsvp", previewKey, eventSlug),
          userId: seedEvent.hostId,
          type: "event_rsvp",
          title: `${previewUser.firstName} is going to ${seedEvent.title}`,
          body: `${previewUser.firstName} RSVPed to your event.`,
          data: { eventId: seedEvent.id, attendeeId: previewUser.userId },
          read: false,
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        },
      });
      notificationCount++;
    }
  }

  console.log(
    `Seed graph: ${matchCount} matches (${messageCount} messages), ${likeCount} incoming likes, ${rsvpCount} event RSVPs, ${notificationCount} notifications`,
  );

  return { matches: matchCount, likes: likeCount, rsvps: rsvpCount, notifications: notificationCount };
}

async function prepareUiPreviewScenario() {
  const scenario = SCENARIOS["ui-preview"];
  const createdUsers = {};
  const scenarioNow = process.env.SCENARIO_NOW_ISO
    ? new Date(process.env.SCENARIO_NOW_ISO)
    : new Date();
  const { startsAt, endsAt } = getUiPreviewEventWindow(scenarioNow);

  for (const definition of scenario.users) {
    createdUsers[definition.key] = await createUser(
      definition,
      scenario.password,
    );
  }

  const lana = createdUsers.lana;
  const mason = createdUsers.mason;
  const niko = createdUsers.niko;

  await request(`/discovery/like/${mason.userId}`, {
    method: "POST",
    token: lana.token,
  });

  const matchResult = await request(`/discovery/like/${lana.userId}`, {
    method: "POST",
    token: mason.token,
  });

  const matchId = matchResult.match?.id;
  if (!matchId) {
    throw new Error("Expected deterministic match id for ui-preview scenario");
  }

  await request(`/discovery/like/${lana.userId}`, {
    method: "POST",
    token: niko.token,
  });

  await request(`/matches/${matchId}/messages`, {
    method: "POST",
    token: mason.token,
    body: { content: "Coffee after the sunrise run?" },
  });

  await request(`/matches/${matchId}/messages`, {
    method: "POST",
    token: lana.token,
    body: { content: "Yes. Magic Island at 8 works for me." },
  });

  const createdEvent = await request("/events", {
    method: "POST",
    token: lana.token,
    body: {
      title: "Preview Beach Workout",
      description: "Low-pressure bodyweight session by the water with coffee after.",
      location: "Magic Island",
      category: "FITNESS",
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    },
  });

  await request(`/events/${createdEvent.id}/invite`, {
    method: "POST",
    token: lana.token,
    body: {
      matchId,
      message: "Want to turn the chat into an actual plan?",
    },
  });

  await request(`/events/${createdEvent.id}/rsvp`, {
    method: "POST",
    token: mason.token,
  });

  const lanaLikeNotification = await expectNotification(
    lana.userId,
    (notification) =>
      notification.type === "like_received" &&
      notification.data?.fromUserId === niko.userId,
    "Lana like notification",
  );
  await expectNotification(
    lana.userId,
    (notification) =>
      notification.type === "message_received" &&
      notification.data?.matchId === matchId &&
      notification.data?.senderId === mason.userId,
    "Lana message notification",
  );
  await expectNotification(
    lana.userId,
    (notification) =>
      notification.type === "event_rsvp" &&
      notification.data?.eventId === createdEvent.id &&
      notification.data?.attendeeId === mason.userId,
    "Lana event RSVP notification",
  );
  await expectNotification(
    mason.userId,
    (notification) =>
      notification.type === "match_created" &&
      notification.data?.matchId === matchId &&
      notification.data?.withUserId === lana.userId,
    "Mason match notification",
  );
  await expectNotification(
    mason.userId,
    (notification) =>
      notification.type === "event_reminder" &&
      notification.data?.eventId === createdEvent.id,
    "Mason event notification",
  );

  await prisma.notification.update({
    where: { id: lanaLikeNotification.id },
    data: {
      read: true,
      readAt: new Date(startsAt.getTime() - 60 * 60 * 1000),
    },
  });

  // ── Weave preview users into the seed social graph ──────────────
  const seedGraphStats = await weavePreviewIntoSeedGraph(createdUsers);

  return {
    password: scenario.password,
    matchId,
    eventId: createdEvent.id,
    deletedPreviewUsers: undefined,
    eventWindow: {
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    },
    seedGraph: seedGraphStats,
    notifications: {
      lana: await summarizeNotifications(lana.userId),
      mason: await summarizeNotifications(mason.userId),
      niko: await summarizeNotifications(niko.userId),
    },
    users: Object.values(createdUsers).map((user) => ({
      key: user.key,
      email: user.email,
      firstName: user.firstName,
      photoCount: (user.photoUrls || []).length,
    })),
  };
}

async function main() {
  const scenarioName = process.argv[2] || "ui-preview";
  if (!SCENARIOS[scenarioName]) {
    throw new Error(`Unsupported scenario: ${scenarioName}`);
  }

  const deletedPreviewUsers = await cleanupPreviewUsers();

  let result;
  if (scenarioName === "ui-preview") {
    result = await prepareUiPreviewScenario();
  }

  console.log(
    JSON.stringify(
      {
        scenario: scenarioName,
        apiBaseUrl: API_BASE_URL,
        loadedEnvPath,
        deletedPreviewUsers,
        ...result,
      },
      null,
      2,
    ),
  );
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
