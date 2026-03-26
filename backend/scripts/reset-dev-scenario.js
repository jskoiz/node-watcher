const fs = require("node:fs");
const path = require("node:path");
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

function getAssetUrl(fileName) {
  return `${API_BASE_URL}/pfps/${fileName}`;
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

  await prisma.userPhoto.createMany({
    data: definition.photoFiles.map((photoFile, index) => ({
      userId,
      storageKey: getAssetUrl(photoFile),
      isPrimary: index === 0,
      sortOrder: index,
    })),
  });

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

  return {
    password: scenario.password,
    matchId,
    eventId: createdEvent.id,
    deletedPreviewUsers: undefined,
    eventWindow: {
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    },
    notifications: {
      lana: await summarizeNotifications(lana.userId),
      mason: await summarizeNotifications(mason.userId),
    },
    users: Object.values(createdUsers).map((user) => ({
      key: user.key,
      email: user.email,
      firstName: user.firstName,
      photoCount: user.photoFiles.length,
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
