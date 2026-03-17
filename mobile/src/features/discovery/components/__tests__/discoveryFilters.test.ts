import { buildDiscoveryFilters, countActiveFilters, type FilterModalState } from '../discoveryFilters';

const baseState: FilterModalState = {
  availability: [],
  distanceKm: '50',
  goals: [],
  intensity: [],
  maxAge: '45',
  minAge: '21',
};

describe('buildDiscoveryFilters', () => {
  it('drops min/max when the range is contradictory', () => {
    const filters = buildDiscoveryFilters('all', {
      ...baseState,
      minAge: '50',
      maxAge: '25',
    });

    expect(filters.minAge).toBeUndefined();
    expect(filters.maxAge).toBeUndefined();
  });

  it('keeps valid min/max ranges', () => {
    const filters = buildDiscoveryFilters('all', {
      ...baseState,
      minAge: '25',
      maxAge: '35',
    });

    expect(filters.minAge).toBe(25);
    expect(filters.maxAge).toBe(35);
  });

  it('does not treat contradictory age input as active filters', () => {
    const filters = buildDiscoveryFilters('all', {
      ...baseState,
      minAge: '50',
      maxAge: '25',
    });

    expect(countActiveFilters(filters, {
      ...baseState,
      minAge: '50',
      maxAge: '25',
    })).toBe(0);
  });
});
