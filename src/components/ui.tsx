import { Feather } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import { useState, type ComponentProps, type ReactNode } from "react";
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
import {
  colors as c,
  learningColors,
  radius,
  typography,
  spacing,
  controls,
  layout,
  shadows,
} from "../theme/tokens";

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
  return (
    <Feather
      name={name}
      size={size}
      color={color}
      accessible={false}
      aria-hidden
    />
  );
}
export function Label({
  children,
  color = c.muted,
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <Text
      style={[
        styles.label,
        { color: color === c.orange ? c.orangeText : color },
      ]}
    >
      {children}
    </Text>
  );
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
  testID,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  return (
    <View testID={testID} style={[styles.card, style]}>
      {children}
    </View>
  );
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
    orange: [c.orangeSoft, c.orangeText],
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
  target,
  onPress,
  icon,
  variant = "primary",
  disabled = false,
  iconOnly = false,
  style,
}: {
  title: string;
  accessibilityLabel?: string;
  href?: Href;
  target?: "_blank";
  onPress?: () => void;
  icon?: IconName;
  variant?: "primary" | "secondary" | "quiet" | "warm" | "destructive";
  disabled?: boolean;
  iconOnly?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);
  const active = !disabled && (hovered || pressed);
  const foreground =
    variant === "primary" || variant === "destructive"
      ? c.white
      : variant === "warm"
        ? learningColors.new.text
        : c.navy;
  const control = (
    <Pressable
      accessibilityRole={href ? "link" : "button"}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled }}
      {...(target ? { hrefAttrs: { target, rel: "noopener noreferrer" } } : {})}
      disabled={disabled}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={StyleSheet.flatten([
        styles.button,
        variant === "primary"
          ? { backgroundColor: active ? c.orangePressed : c.orangeAction }
          : variant === "destructive"
            ? { backgroundColor: active ? c.dangerPressed : c.danger }
            : variant === "secondary"
              ? {
                  backgroundColor: active ? c.blueSoft : c.surface,
                  borderColor: active ? c.blue : c.line,
                }
              : variant === "warm"
                ? {
                    backgroundColor: c.orangeSoft,
                    borderColor:
                      !disabled && focused
                        ? c.navy
                        : !disabled && hovered
                          ? c.orange
                          : learningColors.new.border,
                    cursor: disabled ? "auto" : "pointer",
                  }
                : { backgroundColor: active ? c.blueSoft : c.transparent },
        !disabled && focused && { borderColor: c.navy },
        {
          opacity: disabled ? 0.5 : pressed ? 0.88 : 1,
          cursor: disabled ? "auto" : "pointer",
        },
        iconOnly && styles.iconButton,
        style,
      ])}
    >
      {!iconOnly && (
        <Text style={[styles.buttonText, { color: foreground }]}>{title}</Text>
      )}
      {icon && <Icon name={icon} size={17} color={foreground} />}
    </Pressable>
  );
  return href && !disabled ? (
    <Link
      href={href}
      target={target}
      rel={target ? "noopener noreferrer" : undefined}
      asChild
    >
      {control}
    </Link>
  ) : (
    control
  );
}
export function IconAction(
  props: Omit<ComponentProps<typeof Action>, "iconOnly"> & { icon: IconName },
) {
  return <Action variant="quiet" {...props} iconOnly />;
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
      <View
        style={{ flexGrow: 1, flexShrink: 1, flexBasis: 260, gap: spacing.sm }}
      >
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
  onDismiss,
  title,
  contentKey,
  prominentTitle = false,
  eyebrow = "STUDY SPACE",
  footer = "Progress is saved only when you choose a study action or submit an answer.",
  showDone = true,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  onDismiss?: () => void;
  title: string;
  contentKey?: string;
  prominentTitle?: boolean;
  eyebrow?: string;
  footer?: string;
  showDone?: boolean;
  children: ReactNode;
}) {
  return (
    <Modal
      accessibilityLabel={title}
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      onDismiss={onDismiss}
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
            <IconAction onPress={onClose} title="Close preview" icon="x" />
          </View>
          <ScrollView
            key={contentKey ?? title}
            contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
          >
            {children}
          </ScrollView>
          <View style={styles.modalFooter}>
            <Body muted style={{ fontSize: 12, flex: 1 }}>
              {footer}
            </Body>
            {showDone && <Action title="Done" onPress={onClose} />}
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
    fontSize: typography.sizes.body,
    lineHeight: 23,
    color: c.text,
    fontFamily: typography.family,
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.line,
    padding: spacing.xl,
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
    minHeight: controls.height,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: controls.borderWidth,
    borderColor: c.transparent,
    cursor: "pointer",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    alignSelf: "flex-start",
  },
  iconButton: {
    width: controls.iconSize,
    height: controls.iconSize,
    minHeight: controls.iconSize,
    padding: 0,
  },
  answerInput: {
    fontFamily: typography.family,
    fontSize: typography.sizes.subtitle,
    lineHeight: 28,
    minHeight: controls.inputHeight,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: c.blue,
    borderRadius: radius.md,
    color: c.text,
    backgroundColor: c.surface,
    textAlignVertical: "top",
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
    fontSize: typography.sizes.page,
    fontWeight: "600",
    color: c.navy,
    letterSpacing: -1,
    fontFamily: typography.family,
  },
  sectionTitle: {
    fontSize: typography.sizes.section,
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
    maxWidth: layout.modalWidth,
    maxHeight: "88%",
    backgroundColor: c.surface,
    borderRadius: radius.xl,
    boxShadow: shadows.modal,
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
  modalFooter: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: c.line,
  },
});
