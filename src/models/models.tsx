interface Player {
    id: string;
    centralbank_uuid: string;
    username: string;
}

interface Creature {
    id: number;
    name: string;
    type: string;
    base_hp: number;
    base_attack: number;
    base_defence: number;
    base_speed: number;
    description: string;
}

interface Move {
    id: number;
    name: string;
    type: string;
    power: number;
    accuracy: number;
    effect: string;
    description: string;
}

interface Item {
    id: number;
    name: string;
    description: string;
    effect: string;
    price: number;
}