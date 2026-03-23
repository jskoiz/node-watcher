/**
 * Response-shape contract tests.
 *
 * These tests validate that representative backend response fixtures conform
 * to the shared Zod schemas in shared/contracts/.  If a backend service
 * changes its response shape, these tests will catch the drift.
 */
import {
  AuthResponseSchema,
  CurrentUserSchema,
  DiscoveryFeedSchema,
  LikeResponseSchema,
  PassResponseSchema,
  UndoSwipeResponseSchema,
  ProfileCompletenessSchema,
  MatchListSchema,
  ChatMessageListSchema,
  SendMessageResponseSchema,
  EventListSchema,
  EventSummarySchema,
  EventRsvpResponseSchema,
  EventInviteResponseSchema,
  EventInviteListSchema,
} from '@contracts';

// ── Helpers ─────────────────────────────────────────────────────────

function expectValid(schema: { safeParse: (d: unknown) => { success: boolean; error?: unknown } }, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    // Print issues for easy debugging
    throw new Error(`Schema validation failed:\n${JSON.stringify(result.error, null, 2)}`);
  }
  expect(result.success).toBe(true);
}

function expectInvalid(schema: { safeParse: (d: unknown) => { success: boolean } }, data: unknown) {
  expect(schema.safeParse(data).success).toBe(false);
}

// ── Auth ─────────────────────────────────────────────────────────────

describe('Auth contracts', () => {
  it('AuthResponseSchema accepts a valid login/signup response', () => {
    expectValid(AuthResponseSchema, {
      access_token: 'eyJhbGciOiJIUzI1NiJ9.test',
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        firstName: 'Alice',
        isOnboarded: false,
      },
    });
  });

  it('AuthResponseSchema rejects missing access_token', () => {
    expectInvalid(AuthResponseSchema, {
      user: { id: '1', email: 'a@b.com', firstName: 'A', isOnboarded: true },
    });
  });

  it('CurrentUserSchema accepts a full /auth/me response', () => {
    expectValid(CurrentUserSchema, {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'alice@example.com',
      firstName: 'Alice',
      birthdate: '1995-06-15T00:00:00.000Z',
      gender: 'FEMALE',
      pronouns: 'she/her',
      isOnboarded: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-06-01T00:00:00.000Z',
      age: 30,
      profile: {
        bio: 'Hello!',
        city: 'Portland',
        intentWorkout: true,
        intentDating: false,
        intentFriends: true,
        latitude: 45.5,
        longitude: -122.6,
      },
      fitnessProfile: {
        intensityLevel: 'MODERATE',
        weeklyFrequencyBand: '3-4',
        primaryGoal: 'strength',
        secondaryGoal: null,
        favoriteActivities: 'yoga,running',
        prefersMorning: true,
        prefersEvening: false,
      },
      photos: [
        {
          id: 'photo-1',
          storageKey: 'uploads/photo-1.jpg',
          isPrimary: true,
          sortOrder: 0,
          createdAt: '2024-03-01T00:00:00.000Z',
        },
      ],
    });
  });

  it('CurrentUserSchema accepts nullable profile/fitnessProfile', () => {
    expectValid(CurrentUserSchema, {
      id: '1',
      email: null,
      firstName: 'Bob',
      birthdate: null,
      gender: 'MALE',
      pronouns: null,
      isOnboarded: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      age: null,
      profile: null,
      fitnessProfile: null,
      photos: [],
    });
  });
});

// ── Discovery ────────────────────────────────────────────────────────

describe('Discovery contracts', () => {
  it('DiscoveryFeedSchema accepts an array of discovery users', () => {
    expectValid(DiscoveryFeedSchema, [
      {
        id: 'user-1',
        firstName: 'Charlie',
        birthdate: '1992-03-10T00:00:00.000Z',
        age: 33,
        distanceKm: 5.2,
        recommendationScore: 0.87,
        profile: { bio: 'Hey!', city: 'Seattle', latitude: null, longitude: null },
        fitnessProfile: {
          intensityLevel: 'HIGH',
          primaryGoal: 'endurance',
          prefersMorning: true,
          prefersEvening: false,
        },
        photos: [{ id: 'p1', storageKey: 'k1', isPrimary: true, sortOrder: 0 }],
      },
    ]);
  });

  it('DiscoveryFeedSchema accepts an empty array', () => {
    expectValid(DiscoveryFeedSchema, []);
  });

  it('LikeResponseSchema accepts match result', () => {
    expectValid(LikeResponseSchema, { status: 'match', match: { id: 'match-1' } });
  });

  it('LikeResponseSchema accepts liked result', () => {
    expectValid(LikeResponseSchema, { status: 'liked' });
  });

  it('PassResponseSchema accepts passed', () => {
    expectValid(PassResponseSchema, { status: 'passed' });
  });

  it('UndoSwipeResponseSchema accepts undone with details', () => {
    expectValid(UndoSwipeResponseSchema, {
      status: 'undone',
      action: 'like',
      targetUserId: 'user-2',
    });
  });

  it('UndoSwipeResponseSchema accepts nothing_to_undo', () => {
    expectValid(UndoSwipeResponseSchema, { status: 'nothing_to_undo' });
  });

  it('ProfileCompletenessSchema accepts a completeness response', () => {
    expectValid(ProfileCompletenessSchema, {
      score: 75,
      total: 100,
      earned: 75,
      prompts: ['Add a bio', 'Upload a photo'],
      missing: [
        { field: 'bio', label: 'Bio', route: '/profile/edit' },
      ],
    });
  });
});

