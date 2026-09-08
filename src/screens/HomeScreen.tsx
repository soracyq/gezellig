import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import {
  Action,
  Badge,
  Body,
  Card,
  Icon,
  Label,
  PageHeading,
  SectionHeading,
  type IconName,
} from "../components/ui";
import { CanalIllustration } from "../components/CanalIllustration";
import { useLearning } from "../state/LearningProvider";
import { useSettings } from "../state/SettingsProvider";
import { colors as c, typography } from "../theme/tokens";

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 1250;
  const compact = width < 700;
  const { dailyTarget, isLoading } = useSettings();
  const {
    statistics: data,
    grammar: grammarTopics,
    vocabulary,
    activityError,
  } = useLearning();
  return (
    <View>
      <PageHeading
        eyebrow="EVERY DAY IS A FRESH START"
        title="Your daily dose of Dutch."
        subtitle="A few new words. A little practice. One step closer."
      />
      <View style={[s.columns, !wide && { flexDirection: "column" }]}>
        <View style={s.mainColumn}>
          <View style={s.hero}>
            <View style={[s.heroCopy, compact && { padding: 25 }]}>
              <View style={s.heroEyebrow}>
                <View style={s.smallDot} />
                <Label color={c.blue}>GROW AT YOUR OWN PACE</Label>
              </View>
              <Text
                accessibilityRole="header"
                style={[s.heroTitle, compact && { fontSize: 34 }]}
              >
                Make yourself{"\n"}at home in Dutch.
              </Text>
              <Body style={s.heroDescription}>
                From your first hello to everyday conversations. Your next small
                step starts here.
              </Body>
              <Action
                title="Continue learning"
                href="/vocabulary?preview=vocab-huis"
                icon="arrow-right"
              />
              <Text style={s.heroCaption}>
                Explore your collection · {vocabulary.length} words
              </Text>
            </View>
            {!compact && (
              <View style={s.heroArt}>
                <CanalIllustration />
              </View>
            )}
          </View>
          <View style={[s.quickStats, compact && { flexWrap: "wrap" }]}>
            <QuickStat
              icon="book-open"
              value={activityError ? "—" : String(data.wordsToday)}
              label="Words today"
              caption="Marked studied today"
            />
            <QuickStat
              icon="layers"
              value={activityError ? "—" : String(data.vocabularySize)}
              label="Words studied"
              caption="Unique words studied"
            />
            <QuickStat
              icon="target"
              value={
                activityError
                  ? "Unavailable"
                  : data.recentAccuracy === null
                    ? "Not available"
                    : `${data.recentAccuracy}%`
              }
              label="Recent accuracy"
              caption="Last 20 submitted answers"
            />
          </View>
          <SectionHeading
            title="A little practice for today"
            subtitle="Build confidence, one small step at a time."
          />
          <View style={[s.practiceRow, compact && { flexDirection: "column" }]}>
            <Card style={s.practiceCard}>
              <View style={s.cardTop}>
                <View style={[s.cardIcon, { backgroundColor: c.orangeSoft }]}>
                  <Icon name="refresh-cw" color={c.orange} />
                </View>
                <Badge tone="orange">Practice questions</Badge>
              </View>
              <Text style={s.cardTitle}>Keep it fresh</Text>
              <Body muted style={s.cardDescription}>
                Revisit familiar words and make them feel like second nature.
              </Body>
              <Action
                title="Start practice"
                href="/review"
                variant="secondary"
                icon="arrow-right"
                style={s.cardAction}
              />
            </Card>
            <Card style={s.practiceCard}>
              <View style={s.cardTop}>
                <View style={[s.cardIcon, { backgroundColor: c.blueSoft }]}>
                  <Icon name="file-text" color={c.blue} />
                </View>
                <Badge tone="blue">A1 · Sample lesson</Badge>
              </View>
              <Text style={s.cardTitle}>Give your words structure</Text>
              <Body muted style={s.cardDescription}>
                Get to know de, het and een. Small words that make a big
                difference.
              </Body>
              <Action
                title="Explore grammar"
                href={`/grammar?preview=${grammarTopics[0].id}`}
                variant="secondary"
                icon="arrow-right"
                style={s.cardAction}
              />
            </Card>
          </View>
          <View style={s.wordStrip}>
            <View style={s.wordLeaf}>
              <Icon name="feather" color={c.green} size={23} />
            </View>
            <View style={{ flex: 1, gap: 5 }}>
              <Label color={c.green}>A WORD TO TAKE WITH YOU</Label>
              <Text style={s.wordOfDay}>
                het huis <Text style={s.wordMeaning}>/ house</Text>
              </Text>
              <Body muted style={{ fontSize: 12 }}>
                Ik woon in een klein huis.{" "}
                <Text>— I live in a small house.</Text>
              </Body>
            </View>
            <Action
              title="Explore word"
              href="/vocabulary?preview=vocab-huis"
              variant="quiet"
              icon="arrow-up-right"
            />
          </View>
        </View>
        <View
          style={[
            s.sideColumn,
            !wide && {
              width: "100%",
              flexDirection: compact ? "column" : "row",
              flexWrap: "wrap",
            },
          ]}
        >
          <Card style={[s.levelCard, !wide && { flex: 1, minWidth: 235 }]}>
            <View style={s.cardTop}>
              <Label>YOUR LEARNING JOURNEY</Label>
              <Icon name="compass" size={17} />
            </View>
            <View style={s.levelHeading}>
              <View style={s.levelBadge}>
                <Text style={s.levelBadgeText}>A1</Text>
              </View>
              <View style={{ gap: 5 }}>
                <Text style={s.levelTitle}>A new beginning</Text>
                <Body muted style={{ fontSize: 12 }}>
                  A starting point to explore
                </Body>
              </View>
            </View>
            <View style={s.levelSteps}>
              {["A1", "A2", "B1", "B2", "C1"].map((level, i) => (
                <View key={level} style={{ alignItems: "center", gap: 6 }}>
                  <View
                    style={[s.levelDot, i === 0 && { backgroundColor: c.blue }]}
                  />
                  <Text
                    style={[
                      s.levelStepText,
                      i === 0 && { color: c.blue, fontWeight: "700" },
                    ]}
                  >
                    {level}
                  </Text>
                </View>
              ))}
            </View>
            <Action
              title="Explore the levels"
              href="/levels"
              variant="quiet"
              icon="arrow-right"
              style={{
                alignSelf: "stretch",
                paddingHorizontal: 0,
                justifyContent: "space-between",
              }}
            />
            <Text style={s.certificationNote}>
              Level estimate: not available. Studying words alone does not
              assess your CEFR level.
            </Text>
          </Card>
          <Card style={[s.streakCard, !wide && { flex: 1, minWidth: 235 }]}>
            <View style={s.streakHeader}>
              <View style={s.streakIcon}>
                <Icon name="sun" color={c.orange} size={26} />
              </View>
              <View>
                <Text style={s.streakTitle}>
                  {activityError
                    ? "Streak unavailable"
                    : `${data.streakDays}-day streak`}
                </Text>
                <Body muted style={{ fontSize: 12 }}>
                  A little consistency adds up.
                </Body>
              </View>
            </View>
            <View style={s.weekDays}>
              {data.weeklyActivity.map((day) => (
                <View key={day.day} style={{ gap: 8, alignItems: "center" }}>
                  <Text style={s.dayLabel}>{day.day[0]}</Text>
                  <View
                    style={[
                      s.dayCircle,
                      day.completed && { backgroundColor: c.orange },
                    ]}
                  >
                    {day.completed ? (
                      <Icon name="check" size={13} color={c.white} />
                    ) : (
                      <Text style={s.dayEmpty}>·</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
            <Text style={s.certificationNote}>
              A study day is 5 new words, 1 completed lesson, or 5 distinct
              answered questions.
            </Text>
          </Card>
          <View style={[s.goalCard, !wide && { flex: 1, minWidth: 235 }]}>
            <View style={s.cardTop}>
              <Label color={c.green}>YOUR DAILY WORD TARGET</Label>
              <Icon name="flag" color={c.green} size={17} />
            </View>
            <View style={s.goalValueRow}>
              <Text style={s.goalValue}>{isLoading ? "…" : dailyTarget}</Text>
              <Body muted>words per day</Body>
            </View>
            <Body muted style={{ fontSize: 12 }}>
              A pace that works for you. You can change it any time.
            </Body>
            <Action
              title="Adjust your goal"
              href="/settings"
              variant="quiet"
              icon="arrow-right"
              style={{ paddingHorizontal: 0, minHeight: 42 }}
            />
          </View>
        </View>
      </View>
      <View style={s.demoNote}>
        <Icon name="info" size={14} />
        <Text style={s.demoNoteText}>
          Your progress and imports are saved in this browser or desktop app.
          Sample curriculum is labeled. There is no account or cloud sync.
        </Text>
      </View>
    </View>
  );
}
function QuickStat({
  icon,
  value,
  label,
  caption,
}: {
  icon: IconName;
  value: string;
  label: string;
  caption: string;
}) {
  return (
    <View style={s.quickStat}>
      <View style={s.statLabel}>
        <Icon name={icon} size={16} />
        <Text style={s.statLabelText}>{label}</Text>
      </View>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statCaption}>{caption}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  columns: { flexDirection: "row", gap: 25 },
  mainColumn: { flex: 1, minWidth: 0 },
  sideColumn: { width: 285, gap: 20 },
  hero: {
    minHeight: 298,
    backgroundColor: c.hero,
    borderRadius: 18,
    overflow: "hidden",
    flexDirection: "row",
    position: "relative",
  },
  heroCopy: { zIndex: 1, padding: 30, gap: 18, flex: 1 },
  heroEyebrow: { flexDirection: "row", gap: 7, alignItems: "center" },
  smallDot: { height: 5, width: 5, borderRadius: 3, backgroundColor: c.blue },
  heroTitle: {
    fontSize: 37,
    lineHeight: 43,
    letterSpacing: -1.5,
    fontWeight: "600",
    color: c.navy,
    fontFamily: typography.family,
  },
  heroDescription: {
    fontSize: 13,
    lineHeight: 21,
    maxWidth: 300,
    color: c.blue,
  },
  heroCaption: { fontSize: 10, color: c.muted, fontFamily: typography.family },
  heroArt: {
    width: "51%",
    maxWidth: 350,
    height: 260,
    position: "absolute",
    right: -22,
    bottom: 8,
    opacity: 0.98,
  },
  quickStats: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 14,
    backgroundColor: c.surface,
    marginTop: 21,
    marginBottom: 30,
    paddingVertical: 21,
  },
  quickStat: { flex: 1, minWidth: 110, paddingHorizontal: 20, gap: 7 },
  statLabel: { flexDirection: "row", gap: 7, alignItems: "center" },
  statLabelText: {
    color: c.muted,
    fontSize: 11,
    fontFamily: typography.family,
  },
  statValue: {
    fontSize: 28,
    color: c.navy,
    letterSpacing: -1,
    fontFamily: typography.family,
    fontWeight: "600",
  },
  statCaption: { color: c.muted, fontSize: 10, fontFamily: typography.family },
  practiceRow: { flexDirection: "row", gap: 18 },
  practiceCard: { flex: 1, minWidth: 0, padding: 22 },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  cardIcon: {
    height: 40,
    width: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: c.navy,
    fontFamily: typography.family,
    marginTop: 19,
    letterSpacing: -0.4,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 20,
    marginTop: 9,
    marginBottom: 20,
  },
  cardAction: {
    alignSelf: "stretch",
    marginTop: "auto",
    justifyContent: "space-between",
  },
  wordStrip: {
    paddingVertical: 23,
    gap: 14,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  wordLeaf: {
    width: 43,
    height: 43,
    backgroundColor: c.greenSoft,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  wordOfDay: {
    color: c.navy,
    fontSize: 18,
    fontFamily: typography.family,
    fontWeight: "600",
  },
  wordMeaning: { fontWeight: "400", color: c.muted, fontSize: 14 },
  levelCard: { padding: 22 },
  levelHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 22,
    marginBottom: 25,
  },
  levelBadge: {
    width: 52,
    height: 58,
    borderRadius: 13,
    backgroundColor: c.blueSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  levelBadgeText: {
    color: c.blue,
    fontSize: 25,
    fontWeight: "600",
    fontFamily: typography.family,
  },
  levelTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: c.navy,
    fontFamily: typography.family,
  },
  progressLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  smallText: { fontSize: 11 },
  percent: { color: c.blue, fontSize: 11, fontWeight: "700" },
  levelSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 12,
  },
  levelDot: { width: 8, height: 8, borderRadius: 5, backgroundColor: c.line },
  levelStepText: { fontSize: 10, color: c.muted },
  certificationNote: {
    fontSize: 10,
    color: c.muted,
    lineHeight: 16,
    fontFamily: typography.family,
  },
  streakCard: { padding: 22 },
  streakHeader: { flexDirection: "row", gap: 12, alignItems: "center" },
  streakIcon: {
    height: 45,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  streakTitle: {
    color: c.navy,
    fontSize: 19,
    fontWeight: "600",
    fontFamily: typography.family,
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 21,
  },
  dayLabel: { fontSize: 10, color: c.muted },
  dayCircle: {
    width: 24,
    height: 24,
    borderRadius: 13,
    backgroundColor: c.background,
    alignItems: "center",
    justifyContent: "center",
  },
  dayEmpty: { color: c.muted },
  goalCard: {
    backgroundColor: c.greenSoft,
    borderRadius: 15,
    padding: 22,
    gap: 12,
  },
  goalValueRow: { flexDirection: "row", gap: 8, alignItems: "baseline" },
  goalValue: {
    color: c.green,
    fontSize: 32,
    fontWeight: "600",
    fontFamily: typography.family,
  },
  demoNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
  },
  demoNoteText: {
    color: c.muted,
    fontSize: 11,
    flex: 1,
    lineHeight: 17,
    fontFamily: typography.family,
  },
});
