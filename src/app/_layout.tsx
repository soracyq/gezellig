import { Feather } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useSyncExternalStore } from "react";
import { Slot } from "expo-router";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppShell } from "../components/AppShell";
import { SettingsProvider } from "../state/SettingsProvider";
import { LearningProvider } from "../state/LearningProvider";
import { colors } from "../theme/tokens";
import { webStyles } from "../theme/webStyles";

export { ErrorBoundary } from "expo-router";
const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
export default function RootLayout() {
  // Static HTML and the first browser render share the loading frame. Viewport
  // measurements and this device's saved state are available after hydration.
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    clientSnapshot,
    serverSnapshot,
  );
  const [fontsLoaded, fontError] = useFonts(Feather.font);
  if (!hydrated || (!fontsLoaded && !fontError))
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator
          accessibilityLabel="Loading Gezellig"
          color={colors.orange}
        />
      </View>
    );
  return (
    <SafeAreaProvider>
      <Head>
        <title>Gezellig · Your learning space</title>
        <style>{webStyles}</style>
      </Head>
      <SettingsProvider>
        <LearningProvider>
          <StatusBar style="dark" />
          <AppShell>
            <Slot />
          </AppShell>
        </LearningProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
