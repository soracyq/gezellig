import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import {
  Action,
  Badge,
  Body,
  Card,
  Label,
  PageHeading,
  SectionHeading,
} from "../components/ui";
import { useLearning } from "../state/LearningProvider";
import { fieldsFor, type ImportKind } from "../imports/schema";
import type { ImportPreview } from "../imports/validate";
import type { GrammarTopic, VocabularyItem } from "../domain/models";
import { colors as c, typography } from "../theme/tokens";

const MAX_BYTES = 5 * 1024 * 1024;
export default function ImportScreen() {
  const { kind: initialKind } = useLocalSearchParams<{ kind?: string }>();
  const [kind, setKind] = useState<ImportKind>(
    initialKind === "grammar" ? "grammar" : "vocabulary",
  );
  const {
    vocabulary,
    grammar,
    curriculum,
    importContent,
    loading,
    busy,
    curriculumError,
  } = useLearning();
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [shown, setShown] = useState(20);
  const [issuesShown, setIssuesShown] = useState(30);
  const [showFields, setShowFields] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const job = useRef(0);
  const submitting = useRef(false);
  const fileInput = useRef<HTMLInputElement | null>(null);
  function stopWorker() {
    workerRef.current?.terminate();
    workerRef.current = null;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }
  useEffect(
    () => () => {
      job.current++;
      workerRef.current?.terminate();
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );
  function clear() {
    job.current++;
    stopWorker();
    setWorking(false);
    setPreview(null);
    setError(null);
    setResult(null);
    setSelectedFileName(null);
    setShown(20);
    setIssuesShown(30);
    if (fileInput.current) fileInput.current.value = "";
  }
  async function selectFile(file: File | undefined) {
    clear();
    if (!file) return;
    setSelectedFileName(file.name);
    if (file.size > MAX_BYTES) {
      setError("This file is larger than 5 MiB. Split it into smaller files.");
      return;
    }
    if (!file.size) {
      setError("This file is empty. Fill in a template and try again.");
      return;
    }
    const currentJob = job.current;
    setWorking(true);
    try {
      const buffer = await file.arrayBuffer();
      if (currentJob !== job.current) return;
      // This is a separately built public asset, not a Metro module worker.
      const workerURL = new URL("/import-worker.js", window.location.href).href;
      const worker = new window.Worker(workerURL);
      workerRef.current = worker;
      timerRef.current = setTimeout(() => {
        if (currentJob === job.current) {
          stopWorker();
          setWorking(false);
          setError(
            "The file took too long to read. Try a smaller file or save a fresh copy of the template.",
          );
        }
      }, 20000);
      worker.onerror = () => {
        if (currentJob === job.current) {
          stopWorker();
          setWorking(false);
          setError(
            "The file reader could not start. Refresh this page and try again.",
          );
        }
      };
      worker.onmessage = (
        event: MessageEvent<{ preview?: ImportPreview; error?: string }>,
      ) => {
        if (currentJob !== job.current) return;
        stopWorker();
        setWorking(false);
        if (event.data.error) setError(event.data.error);
        else if (event.data.preview) setPreview(event.data.preview);
        else setError("The file reader returned no preview. Please try again.");
      };
      worker.postMessage(
        { name: file.name, buffer, kind, existing: { vocabulary, grammar } },
        [buffer],
      );
    } catch (e) {
      if (currentJob === job.current) {
        stopWorker();
        setWorking(false);
        setError(
          e instanceof Error ? e.message : "This file could not be read.",
        );
      }
    }
  }
  async function confirm() {
    if (!preview || submitting.current) return;
    submitting.current = true;
    setError(null);
    try {
      const saved = await importContent(preview);
      setResult(
        `${saved.imported} ${kind === "vocabulary" ? "words" : "lessons"} imported. ${saved.skipped} duplicates skipped. Your learning statistics are unchanged.`,
      );
      setPreview(null);
      if (fileInput.current) fileInput.current.value = "";
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "The import could not be saved. Nothing has been added.",
      );
    } finally {
      submitting.current = false;
    }
  }
  const canImport =
    !!preview &&
    preview.items.length > 0 &&
    preview.invalid === 0 &&
    !preview.issues.some((issue) => issue.severity === "error") &&
    !busy &&
    !curriculumError;
  return (
    <View style={{ gap: 24 }}>
      <PageHeading
        eyebrow="GROW YOUR COLLECTION"
        title="Bring your own Dutch."
        subtitle="Download a template, check your file, and add it to your learning space."
      />
      <Card style={{ backgroundColor: c.blueSoft, gap: 16 }}>
        <SectionHeading title="1. Choose your content" />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {(["vocabulary", "grammar"] as const).map((value) => (
            <Action
              key={value}
              title={
                value === "vocabulary" ? "Vocabulary import" : "Grammar import"
              }
              variant={kind === value ? "primary" : "secondary"}
              disabled={busy}
              onPress={() => {
                clear();
                setKind(value);
              }}
            />
          ))}
        </View>
        <Body muted>
          {kind === "vocabulary"
            ? "Add Dutch words, English meanings, levels, word types and optional word forms."
            : "Add English lesson explanations, Dutch examples and translations. Text-only lessons can be completed without exercises."}
        </Body>
        <Body muted>
          Existing content is preserved. Duplicate words or lessons are skipped.
          Importing a file does not count as studying.
        </Body>
      </Card>
      <Card style={{ gap: 16 }}>
        <SectionHeading
          title="2. Download and fill in a template"
          subtitle="Keep the first row as column headers. One word or lesson per row."
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {(["csv", "xlsx"] as const).flatMap((format) =>
            (["template", "example"] as const).map((type) => (
              <a
                key={`${format}-${type}`}
                href={`/templates/${kind}_${type}.${format}`}
                download={
                  window.location.protocol === "dutchly:"
                    ? undefined
                    : `${kind}_${type}.${format}`
                }
                style={{
                  fontFamily: typography.family,
                  color: c.blue,
                  border: `1px solid ${c.line}`,
                  borderRadius: 9,
                  padding: "12px 16px",
                  background: c.surface,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {format.toUpperCase()} {type}
              </a>
            )),
          )}
        </View>
        <Body muted>
          Examples are marked as sample content. Use a blank template for your
          own collection. Files stay on your device; there is no server upload.
        </Body>
        <Body muted style={{ fontSize: 13 }}>
          CSV: comma-separated UTF-8; quote text containing commas or line
          breaks. Excel: .xlsx, with plain text or numbers and no formulas. Use
          the {kind === "vocabulary" ? "Vocabulary" : "Lessons"} worksheet. Up
          to 5 MiB, 5,000 records and 64 columns per file.
        </Body>
        <Action
          title={showFields ? "Hide column guide" : "Show column guide"}
          variant="quiet"
          onPress={() => setShowFields((value) => !value)}
          icon="help-circle"
        />
        {showFields && (
          <View style={{ gap: 10 }}>
            {fieldsFor(kind).map((field) => (
              <View
                key={field.name}
                style={{
                  gap: 3,
                  paddingBottom: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: c.line,
                }}
              >
                <Body style={{ fontWeight: "600" }}>
                  {field.name}
                  {field.required ? " · Required" : " · Optional"}
                </Body>
                <Body muted style={{ fontSize: 13 }}>
                  {field.description}
                </Body>
              </View>
            ))}
          </View>
        )}
      </Card>
      <Card style={{ gap: 16 }}>
        <SectionHeading
          title="3. Select a file to preview"
          subtitle="Nothing is saved until you confirm the validated preview."
        />
        <input
          ref={fileInput}
          aria-label={`Choose ${kind} CSV or Excel file`}
          type="file"
          accept=".csv,.xlsx"
          disabled={loading || busy || !!curriculumError}
          onChange={(event) => void selectFile(event.target.files?.[0])}
          style={{ display: "none" }}
        />
        <Action
          title="Choose CSV or Excel file"
          icon="upload"
          variant="secondary"
          disabled={loading || busy || !!curriculumError}
          onPress={() => fileInput.current?.click()}
        />
        <Body muted style={{ fontSize: 13 }}>
          {selectedFileName ?? "No file selected yet."}
        </Body>
        {working && (
          <View style={{ gap: 10 }}>
            <Body accessibilityLiveRegion="polite">
              Reading and checking your file…
            </Body>
            <Action
              title="Cancel file reading"
              variant="secondary"
              onPress={clear}
            />
          </View>
        )}
        {(error || curriculumError) && (
          <Body accessibilityRole="alert" style={{ color: c.orange }}>
            {error || curriculumError}
          </Body>
        )}
        {result && (
          <View style={{ gap: 14 }}>
            <Body
              accessibilityLiveRegion="polite"
              style={{ fontWeight: "600" }}
            >
              {result}
            </Body>
            <Action
              title={kind === "vocabulary" ? "Open vocabulary" : "Open grammar"}
              href={kind === "vocabulary" ? "/vocabulary" : "/grammar"}
              variant="secondary"
              icon="arrow-right"
            />
          </View>
        )}
      </Card>
      {preview && (
        <Card style={{ gap: 20 }}>
          <SectionHeading
            title="4. Review and confirm"
            subtitle={preview.fileName}
          />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <Badge>{preview.total} rows found</Badge>
            <Badge>{preview.valid} valid</Badge>
            <Badge tone={preview.invalid ? "orange" : "neutral"}>
              {preview.invalid} invalid
            </Badge>
            <Badge tone="neutral">{preview.skipped} duplicates skipped</Badge>
            <Badge>{preview.items.length} ready to import</Badge>
          </View>
          {preview.warnings.map((warning, i) => (
            <Body key={i} muted>
              {warning}
            </Body>
          ))}
          {preview.issues.length > 0 && (
            <View style={{ gap: 12 }}>
              <Body style={{ fontWeight: "600" }}>
                Validation details · {preview.issues.length}
              </Body>
              {preview.issues.slice(0, issuesShown).map((issue, i) => (
                <View
                  key={i}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    backgroundColor:
                      issue.severity === "error" ? c.orangeSoft : c.blueSoft,
                    gap: 4,
                  }}
                >
                  <Body style={{ fontWeight: "600" }}>
                    {issue.severity === "error" ? "Error" : "Warning"} · Row{" "}
                    {issue.row} · {issue.column}
                  </Body>
                  <Body>{issue.message}</Body>
                  {issue.value && (
                    <Body muted>Value: {issue.value.slice(0, 150)}</Body>
                  )}
                </View>
              ))}
              {preview.issues.length > issuesShown && (
                <Action
                  title="Show more validation details"
                  variant="secondary"
                  onPress={() => setIssuesShown((n) => n + 30)}
                />
              )}
            </View>
          )}
          {preview.items.length > 0 && (
            <ScrollView nestedScrollEnabled style={{ maxHeight: 480 }}>
              <View style={{ gap: 12, paddingBottom: 10 }}>
                {preview.items.slice(0, shown).map((item) => (
                  <PreviewRow key={item.id} item={item} kind={kind} />
                ))}
              </View>
            </ScrollView>
          )}
          {preview.items.length > shown && (
            <Action
              title="Show more preview rows"
              variant="secondary"
              onPress={() => setShown((n) => n + 20)}
            />
          )}
          <Body muted style={{ fontSize: 13 }}>
            Duplicates match a normalized Dutch term, word type and level, or a
            grammar lesson ID or title and level. They never overwrite existing
            content. All errors must be fixed before anything is imported.
          </Body>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <Action
              title={
                busy
                  ? "Saving import…"
                  : `Confirm import (${preview.items.length})`
              }
              onPress={() => void confirm()}
              disabled={!canImport}
              icon="check"
            />
            <Action
              title="Cancel import"
              variant="secondary"
              onPress={clear}
              disabled={busy}
            />
          </View>
        </Card>
      )}
      <Card style={{ gap: 18 }}>
        <SectionHeading
          title="Your imported datasets"
          subtitle="Saved in this browser or desktop app. Each successful import is listed below."
        />
        {curriculum.datasets.length === 0 ? (
          <Body muted>
            No datasets imported yet. The starter curriculum is already
            available in Vocabulary and Grammar.
          </Body>
        ) : (
          [...curriculum.datasets].reverse().map((dataset) => (
            <View
              key={dataset.id}
              style={{
                gap: 8,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: c.line,
              }}
            >
              <Body style={{ fontWeight: "600" }}>{dataset.name}</Body>
              <Body muted>
                {dataset.contentType === "vocabulary"
                  ? "Vocabulary"
                  : "Grammar"}{" "}
                · {dataset.format.toUpperCase()} ·{" "}
                {new Date(dataset.importedAt).toLocaleString()}
              </Body>
              <Body muted>
                {dataset.itemCount} imported · {dataset.skippedCount} skipped ·{" "}
                {dataset.levels.join(", ")} · {dataset.status}
              </Body>
            </View>
          ))
        )}
        <Body muted style={{ fontSize: 12 }}>
          Keep your source files as a backup. Browsers, addresses and desktop
          profiles each have separate local data. Clearing browser or app
          storage removes that local copy. Dataset removal is not available in
          this release.
        </Body>
      </Card>
    </View>
  );
}

