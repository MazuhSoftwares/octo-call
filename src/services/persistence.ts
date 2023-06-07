export function readFromPersistence<T>(
  storage: typeof window.localStorage | typeof window.sessionStorage,
  key: string
): T | null {
  try {
    const serializedValue = storage.getItem(key);
    if (serializedValue === null) {
      return null;
    }
    return JSON.parse(serializedValue) as T;
  } catch (error) {
    console.error("Error reading key [${key}] from storage.", storage, error);
    return null;
  }
}

export function writeToPersistence<T>(
  storage: typeof window.localStorage | typeof window.sessionStorage,
  key: string,
  value: T
): boolean {
  try {
    const serializedValue = JSON.stringify(value);
    storage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error("Error reading key [${key}] from storage.", storage, error);
    return false;
  }
}

export function appendToPersistence<T>(
  storage: typeof window.localStorage | typeof window.sessionStorage,
  key: string,
  value: Partial<T>
): boolean {
  const existingValue = readFromPersistence<T>(storage, key);
  if (existingValue === null) {
    return writeToPersistence(storage, key, value);
  }

  const newValue: T = { ...existingValue, ...value };
  return writeToPersistence(storage, key, newValue);
}
