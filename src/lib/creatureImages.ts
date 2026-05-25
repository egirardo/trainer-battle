import fireCreatureImg from '@/assets/sprites/creatures/fire-creature.png';
import waterCreatureImg from '@/assets/sprites/creatures/water-creature.png';
import grassCreatureImg from '@/assets/sprites/creatures/grass-creature.png';
import type { CreatureType } from '@/models/models';

const filenameMap: Record<string, string> = {
    'fire-creature.png': fireCreatureImg,
    'water-creature.png': waterCreatureImg,
    'grass-creature.png': grassCreatureImg,
};

const typeMap: Record<CreatureType, string> = {
    fire: fireCreatureImg,
    water: waterCreatureImg,
    grass: grassCreatureImg,
};

/**
 * Resolves a creature image URL from a DB filename.
 * Falls back to the type-based sprite when the filename is missing or unrecognised.
 */
export function getCreatureImage(filename: string, fallbackType?: CreatureType): string | undefined {
    return filenameMap[filename] ?? (fallbackType !== undefined ? typeMap[fallbackType] : undefined);
}
