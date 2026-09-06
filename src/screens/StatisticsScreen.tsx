import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Badge,
  Body,
  Card,
  Icon,
  Label,
  PageHeading,
  ProgressBar,
  SectionHeading,
  type IconName,
} from "../components/ui";
import { demoStatistics as data } from "../data/sample-content";
import { colors as c, radius, spacing, typography } from "../theme/tokens";

const periods = [
  "Today",
  "This week",
  "This month",
  "This year",
  "All time",
] as const;
type Period = (typeof periods)[number];
const learnedByPeriod: Record<Period, number> = {
  Today: data.wordsToday,
  "This week": data.wordsThisWeek,
  "This month": data.wordsThisMonth,
  "This year": data.wordsThisYear,
  "All time": data.vocabularySize,
};

function Metric({
  icon,
  label,
  value,
  note,
  orange = false,
}: {
  icon: IconName;
  label: string;
  value: string | number;
  note: string;
  orange?: boolean;
}) {
  return (
    <Card style={s.metric}>
      <View
        style={[
          s.metricIcon,
          { backgroundColor: orange ? c.orangeSoft : c.blueSoft },
        ]}
      >
        <Icon name={icon} size={19} color={orange ? c.orange : c.blue} />
      </View>
      <Body muted style={s.metricLabel}>
        {label}
      </Body>
      <Text style={s.metricValue}>{value}</Text>
      <Body muted style={s.small}>
        {note}
      </Body>
    </Card>
  );
}

