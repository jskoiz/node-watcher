# BRDG Code Review Checklist

- Confirm backend response shapes still match the mobile types and calling patterns.
- Check whether a change relies on seeded users, seeded matches, preview-only data, or in-memory notifications.
- Verify that UI changes do not silently replace real flows with mock-only behavior.
- Call out React Native risks: polling loops, list rendering, navigation churn, and expensive derived state.
- Check docs drift whenever commands, env vars, release steps, preview surfaces, or dev scenarios change.
- Prefer small, direct findings over general summaries.
