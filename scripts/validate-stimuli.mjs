// Validates the stimulus catalogue against the published files: every grid has
// nine tiles and a defensible answer key, every image exists with the recorded
// hash and dimensions, provenance and licences are recorded, and nothing in a
// file name or alternative text gives the answer away.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';

const CATALOGUE = 'src/stimuli/catalogue.json';
const DIR = 'public/stimuli';
const LICENCES = new Set(['Apache-2.0']);
const FAMILIES = ['recognition', 'semantic', 'odd_one_out', 'functional', 'absurd'];
const OPAQUE = /^[0-9a-f]{16}(-s)?\.webp$/;
const REVEALING = /\b(target|distractor|correct|incorrect|answer|lure)\b/i;

const errors = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);

function webpSize(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X') return { width: buffer.readUIntLE(24, 3) + 1, height: buffer.readUIntLE(27, 3) + 1 };
  return null;
}

const catalogue = JSON.parse(readFileSync(CATALOGUE, 'utf8'));
const files = new Set(readdirSync(DIR).filter((f) => f.endsWith('.webp')));
const referenced = new Set();
const tileIds = new Set();
const hashes = new Set();

if (catalogue.schema_version !== 1) fail('catalogue', 'unexpected schema_version');
if (JSON.stringify(catalogue.families) !== JSON.stringify(FAMILIES)) fail('catalogue', 'families differ from the five V1 families');

// Families without a grid of their own borrow from the pool (src/app/session.ts),
// so one grid is enough to play; the summary below reports the gaps.
if (catalogue.stimuli.length < 1) fail('catalogue', 'no playable grid');
const missing = FAMILIES.filter((f) => !catalogue.stimuli.some((s) => s.family === f));

for (const s of catalogue.stimuli) {
  const where = s.stimulus_id;
  for (const field of ['instruction', 'hint', 'explanation']) if (!s[field]?.trim()) fail(where, `missing ${field}`);
  if (!FAMILIES.includes(s.family)) fail(where, `unknown family ${s.family}`);
  if (!['single', 'multiple'].includes(s.mode)) fail(where, `unknown mode ${s.mode}`);
  if (!['unambiguous', 'entertainment', 'category_judgement'].includes(s.research_class)) fail(where, `unknown research class ${s.research_class}`);
  if (s.research_class === 'entertainment' && !s.operational_definition) fail(where, 'entertainment grids need an operational definition');
  if (!Number.isInteger(s.version) || s.version < 1) fail(where, 'version must be a positive integer');
  const lines = (key) => Array.isArray(s.feedback?.[key]) && s.feedback[key].length > 0 && s.feedback[key].every((l) => typeof l === 'string' && l.trim());
  if (!lines('correct') || !lines('incorrect')) fail(where, 'missing feedback lines');
  if (s.mode === 'multiple' && !lines('partial')) fail(where, 'multiple-selection grids need partial feedback lines');
  if (s.tiles.length !== 9) fail(where, `has ${s.tiles.length} tiles, not 9`);

  const ids = new Set(s.tiles.map((t) => t.tile_id));
  const key = new Set(s.answer_key);
  if (key.size !== s.answer_key.length) fail(where, 'duplicate tile in the answer key');
  for (const id of key) if (!ids.has(id)) fail(where, `answer key names ${id}, which is not in the grid`);
  const borderline = new Set(s.borderline_tile_ids ?? []);
  if (borderline.size !== (s.borderline_tile_ids ?? []).length) fail(where, 'duplicate borderline tile');
  for (const id of borderline) if (!ids.has(id) || key.has(id)) fail(where, `invalid borderline tile ${id}`);
  if (s.research_class === 'category_judgement' && (s.mode !== 'multiple' || borderline.size === 0)) fail(where, 'category judgement requires multiple selection and borderline tiles');
  if (s.research_class !== 'category_judgement' && borderline.size) fail(where, 'borderline tiles require category_judgement research class');
  if (s.mode === 'single' && key.size !== 1) fail(where, `single-selection grid has ${key.size} answers`);
  if (s.mode === 'multiple' && (key.size < 1 || key.size > 8)) fail(where, `multiple-selection grid has ${key.size} answers`);

  for (const t of s.tiles) {
    const at = `${where}/${t.tile_id}`;
    if (tileIds.has(t.tile_id)) fail(at, 'tile ID is not unique');
    tileIds.add(t.tile_id);
    if (hashes.has(t.sha256)) fail(at, 'the same image appears twice in the catalogue');
    hashes.add(t.sha256);
    if (!t.alt?.trim()) fail(at, 'missing alternative text');
    if (REVEALING.test(t.alt)) fail(at, 'alternative text gives the answer away');
    const p = t.provenance ?? {};
    if (!LICENCES.has(p.licence)) fail(at, `licence ${p.licence} is not on the approved list`);
    for (const field of ['model', 'model_revision', 'prompt', 'generated_at', 'edits']) if (!p[field]) fail(at, `provenance lacks ${field}`);
    if (!Number.isInteger(p.seed)) fail(at, 'provenance lacks a seed');

    for (const [file, expected] of [[t.src, t.width], [t.src_small, t.width / 2]]) {
      referenced.add(file);
      if (!OPAQUE.test(file)) fail(at, `file name ${file} is not an opaque hash`);
      if (!files.has(file)) {
        fail(at, `missing file ${file}`);
        continue;
      }
      const buffer = readFileSync(`${DIR}/${file}`);
      const size = webpSize(buffer);
      if (!size || size.width !== expected || size.height !== expected) fail(at, `${file} is ${size?.width}x${size?.height}, expected ${expected}x${expected}`);
      if (file === t.src && createHash('sha256').update(buffer).digest('hex') !== t.sha256) fail(at, `${file} does not match its recorded hash`);
    }
    if (t.width !== t.height) fail(at, 'tiles must be square');
  }

  const hashParts = [s.instruction, s.mode, s.answer_key, s.tiles.map((t) => t.sha256)];
  if (borderline.size) hashParts.push(s.borderline_tile_ids);
  const recomputed = createHash('sha256')
    .update(JSON.stringify(hashParts))
    .digest('hex');
  if (recomputed !== s.hash) fail(where, 'grid hash does not match its contents; rebuild the catalogue and bump the version');
}

for (const file of files) if (!referenced.has(file)) fail(DIR, `${file} is not in the catalogue`);

if (errors.length) {
  console.error(`Stimulus validation failed:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`Stimulus catalogue ${catalogue.catalogue_version}: ${catalogue.stimuli.length} grids, ${tileIds.size} tiles, all valid.`);
if (missing.length) console.log(`Families without a grid of their own (rounds reuse the pool): ${missing.join(', ')}.`);
