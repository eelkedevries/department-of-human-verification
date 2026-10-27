// Writes stimuli/GALLERY.md, a browsable view of the authoring collection that
// GitHub renders. The catalogue stays the record; --check fails when stale.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = 'stimuli/GALLERY.md';
const COLUMNS = 3;
const WIDTH = 240;

const readJson = (path) => JSON.parse(readFileSync(resolve(ROOT, path), 'utf8'));
const stage = (level, theme) => {
  const path = `stimuli/${level}/${theme}/index.json`;
  return existsSync(resolve(ROOT, path)) ? readJson(path) : null;
};
const esc = (v) => String(v ?? '').replace(/\s+/g, ' ').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const link = (href, label) => (href ? `<a href="${esc(href)}">${esc(label)}</a>` : esc(label));
// Image paths in the catalogue are repository-relative; the gallery sits in stimuli/.
const local = (path) => posix.relative('stimuli', path);

const catalogue = readJson('stimuli/catalogue.json');
const vocabulary = readJson('stimuli/vocabulary.json');
// The latest decision moving a version out of suitable explains why it is a reserve.
const leftSuitable = new Map();
for (const line of readFileSync(resolve(ROOT, 'stimuli/history.jsonl'), 'utf8').split('\n').filter(Boolean)) {
  const e = JSON.parse(line);
  if (e.from === 'suitable' && e.to === 'raw') for (const id of e.version_ids) leftSuitable.set(id, e.reason);
}
const versions = new Map(catalogue.versions.map((v) => [v.version_id, v]));
const assets = new Map(catalogue.assets.map((a) => [a.asset_id, a]));

function image(v) {
  const file = (purpose) => v.files?.find((f) => f.purpose === purpose);
  const shown = file('small') ?? file('large') ?? file('master');
  if (shown) return { src: local(shown.path), href: local((file('large') ?? shown).path) };
  const source = assets.get(v.asset_id)?.source;
  return v.external_url ? { src: v.external_url, href: source?.publisher_url ?? v.external_url } : null;
}

function caption(v, theme, heading) {
  const a = v.assessments?.find((x) => x.theme === theme);
  const licence = assets.get(v.asset_id)?.source?.licence;
  const lines = [
    `${heading ? `<b>${esc(heading)}</b> ` : ''}${esc(v.description)}`,
    `${esc(v.object_type)} · ${esc(v.content_origin ?? 'origin unknown')} · ${esc(a?.role ?? 'no role')}${a?.semantic_class ? ` (${esc(a.semantic_class)})` : ''}${a?.grade ? ` · ${esc(a.grade)}` : ''}`,
  ];
  const credit = assets.get(v.asset_id)?.source?.creator;
  if (credit || licence) lines.push([credit && esc(credit), licence && link(licence.url, licence.name)].filter(Boolean).join(' · '));
  lines.push(`Visual: ${esc(v.reviews?.visual?.status)} · rights: ${esc(v.reviews?.rights?.status)}`);
  const issues = v.unresolved_issues ?? [];
  if (leftSuitable.has(v.version_id) && v.reviews?.visual?.status === 'approved') lines.push(`<details><summary>Why a reserve</summary>${esc(leftSuitable.get(v.version_id))}</details>`);
  if (issues.length) lines.push(`<details><summary>Unresolved (${issues.length})</summary>${issues.map(esc).join('<br><br>')}</details>`);
  return `<sub>${lines.join('<br>')}</sub>`;
}

function grid(cards) {
  if (!cards.length) return 'None yet.\n';
  const cells = cards.map(({ v, theme, heading }) => {
    const img = image(v);
    const picture = img ? `<a href="${esc(img.href)}"><img src="${esc(img.src)}" width="${WIDTH}" alt="${esc(v.description)}"></a>` : '<i>No image recorded</i>';
    return `<td width="${Math.floor(100 / COLUMNS)}%" valign="top">${picture}<br>${caption(v, theme, heading)}</td>`;
  });
  const rows = [];
  for (let i = 0; i < cells.length; i += COLUMNS) rows.push(`<tr>\n${cells.slice(i, i + COLUMNS).join('\n')}\n</tr>`);
  return `<table>\n${rows.join('\n')}\n</table>\n`;
}

const rank = (v, theme) => v?.assessments?.find((a) => a.theme === theme)?.rank ?? null;
const byRank = (theme) => (a, b) => (rank(versions.get(a), theme) ?? Number.MAX_SAFE_INTEGER) - (rank(versions.get(b), theme) ?? Number.MAX_SAFE_INTEGER);
const cardsFor = (ids, theme, label) => ids.map((id) => versions.get(id)).filter(Boolean).map((v) => ({ v, theme, heading: label(v) }));

