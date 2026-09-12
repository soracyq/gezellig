import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Action,
  Badge,
  Body,
  Card,
  EmptyState,
  Icon,
  Label,
  PageHeading,
  PreviewModal,
} from "../components/ui";
import { useLearning } from "../state/LearningProvider";
import { CompleteItem } from "../components/CompleteItem";
import { PronunciationButton } from "../components/PronunciationButton";
import {
  LearningStatus,
  LearningStatusFilter,
} from "../components/LearningStatus";
import { learningList, type LearningFilter } from "../domain/learningStatus";
import { googleTranslateUrl } from "../domain/externalLinks";
import { vocabularyLabel } from "../domain/homeLearning";
import { cefrLevels } from "../data/sample-content";
import type { VocabularyItem } from "../domain/models";
import { useSettings } from "../state/SettingsProvider";
import { colors as c, learningColors, typography } from "../theme/tokens";

export const wordLabel = vocabularyLabel;
export default function VocabularyScreen() {
  const { width } = useWindowDimensions();
  const { vocabulary: vocabularyItems, studiedIds } = useLearning();
  const { preview, level: initialLevel } = useLocalSearchParams<{
    preview?: string;
    level?: string;
  }>();
  const [limit, setLimit] = useState(50);
  const router = useRouter();
  const selected = vocabularyItems.find((item) => item.id === preview) ?? null;
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All words");
  const [level, setLevel] = useState(initialLevel ?? "A1");
  const [status, setStatus] = useState<LearningFilter>("all");
  const { dailyTarget } = useSettings();
  const filtered = vocabularyItems.filter(
    (item) =>
      item.level === level &&
      (type === "All words" || item.wordType === type) &&
      `${wordLabel(item)} ${item.english} ${item.topic}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const { items, counts } = learningList(filtered, studiedIds, status);
  function closePreview() {
    router.setParams({ preview: undefined });
  }
  return (
    <View>
      <PageHeading
        eyebrow="WORDS FOR YOUR WORLD"
        title="Build your vocabulary."
        subtitle="Get to know the words that make everyday Dutch feel familiar."
      >
        <Badge tone="orange">{dailyTarget} words / day</Badge>
        <Action
          title="Import vocabulary"
          href="/import?kind=vocabulary"
          variant="secondary"
          icon="upload"
        />
      </PageHeading>
      <View style={s.intro}>
        <View style={{ flex: 1, gap: 8 }}>
          <Label color={c.blue}>START SMALL. STAY CURIOUS.</Label>
          <Text style={s.introTitle}>Every word opens a little door.</Text>
          <Body muted>
            Explore {vocabularyItems.length} words, including clearly labeled
            samples and your imports.
          </Body>
        </View>
        <View style={s.introIcon}>
          <Icon name="book-open" size={38} color={c.blue} />
        </View>
      </View>
      <View style={s.toolbar}>
        <View style={s.search}>
          <Icon name="search" size={18} />
          <TextInput
            accessibilityLabel="Search vocabulary"
            placeholder="Search Dutch or English…"
            placeholderTextColor={c.muted}
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              setLimit(50);
            }}
            style={s.searchInput}
          />
          {search.length > 0 && (
            <Pressable
              accessibilityLabel="Clear vocabulary search"
              accessibilityRole="button"
              style={s.clearSearch}
              onPress={() => setSearch("")}
            >
              <Icon name="x" size={17} />
            </Pressable>
          )}
        </View>
        <View style={s.filterRow}>
          {cefrLevels.map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={`Vocabulary level ${value}`}
              accessibilityState={{ selected: value === level }}
              onPress={() => {
                setLevel(value);
                setLimit(50);
              }}
              style={[s.levelFilter, value === level && s.levelFilterActive]}
            >
              <Text
                style={[
                  s.filterText,
                  value === level && { color: c.blue, fontWeight: "700" },
                ]}
              >
                {value}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={s.typeToolbar}>
        <View style={s.filterRow}>
          {["All words", "noun", "verb", "adjective", "expression"].map(
            (value) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: type === value }}
                accessibilityLabel={
                  value === "All words" ? value : `Filter ${value}s`
                }
                key={value}
                onPress={() => {
                  setType(value);
                  setLimit(50);
                }}
                style={[
                  s.typeFilter,
                  type === value && { backgroundColor: c.blueSoft },
                ]}
              >
                <Text
                  style={[
                    s.typeText,
                    type === value && { color: c.blue, fontWeight: "600" },
                  ]}
                >
                  {value === "All words"
                    ? value
                    : `${value[0].toUpperCase()}${value.slice(1)}s`}
                </Text>
              </Pressable>
            ),
          )}
        </View>
        <Body muted style={{ fontSize: 12 }}>
          {items.length} {items.length === 1 ? "word" : "words"}
        </Body>
      </View>
      <LearningStatusFilter
        value={status}
        onChange={(value) => {
          setStatus(value);
          setLimit(50);
        }}
        counts={counts}
      />
      {items.length === 0 ? (
        <EmptyState
          icon="search"
          title={
            !vocabularyItems.some((item) => item.level === level)
              ? `Your ${level} collection is still to come`
              : "No matching words"
          }
          description={
            !vocabularyItems.some((item) => item.level === level)
              ? "Import vocabulary at this level, or try another search and word type."
              : "Try another search, word type, or learning-status filter."
          }
        />
      ) : (
        <View style={s.grid}>
          {items.slice(0, limit).map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Preview ${wordLabel(item)}`}
              onPress={() => router.setParams({ preview: item.id })}
              style={({ pressed }) => [
                s.wordCard,
                {
                  borderColor: studiedIds.has(item.id)
                    ? learningColors.completed.border
                    : learningColors.new.border,
                },
                {
                  width:
                    width >= 1450 ? "31.9%" : width >= 720 ? "48.6%" : "100%",
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View style={s.cardHeader}>
                <Badge tone={item.wordType === "verb" ? "orange" : "blue"}>
                  {item.level} · {item.wordType}
                </Badge>
                <Icon name="arrow-up-right" size={18} />
              </View>
              <View style={{ marginTop: 12 }}>
                <LearningStatus learned={studiedIds.has(item.id)} />
              </View>
              <Text style={s.dutchWord}>{wordLabel(item)}</Text>
              <Body muted>{item.english}</Body>
              <View style={s.example}>
                <Text style={s.exampleDutch}>{item.example.dutch}</Text>
                <Text style={s.exampleEnglish}>{item.example.english}</Text>
              </View>
              <View style={s.cardFooter}>
                <Text style={s.topic}>{item.topic}</Text>
                <Text style={s.sampleLabel}>
                  {item.isSample ? "Sample" : "Imported"}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
      {items.length > limit && (
        <Action
          title="Show 50 more words"
          variant="secondary"
          onPress={() => setLimit((n) => n + 50)}
        />
      )}
      <View style={s.note}>
        <Icon name="info" size={15} />
        <Body muted style={{ fontSize: 12, flex: 1 }}>
          Open a word to study its details. Choose Mark studied when you finish;
          each word counts once.
        </Body>
      </View>
      <PreviewModal
        prominentTitle
        visible={selected !== null}
        onClose={closePreview}
        title={selected ? wordLabel(selected) : "Word preview"}
      >
        {selected && (
          <>
            <VocabularyDetails item={selected} />
            <CompleteItem
              key={selected.id}
              id={selected.id}
              type="vocabulary"
            />
          </>
        )}
      </PreviewModal>
    </View>
  );
}
function VocabularyDetails({ item }: { item: VocabularyItem }) {
  const details: [string, string | undefined][] =
    item.wordType === "noun"
      ? [
          ["Definite article", item.article],
          ["Indefinite article", item.indefiniteArticle],
          ["Plural", item.plural],
          ["Diminutive", item.diminutive],
        ]
      : item.wordType === "verb"
        ? [
            [
              "Verb pattern",
              item.regular === undefined
                ? undefined
                : item.regular
                  ? "Regular"
                  : "Irregular",
            ],
            [
              "Separable",
              item.separable === undefined
                ? undefined
                : item.separable
                  ? "Yes"
                  : "No",
            ],
            ["Perfect auxiliary", item.auxiliary],
            ["Past participle", item.pastParticiple],
          ]
        : item.wordType === "adjective"
          ? [
              ["Inflected form", item.inflected],
              ["Comparative", item.comparative],
              ["Superlative", item.superlative],
            ]
          : [];
  return (
    <>
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <Badge>
          {item.level} · {item.wordType}
        </Badge>
        <Body>{item.english}</Body>
      </View>
      {item.example.dutch && (
        <Card style={{ backgroundColor: c.blueSoft, gap: 8, borderWidth: 0 }}>
          <Label color={c.blue}>IN A SENTENCE</Label>
          <Text style={s.detailSentence}>{item.example.dutch}</Text>
          <Body muted>{item.example.english}</Body>
        </Card>
      )}
      {details.filter(([, value]) => value).length > 0 && (
        <View style={{ gap: 12 }}>
          {details
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <View key={label} style={s.detailRow}>
                <Body muted>{label}</Body>
                <Body style={{ fontWeight: "600" }}>{value}</Body>
              </View>
            ))}
        </View>
      )}
      {item.wordType === "verb" && item.conjugations?.present && (
        <View style={{ gap: 12 }}>
          <Label>PRESENT TENSE · SIMPLE STATEMENTS</Label>
          {Object.entries(item.conjugations.present).map(([person, form]) => (
            <View key={person} style={s.detailRow}>
              <Body muted>{person}</Body>
              <Body>{form}</Body>
            </View>
          ))}
        </View>
      )}
      {item.notes && <Body muted>{item.notes}</Body>}
      <PronunciationButton key={item.id} text={wordLabel(item)}>
        <Action
          title="Google Translate"
          accessibilityLabel={`Open ${wordLabel(item)} in Google Translate`}
          href={googleTranslateUrl(wordLabel(item))}
          target="_blank"
          variant="secondary"
          icon="external-link"
        />
      </PronunciationButton>
      <Body muted style={{ fontSize: 12 }}>
        Google Translate opens in your browser. Use its speaker button to listen
        there.
      </Body>
    </>
  );
}
const s = StyleSheet.create({
  intro: {
    backgroundColor: c.blueSoft,
    borderRadius: 17,
    padding: 27,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 26,
  },
  introTitle: {
    color: c.navy,
    fontSize: 24,
    fontWeight: "600",
    fontFamily: typography.family,
    letterSpacing: -0.5,
  },
  introIcon: { padding: 10 },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 18,
    flexWrap: "wrap",
    alignItems: "center",
  },
  search: {
    backgroundColor: c.surface,
    borderColor: c.line,
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 15,
    minHeight: 49,
    flex: 1,
    minWidth: 240,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 14,
    color: c.text,
    fontFamily: typography.family,
    fontSize: 14,
  },
  clearSearch: { padding: 12 },
  filterRow: {
    maxWidth: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  levelFilter: {
    minWidth: 45,
    minHeight: 45,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.surface,
  },
  levelFilterActive: { backgroundColor: c.blueSoft, borderColor: c.blue },
  filterText: { color: c.muted, fontSize: 13, fontFamily: typography.family },
  typeToolbar: {
    marginVertical: 21,
    gap: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeFilter: {
    paddingHorizontal: 14,
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 8,
  },
  typeText: { fontSize: 12, color: c.muted, fontFamily: typography.family },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: "2.1%",
    rowGap: 20,
  },
  wordCard: {
    backgroundColor: c.surface,
    padding: 23,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dutchWord: {
    color: c.navy,
    fontSize: 27,
    fontWeight: "600",
    fontFamily: typography.family,
    letterSpacing: -0.5,
    marginTop: 23,
    marginBottom: 4,
  },
  example: { paddingVertical: 17, gap: 5, marginTop: 7 },
  exampleDutch: { fontSize: 13, color: c.text, fontFamily: typography.family },
  exampleEnglish: {
    fontSize: 12,
    color: c.muted,
    fontFamily: typography.family,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: c.line,
    paddingTop: 14,
  },
  topic: { fontSize: 10, color: c.muted, fontFamily: typography.family },
  sampleLabel: { fontSize: 10, color: c.green, fontFamily: typography.family },
  note: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 25 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", gap: 15 },
  detailSentence: {
    fontSize: 20,
    fontWeight: "600",
    color: c.navy,
    fontFamily: typography.family,
  },
});
