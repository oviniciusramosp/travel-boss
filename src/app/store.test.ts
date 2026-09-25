import { afterEach, describe, expect, it } from 'vitest';
import {
  arrivalKey,
  categoryFilterKey,
  groupsKey,
  periodsKey,
  read,
  readArrival,
  readCategoryFilter,
  readGroups,
  readPeriods,
  write,
  writeArrival,
  writeCategoryFilter,
  writeGroups,
  writePeriods,
} from './store';

function installStorage() {
  const data = new Map<string, string>();
  const storage = {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => [...data.keys()][index] ?? null,
    removeItem: (key: string) => {
      data.delete(key);
    },
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  return data;
}

describe('store', () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'localStorage');
  });

  it('round-trips JSON under the tb: prefix and falls back when storage fails', () => {
    const data = installStorage();
    write('categories', ['parks']);
    expect(data.get('tb:categories')).toBe('["parks"]');
    expect(read('categories', [])).toEqual(['parks']);
    expect(read('missing', ['cafes'])).toEqual(['cafes']);

    data.set('tb:categories', '{');
    expect(read('categories', ['cafes'])).toEqual(['cafes']);

    storageThrows();
    expect(read('categories', ['cafes'])).toEqual(['cafes']);
    expect(() => write('categories', ['parks'])).not.toThrow();
  });

  it('stores the category filter, open groups and the arrival', () => {
    installStorage();
    expect(readCategoryFilter()).toBeNull();
    writeCategoryFilter(['parks', 'cafes']);
    expect(readCategoryFilter()).toEqual(['parks', 'cafes']);
    expect(read(categoryFilterKey, null)).toEqual(['parks', 'cafes']);

    expect(readGroups('paris')).toBeNull();
    writeGroups('paris', { parks: true, cafes: false });
    expect(readGroups('paris')).toEqual({ parks: true, cafes: false });
    expect(groupsKey('paris')).toBe('groups:paris');

    expect(readArrival('paris', 'paris-d1')).toBeNull();
    writeArrival('paris', 'paris-d1', 'cdg');
    expect(readArrival('paris', 'paris-d1')).toBe('cdg');
    expect(arrivalKey('paris', 'paris-d1')).toBe('arrival:paris:paris-d1');
  });

  it('keeps only the boolean choices of each period', () => {
    const data = installStorage();
    expect(readPeriods('europa')).toEqual({});
    writePeriods('europa', { '2026-10-04:morning': { open: true }, '2026-10-04:evening': { on: false } });
    expect(readPeriods('europa')).toEqual({
      '2026-10-04:morning': { open: true },
      '2026-10-04:evening': { on: false },
    });
    expect(periodsKey('europa')).toBe('periods:europa');

    data.set('tb:periods:europa', '{"a":{"open":"yes","on":true},"b":3}');
    expect(readPeriods('europa')).toEqual({ a: { on: true } });
  });
});

function storageThrows() {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
    },
  });
}
