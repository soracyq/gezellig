import { Feather } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppShell } from "../components/AppShell";
import { SettingsProvider } from "../state/SettingsProvider";
import { colors } from "../theme/tokens";
import { webStyles } from "../theme/webStyles";

export { ErrorBoundary } from "expo-router";
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(Feather.font);
  if (!fontsLoaded && !fontError)
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
          accessibilityLabel="Loading Dutchly"
          color={colors.orange}
        />
      </View>
    );
  return (
    <SafeAreaProvider>
      <Head>
        <title>Dutchly · Your learning space</title>
        <style>{webStyles}</style>
      </Head>
      <SettingsProvider>
        <StatusBar style="dark" />
        <AppShell>
          <Slot />
        </AppShell>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
