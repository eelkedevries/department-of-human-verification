/** The Department's seal: an original design for a fictional body. */

export const SEAL_SVG = `
<svg class="seal" viewBox="0 0 120 120" role="img" aria-label="Seal of the fictional Department of Human Verification" focusable="false">
  <defs>
    <path id="seal-top" d="M 23.14,85.81 A 45,45 0 1,1 96.86,85.81" />
    <path id="seal-bottom" d="M 31.9,100.14 A 49,49 0 0,0 88.1,100.14" />
  </defs>
  <circle cx="60" cy="60" r="58" fill="var(--seal-ink)" />
  <circle cx="60" cy="60" r="54.5" fill="none" stroke="var(--seal-paper)" stroke-width="1" />
  <circle cx="60" cy="60" r="38" fill="none" stroke="var(--seal-paper)" stroke-width="1" />
  <circle cx="60" cy="60" r="35.5" fill="none" stroke="var(--seal-paper)" stroke-width="0.5" stroke-dasharray="1.2 1.6" />
  <text fill="var(--seal-paper)" font-family="IBM Plex Mono, monospace" font-size="7" font-weight="600" letter-spacing="0.9">
    <textPath href="#seal-top" startOffset="50%" text-anchor="middle">DEPARTMENT OF HUMAN VERIFICATION</textPath>
  </text>
  <text fill="var(--seal-paper)" font-family="IBM Plex Mono, monospace" font-size="6.2" letter-spacing="1.2">
    <textPath href="#seal-bottom" startOffset="50%" text-anchor="middle">EST. MMXXVI</textPath>
  </text>
  <g fill="none" stroke="var(--seal-paper)" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 36,56 Q 60,36 84,56 Q 60,76 36,56 Z" stroke-width="2" />
    <circle cx="60" cy="56" r="8.5" stroke-width="1.6" />
    <path d="M 56,56.5 l 3,3 l 6,-7" stroke-width="2" />
    <path d="M 60,40 v -5 M 49,42.5 l -2.5,-4 M 71,42.5 l 2.5,-4 M 40,47.5 l -3.5,-3 M 80,47.5 l 3.5,-3" stroke-width="1.3" />
    <path d="M 58,88 Q 40,85 35,67 M 62,88 Q 80,85 85,67" stroke-width="1.1" />
  </g>
  <g fill="var(--seal-paper)">
    <ellipse cx="52.73" cy="84.27" rx="3.1" ry="1.35" transform="rotate(-198.0 52.73 84.27)" />
    <ellipse cx="51.15" cy="88.60" rx="3.1" ry="1.35" transform="rotate(-122.0 51.15 88.60)" />
    <ellipse cx="46.54" cy="80.99" rx="3.1" ry="1.35" transform="rotate(-181.4 46.54 80.99)" />
    <ellipse cx="43.80" cy="84.68" rx="3.1" ry="1.35" transform="rotate(-105.4 43.80 84.68)" />
    <ellipse cx="41.76" cy="76.15" rx="3.1" ry="1.35" transform="rotate(-164.1 41.76 76.15)" />
    <ellipse cx="38.05" cy="78.86" rx="3.1" ry="1.35" transform="rotate(-88.1 38.05 78.86)" />
    <ellipse cx="38.28" cy="69.63" rx="3.1" ry="1.35" transform="rotate(-148.9 38.28 69.63)" />
    <ellipse cx="33.98" cy="71.27" rx="3.1" ry="1.35" transform="rotate(-72.9 33.98 71.27)" />
    <ellipse cx="34.33" cy="64.59" rx="3.1" ry="1.35" transform="rotate(-105.5 34.33 64.59)" />
    <ellipse cx="67.27" cy="84.27" rx="3.1" ry="1.35" transform="rotate(378.0 67.27 84.27)" />
    <ellipse cx="68.85" cy="88.60" rx="3.1" ry="1.35" transform="rotate(302.0 68.85 88.60)" />
    <ellipse cx="73.46" cy="80.99" rx="3.1" ry="1.35" transform="rotate(361.4 73.46 80.99)" />
    <ellipse cx="76.20" cy="84.68" rx="3.1" ry="1.35" transform="rotate(285.4 76.20 84.68)" />
    <ellipse cx="78.24" cy="76.15" rx="3.1" ry="1.35" transform="rotate(344.1 78.24 76.15)" />
    <ellipse cx="81.95" cy="78.86" rx="3.1" ry="1.35" transform="rotate(268.1 81.95 78.86)" />
    <ellipse cx="81.72" cy="69.63" rx="3.1" ry="1.35" transform="rotate(328.9 81.72 69.63)" />
    <ellipse cx="86.02" cy="71.27" rx="3.1" ry="1.35" transform="rotate(252.9 86.02 71.27)" />
    <ellipse cx="85.67" cy="64.59" rx="3.1" ry="1.35" transform="rotate(285.5 85.67 64.59)" />
  </g>
</svg>`;
