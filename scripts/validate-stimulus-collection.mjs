// Offline integrity checks for the authoring collection. This does not judge
// photographic quality, clear copyright or fetch remote images.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const COLLECTION = 'stimuli/';
const errors = [];
const fail = (at, message) => errors.push(`${at}: ${message}`);
const text = (v) => typeof v === 'string' && v.trim().length > 0;
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const hashPattern = /^[0-9a-f]{64}$/;
const utc = (v) => text(v) && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(v) && Number.isFinite(Date.parse(v));
const positive = (v) => Number.isInteger(v) && v > 0;
const ordered = (v) => Array.isArray(v) ? v.map(ordered) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, ordered(v[k])])) : v;
const same = (a, b) => JSON.stringify(ordered(a)) === JSON.stringify(ordered(b));

function pathInRepo(path, at) {
  if (!text(path) || path.includes('\\') || path.includes('\0') || path.startsWith('/') || path.split('/').some((p) => !p || p === '.' || p === '..')) {
    fail(at, 'expected a normalised repository-relative path');
    return null;
  }
  const full = resolve(ROOT, path);
  if (relative(ROOT, full).startsWith('..')) { fail(at, 'path escapes the repository'); return null; }
  let current = ROOT;
  for (const part of path.split('/')) {
    current = resolve(current, part);
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) { fail(at, 'symlinks are not collection image files'); return null; }
  }
  return full;
}

function readJson(path) {
  const full = pathInRepo(path, path);
  try { return JSON.parse(readFileSync(full, 'utf8')); }
  catch (e) { fail(path, `cannot read JSON: ${e.message}`); return {}; }
}

function strings(value, at, { nonempty = false, unique = true } = {}) {
  if (!Array.isArray(value) || (nonempty && !value.length) || !value.every(text)) { fail(at, 'expected an array of nonempty strings'); return []; }
  if (unique && new Set(value).size !== value.length) fail(at, 'duplicate values');
  return value;
}

function url(value, at, optional = false) {
  if (optional && value === null) return;
  try {
    const u = new URL(value);
    if (!['https:', 'http:'].includes(u.protocol) || !u.hostname || u.username || u.password) throw new Error();
  } catch { fail(at, 'expected a public HTTP(S) URL without embedded credentials'); }
}

function recordStamp(record, at, timestamp = 'timestamp') {
  if (!text(record?.actor) || !utc(record?.[timestamp])) fail(at, `actor and UTC ${timestamp} are required`);
}

function indexBy(records, key, at) {
  const map = new Map();
  if (!Array.isArray(records)) { fail(at, 'expected an array'); return map; }
  for (const r of records) {
    if (!text(r?.[key]) || map.has(r[key])) fail(at, `missing or duplicate ${key}: ${r?.[key]}`);
    else map.set(r[key], r);
  }
  return map;
}

// Parse container dimensions without adding an image-processing dependency.
// Standardised/final WebP files must be static and opaque; colour conversion is
// also recorded explicitly because a missing ICC profile cannot prove sRGB.
function imageInfo(b) {
  if (b.length >= 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    if (b.readUInt32LE(4) + 8 !== b.length) return null;
    const type = b.toString('ascii', 12, 16);
    if (type === 'VP8 ') return { format: 'webp', width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff, alpha: false, animated: false };
    if (type === 'VP8L' && b[20] === 0x2f) {
      const bits = b.readUInt32LE(21);
      return { format: 'webp', width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1, alpha: Boolean(bits & (1 << 28)), animated: false };
    }
    if (type === 'VP8X') return { format: 'webp', width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1, alpha: Boolean(b[20] & 0x10), animated: Boolean(b[20] & 2) };
  }
  if (b.length >= 26 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { format: 'png', width: b.readUInt32BE(16), height: b.readUInt32BE(20), alpha: [4, 6].includes(b[25]), animated: false };
  }
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
    let p = 2;
    while (p + 8 < b.length) {
      if (b[p++] !== 0xff) break;
      while (b[p] === 0xff) p++;
      const marker = b[p++];
      if (marker === 0xda || marker === 0xd9) break;
      if (marker === 1 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      const size = b.readUInt16BE(p);
      if (size < 2 || p + size > b.length) break;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { format: 'jpeg', width: b.readUInt16BE(p + 5), height: b.readUInt16BE(p + 3), alpha: false, animated: false };
      }
      p += size;
    }
  }
  return null;
}

