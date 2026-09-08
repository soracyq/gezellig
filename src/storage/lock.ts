// Native writes are serialized by LearningProvider in one running app.
export async function withStorageLock<T>(
  operation: () => Promise<T>,
): Promise<T> {
  return operation();
}
