export type LearningFilter = "all" | "new" | "learned";

/** The caller applies level/search/type first, preserving curriculum order. */
export function learningList<T extends { id: string }>(
  items: T[],
  learned: ReadonlySet<string>,
  filter: LearningFilter = "all",
) {
  const fresh = items.filter((item) => !learned.has(item.id));
  const done = items.filter((item) => learned.has(item.id));
  return {
    counts: { all: items.length, new: fresh.length, learned: done.length },
    items:
      filter === "new"
        ? fresh
        : filter === "learned"
          ? done
          : [...fresh, ...done],
  };
}