// ── Matches ──────────────────────────────────────────────────────────

describe('Matches contracts', () => {
  it('MatchListSchema accepts a match list', () => {
    expectValid(MatchListSchema, [
      {
        id: 'match-1',
        createdAt: '2024-06-01T00:00:00.000Z',
        user: { id: 'user-2', firstName: 'Dana', photoUrl: 'uploads/dana.jpg' },
        lastMessage: 'Hey there!',
      },
      {
        id: 'match-2',
        createdAt: '2024-05-15T00:00:00.000Z',
        user: { id: 'user-3', firstName: 'Eve', photoUrl: null },
        lastMessage: null,
      },
    ]);
  });

  it('ChatMessageListSchema accepts messages', () => {
    expectValid(ChatMessageListSchema, [
      { id: 'msg-1', text: 'Hello', sender: 'me', timestamp: '2024-06-01T12:00:00.000Z' },
      { id: 'msg-2', text: 'Hi!', sender: 'them', timestamp: '2024-06-01T12:01:00.000Z' },
    ]);
  });

  it('SendMessageResponseSchema accepts a sent message', () => {
    expectValid(SendMessageResponseSchema, {
      id: 'msg-3',
      text: 'How are you?',
      sender: 'me',
      timestamp: '2024-06-01T12:02:00.000Z',
    });
  });

  it('SendMessageResponseSchema rejects sender=them', () => {
    expectInvalid(SendMessageResponseSchema, {
      id: 'msg-3',
      text: 'Bad',
      sender: 'them',
      timestamp: '2024-06-01T12:02:00.000Z',
    });
  });
});

// ── Events ───────────────────────────────────────────────────────────

describe('Events contracts', () => {
  const validEvent = {
    id: 'evt-1',
    title: 'Morning Run',
    description: 'Meet at the park',
    location: 'Central Park',
    imageUrl: null,
    category: 'FITNESS',
    startsAt: '2024-07-01T08:00:00.000Z',
    endsAt: '2024-07-01T10:00:00.000Z',
    host: { id: 'user-1', firstName: 'Alice' },
    attendeesCount: 5,
    joined: true,
  };

  it('EventSummarySchema accepts a valid event', () => {
    expectValid(EventSummarySchema, validEvent);
  });

  it('EventListSchema accepts an array of events', () => {
    expectValid(EventListSchema, [validEvent]);
  });

  it('EventRsvpResponseSchema accepts rsvp result', () => {
    expectValid(EventRsvpResponseSchema, { status: 'joined', attendeesCount: 6 });
  });

  it('EventInviteResponseSchema accepts invite result', () => {
    expectValid(EventInviteResponseSchema, {
      id: 'inv-1',
      status: 'pending',
      event: {
        id: 'evt-1',
        title: 'Morning Run',
        location: 'Central Park',
        startsAt: '2024-07-01T08:00:00.000Z',
        endsAt: null,
        category: 'FITNESS',
        host: { id: 'user-1', firstName: 'Alice' },
        attendeesCount: 5,
      },
    });
  });

  it('EventInviteListSchema accepts invite list', () => {
    expectValid(EventInviteListSchema, [
      {
        id: 'inv-1',
        status: 'accepted',
        createdAt: '2024-06-15T00:00:00.000Z',
        inviter: { id: 'user-1', firstName: 'Alice' },
        invitee: { id: 'user-2', firstName: 'Bob' },
      },
    ]);
  });

  it('EventSummarySchema rejects missing required fields', () => {
    expectInvalid(EventSummarySchema, {
      id: 'evt-1',
      title: 'Missing fields',
    });
  });
});