const cat = readJson('stimuli/catalogue.json');
const vocab = readJson('stimuli/vocabulary.json');
const levels = ['raw', 'suitable', 'standardized', 'manipulated', 'final'];
if (cat.schema !== 'dhv-stimulus-collection-v1' || cat.schema_version !== 1 || vocab.schema_version !== 1) fail('collection', 'unsupported schema');
if (!same(vocab.levels, levels)) fail('vocabulary', 'the five level names/order must be preserved');
for (const field of ['themes', 'roles', 'semantic_classes', 'origins', 'content_origins', 'review_statuses', 'licence_statuses', 'modification_permissions', 'actions', 'set_statuses', 'operations']) strings(vocab[field], `vocabulary.${field}`, { nonempty: true });
const has = (field, value, at) => { if (!vocab[field]?.includes(value)) fail(at, `unknown ${field}: ${value}`); };
const assets = indexBy(cat.assets, 'asset_id', 'assets');
const versions = indexBy(cat.versions, 'version_id', 'versions');
const sets = indexBy(cat.sets, 'set_key', 'sets');
const prof = cat.standardisation_profiles?.['webp-512-256-v1'];
const profile = { large: [512, 512], small: [256, 256], format: 'webp', colour_mode: 'RGB', colour_space: 'sRGB', quality: 82, method: 6, resampling: 'Lanczos', publisher: 'tools/stimuli/build.py', content_changes: false, allow_upscale: false };
if (!same(prof, profile)) fail('standardisation_profiles', 'webp-512-256-v1 must match the implemented publisher');

