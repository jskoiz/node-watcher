/**
 * Shared contract guardrails.
 *
 * Positive response shapes are now asserted at controller boundaries where the
 * transport layer actually returns them. This file keeps a few schema-only
 * checks for invalid or edge-case payloads that are not otherwise covered.
 */
import {
  AuthResponseSchema,
  EventSummarySchema,
  SendMessageResponseSchema,
} from '@contracts';

function expectInvalid(
  schema: { safeParse: (d: unknown) => { success: boolean } },
  data: unknown,
) {
  expect(schema.safeParse(data).success).toBe(false);
}

describe('Shared contract guardrails', () => {
  it('AuthResponseSchema rejects missing access_token', () => {
    expectInvalid(AuthResponseSchema, {
      user: { id: '1', email: 'a@b.com', firstName: 'A', isOnboarded: true },
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

  it('EventSummarySchema rejects missing required fields', () => {
    expectInvalid(EventSummarySchema, {
      id: 'evt-1',
      title: 'Missing fields',
    });
  });
});
