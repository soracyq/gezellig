import { Link, usePathname, type Href } from "expo-router";
import { useState, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors as c, typography } from "../theme/tokens";
import { useLearning } from "../state/LearningProvider";
import { Badge, Body, Icon, Label, type IconName } from "./ui";

export const navigation: { label: string; href: Href; icon: IconName }[] = [
  { label: "Home", href: "/", icon: "grid" },
  { label: "Levels", href: "/levels", icon: "layers" },
  { label: "Vocabulary", href: "/vocabulary", icon: "book-open" },
  { label: "Grammar", href: "/grammar", icon: "file-text" },
  { label: "Review", href: "/review", icon: "refresh-cw" },
  { label: "Statistics", href: "/statistics", icon: "bar-chart-2" },
  { label: "Import", href: "/import", icon: "upload" },
  { label: "Settings", href: "/settings", icon: "sliders" },
];
function Brand() {
  return (
    <View style={s.brand}>
      <View style={s.brandMark}>
        <Icon name="wind" color={c.white} size={23} />
      </View>
      <Text style={s.brandName}>
        dutchly<Text style={{ color: c.orange }}>.</Text>
      </Text>
    </View>
  );
}
export function AppShell({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const { loading, curriculumError, activityError, error, refresh } =
    useLearning();
  const large = width >= 1050;
  const pathname = usePathname();
  const current =
    navigation.find((item) => item.href === pathname)?.label ?? "Explore";
  const [menuOpen, setMenuOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const nav = (onNavigate?: () => void) => (
    <View style={{ gap: 6 }}>
      {navigation.map((item, i) => (
        <View key={item.label}>
          {i === 5 && <View style={s.navDivider} />}
          <Link href={item.href} asChild>
            <Pressable
              onPress={onNavigate}
              accessibilityRole="link"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: item.href === pathname }}
              style={StyleSheet.flatten([
                s.navItem,
                item.href === pathname && s.navItemActive,
              ])}
            >
              <Icon
                name={item.icon}
                size={19}
                color={item.href === pathname ? c.blue : c.muted}
              />
              <Text
                style={[
                  s.navText,
                  item.href === pathname && {
                    color: c.blue,
                    fontWeight: "600",
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          </Link>
        </View>
      ))}
    </View>
  );
  return (
    <View
      style={[s.app, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      {large && (
        <ScrollView style={s.sidebar} contentContainerStyle={{ flexGrow: 1 }}>
          <Brand />
          <View style={s.sidebarNav}>
            <Label>YOUR LEARNING SPACE</Label>
            <View style={{ marginTop: 20 }}>{nav()}</View>
          </View>
          <View style={s.sidebarBottom}>
            <View style={s.journeyCard}>
              <Icon name="sun" color={c.orange} size={24} />
              <Text style={s.journeyTitle}>
                Little by little,<Text>{"\n"}</Text>you’ll get there.
              </Text>
              <Body muted style={{ fontSize: 12, lineHeight: 19 }}>
                Make a little room for Dutch every day.
              </Body>
            </View>
            <View style={s.profile}>
              <View style={s.avatar}>
                <Icon name="user" size={19} color={c.blue} />
              </View>
              <View style={{ gap: 3 }}>
                <Text style={s.profileName}>Your personal space</Text>
                <Text style={s.profileCaption}>Learning at your own pace</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
      <View style={s.workspace}>
        <View style={[s.topbar, !large && { paddingHorizontal: 20 }]}>
          {large ? (
            <View style={s.breadcrumb}>
              <Text style={s.crumbMuted}>My learning</Text>
              <Icon name="chevron-right" size={13} />
              <Text style={s.crumbActive}>{current}</Text>
            </View>
          ) : (
            <Brand />
          )}
          <View style={[s.topRight, width < 500 && { gap: 6 }]}>
            <Badge tone="neutral">
              {width < 500 ? "Local" : "Saved on this device"}
            </Badge>
            {large && <View style={s.topDivider} />}
            {large && (
              <View style={s.language}>
                <View style={s.dutchFlag}>
                  <View style={{ flex: 1, backgroundColor: c.orange }} />
                  <View style={{ flex: 1, backgroundColor: c.white }} />
                  <View style={{ flex: 1, backgroundColor: c.blue }} />
                </View>
                <Text style={s.crumbActive}>Dutch</Text>
              </View>
            )}
            {!large && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open navigation menu"
                onPress={() => setMenuOpen(true)}
                style={s.menuButton}
              >
                <Icon name="menu" color={c.navy} />
              </Pressable>
            )}
          </View>
        </View>
        <ScrollView
          key={pathname}
          contentContainerStyle={[
            s.scrollContent,
            { padding: width < 650 ? 20 : 36 },
          ]}
        >
          <View style={s.page}>
            {loading ? (
              <Body>Loading your saved learning space…</Body>
            ) : (
              <>
                {(curriculumError || activityError || error) && (
                  <View
                    accessibilityRole="alert"
                    style={{
                      padding: 20,
                      gap: 10,
                      backgroundColor: c.orangeSoft,
                      marginBottom: 20,
                    }}
                  >
                    <Body>{curriculumError || activityError || error}</Body>
                    <Body muted>
                      Your saved data has not been cleared. Statistics may be
                      unavailable until the data can be loaded.
                    </Body>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => void refresh()}
                    >
                      <Body>Try loading again</Body>
                    </Pressable>
                  </View>
                )}
                {children}
              </>
            )}
            <View style={s.footer}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 7 }}
              >
                <Icon name="feather" size={13} />
                <Text style={s.footerText}>
                  A little practice goes a long way.
                </Text>
              </View>
              <Text style={s.footerText}>Dutchly · Personal learning</Text>
            </View>
          </View>
        </ScrollView>
        {!large && (
          <View style={s.mobileTabs}>
            {[navigation[0], navigation[2], navigation[4], navigation[5]].map(
              (item) => (
                <Link key={item.label} href={item.href} asChild>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={item.label}
                    accessibilityState={{ selected: item.href === pathname }}
                    style={s.mobileTab}
                  >
                    <Icon
                      name={item.icon}
                      size={20}
                      color={item.href === pathname ? c.orange : c.muted}
                    />
                    <Text
                      style={[
                        s.mobileTabText,
                        { color: item.href === pathname ? c.orange : c.muted },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                </Link>
              ),
            )}
          </View>
        )}
      </View>
      <Modal
        transparent
        visible={menuOpen}
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={s.menuBackdrop}>
          <View accessibilityViewIsModal style={s.menuSheet}>
            <View style={s.menuHeading}>
              <Brand />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close navigation menu"
                onPress={() => setMenuOpen(false)}
                style={s.menuButton}
              >
                <Icon name="x" />
              </Pressable>
            </View>
            <ScrollView style={{ flexShrink: 1 }}>
              {nav(() => setMenuOpen(false))}
              <Body muted style={{ fontSize: 12, marginTop: 20 }}>
                Your curriculum · English interface
              </Body>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const s = StyleSheet.create({
  app: { flex: 1, flexDirection: "row", backgroundColor: c.background },
  sidebar: {
    width: 226,
    flexGrow: 0,
    backgroundColor: c.surface,
    borderRightWidth: 1,
    borderRightColor: c.line,
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  brand: { flexDirection: "row", gap: 10, alignItems: "center" },
  brandMark: {
    width: 35,
    height: 35,
    backgroundColor: c.orange,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 27,
    fontWeight: "700",
    letterSpacing: -1.2,
    color: c.navy,
    fontFamily: typography.family,
  },
  sidebarNav: { marginTop: 48 },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    minHeight: 47,
    paddingHorizontal: 14,
    borderRadius: 9,
  },
  navItemActive: { backgroundColor: c.blueSoft },
  navText: { fontSize: 14, fontFamily: typography.family, color: c.muted },
  navDivider: {
    height: 1,
    backgroundColor: c.line,
    marginVertical: 20,
    marginHorizontal: 12,
  },
  navCount: {
    marginLeft: "auto",
    backgroundColor: c.orangeSoft,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  navCountText: { color: c.orange, fontSize: 10, fontWeight: "600" },
  sidebarBottom: { marginTop: "auto", paddingTop: 24 },
  journeyCard: {
    backgroundColor: c.sand,
    borderRadius: 12,
    padding: 17,
    gap: 10,
  },
  journeyTitle: {
    color: c.navy,
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 24,
    fontFamily: typography.family,
  },
  profile: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingVertical: 25,
  },
  avatar: {
    width: 34,
    height: 34,
    backgroundColor: c.blueSoft,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    fontSize: 11,
    fontWeight: "600",
    color: c.navy,
    fontFamily: typography.family,
  },
  profileCaption: {
    fontSize: 9,
    color: c.muted,
    fontFamily: typography.family,
  },
  workspace: { flex: 1, minWidth: 0 },
  topbar: {
    height: 78,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 36,
    backgroundColor: c.surface,
  },
  breadcrumb: { flexDirection: "row", gap: 16, alignItems: "center" },
  crumbMuted: { color: c.muted, fontSize: 12, fontFamily: typography.family },
  crumbActive: {
    color: c.navy,
    fontSize: 12,
    fontFamily: typography.family,
    fontWeight: "600",
  },
  topRight: { flexDirection: "row", gap: 20, alignItems: "center" },
  topDivider: { height: 23, width: 1, backgroundColor: c.line },
  language: { flexDirection: "row", gap: 8, alignItems: "center" },
  dutchFlag: {
    width: 21,
    height: 15,
    borderRadius: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: c.line,
  },
  scrollContent: { flexGrow: 1 },
  page: { width: "100%", maxWidth: 1230, alignSelf: "center", flexGrow: 1 },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 36,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: c.line,
  },
  footerText: { color: c.muted, fontSize: 11, fontFamily: typography.family },
  mobileTabs: {
    flexDirection: "row",
    minHeight: 68,
    borderTopWidth: 1,
    borderTopColor: c.line,
    backgroundColor: c.surface,
  },
  mobileTab: {
    flex: 1,
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 64,
  },
  mobileTabText: { fontSize: 10, fontFamily: typography.family },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: c.overlay,
    justifyContent: "center",
    padding: 24,
  },
  menuSheet: {
    maxHeight: "90%",
    padding: 24,
    backgroundColor: c.surface,
    borderRadius: 20,
    maxWidth: 380,
    width: "100%",
    alignSelf: "center",
  },
  menuHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
});
