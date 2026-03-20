import { luxx } from './luxx';
import { terminal } from './terminal';
import { luxury } from './luxury';
import { zen } from './zen';

export const SKINS = { luxx, terminal, luxury, zen };
export const SKIN_LIST = [luxx, terminal, luxury, zen];
export const DEFAULT_SKIN = 'luxx';

export function getSkin(id) {
  return SKINS[id] || SKINS[DEFAULT_SKIN];
}
