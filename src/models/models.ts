export interface Player {
    id: string;
    centralbank_uuid: string;
    username: string;
}

export type TrainerGender = 'male' | 'female' | 'nb';


export interface Trainer extends Player {
    name: string;
    creature: Creature;
    gender: TrainerGender;
    wins: number;
    losses: number;
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

// Lobby and matchmaking related types

export type SessionStatus = "pending" | "waiting" | "active" | "finished" | "declined";

export interface ApiError {
    message: string;
    status?: number;
}

export interface GameSession {
    id: number;
    player1_id: string;
    player2_id: string | null;
    player1_creature_id: number | null;
    player2_creature_id: number | null;
    is_cpu: boolean;
    status: SessionStatus;
    winner_id: string | null;
    current_turn: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface LobbyPlayer {
    userId: string;
    username: string;
    creatureId: number;
    creatureName: string;
    level: number;
}

export interface IncomingInvitation {
    sessionId: number;
    fromUserId: string;
    fromUsername: string;
    creatureId: number;
}