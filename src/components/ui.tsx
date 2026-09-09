import { Feather } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import type { ComponentProps, ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors as c, radius, typography } from "../theme/tokens";

export type IconName = ComponentProps<typeof Feather>["name"];
export function Icon({
  name,
  size = 20,
  color = c.muted,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Feather name={name} size={size} color={color} />;
}
export function Label({
  children,
  color = c.muted,
}: {
  children: ReactNode;
  color?: string;
}) {
  return <Text style={[styles.label, { color }]}>{children}</Text>;
}
export function Body({
  children,
  muted = false,
  style,
  ...props
}: {
  children: ReactNode;
  muted?: boolean;
  style?: ComponentProps<typeof Text>["style"];
} & Omit<ComponentProps<typeof Text>, "children" | "style">) {
  return (
    <Text {...props} style={[styles.body, muted && { color: c.muted }, style]}>
      {children}
    </Text>
  );
}
export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}
export function Badge({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "blue" | "orange" | "green" | "neutral";
}) {
  const tones = {
    blue: [c.blueSoft, c.blue],
    orange: [c.orangeSoft, c.orange],
    green: [c.greenSoft, c.green],
    neutral: [c.background, c.muted],
  };
  return (
    <View style={[styles.badge, { backgroundColor: tones[tone][0] }]}>
      <Text style={[styles.badgeText, { color: tones[tone][1] }]}>
        {children}
      </Text>
    </View>
  );
}
export function ProgressBar({
  value,
  color = c.orange,
  label,
}: {
  value: number;
  color?: string;
  label: string;
}) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: value }}
      style={styles.progressTrack}
    >
      <View
        style={[
          styles.progressFill,
          {
            backgroundColor: color,
            width: `${Math.min(100, Math.max(0, value))}%`,
          },
        ]}
      />
    </View>
  );
}
export function Action({
  title,
  accessibilityLabel,
  href,
  onPress,
  icon,
  variant = "primary",
  disabled = false,
  style,
}: {
  title: string;
  accessibilityLabel?: string;
  href?: Href;
  onPress?: () => void;
  icon?: IconName;
  variant?: "primary" | "secondary" | "quiet";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const foreground = variant === "primary" ? c.white : c.navy;
  const control = (
    <Pressable
      accessibilityRole={href ? "link" : "button"}
      accessibilityLabel={accessibilityLabel ?? title}
      disabled={disabled}
      onPress={onPress}
      style={StyleSheet.flatten([
        styles.button,
        variant === "primary"
          ? { backgroundColor: c.orange }
          : variant === "secondary"
            ? {
                backgroundColor: c.surface,
                borderWidth: 1,
                borderColor: c.line,
              }
            : { backgroundColor: c.transparent },
        { opacity: disabled ? 0.5 : 1 },
        style,
      ])}
    >
      <Text style={[styles.buttonText, { color: foreground }]}>{title}</Text>
      {icon && <Icon name={icon} size={17} color={foreground} />}
    </Pressable>
  );
  return href ? (
    <Link href={href} asChild>
      {control}
    </Link>
  ) : (
    control
  );
}
export function PageHeading({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.pageHeading}>
      <View style={{ flex: 1, gap: 8 }}>
        {eyebrow && <Label color={c.orange}>{eyebrow}</Label>}
        <Text accessibilityRole="header" style={styles.pageTitle}>
          {title}
        </Text>
        <Body muted>{subtitle}</Body>
      </View>
      {children}
    </View>
  );
}
export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.sectionHeading}>
      <View style={{ flex: 1, gap: 5 }}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {title}
        </Text>
        {subtitle && (
          <Body muted style={{ fontSize: 13 }}>
            {subtitle}
          </Body>
        )}
      </View>
      {action}
    </View>
  );
}
export function EmptyState({
  icon = "book-open",
  title,
  description,
}: {
  icon?: IconName;
  title: string;
  description: string;
}) {
  return (
    <Card style={styles.empty}>
      <View style={styles.iconCircle}>
        <Icon name={icon} color={c.blue} size={26} />
      </View>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      <Body muted style={{ textAlign: "center", maxWidth: 420 }}>
        {description}
      </Body>
    </Card>
  );
}
export function PreviewModal({
  visible,
  onClose,
  title,
  contentKey,
  prominentTitle = false,
  eyebrow = "STUDY SPACE",
  footer = "Progress is saved only when you choose a study action or submit an answer.",
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  contentKey?: string;
  prominentTitle?: boolean;
  eyebrow?: string;
  footer?: string;
  children: ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View accessibilityViewIsModal style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1, gap: 8 }}>
              <Label color={c.orange}>{eyebrow}</Label>
              <Text
                accessibilityRole="header"
                style={[
                  styles.sectionTitle,
                  prominentTitle && {
                    fontSize: typography.sizes.title,
                    fontWeight: "700",
                  },
                ]}
              >
                {title}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close preview"
              style={styles.closeButton}
            >
              <Icon name="x" color={c.navy} />
            </Pressable>
          </View>
          <ScrollView
            key={contentKey ?? title}
            contentContainerStyle={{ padding: 24, gap: 20 }}
          >
            {children}
          </ScrollView>
          <View style={styles.modalFooter}>
            <Body muted style={{ fontSize: 12, flex: 1 }}>
              {footer}
            </Body>
            <Action title="Done" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
export const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "700",
    fontFamily: typography.family,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    color: c.text,
    fontFamily: typography.family,
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.line,
    padding: 24,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontFamily: typography.family,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  progressTrack: {
    height: 6,
    backgroundColor: c.line,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  button: {
    minHeight: 46,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    alignSelf: "flex-start",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: typography.family,
  },
  pageHeading: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 28,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "600",
    color: c.navy,
    letterSpacing: -1,
    fontFamily: typography.family,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: c.navy,
    letterSpacing: -0.4,
    fontFamily: typography.family,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 17,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: c.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { alignItems: "center", paddingVertical: 48, gap: 14 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: c.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 630,
    maxHeight: "88%",
    backgroundColor: c.surface,
    borderRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: c.background,
  },
  modalFooter: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: c.line,
  },
});
