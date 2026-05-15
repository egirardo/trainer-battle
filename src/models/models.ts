import type { Tables } from "@/types/database.types";

export type Player = Tables<'profiles'>;

export type TrainerGender = 'male' | 'female' | 'nb';


export interface Trainer extends Player {
    name: string;
    creature: Creature;
    playerCreature: PlayerCreature;
    trainer_gender: TrainerGender;
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
    type: CreatureType;
    power: number;
    accuracy: number;
    effect: string;
    description: string;
}

export interface PlayerItem extends Item {
    quantity: number;
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
    cpu_creature_id: number | null;
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
    level: number | null;
    experience: number | null;
    current_hp: number | null;
    attack: number | null;
    defence: number | null;
    speed: number | null;
}

export interface BattleParticipantInfo {
    name: string;
    level: number;
    currentHp: number;
    maxHp: number;
    creatureImage: string;
    creatureType: CreatureType;
}

export interface PlayerStats {
    id: number;
    player_id: string;
    total_battles: number;
    total_wins: number;
    total_losses: number;
    total_forfeits: number;
    lives: number;
    credits: number;
}

export type ItemEffectType = 'heal' | 'attack_boost' | 'defence_boost';

export interface Item {
    id: number;
    name: string;
    description: string;
    effect: number;
    effect_type: ItemEffectType;
    price: number;
}