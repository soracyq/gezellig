import { Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { version } from "../../package.json";
import { useLearning } from "../state/LearningProvider";
import {
  Badge,
  Body,
  Card,
  Icon,
  Label,
  PageHeading,
  SectionHeading,
  Action,
  PreviewModal,
} from "../components/ui";
import { useSettings } from "../state/SettingsProvider";
import { DAILY_TARGETS } from "../storage/settings";
import { colors as c, typography } from "../theme/tokens";

export default function SettingsScreen() {
  const { vocabulary, grammar, resetProgress, loading, busy } = useLearning();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  async function reset() {
    try {
      await resetProgress();
      setConfirmReset(false);
      setResetMessage(
        "Progress reset. Your curriculum, imported datasets and daily target are unchanged.",
      );
    } catch (e) {
      setResetMessage(
        e instanceof Error ? e.message : "Progress could not be reset.",
      );
    }
  }
  const { dailyTarget, setDailyTarget, isLoading, isSaving, error } =
    useSettings();
  return (
    <View>
      <PageHeading
        eyebrow="MAKE IT YOURS"
        title="Find your own pace."
        subtitle="A learning routine that fits into your everyday life."
      />
      <View style={{ maxWidth: 820, gap: 24 }}>
        <Card style={{ padding: 28 }}>
          <SectionHeading
            title="Your daily vocabulary target"
            subtitle="Choose your new-word goal. This also sets the daily maximum for vocabulary and grammar Review questions."
            action={
              <View style={s.icon}>
                <Icon name="flag" color={c.orange} />
              </View>
            }
          />
          <View style={s.targets}>
            {DAILY_TARGETS.map((target) => (
              <Pressable
                key={target}
                accessibilityRole="button"
                accessibilityLabel={`${target} words per day`}
                accessibilityState={{
                  selected: dailyTarget === target,
                  disabled: isLoading || isSaving,
                }}
                disabled={isLoading || isSaving}
                onPress={() => void setDailyTarget(target)}
                style={({ pressed }) => [
                  s.target,
                  dailyTarget === target && s.selectedTarget,
                  { opacity: isLoading || isSaving ? 0.6 : pressed ? 0.8 : 1 },
                ]}
              >
                <Text
                  style={[
                    s.targetNumber,
                    dailyTarget === target && { color: c.orange },
                  ]}
                >
                  {target}
                </Text>
                <Text
                  style={[
                    s.targetWords,
                    dailyTarget === target && { color: c.orange },
                  ]}
                >
                  words
                </Text>
                {dailyTarget === target && (
                  <View style={s.targetCheck}>
                    <Icon name="check" size={11} color={c.white} />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
          <View accessibilityLiveRegion="polite" style={s.saveNote}>
            <Icon
              name={error ? "alert-circle" : "check-circle"}
              size={16}
              color={error ? c.orange : c.green}
            />
            <Body muted style={{ fontSize: 13, flex: 1 }}>
              {error ??
                (isLoading
                  ? "Loading your preference…"
                  : isSaving
                    ? "Saving your daily target…"
                    : `Your target is ${dailyTarget} words per day. Changes are saved on this device.`)}
            </Body>
          </View>
          <View style={s.tip}>
            <Icon name="sun" color={c.orange} size={19} />
            <Body style={{ fontSize: 13, flex: 1 }}>
              Start with a comfortable target. You can always make more room for
              Dutch later.
            </Body>
          </View>
        </Card>
        <Card>
          <SectionHeading title="Your learning space" />
          <View style={s.settingRow}>
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={s.settingTitle}>Teaching language</Text>
              <Body muted style={{ fontSize: 13 }}>
                Instructions, explanations and translations
              </Body>
            </View>
            <Badge>English</Badge>
          </View>
          <View style={s.settingRow}>
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={s.settingTitle}>Learning content</Text>
              <Body muted style={{ fontSize: 13 }}>
                {vocabulary.length} vocabulary items and {grammar.length}{" "}
                grammar lessons
              </Body>
            </View>
            <Badge tone="orange">Your curriculum</Badge>
          </View>
          <View
            style={[s.settingRow, { borderBottomWidth: 0, paddingBottom: 0 }]}
          >
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={s.settingTitle}>Saved on this device</Text>
              <Body muted style={{ fontSize: 13 }}>
                Your daily target, imports and activity stay in this browser or
                app. Cloud synchronization will come later.
              </Body>
            </View>
            <Icon name="smartphone" color={c.blue} />
          </View>
        </Card>
        <View style={s.future}>
          <View style={s.icon}>
            <Icon name="upload" color={c.blue} />
          </View>
          <View style={{ flex: 1, gap: 8 }}>
            <Label>ROOM TO GROW</Label>
            <Text style={s.settingTitle}>
              Bring your own words and grammar.
            </Text>
            <Body muted style={{ fontSize: 13 }}>
              Download a CSV or Excel template, fill it in, and preview the
              results before importing.
            </Body>
            <Action
              title="Open imports"
              href="/import"
              variant="secondary"
              icon="upload"
            />
          </View>
        </View>
        <Card style={{ gap: 16 }}>
          <SectionHeading title="Start your progress again" />
          <Body muted>
            This resets studied words, completed lessons, practice answers,
            accuracy, mistakes, streaks and study days. Your curriculum, imports
            and daily target are kept.
          </Body>
          <Action
            title="Reset learning progress"
            variant="secondary"
            onPress={() => {
              setResetMessage(null);
              setConfirmReset(true);
            }}
            disabled={loading || busy}
          />
          {resetMessage && (
            <Body accessibilityLiveRegion="polite">{resetMessage}</Body>
          )}
        </Card>
        <Body muted style={{ fontSize: 12 }}>
          Dutchly {version} · Personal learning · No account needed.
        </Body>
      </View>
      <PreviewModal
        visible={confirmReset}
        onClose={() => {
          if (!busy) setConfirmReset(false);
        }}
        title="Reset learning progress?"
        eyebrow="CONFIRM RESET"
        footer="This affects progress only and cannot be undone."
      >
        <Body>
          Your saved learning history and all statistics will return to zero.
          Your words, grammar lessons, imported datasets and settings will
          remain.
        </Body>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          <Action
            title="Cancel reset"
            variant="secondary"
            onPress={() => setConfirmReset(false)}
            disabled={busy}
          />
          <Action
            title="Confirm progress reset"
            onPress={() => void reset()}
            disabled={busy}
          />
        </View>
        {resetMessage && <Body accessibilityRole="alert">{resetMessage}</Body>}
      </PreviewModal>
    </View>
  );
}
const s = StyleSheet.create({
  icon: {
    width: 43,
    height: 43,
    backgroundColor: c.orangeSoft,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  targets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginVertical: 18,
  },
  target: {
    minWidth: 75,
    flex: 1,
    minHeight: 84,
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    backgroundColor: c.background,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 12,
    position: "relative",
  },
  selectedTarget: { backgroundColor: c.orangeSoft, borderColor: c.orange },
  targetNumber: {
    fontSize: 25,
    color: c.navy,
    fontWeight: "600",
    fontFamily: typography.family,
  },
  targetWords: { fontSize: 11, color: c.muted, fontFamily: typography.family },
  targetCheck: {
    position: "absolute",
    top: -7,
    right: -5,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: c.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  saveNote: {
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
    marginVertical: 5,
  },
  tip: {
    marginTop: 22,
    padding: 17,
    backgroundColor: c.sand,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
  },
  settingTitle: {
    color: c.navy,
    fontSize: 15,
    fontWeight: "600",
    fontFamily: typography.family,
  },
  future: {
    flexDirection: "row",
    padding: 23,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 15,
    gap: 18,
  },
});
