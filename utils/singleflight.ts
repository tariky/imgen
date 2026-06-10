export async function runSingleFlight<K, V>(
  inFlight: Map<K, Promise<V>>,
  key: K,
  factory: () => Promise<V>
): Promise<V> {
  const existing = inFlight.get(key);
  if (existing) {
    return existing;
  }

  const promise = factory();
  inFlight.set(key, promise);

  try {
    return await promise;
  } finally {
    if (inFlight.get(key) === promise) {
      inFlight.delete(key);
    }
  }
}
