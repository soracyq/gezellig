import { colors } from "./tokens";

// Shared by the initial web document and client navigation. Native ignores Head.
export const webStyles = `
  [tabindex]:focus-visible, button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible {
    outline: 3px solid ${colors.blue} !important;
    outline-offset: 3px;
  }
  a:hover { opacity: 0.86; }
  * { box-sizing: border-box; }
  body { margin: 0; background: ${colors.background}; }
  ::-webkit-scrollbar { width: 7px; height: 6px; }
  ::-webkit-scrollbar-thumb { background: ${colors.illustration.hill}; border-radius: 8px; }
`;
