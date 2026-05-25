import fireCreatureImg from '@/assets/sprites/creatures/fire-creature.png';
import waterCreatureImg from '@/assets/sprites/creatures/water-creature.png';
import grassCreatureImg from '@/assets/sprites/creatures/grass-creature.png';

const map: Record<string, string> = {
    'fire-creature.png': fireCreatureImg,
    'water-creature.png': waterCreatureImg,
    'grass-creature.png': grassCreatureImg,
};

export function getCreatureImage(filename: string): string | undefined {
    return map[filename];
}
