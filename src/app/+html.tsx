import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";
import { colors } from "../theme/tokens";
import { webStyles } from "../theme/webStyles";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content={colors.background} />
        <meta
          name="description"
          content="A little Dutch, every day. Explore your personal learning space with Gezellig."
        />
        <title>Gezellig · Your learning space</title>
        <link rel="icon" href="/brand/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/brand/icon-192.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: webStyles,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
