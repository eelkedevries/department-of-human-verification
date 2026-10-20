import data from './catalogue.json';
import type { Catalogue, Stimulus } from './types';

export const catalogue = data as Catalogue;

export function stimulusById(id: string): Stimulus {
  const stimulus = catalogue.stimuli.find((s) => s.stimulus_id === id);
  if (!stimulus) throw new Error(`Unknown stimulus ${id}.`);
  return stimulus;
}

export function assetUrl(file: string): string {
  return `${import.meta.env.BASE_URL}stimuli/${file}`;
}
