import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type GameConfig = {
  xpPerLevel: number;
};

const DEFAULT_CONFIG: GameConfig = { xpPerLevel: 100 };

export function useGameConfig(): GameConfig {
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    async function fetchConfig() {
      const { data, error } = await supabase
        .from('game_config')
        .select('xp_per_level')
        .single();

      if (!error && data?.xp_per_level != null && data.xp_per_level > 0) {
        setConfig({ xpPerLevel: data.xp_per_level });
      }
    }

    void fetchConfig();
  }, []);

  return config;
}
