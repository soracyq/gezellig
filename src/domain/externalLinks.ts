export function googleTranslateUrl(text: string) {
  return `https://translate.google.com/?sl=nl&tl=en&text=${encodeURIComponent(text)}&op=translate` as const;
}