const out = [
  '# Stimulus gallery',
  '',
  '*Generated from [catalogue.json](catalogue.json) and the stage manifests by `npm run gallery:collection`; do not edit by hand. The catalogue remains the record.*',
  '',
  'Linked photographs are shown from their source sites and keep their recorded licences; they may stop displaying if a source link expires. Click an image for its publisher page or full-size file. See [README.md](README.md) for the levels.',
  '',
];

for (const theme of vocabulary.themes) {
  const raw = stage('raw', theme);
  const suitable = stage('suitable', theme);
  const standardized = stage('standardized', theme);
  const manipulated = stage('manipulated', theme);
  const final = stage('final', theme);
  if (![raw, suitable, standardized, manipulated, final].some(Boolean)) continue;

  const suitableIds = suitable?.version_ids ?? [];
  const notSuitable = (raw?.version_ids ?? []).filter((id) => !suitableIds.includes(id));
  const visual = (id) => versions.get(id)?.reviews?.visual?.status;
  const reserves = notSuitable.filter((id) => visual(id) === 'approved');
  const pending = notSuitable.filter((id) => !['approved', 'rejected'].includes(visual(id)));
  const rejected = notSuitable.filter((id) => visual(id) === 'rejected');
  const ranked = [...suitableIds].sort(byRank(theme));
  const sets = (final?.set_keys ?? []).map((key) => catalogue.sets.find((s) => s.set_key === key)).filter(Boolean);

  out.push(`## ${theme}`, '');
  out.push(`Suitable: ${ranked.length} · reserves: ${reserves.length} · awaiting review: ${pending.length} · rejected: ${rejected.length} · standardised: ${standardized?.version_ids?.length ?? 0} · manipulated: ${manipulated?.version_ids?.length ?? 0} · final sets: ${sets.length}`, '');

  out.push('### Suitable', '', 'Rights-verified and visually reviewed, by rank.', '');
  out.push(grid(cardsFor(ranked, theme, (v) => `#${rank(v, theme) ?? '–'}`)));

  out.push('### Reserves', '', 'Approved in the visual and rights reviews but not in the current selection, usually for set-level variety. They can replace a suitable photograph without a new image review; recheck the set-level variety targets when swapping.', '');
  out.push(grid(cardsFor(reserves, theme, () => 'Reserve')));
  if (pending.length) {
    out.push('### Awaiting review', '', 'Registered candidates without a visual decision yet.', '');
    out.push(grid(cardsFor(pending, theme, (v) => `Original #${rank(v, theme) ?? '–'}`)));
  }
  if (rejected.length) {
    // Rejected sources stay registered to prevent re-adding them; list them without images.
    const items = rejected.map((id) => versions.get(id)).map((v) => `<li>${link(assets.get(v.asset_id)?.source?.publisher_url ?? v.external_url, v.description)}: ${esc(v.reviews.visual.reason)}</li>`);
    out.push(`<details><summary>Rejected photographs (${rejected.length}), not shown</summary><ul>${items.join('')}</ul></details>`, '');
  }

  out.push('### Standardised', '');
  out.push(grid(cardsFor([...(standardized?.version_ids ?? [])].sort(byRank(theme)), theme, (v) => `#${rank(v, theme) ?? '–'}`)));

  out.push('### Manipulated', '');
  out.push(grid(cardsFor(manipulated?.version_ids ?? [], theme, () => '')));

  out.push('### Final sets', '');
  if (!sets.length) out.push('None yet.\n');
  for (const set of sets) {
    const manifest = readJson(set.manifest);
    const answers = new Set(manifest.answer_key ?? []);
    out.push(`#### ${set.set_key} — ${manifest.status}`, '');
    out.push(`“${manifest.instruction}” ([manifest](${local(set.manifest)}))`, '');
    out.push(grid(manifest.tiles.map((t) => ({
      v: versions.get(t.version_id),
      theme,
      heading: `${t.tile_id}${answers.has(t.tile_id) ? ' ✓' : ''}`,
    })).filter((c) => c.v)));
  }
}

const markdown = `${out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
const target = resolve(ROOT, OUT);

if (process.argv.includes('--check')) {
  if (!existsSync(target) || readFileSync(target, 'utf8') !== markdown) {
    console.error(`${OUT} is out of date. Run \`npm run gallery:collection\` and commit the result.`);
    process.exit(1);
  }
  console.log(`${OUT} is up to date.`);
} else {
  writeFileSync(target, markdown);
  console.log(`Wrote ${OUT}.`);
}
