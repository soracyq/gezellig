import { useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import type { Href } from "expo-router";
import { Action, Body, Label, PreviewModal } from "./ui";
import {
  currentRelease,
  currentVersion,
  developerName,
  repositoryURL,
} from "../about/metadata";
import {
  checkForUpdates,
  networkMessage,
  type UpdateResult,
} from "../about/updates";
import { colors as c } from "../theme/tokens";

export function AboutModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<UpdateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const desktop =
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    window.location.protocol === "dutchly:";
  useEffect(() => {
    return () => {
      request.current?.abort();
      request.current = null;
    };
  }, []);
  function close() {
    request.current?.abort();
    request.current = null;
    setChecking(false);
    onClose();
  }
  async function check() {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setChecking(true);
    setError(null);
    try {
      const next = await checkForUpdates(
        currentVersion,
        repositoryURL,
        controller.signal,
      );
      if (!controller.signal.aborted) setResult(next);
    } catch (reason) {
      if (!controller.signal.aborted)
        setError(reason instanceof Error ? reason.message : networkMessage);
    } finally {
      if (request.current === controller) {
        request.current = null;
        setChecking(false);
      }
    }
  }
  return (
    <PreviewModal
      visible={visible}
      onClose={close}
      title="About Gezellig"
      eyebrow="GEZELLIG"
      closeLabel="Close About Gezellig"
      footer="Updates are checked only when you choose. Nothing is downloaded or installed automatically."
    >
      <Body>Dutch learning application</Body>
      <View style={{ gap: 8 }}>
        <Label>Current version</Label>
        <Body style={{ fontSize: 23, fontWeight: "600" }}>
          Version {currentVersion}
        </Body>
        <Body muted>
          {desktop
            ? "Installed desktop version"
            : Platform.OS === "web"
              ? "Current web version"
              : "Current app version"}
        </Body>
        {currentRelease?.date && (
          <Body muted>
            Released{" "}
            {new Date(`${currentRelease.date}T12:00:00`).toLocaleDateString(
              undefined,
              { year: "numeric", month: "long", day: "numeric" },
            )}
          </Body>
        )}
        <Body>
          {currentRelease?.summary ??
            "Release information is not available for this build."}
        </Body>
      </View>
      <Action
        title={
          checking
            ? "Checking for updates…"
            : error
              ? "Retry update check"
              : "Check for updates"
        }
        onPress={() => void check()}
        disabled={checking}
        icon="refresh-cw"
      />
      <View
        accessibilityLiveRegion="polite"
        testID="update-status"
        style={{ gap: 10 }}
      >
        {checking ? (
          <Body>Checking for updates…</Body>
        ) : error ? (
          <Body style={{ color: c.orangeText }}>{error}</Body>
        ) : (
          result && (
            <View
              style={{
                gap: 10,
                padding: 16,
                borderRadius: 12,
                backgroundColor: c.blueSoft,
              }}
            >
              <Body style={{ fontWeight: "600" }}>
                {result.status === "available"
                  ? "A new version is available"
                  : result.status === "current"
                    ? "You're up to date"
                    : "You're using a newer build"}
              </Body>
              <Body>
                {result.status === "current"
                  ? `Gezellig ${currentVersion} is the latest version.`
                  : `Current: ${currentVersion} · Latest public release: ${result.version}`}
              </Body>
              {result.status === "available" && (
                <>
                  {!!result.summary && (
                    <>
                      <Label>What’s new in {result.version}</Label>
                      <Body>{result.summary}</Body>
                    </>
                  )}
                  <Action
                    title="View update"
                    accessibilityLabel="View update and full release notes on GitHub"
                    href={result.url as Href}
                    target="_blank"
                    variant="secondary"
                    icon="external-link"
                  />
                  {!desktop && Platform.OS === "web" && (
                    <Body muted>
                      This is the web app. Its deployed version is updated by
                      its host; desktop installation is not required.
                    </Body>
                  )}
                </>
              )}
            </View>
          )
        )}
        {result && (
          <Body muted style={{ fontSize: 12 }}>
            Last successful check: {new Date(result.checkedAt).toLocaleString()}
          </Body>
        )}
      </View>
      <View style={{ gap: 10 }}>
        <Label>Developer</Label>
        <Body>{developerName}</Body>
        <Action
          title="GitHub"
          accessibilityLabel="Open Gezellig's GitHub repository in your browser"
          href={repositoryURL as Href}
          target="_blank"
          variant="quiet"
          icon="external-link"
          style={{ alignSelf: "flex-start" }}
        />
      </View>
    </PreviewModal>
  );
}
