import { createPronunciationService } from "./speech";
// No native speech dependency is installed. Native uses the same graceful fallback.
export const pronunciationService = createPronunciationService(() => undefined);
