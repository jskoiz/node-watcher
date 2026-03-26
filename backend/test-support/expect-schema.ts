/**
 * Shared test helper for asserting a value conforms to a Zod schema.
 */
export function expectSchema<T>(
  schema: { parse: (value: unknown) => T },
  value: unknown,
) {
  expect(() => schema.parse(value)).not.toThrow();
}
