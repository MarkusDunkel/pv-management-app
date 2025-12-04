export function numericObjectEquals(a: Record<string, string>, b: Record<string, string>): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  // Same number of keys?
  if (keysA.length !== keysB.length) return false;

  // Same key set?
  for (const key of keysA) {
    if (!(key in b)) return false;

    const numA = Number(a[key]);
    const numB = Number(b[key]);

    // Treat both non-numeric values as equal (optional – adjust if you want)
    const bothNaN = Number.isNaN(numA) && Number.isNaN(numB);
    if (bothNaN) continue;

    if (numA !== numB) return false;
  }

  return true;
}
