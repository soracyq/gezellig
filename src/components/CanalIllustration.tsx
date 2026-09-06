import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { colors as c } from "../theme/tokens";

// A small, scalable illustration built from native SVG primitives; no remote assets.
export function CanalIllustration() {
  const p = c.illustration;
  return (
    <Svg width="100%" height="100%" viewBox="0 0 440 300" aria-hidden={true}>
      <Circle cx="247" cy="142" r="116" fill={p.sky} />
      <Circle cx="318" cy="68" r="30" fill={p.sun} opacity="0.85" />
      <Path
        d="M72 213 Q125 173 192 200 Q282 162 394 218 L405 243 L65 243Z"
        fill={p.hill}
      />
      <Path
        d="M38 249 Q186 210 410 243 L429 275 Q256 247 72 284Z"
        fill={p.water}
      />
      <Path
        d="M107 255 Q177 240 215 247 M260 260 Q313 252 367 260 M156 275 L231 267"
        fill="none"
        stroke={c.hero}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <G>
        <Path d="M199 212 L204 102 L231 69 L257 102 L262 212Z" fill={p.brick} />
        <Path
          d="M198 105 L207 105 L207 90 L220 90 L220 78 L240 78 L240 90 L252 90 L252 105 L262 105"
          fill="none"
          stroke={p.roof}
          strokeWidth="7"
        />
        <Rect x="214" y="120" width="11" height="19" rx="1" fill={p.cream} />
        <Rect x="238" y="120" width="11" height="19" rx="1" fill={p.cream} />
        <Rect x="214" y="153" width="11" height="19" rx="1" fill={p.cream} />
        <Rect x="238" y="153" width="11" height="19" rx="1" fill={p.cream} />
        <Path d="M224 212 V188 Q232 178 240 188 V212" fill={p.roof} />
        <Path d="M271 211 V128 L298 103 L325 128 V216Z" fill={p.cream} />
        <Path
          d="M267 130 L298 100 L329 130"
          fill="none"
          stroke={p.roof}
          strokeWidth="6"
        />
        <Rect x="283" y="139" width="10" height="17" fill={p.roof} />
        <Rect x="304" y="139" width="10" height="17" fill={p.roof} />
        <Rect x="283" y="170" width="10" height="17" fill={p.roof} />
        <Rect x="304" y="170" width="10" height="17" fill={p.roof} />
        <Rect x="294" y="196" width="12" height="20" fill={p.brick} />
      </G>
      <G>
        <Path d="M117 215 L130 119 L153 119 L169 215Z" fill={p.cream} />
        <Path d="M124 120 L141 92 L160 120Z" fill={p.roof} />
        <Path
          d="M141 135 L92 76 M141 135 L200 86 M141 135 L190 194 M141 135 L82 184"
          stroke={p.roof}
          strokeWidth="5"
        />
        <Path
          d="M128 120 L105 71 L92 76 L123 115Z M155 122 L204 100 L200 86 L150 117Z M154 150 L176 198 L190 194 L159 144Z M126 149 L78 171 L82 184 L132 154Z"
          fill={p.roof}
        />
        <Circle cx="141" cy="135" r="7" fill={p.brick} />
        <Path d="M135 215 V191 Q141 180 149 191 V215" fill={p.roof} />
      </G>
      <G stroke={p.roof} strokeWidth="2.5" fill="none">
        <Circle cx="243" cy="222" r="10" />
        <Circle cx="278" cy="222" r="10" />
        <Path d="M243 222 L254 203 L268 222 L243 222 L256 210 L274 210 L278 222 M250 202 L258 202 M274 210 L271 201 L278 201" />
      </G>
      <Path
        d="M51 222 Q193 215 378 231"
        stroke={p.roof}
        strokeWidth="3"
        fill="none"
      />
      <G fill={p.foliage}>
        <Ellipse cx="351" cy="168" rx="18" ry="29" />
        <Ellipse cx="371" cy="183" rx="13" ry="23" />
      </G>
      <Path d="M351 229 V162 M372 230 V182" stroke={p.roof} strokeWidth="3" />
      <G stroke={p.foliage} strokeWidth="3" fill="none">
        <Path d="M75 226 V197 M88 228 V207 M63 229 V211" />
      </G>
      <G fill={p.brick}>
        <Path d="M66 190 L75 196 L84 190 Q85 209 75 208 Q65 207 66 190Z" />
        <Path d="M79 201 L88 207 L97 201 Q98 218 88 218 Q78 217 79 201Z" />
        <Path d="M55 205 L63 210 L71 205 Q72 222 63 221 Q54 222 55 205Z" />
      </G>
      <Path
        d="M275 56 Q282 48 289 55 M79 128 Q86 121 93 128"
        stroke={p.roof}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}
