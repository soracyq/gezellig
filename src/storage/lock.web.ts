// Coordinate transactions across tabs/windows at the same browser origin.
export async function withStorageLock<T>(
  operation: () => Promise<T>,
): Promise<T> {
  if (!navigator.locks)
    throw new Error(
      "Saving requires a current browser on HTTPS or localhost. Please use a secure address or the desktop app.",
    );
  return navigator.locks.request("dutchly-local-data", operation);
}
