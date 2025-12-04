export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function deepEqualIgnoreOrder(a: any, b: any, seen = new WeakMap()): boolean {
  // Handle identical reference
  if (a === b) return true;

  // Handle NaN
  if (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)) {
    return true;
  }

  // Handle null vs object
  if (a === null || b === null) return a === b;

  // Types must match
  if (typeof a !== typeof b) return false;

  // Handle circular references
  if (typeof a === 'object') {
    if (seen.has(a)) return seen.get(a) === b;
    seen.set(a, b);
  }

  // Handle Arrays (ignore order)
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;

    const used = new Array(b.length).fill(false);

    return a.every((itemA) => {
      const idx = b.findIndex((itemB, i) => !used[i] && deepEqualIgnoreOrder(itemA, itemB, seen));
      if (idx === -1) return false;
      used[idx] = true;
      return true;
    });
  }

  // Handle Sets (ignore order)
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;

    const used = new Set<any>();

    for (const av of a) {
      let found = false;
      for (const bv of b) {
        if (!used.has(bv) && deepEqualIgnoreOrder(av, bv, seen)) {
          used.add(bv);
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  // Handle Maps (ignore order)
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;

    for (const [keyA, valA] of a) {
      let match = false;
      for (const [keyB, valB] of b) {
        if (deepEqualIgnoreOrder(keyA, keyB, seen) && deepEqualIgnoreOrder(valA, valB, seen)) {
          match = true;
          break;
        }
      }
      if (!match) return false;
    }
    return true;
  }

  // Handle Objects
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    // Order ignored → compare key/value pairs
    return keysA.every((key) => keysB.includes(key) && deepEqualIgnoreOrder(a[key], b[key], seen));
  }

  // Fallback for primitives
  return a === b;
}
