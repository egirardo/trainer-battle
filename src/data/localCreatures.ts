import fireCreatureImg from '@/assets/sprites/creatures/fire-creature.png'
import waterCreatureImg from '@/assets/sprites/creatures/water-creature.png'
import grassCreatureImg from '@/assets/sprites/creatures/grass-creature.png'
import type { Creature } from '@/models/models'

// TODO: replace with Supabase fetch
export const localCreatures: Creature[] = [
    {
        id: 1,
        name: 'Infernus',
        type: 'fire',
        base_hp: 45,
        base_attack: 65,
        base_defence: 40,
        base_speed: 65,
        description: 'A blazing creature that burns with fierce energy.',
        image: fireCreatureImg,
    },
    {
        id: 2,
        name: 'Aqualis',
        type: 'water',
        base_hp: 55,
        base_attack: 50,
        base_defence: 60,
        base_speed: 50,
        description: 'A flowing creature at home in the deepest waters.',
        image: waterCreatureImg,
    },
    {
        id: 3,
        name: 'Sylvara',
        type: 'grass',
        base_hp: 60,
        base_attack: 50,
        base_defence: 55,
        base_speed: 45,
        description: 'A verdant creature nurtured by sunlight and soil.',
        image: grassCreatureImg,
    },
]
