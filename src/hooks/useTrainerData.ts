import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';
import { getCreatureImage } from '@/lib/creatureImages';
import type { Trainer, PlayerStats, PlayerItem } from '@/models/models';

type PlayerItemRow = {
  id: number;
  quantity: number | null;
  items: {
    id: number;
    name: string | null;
    description: string | null;
    effect: number | null;
    effect_type: PlayerItem['effect_type'];
    on_use: string | null;
    image: string | null;
    price: number | null;
  } | null;
};

type PlayerCreatureData = {
  id: number;
  level: number | null;
  creature_id: number;
  player_id: string;
  nickname: string | null;
  experience: number | null;
  current_hp: number | null;
  attack: number | null;
  defence: number | null;
  speed: number | null;
  creatures: {
    id: number;
    name: string | null;
    type: string | null;
    image: string | null;
    base_hp: number | null;
    base_attack: number | null;
    base_defence: number | null;
    base_speed: number | null;
    description: string | null;
  } | null;
};

export function useTrainerData() {
  const { user } = useAuth();
  const userId = user?.id;
  const [state, setState] = useState<State>({ ...EMPTY, loading: !!userId });

  useEffect(() => {
    async function fetchTrainerData() {
      if (!userId) {
        setState(EMPTY);
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      const [
        { data: profileData, error: profileError },
        { data: pcData, error: pcError },
        { data: statsData, error: statsError },
        { data: itemsData, error: itemsError },
      ] = await Promise.all([
        fetchTrainer
          ? supabase
              .from('profiles')
              .select('id, username, trainer_gender, centralbank_uuid, is_admin, created_at')
              .eq('id', userId)
              .single()
          : SKIP,
        fetchTrainer
          ? supabase
              .from('player_creatures')
              .select('id, level, creature_id, player_id, nickname, experience, current_hp, attack, defence, speed, creatures(id, name, type, image, base_hp, base_attack, base_defence, base_speed, description)')
              .eq('player_id', userId)
              .single()
          : SKIP,
        fetchStats
          ? supabase
              .from('player_stats')
              .select('*')
              .eq('player_id', userId)
              .single()
          : SKIP,
        fetchItems
          ? supabase
              .from('player_items')
              .select('id, quantity, items(id, name, description, effect, effect_type, on_use, image, price)')
              .eq('player_id', userId)
          : SKIP,
      ]);

      if (profileError || pcError || statsError || itemsError) {
        setState(prev => ({ ...prev, loading: false, error: 'Failed to load player data.' }));
        return;
      }

      const playerItems: PlayerItem[] = itemsData
        ? (itemsData as PlayerItemRow[]).flatMap((row) => {
            const item = row.items;
            if (!item) return [];
            return [{
              id: item.id,
              name: item.name ?? '',
              description: item.description ?? '',
              effect: item.effect ?? 0,
              effect_type: item.effect_type,
              on_use: item.on_use,
              image: item.image ?? undefined,
              price: item.price ?? 0,
              quantity: row.quantity ?? 0,
            }];
          })
        : [];

      if (!profileData || !pcData) {
        setState(prev => ({ ...prev, playerStats: statsData ?? null, playerItems, loading: false }));
        return;
      }

      const pc = pcData as PlayerCreatureData;
      const creatureRaw = (Array.isArray(pc.creatures) ? pc.creatures[0] : pc.creatures) as NonNullable<PlayerCreatureData['creatures']> | undefined;

      if (!creatureRaw) {
        setState(prev => ({ ...prev, playerStats: statsData ?? null, playerItems, loading: false }));
        return;
      }

      setState({
        loading: false,
        error: null,
        playerStats: statsData ?? null,
        playerItems,
        trainer: {
          id: profileData.id,
          name: profileData.username ?? '',
          username: profileData.username,
          centralbank_uuid: profileData.centralbank_uuid ?? '',
          is_admin: profileData.is_admin,
          created_at: profileData.created_at,
          trainer_gender: (profileData.trainer_gender as Trainer['trainer_gender']) ?? 'nb',
          wins: statsData?.total_wins ?? 0,
          losses: statsData?.total_losses ?? 0,
          creature: {
            id: creatureRaw.id,
            name: creatureRaw.name ?? '',
            type: (creatureRaw.type as Trainer['creature']['type']) ?? 'fire',
            base_hp: creatureRaw.base_hp ?? 0,
            base_attack: creatureRaw.base_attack ?? 0,
            base_defence: creatureRaw.base_defence ?? 0,
            base_speed: creatureRaw.base_speed ?? 0,
            description: creatureRaw.description ?? '',
            image: getCreatureImage(creatureRaw.image ?? ''),
          },
          playerCreature: {
            id: pc.id,
            player_id: pc.player_id,
            creature_id: pc.creature_id,
            nickname: pc.nickname,
            level: pc.level,
            experience: pc.experience,
            current_hp: pc.current_hp,
            attack: pc.attack,
            defence: pc.defence,
            speed: pc.speed,
          },
        },
      });
    }

    void fetchTrainerData();
  }, [userId, fetchTrainer, fetchStats, fetchItems]);

  return state;
}