export default function StatisticsScreen() {
  const [period, setPeriod] = useState<Period>("This week");
  const { width } = useWindowDimensions();
  const wide = width >= 1100;
  const maximumWords = Math.max(
    1,
    ...data.weeklyActivity.map((day) => day.words),
  );

  return (
    <View style={s.page}>
      <PageHeading
        eyebrow="THE BIGGER PICTURE"
        title="Every little step adds up."
        subtitle="See how steady practice can turn into visible progress."
      >
        <Badge tone="orange">Demo statistics</Badge>
      </PageHeading>

      <View style={s.demoNote}>
        <Icon name="info" size={17} color={c.blue} />
        <Body muted style={s.demoText}>
          All figures on this page are fictional demonstration data. They do not
          represent your learning activity.
        </Body>
      </View>

      <View style={s.periodHeader}>
        <View style={s.periodTitle}>
          <Label color={c.orange}>WORDS LEARNED</Label>
          <Body muted style={s.small}>
            Choose a period for the words-learned card.
          </Body>
        </View>
        <View style={s.periods}>
          {periods.map((item) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityLabel={`Show words learned: ${item}`}
              accessibilityState={{ selected: item === period }}
              onPress={() => setPeriod(item)}
              style={({ pressed }) => [
                s.period,
                item === period && s.selectedPeriod,
                pressed && s.pressed,
              ]}
            >
              <Text
                style={[s.periodText, item === period && s.selectedPeriodText]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={s.metrics}>
        <Metric
          icon="book-open"
          label="Words learned"
          value={learnedByPeriod[period]}
          note={`${period} · Demo`}
          orange
        />
        <Metric
          icon="check-circle"
          label="Recent accuracy"
          value={`${data.recentAccuracy}%`}
          note="Example recent result · Demo"
        />
        <Metric
          icon="sun"
          label="Current streak"
          value={`${data.streakDays} days`}
          note={`Longest: ${data.longestStreak} days · Demo`}
        />
        <Metric
          icon="refresh-cw"
          label="Waiting for review"
          value={data.dueReviews}
          note="Example due count · Demo"
        />
      </View>

      <View style={[s.columns, !wide && s.stack]}>
        <Card style={s.chartCard}>
          <SectionHeading
            title="A week of small wins"
            subtitle="Sample words learned per day · This week"
            action={<Badge tone="blue">{data.wordsThisWeek} words</Badge>}
          />
          <View style={s.chart}>
            {data.weeklyActivity.map((day) => (
              <View
                key={day.day}
                accessible
                accessibilityLabel={`${day.day}: ${day.words} sample words learned`}
                style={s.chartColumn}
              >
                <Text style={s.barValue}>{day.words}</Text>
                <View style={s.barTrack}>
                  <View
                    style={[
                      s.bar,
                      {
                        height: `${(day.words / maximumWords) * 100}%`,
                        backgroundColor: day.day === "Sun" ? c.orange : c.blue,
                      },
                    ]}
                  />
                </View>
                <Text style={s.day}>{day.day}</Text>
              </View>
            ))}
          </View>
          <View style={s.chartFooter}>
            <View style={s.legendDot} />
            <Body muted style={s.small}>
              Illustrative activity · weekly chart stays on this week
            </Body>
          </View>
        </Card>

        <Card style={[s.accuracyCard, !wide && s.fullWidth]}>
          <SectionHeading
            title="Understanding, over time"
            subtitle="All-time sample answers"
          />
          <Text style={s.accuracyValue}>
            {data.lifetimeAccuracy}
            <Text style={s.percent}>%</Text>
          </Text>
          <Body muted style={s.small}>
            Lifetime accuracy · rounded
          </Body>
          <View style={s.accuracyProgress}>
            <ProgressBar
              value={data.lifetimeAccuracy}
              color={c.blue}
              label={`Demo lifetime accuracy: ${data.lifetimeAccuracy}%`}
            />
          </View>
          <View style={s.answerRow}>
            <View style={s.answerLabel}>
              <View style={[s.answerDot, { backgroundColor: c.blue }]} />
              <Body style={s.rowText}>Correct answers</Body>
            </View>
            <Text style={s.rowNumber}>{data.correctAnswers}</Text>
          </View>
          <View style={s.answerRow}>
            <View style={s.answerLabel}>
              <View style={[s.answerDot, { backgroundColor: c.orange }]} />
              <Body style={s.rowText}>Incorrect answers</Body>
            </View>
            <Text style={s.rowNumber}>{data.incorrectAnswers}</Text>
          </View>
          <View style={[s.answerRow, s.totalRow]}>
            <Body muted style={s.rowText}>
              Total questions answered
            </Body>
            <Text style={s.rowNumber}>{data.questionsAnswered}</Text>
          </View>
        </Card>
      </View>

      <View style={s.activitySection}>
        <SectionHeading
          title="The habits behind the progress"
          subtitle="All-time demonstration activity"
        />
        <Card style={s.activityGrid}>
          {[
            {
              value: data.studyDays,
              label: "Study days",
              icon: "calendar" as const,
            },
            {
              value: data.lessonsCompleted,
              label: "Lessons completed",
              icon: "layers" as const,
            },
            {
              value: data.reviewSessionsCompleted,
              label: "Review sessions",
              icon: "repeat" as const,
            },
            {
              value: data.vocabularySize,
              label: "Words studied",
              icon: "book" as const,
            },
          ].map((item) => (
            <View key={item.label} style={s.activityItem}>
              <Icon name={item.icon} size={19} color={c.blue} />
              <Text style={s.activityValue}>{item.value}</Text>
              <Body muted style={s.small}>
                {item.label}
              </Body>
            </View>
          ))}
        </Card>
      </View>

      <View style={s.estimateNote}>
        <Icon name="compass" color={c.blue} size={22} />
        <View style={s.estimateCopy}>
          <Text style={s.noteTitle}>Your learning is more than a number.</Text>
          <Body muted style={s.small}>
            A future estimated level will consider vocabulary mastery, grammar,
            tests, and review performance. This preview does not assess or
            certify your CEFR level.
          </Body>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingBottom: spacing.xl },
  small: { fontSize: 12, lineHeight: 19 },
  demoNote: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: c.blueSoft,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
    alignItems: "flex-start",
  },
  demoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  periodHeader: {
    gap: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  periodTitle: { gap: spacing.xs },
  periods: {
    maxWidth: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    backgroundColor: c.line,
    borderRadius: radius.md,
    padding: spacing.xs,
  },
  period: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  selectedPeriod: { backgroundColor: c.surface },
  pressed: { opacity: 0.8 },
  periodText: {
    color: c.muted,
    fontSize: 12,
    fontWeight: "500",
    fontFamily: typography.family,
  },
  selectedPeriodText: { color: c.navy, fontWeight: "600" },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  metric: { flex: 1, flexBasis: 175, gap: spacing.sm, padding: spacing.xl },
  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  metricLabel: { fontSize: 13 },
  metricValue: {
    color: c.navy,
    fontSize: 32,
    fontWeight: "600",
    letterSpacing: -1,
    fontFamily: typography.family,
  },
  columns: { flexDirection: "row", gap: spacing.xl, alignItems: "stretch" },
  stack: { flexDirection: "column" },
  chartCard: { flex: 1, minWidth: 0 },
  chart: {
    height: 213,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-end",
    paddingTop: spacing.lg,
  },
  chartColumn: { flex: 1, gap: spacing.sm, alignItems: "center" },
  barValue: {
    color: c.navy,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: typography.family,
  },
  barTrack: {
    height: 125,
    width: "65%",
    maxWidth: 38,
    justifyContent: "flex-end",
    backgroundColor: c.background,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  bar: { width: "100%", borderRadius: radius.sm },
  day: { color: c.muted, fontSize: 11, fontFamily: typography.family },
  chartFooter: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: c.line,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    flexWrap: "wrap",
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: c.blue,
  },
  accuracyCard: { width: 315 },
  fullWidth: { width: "100%" },
  accuracyValue: {
    color: c.navy,
    fontSize: 48,
    fontWeight: "500",
    letterSpacing: -2,
    fontFamily: typography.family,
  },
  percent: { fontSize: 26, color: c.muted, letterSpacing: 0 },
  accuracyProgress: { marginTop: spacing.lg, marginBottom: spacing.xl },
  answerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  answerLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  answerDot: { width: 7, height: 7, borderRadius: radius.pill },
  rowText: { fontSize: 12, flexShrink: 1 },
  rowNumber: {
    color: c.navy,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: typography.family,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: c.line,
    paddingTop: spacing.md,
    marginBottom: 0,
  },
  activitySection: { marginTop: spacing.xxl },
  activityGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xl },
  activityItem: { flex: 1, minWidth: 125, gap: spacing.sm },
  activityValue: {
    color: c.navy,
    fontSize: 28,
    fontWeight: "500",
    fontFamily: typography.family,
  },
  estimateNote: {
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "flex-start",
    padding: spacing.xl,
    marginTop: spacing.xl,
    backgroundColor: c.sand,
    borderRadius: radius.lg,
  },
  estimateCopy: { flex: 1, gap: spacing.xs },
  noteTitle: {
    color: c.navy,
    fontSize: 15,
    fontWeight: "600",
    fontFamily: typography.family,
  },
});