// Every provider must be documented under "Evaluated sources" in SOURCES.md.
const sourcesText = existsSync(resolve(ROOT, 'stimuli/SOURCES.md')) ? readFileSync(resolve(ROOT, 'stimuli/SOURCES.md'), 'utf8') : '';
const evaluated = sourcesText.split(/^## /m).find((s) => s.startsWith('Evaluated sources')) ?? '';
const documentedProviders = new Set([...evaluated.matchAll(/^### (.+)$/gm)].map((m) => m[1].trim()));
if (!documentedProviders.size) fail('stimuli/SOURCES.md', 'missing "Evaluated sources" entries');
const sourceKeys = new Set();
for (const [id, a] of assets) {
  if (!idPattern.test(id) || !text(a.description)) fail(id, 'invalid source identity or description');
  has('origins', a.origin, id);
  recordStamp(a, id, 'created_at'); if (!utc(a.updated_at)) fail(id, 'missing updated_at');
  const s = a.source ?? {}, l = s.licence ?? {};
  for (const k of ['provider', 'creator']) if (!text(s[k])) fail(id, `source lacks ${k}`);
  for (const p of [s.provider, s.catalogue_record?.provider]) if (text(p) && !documentedProviders.has(p)) fail(id, `source provider "${p}" has no entry under Evaluated sources in stimuli/SOURCES.md`);
  if (!text(s.provider_id) && !(text(s.catalogue_record?.provider) && text(s.catalogue_record?.photo_id))) fail(id, 'source needs a native provider ID or a known catalogue identity');
  const key = text(s.provider_id) ? `${s.provider}:${s.provider_id}` : `${s.catalogue_record?.provider}:${s.catalogue_record?.photo_id}`;
  if (sourceKeys.has(key)) fail(id, 'duplicate source identity'); sourceKeys.add(key);
  url(s.publisher_url, `${id}.publisher_url`, true); url(s.direct_url, `${id}.direct_url`);
  const d = s.original_dimensions;
  if (!['reported', 'verified', 'unknown'].includes(d?.status) || (d?.status !== 'unknown' && (!positive(d?.width) || !positive(d?.height))) || !text(d?.basis)) fail(id, 'missing source dimensions/evidence basis');
  if (!text(l.name) || !text(l.attribution)) fail(id, 'licence name/attribution are required');
  url(l.url, `${id}.licence.url`); has('licence_statuses', l.evidence_status, id); has('modification_permissions', l.modification_permission, id);
  strings(l.conditions, `${id}.licence.conditions`, { nonempty: true });
  for (const u of strings(l.evidence_urls, `${id}.licence.evidence_urls`, { nonempty: true })) url(u, id);
  if (l.evidence_status === 'verified' && (!text(l.verified_by) || !utc(l.verified_at) || !text(s.publisher_url))) fail(id, 'verified rights require source page, reviewer and time');
  if (l.evidence_status === 'verified' && (!Array.isArray(l.evidence_urls) || !l.evidence_urls.includes(s.publisher_url) || !l.evidence_urls.includes(l.url) || !text(l.verification?.matching_basis) || !text(l.verification?.publisher_evidence) || !text(l.verification?.intended_use))) fail(id, 'verified rights require individual publisher/licence evidence, matching basis and intended use');
  if (l.evidence_status === 'inherited' && a.origin !== 'legacy-generated') fail(id, 'inherited rights are limited to existing generated imports');
}

const referencedFiles = new Set();
for (const [id, v] of versions) {
  const a = assets.get(v.asset_id);
  if (!idPattern.test(id) || !a) { fail(id, 'invalid ID or unknown asset'); continue; }
  if (!text(v.description) || !idPattern.test(v.object_type ?? '')) fail(id, 'visible-content description and object_type required');
  for (const tag of strings(v.keywords, `${id}.keywords`, { nonempty: true })) if (!idPattern.test(tag)) fail(id, `keyword is not kebab-case: ${tag}`);
  if (!Array.isArray(v.assessments) || !v.assessments.length) fail(id, 'version-specific theme assessment required');
  const themes = new Set();
  for (const t of v.assessments ?? []) {
    has('themes', t.theme, id); has('roles', t.role, id); has('semantic_classes', t.semantic_class, id);
    if (themes.has(t.theme)) fail(id, 'duplicate theme assessment'); themes.add(t.theme);
    if (!['provisional', 'reviewed', 'inherited'].includes(t.role_status) || !text(t.reason) || !text(t.scope)) fail(id, 'assessment needs role status, reason and scope');
    if (t.rank !== null && !positive(t.rank)) fail(id, 'rank must be positive or null');
    if (t.proposed_crop) {
      const c = t.proposed_crop;
      if (![c.reference_width, c.reference_height, c.side].every(positive) || ![c.x, c.y].every((n) => Number.isInteger(n) && n >= 0) || c.x + c.side > c.reference_width || c.y + c.side > c.reference_height || !text(c.coordinate_space)) fail(id, 'invalid proposed crop/reference dimensions');
    }
  }
  recordStamp(v, id, 'created_at'); if (!utc(v.updated_at)) fail(id, 'missing updated_at');
  for (const level of strings(v.levels, `${id}.levels`, { nonempty: !v.withdrawn })) has('levels', level, id);
  if (v.levels.length > 1 && !same(v.levels, ['raw', 'suitable'])) fail(id, 'only unchanged raw/suitable versions share levels');
  const parents = strings(v.parent_version_ids, `${id}.parents`);
  for (const p of parents) if (!versions.has(p) || p === id) fail(id, `unknown/self parent ${p}`);
  if (!Array.isArray(v.files)) { fail(id, 'files must be an array'); continue; }
  if (!v.files.length && !v.withdrawn) url(v.external_url, `${id}.external_url`);
  for (const key of ['colour', 'viewpoint', 'facing_direction', 'environment', 'support', 'people', 'additional_category_members', 'assessment_scope']) if (!text(v.characteristics?.[key])) fail(id, `missing characteristic ${key}`);
  for (const key of ['visual', 'rights']) {
    const r = v.reviews?.[key]; has('review_statuses', r?.status, id); recordStamp(r, `${id}.${key}`);
    if (!text(r?.reason)) fail(id, `missing ${key} review reason`);
    if (r?.status === 'inherited' && v.operation?.type !== 'legacy-import') fail(id, 'inherited review only allowed on legacy imports');
  }
  if (v.levels.includes('suitable') && (!v.levels.includes('raw') || v.reviews?.visual?.status !== 'approved')) fail(id, 'suitable requires retained raw membership and approved visual review');
  has('operations', v.operation?.type, id); recordStamp(v.operation, `${id}.operation`);
  if (!Array.isArray(v.unresolved_issues) || !v.unresolved_issues.every(text)) fail(id, 'unresolved_issues must be an array of strings');
  if (v.observed_preview && (!hashPattern.test(v.observed_preview.sha256) || !positive(v.observed_preview.width) || !positive(v.observed_preview.height))) fail(id, 'invalid observed preview');
  const fileKinds = new Set();
  for (const f of v.files) {
    if (!['large', 'small', 'master'].includes(f.purpose) || fileKinds.has(f.purpose)) fail(id, 'invalid/duplicate file purpose'); fileKinds.add(f.purpose);
    const full = pathInRepo(f.path, id);
    if (!full) continue;
    if (!f.path.startsWith(COLLECTION) || !v.levels.some((l) => f.path.startsWith(`stimuli/${l}/`))) fail(id, 'image must be stored in its level folder');
    const theme = f.path.split('/')[2];
    if (!v.assessments.some((t) => t.theme === theme)) fail(id, 'file theme lacks a version assessment');
    if (referencedFiles.has(f.path)) fail(id, 'file path shared by different versions'); referencedFiles.add(f.path);
    if (!existsSync(full) || !lstatSync(full).isFile()) { fail(id, `missing local file ${f.path}`); continue; }
    const bytes = readFileSync(full), info = imageInfo(bytes);
    if (!hashPattern.test(f.sha256) || createHash('sha256').update(bytes).digest('hex') !== f.sha256 || f.bytes !== bytes.length) fail(id, `hash/byte count mismatch: ${f.path}`);
    if (!info || info.width !== f.width || info.height !== f.height || info.format !== f.format) fail(id, `format/dimension mismatch: ${f.path}`);
    if (!text(f.colour_mode) || !text(f.colour_space)) fail(id, 'file colour mode/space required');
    if (v.levels.some((l) => ['standardized', 'final'].includes(l))) {
      const size = f.purpose === 'large' ? 512 : f.purpose === 'small' ? 256 : 0;
      if (!size || info?.format !== 'webp' || info.width !== size || info.height !== size || info.alpha || info.animated || f.colour_mode !== 'RGB' || f.colour_space !== 'sRGB') fail(id, 'standardised/final files must be opaque static RGB 512/256 WebP pairs');
    }
  }
  if (v.levels.some((l) => ['standardized', 'final'].includes(l)) && (!fileKinds.has('large') || !fileKinds.has('small') || v.files.length !== 2)) fail(id, 'large/small local files required');
  if (v.levels.includes('manipulated') && !fileKinds.has('master')) fail(id, 'edited master must be stored locally');
}

// Check ancestry before following it for rights gates.
const visiting = new Set(), visited = new Set();
function visit(id) {
  if (visiting.has(id)) { fail(id, 'lineage cycle'); return; }
  if (visited.has(id)) return;
  visiting.add(id);
  for (const p of versions.get(id)?.parent_version_ids ?? []) if (versions.has(p)) visit(p);
  visiting.delete(id); visited.add(id);
}
for (const id of versions.keys()) visit(id);
// The pixels' origin follows from lineage: generated roots make an image
// ai-generated; otherwise any ai-edit makes a photograph ai-edited.
function contentOrigin(id, seen = new Set()) {
  if (seen.has(id)) return null; seen.add(id);
  const v = versions.get(id), parents = v?.parent_version_ids ?? [];
  if (!v) return null;
  if (!parents.length) return ['generated', 'legacy-generated'].includes(assets.get(v.asset_id)?.origin) ? 'ai-generated' : 'photograph';
  const inherited = parents.map((p) => contentOrigin(p, new Set(seen)));
  if (inherited.includes('ai-generated')) return 'ai-generated';
  return v.operation?.type === 'ai-edit' || inherited.includes('ai-edited-photograph') ? 'ai-edited-photograph' : 'photograph';
}
for (const [id, v] of versions) {
  has('content_origins', v.content_origin, id);
  const expected = contentOrigin(id);
  if (expected && v.content_origin !== expected) fail(id, `content_origin must be ${expected} for this lineage`);
}
function rightsCleared(id, seen = new Set()) {
  if (seen.has(id)) return false; seen.add(id);
  const v = versions.get(id), a = assets.get(v?.asset_id), l = a?.source?.licence;
  if (!v || !a || l?.modification_permission !== 'allowed' || !(l.evidence_status === 'verified' || (a.origin === 'legacy-generated' && l.evidence_status === 'inherited'))) return false;
  return (v.parent_version_ids ?? []).every((p) => rightsCleared(p, new Set(seen)));
}
for (const [id, v] of versions) {
  const a = assets.get(v.asset_id); if (!a) continue;
  const op = v.operation ?? {}, parents = v.parent_version_ids ?? [];
  const processing = v.levels?.some((l) => ['standardized', 'manipulated', 'final'].includes(l));
  if (op.type === 'legacy-import') {
    if (a.origin !== 'legacy-generated' || !same(v.levels, ['final']) || parents.length || op.source_commit !== '5177c6aaa464adbed203ac7b5af67c440e29d7a9' || !op.original_tile?.tile_id?.startsWith('G01-T') || v.files.find((f) => f.purpose === 'large')?.sha256 !== op.original_tile.sha256) fail(id, 'invalid legacy import exemption');
    if (!same(op.original_tile?.provenance, a.source.generation_provenance)) fail(id, 'legacy generation provenance changed');
    continue;
  }
  if (v.levels.includes('suitable') && (!rightsCleared(id) || v.reviews?.rights?.status !== 'approved')) fail(id, 'suitable selection requires verified rights and derivative permission during the search');
  if ((processing || v.files.length) && (!rightsCleared(id) || v.reviews?.rights?.status !== 'approved')) fail(id, 'local/processed images require verified rights and derivative permission for all contributing sources');
  // A processed version rejected before final use keeps its record, lineage and
  // removed hashes, so history stays resolvable, but no levels or bytes.
  if (v.withdrawn) {
    const w = v.withdrawn;
    if (v.levels.length || v.files.length || !['standardisation', 'ai-edit'].includes(op.type) || !parents.length) fail(id, 'only unused standardised/edited versions can be withdrawn, without levels or files');
    recordStamp(w, `${id}.withdrawn`);
    if (!text(w.reason) || !Array.isArray(w.files) || !w.files.length || !w.files.every((f) => text(f?.path) && hashPattern.test(f?.sha256 ?? ''))) fail(id, 'withdrawal needs a reason and the removed file records');
    for (const f of w.files ?? []) if (text(f?.path) && existsSync(resolve(ROOT, f.path))) fail(id, `withdrawn file still present: ${f.path}`);
    continue;
  }
  if (!processing) { if (op.type !== 'discovery') fail(id, 'raw/suitable versions use discovery operation'); continue; }
  if (!parents.length || v.reviews?.visual?.status !== 'approved') fail(id, 'processed version requires parents and visual approval');
  if (parents.some((p) => versions.get(p)?.withdrawn)) fail(id, 'withdrawn versions cannot be parents');
  for (const p of parents) if (versions.get(p)?.reviews?.visual?.status !== 'approved' || versions.get(p)?.reviews?.rights?.status !== 'approved') fail(id, 'parents require approved visual and rights reviews');
  if (v.levels.includes('standardized')) {
    if (op.type !== 'standardisation' || op.profile !== 'webp-512-256-v1' || op.content_changes !== false || op.allow_upscale !== false) fail(id, 'standardisation profile and no-content-change/no-upscale declarations required');
    for (const field of ['orientation', 'colour_conversion', 'resampling', 'encoder']) if (!text(op[field])) fail(id, `standardisation lacks ${field}`);
    const d = op.input_dimensions, c = op.crop;
    if (!positive(d?.width) || !positive(d?.height) || !positive(c?.side) || ![c?.x, c?.y].every((n) => Number.isInteger(n) && n >= 0) || c.x + c.side > d.width || c.y + c.side > d.height || c.side < 512) fail(id, 'record a valid input and square crop without upscaling');
    if (!parents.every((p) => versions.get(p)?.levels?.some((l) => ['suitable', 'manipulated'].includes(l)))) fail(id, 'standardise a suitable original or an edited master');
  } else if (v.levels.includes('manipulated')) {
    if (op.type !== 'ai-edit') fail(id, 'manipulated versions need ai-edit provenance');
    for (const field of ['intended_change', 'instructions', 'tool', 'provider', 'model', 'model_revision', 'seed']) {
      if (field === 'seed' && Number.isInteger(op[field])) continue;
      if (field !== 'seed' && text(op[field])) continue;
      if (op[field] !== null || !text(op.unavailable_fields?.[field])) fail(id, `editing field ${field} needs a value or explicit null and reason`);
    }
    if (!parents.every((p) => versions.get(p)?.levels?.some((l) => ['suitable', 'standardized'].includes(l)))) fail(id, 'edit only suitable or standardised parents');
  } else {
    const p = versions.get(parents[0]);
    if (op.type !== 'final-copy' || parents.length !== 1 || !p?.levels?.includes('standardized')) fail(id, 'new final images must copy an approved standardised version');
    for (const f of v.files) if (!p?.files?.some((g) => g.purpose === f.purpose && g.sha256 === f.sha256)) fail(id, 'final pixels differ from the standardised parent');
  }
}

const finalVersions = new Set();
for (const [key, ref] of sets) {
  if (!positive(ref.version) || key !== `${ref.set_id}@${ref.version}` || !/^[A-Za-z0-9-]+$/.test(ref.set_id ?? '')) fail(key, 'invalid set identity/version');
  has('themes', ref.theme, key);
  const prefix = `stimuli/final/${ref.theme}/${ref.set_id}/${ref.version}/`;
  if (ref.manifest !== prefix + 'manifest.json') fail(key, 'manifest must be inside the versioned final set');
  const m = readJson(ref.manifest);
  if (m.schema !== 'dhv-stimulus-final-set-v1' || m.schema_version !== 1 || !same([m.set_key, m.set_id, m.version, m.theme], [key, ref.set_id, ref.version, ref.theme])) fail(key, 'manifest identity/schema mismatch');
  has('set_statuses', m.status, key);
  if (!text(m.instruction) || !['multiple', 'single'].includes(m.mode) || !['unambiguous', 'entertainment', 'category_judgement'].includes(m.research_class) || !positive(m.game?.version) || !text(m.game?.stimulus_id) || !hashPattern.test(m.game?.grid_hash ?? '')) fail(key, 'missing game identity/instruction/mode');
  if (!Array.isArray(m.tiles) || m.tiles.length !== 9 || new Set(m.tiles.map((t) => t.tile_id)).size !== 9 || new Set(m.tiles.map((t) => t.version_id)).size !== 9) fail(key, 'final set needs nine distinct tiles and versions');
  const targets = [], borderline = [], hashes = new Set();
  for (const tile of m.tiles ?? []) {
    has('roles', tile.role, key); if (tile.role === 'unassigned') fail(key, 'final role cannot be unassigned');
    if (tile.role === 'target') targets.push(tile.tile_id);
    if (tile.role === 'borderline') borderline.push(tile.tile_id);
    const v = versions.get(tile.version_id), a = assets.get(v?.asset_id);
    if (!v?.levels?.includes('final') || !v.assessments.some((t) => t.theme === ref.theme && t.role === tile.role)) { fail(key, `missing final version/theme role ${tile.version_id}`); continue; }
    const assessment = v.assessments.find((t) => t.theme === ref.theme);
    if (m.status !== 'legacy-import' && (assessment.role_status !== 'reviewed' || !({ target: ['member-normal', 'member-bizarre'], distractor: ['non-member'], borderline: ['member-debatable'] })[tile.role]?.includes(assessment.semantic_class))) fail(key, 'new final roles require a reviewed, consistent category judgement');
    finalVersions.add(v.version_id);
    if (!v.files.every((f) => f.path.startsWith(prefix))) fail(key, 'selected image bytes must be stored within the final set');
    const hash = v.files.find((f) => f.purpose === 'large')?.sha256;
    if (hashes.has(hash)) fail(key, 'duplicate image bytes within a set'); hashes.add(hash);
    if (m.status === 'legacy-import') {
      const old = m.legacy_snapshot?.tiles?.find((t) => t.tile_id === tile.tile_id);
      if (!same(v.operation.original_tile, old)) fail(key, 'legacy tile/provenance differs from imported catalogue snapshot');
    } else if (v.operation.type === 'legacy-import') fail(key, 'new sets require freshly reviewed/standardised versions');
  }
  const answer = strings(m.answer_key, `${key}.answer_key`, { nonempty: true });
  if (!same([...answer].sort(), targets.sort())) fail(key, 'answer key must contain exactly the clear targets');
  if (!same([...strings(m.borderline_tile_ids, `${key}.borderline_tile_ids`)].sort(), borderline.sort())) fail(key, 'borderline list must match roles');
  if (!m.tiles?.some((t) => t.role === 'distractor') || (m.mode === 'single' && answer.length !== 1)) fail(key, 'set requires clear non-members and a valid answer count');
  if ((borderline.length > 0) !== (m.research_class === 'category_judgement') || (borderline.length && m.mode !== 'multiple')) fail(key, 'borderline choices require category_judgement/multiple mode');
  recordStamp(m.selection_review, key);
  if (!text(m.selection_review?.reason)) fail(key, 'set review reason required');
  if (m.status === 'legacy-import') {
    const old = m.legacy_snapshot;
    if (key !== 'G01@1' || m.game.source_commit !== '5177c6aaa464adbed203ac7b5af67c440e29d7a9' || old?.hash !== '7f33800a4a0e82a8dbff37f29dd56f0aca37c9ff751fcc5c614948e439f136f6' || !same([m.instruction, m.mode, m.research_class, m.answer_key], [old?.instruction, old?.mode, old?.research_class, old?.answer_key]) || m.selection_review?.status !== 'inherited') fail(key, 'only the pinned original G01 set may use inherited review');
    const parts = [m.instruction, m.mode, m.answer_key, (old?.tiles ?? []).map((t) => t.sha256)];
    if (createHash('sha256').update(JSON.stringify(parts)).digest('hex') !== old?.hash) fail(key, 'legacy grid hash mismatch');
  } else if (m.selection_review?.status !== 'approved') fail(key, 'new final sets require approved selection review');
}
for (const [id, v] of versions) if (v.levels?.includes('final') && !finalVersions.has(id)) fail(id, 'final version is not selected by a set');

// Stage manifests must agree exactly with canonical membership, including empty
// processed stages. New themes are added to vocabulary and get all five levels.
function walk(path) {
  if (!existsSync(resolve(ROOT, path))) return [];
  return readdirSync(resolve(ROOT, path), { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(`${path}/${e.name}`) : [`${path}/${e.name}`]);
}
const usedThemes = new Set([...versions.values()].flatMap((v) => (v.assessments ?? []).map((t) => t.theme)));
for (const theme of usedThemes) for (const level of levels) {
  const file = `stimuli/${level}/${theme}/index.json`, m = readJson(file);
  if (m.schema !== 'dhv-stimulus-stage-v1' || m.schema_version !== 1 || m.level !== level || m.theme !== theme) fail(file, 'stage identity/schema mismatch');
  const expected = level === 'final' ? [...sets.values()].filter((s) => s.theme === theme).map((s) => s.set_key) : [...versions.values()].filter((v) => v.levels?.includes(level) && v.assessments?.some((a) => a.theme === theme)).map((v) => v.version_id);
  const actual = strings(level === 'final' ? m.set_keys : m.version_ids, file);
  if (!same(actual.toSorted(), expected.toSorted())) fail(file, 'stage selection differs from canonical registry');
}
for (const file of walk('stimuli')) {
  if (file.startsWith('stimuli/.cache/')) continue;
  if (/\.(?:webp|png|jpe?g|avif|gif)$/i.test(file) && !referencedFiles.has(file)) fail(file, 'unregistered image bytes');
  if (/^stimuli\/(raw|suitable|standardized|manipulated|final)\//.test(file)) {
    const [_, level, theme] = file.split('/');
    if (!vocab.themes?.includes(theme) || !usedThemes.has(theme)) fail(file, 'unregistered theme directory');
  }
}

const historyText = readFileSync(resolve(ROOT, 'stimuli/history.jsonl'), 'utf8');
const events = [], eventIds = new Set();
for (const [i, line] of historyText.trimEnd().split('\n').entries()) {
  let e;
  try { e = JSON.parse(line); } catch { fail(`history:${i + 1}`, 'invalid JSON Lines record'); continue; }
  if (!text(e.event_id) || eventIds.has(e.event_id)) fail(`history:${i + 1}`, 'event ID missing/duplicated'); eventIds.add(e.event_id);
  recordStamp(e, e.event_id); has('actions', e.action, e.event_id);
  if (!text(e.reason) || !Object.hasOwn(e, 'from') || !Object.hasOwn(e, 'to')) fail(e.event_id, 'reason/from/to required');
  for (const [field, map] of [['asset_ids', assets], ['version_ids', versions], ['set_ids', sets], ['parent_version_ids', versions], ['output_version_ids', versions]]) for (const id of strings(e[field], `${e.event_id}.${field}`)) if (!map.has(id)) fail(e.event_id, `unknown ${field}: ${id}`);
  if (events.length && e.timestamp < events.at(-1).timestamp) fail(e.event_id, 'history timestamps are out of order');
  events.push(e);
}
for (const [id, v] of versions) {
  if (v.withdrawn && !events.some((e) => e.version_ids?.includes(id) && e.action === 'withdrawn' && e.to === 'withdrawn')) fail(id, 'missing withdrawal history event');
  for (const level of v.levels ?? []) if (!events.some((e) => e.version_ids?.includes(id) && e.to === level && ({ raw: ['discovered'], suitable: ['selected'], standardized: ['standardized'], manipulated: ['manipulated'], final: ['final_selected', 'legacy_imported'] })[level]?.includes(e.action))) fail(id, `missing ${level} history event`);
}
for (const key of sets.keys()) if (!events.some((e) => e.set_ids?.includes(key) && ['final_selected', 'legacy_set_imported'].includes(e.action))) fail(key, 'missing set history event');

// When Git history is available, reject deleted source/version records, edited
// version bytes and rewritten log lines. Shallow archives may lack HEAD^.
function previous(ref, path) {
  try { return execFileSync('git', ['show', `${ref}:${path}`], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); }
  catch { return null; }
}
for (const ref of ['HEAD', 'HEAD^']) {
  const oldHistory = previous(ref, 'stimuli/history.jsonl');
  if (oldHistory && !historyText.startsWith(oldHistory)) fail('history', `previous log lines from ${ref} were changed or removed`);
  const oldText = previous(ref, 'stimuli/catalogue.json'); if (!oldText) continue;
  const old = JSON.parse(oldText);
  for (const a of old.assets ?? []) if (!assets.has(a.asset_id)) fail(a.asset_id, 'source record was deleted');
  for (const v of old.versions ?? []) {
    const current = versions.get(v.version_id);
    const files = current?.withdrawn && v.files.length ? current.withdrawn.files : current?.files;
    if (!current || !same([current.asset_id, current.parent_version_ids, files], [v.asset_id, v.parent_version_ids, v.files])) fail(v.version_id, 'version identity, parents or files changed; create a new version');
  }
  for (const s of old.sets ?? []) {
    if (!same(sets.get(s.set_key), s)) { fail(s.set_key, 'existing set reference changed/removed'); continue; }
    const before = previous(ref, s.manifest), after = readJson(s.manifest);
    if (before && !same(JSON.parse(before), after)) fail(s.set_key, 'final set manifest changed; create a new set version');
  }
}

if (errors.length) {
  console.error(`Stimulus collection validation failed:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`Stimulus collection valid: ${assets.size} assets, ${versions.size} versions, ${sets.size} final set(s), ${events.length} history events. Remote sources were not fetched.`);
