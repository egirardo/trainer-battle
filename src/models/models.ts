export interface Player {
    id: string;
    centralbank_uuid: string;
    username: string;
    is_admin: boolean;
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
    type: CreatureType;
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

export interface PlayerCreature {
    id: number;
    player_id: string;
    creature_id: number;
    nickname: string | null;
    level: number;
    experience: number;
    current_hp: number;
    attack: number;
    defence: number;
    speed: number;
}

export interface PlayerStats {
    id: number;
    player_id: string;
    total_battles: number;
    total_wins: number;
    total_losses: number;
    total_runs: number;
    lives: number;
    tutorial_complete: boolean;
}