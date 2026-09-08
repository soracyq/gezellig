import { readImportFile } from "./read-file";
import { validateTable } from "./validate";

self.onmessage = async (event) => {
  const { name, buffer, kind, existing } = event.data;
  try {
    const table = await readImportFile(name, buffer, kind);
    self.postMessage({ preview: validateTable(table, kind, name, existing) });
  } catch (error) {
    self.postMessage({
      error:
        error instanceof Error ? error.message : "The file could not be read.",
    });
  }
};
