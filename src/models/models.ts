export interface Player {
    id: string;
    centralbank_uuid: string;
    username: string;
}

export type CreatureType = 'fire' | 'water' | 'grass'

export interface Creature {
    id: number;
    name: string;
    type: CreatureType;
    base_hp: number;
    base_attack: number;
    base_defence: number;
    base_speed: number;
    description: string;
    image: string;
}

export interface Move {
    id: number;
    name: string;
    type: string;
    power: number;
    accuracy: number;
    effect: string;
    description: string;
}

export interface Item {
    id: number;
    name: string;
    description: string;
    effect: string;
    price: number;
}