function PreviewRow({
  item,
  kind,
}: {
  item: VocabularyItem | GrammarTopic;
  kind: ImportKind;
}) {
  const word = item as VocabularyItem,
    lesson = item as GrammarTopic;
  const fields: [string, string | undefined][] =
    kind === "vocabulary"
      ? [
          ["Meaning", word.english],
          ["Type", word.wordType],
          ["Topic", word.topic],
          ["Dutch example", word.example.dutch],
          ["English example", word.example.english],
          ["Notes", word.notes],
          ["Tags", word.tags?.join("; ")],
          ...(word.wordType === "noun"
            ? ([
                ["Article", word.article],
                ["Plural", word.plural],
                ["Diminutive", word.diminutive],
              ] as [string, string | undefined][])
            : []),
          ...(word.wordType === "verb"
            ? ([
                [
                  "Regularity",
                  word.regular === undefined
                    ? undefined
                    : word.regular
                      ? "regular"
                      : "irregular",
                ],
                [
                  "Separable",
                  word.separable === undefined
                    ? undefined
                    : String(word.separable),
                ],
                ["Auxiliary", word.auxiliary],
                ["Past participle", word.pastParticiple],
              ] as [string, string | undefined][])
            : []),
          ...(word.wordType === "adjective"
            ? ([
                ["Inflected", word.inflected],
                ["Comparative", word.comparative],
                ["Superlative", word.superlative],
              ] as [string, string | undefined][])
            : []),
        ]
      : [
          ["Lesson ID", lesson.sourceLessonId],
          ["Category", lesson.category],
          ["Objective", lesson.objective],
          ["Summary", lesson.summary],
          ["Explanation", lesson.explanation],
          ["Rules", lesson.rules.join("\n")],
          [
            "Examples",
            lesson.examples.map((e) => `${e.dutch} — ${e.english}`).join("\n"),
          ],
          ["Common mistakes", lesson.commonMistakes.join("\n")],
          ["Notes", lesson.usageNotes?.join("\n")],
          ["Reading time", `${lesson.estimatedMinutes} minutes`],
          ["Sort order", String(lesson.sortOrder ?? 0)],
        ];
  return (
    <View
      style={{
        padding: 16,
        backgroundColor: c.background,
        borderRadius: 12,
        gap: 7,
      }}
    >
      <Label color={c.blue}>
        {item.level} · {item.isSample ? "Sample content" : "Your content"}
      </Label>
      <Body style={{ fontWeight: "600", fontSize: 18 }}>
        {kind === "vocabulary" ? word.dutch : lesson.title}
      </Body>
      {fields
        .filter(([, value]) => value)
        .map(([label, value]) => (
          <Body key={label} style={{ fontSize: 13 }}>
            <Body style={{ fontWeight: "600", fontSize: 13 }}>{label}: </Body>
            {value}
          </Body>
        ))}
    </View>
  );
}
