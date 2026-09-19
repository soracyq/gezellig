import { prepareImport } from "./prepare";

self.onmessage = async (event) => {
  const { name, buffer, kind, existing } = event.data;
  try {
    self.postMessage({
      preview: await prepareImport(name, buffer, kind, existing),
    });
  } catch (error) {
    self.postMessage({
      error:
        error instanceof Error ? error.message : "The file could not be read.",
    });
  }
};
