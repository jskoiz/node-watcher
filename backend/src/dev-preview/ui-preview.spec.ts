import {
  UI_PREVIEW_PASSWORD,
  UI_PREVIEW_USERS,
  getUiPreviewDayAnchor,
  getUiPreviewEventWindow,
} from './ui-preview';

describe('ui-preview fixtures', () => {
  it('keeps the preview credential and user order stable', () => {
    expect(UI_PREVIEW_PASSWORD).toBe('PreviewPass123!');
    expect(UI_PREVIEW_USERS.map((user) => user.key)).toEqual([
      'lana',
      'mason',
      'niko',
    ]);
    expect(UI_PREVIEW_USERS[0]?.email).toBe('preview.lana@brdg.local');
  });

  it('derives a deterministic UTC day anchor from the reference date', () => {
    const anchor = getUiPreviewDayAnchor(new Date('2026-03-25T23:59:12.000-10:00'));
    expect(anchor.toISOString()).toBe('2026-03-26T12:00:00.000Z');
  });

  it('creates the event window 36-38 hours after the day anchor', () => {
    const window = getUiPreviewEventWindow(new Date('2026-03-25T09:15:00.000Z'));
    expect(window.startsAt.toISOString()).toBe('2026-03-27T00:00:00.000Z');
    expect(window.endsAt.toISOString()).toBe('2026-03-27T02:00:00.000Z');
  });
});
