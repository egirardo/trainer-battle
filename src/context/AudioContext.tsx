import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import menuTrack from '@/assets/audio/boogie-pecan-pie.mp3';
import battleTrack from '@/assets/audio/boss-time.mp3';

interface AudioContextValue {
    muted: boolean;
    started: boolean;
    toggleMute: () => void;
}

const MUSIC_MUTED_KEY = 'musicMuted';

const AudioCtx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
    const location = useLocation();
    const [muted, setMuted] = useState(() => localStorage.getItem(MUSIC_MUTED_KEY) !== 'false');
    const [started, setStarted] = useState(false);
    const menuRef = useRef<HTMLAudioElement | null>(null);
    const battleRef = useRef<HTMLAudioElement | null>(null);
    const activeRef = useRef<'menu' | 'battle'>('menu');

    // Persist muted preference
    useEffect(() => {
        localStorage.setItem(MUSIC_MUTED_KEY, String(muted));
    }, [muted]);

    useEffect(() => {
        const menu = new Audio(menuTrack);
        menu.loop = true;
        menu.volume = 0.5;
        menuRef.current = menu;

        const battle = new Audio(battleTrack);
        battle.loop = true;
        battle.volume = 0.5;
        battleRef.current = battle;

        let removeInteractionListener: (() => void) | null = null;

        // Resume playback if user had music on before reload
        if (localStorage.getItem(MUSIC_MUTED_KEY) === 'false') {
            const isBattle = window.location.pathname.startsWith('/battle');
            activeRef.current = isBattle ? 'battle' : 'menu';
            const track = isBattle ? battle : menu;
            track.play()
                .then(() => setStarted(true))
                .catch(() => {
                    // Autoplay blocked — start on first click anywhere
                    const startOnInteraction = () => {
                        track.play().then(() => setStarted(true)).catch(() => {});
                    };
                    document.addEventListener('click', startOnInteraction, { once: true });
                    removeInteractionListener = () => document.removeEventListener('click', startOnInteraction);
                });
        }

        return () => {
            menu.pause();
            battle.pause();
            removeInteractionListener?.();
        };
    }, []);

    // Switch tracks on route change
    useEffect(() => {
        if (!started || muted) return;

        const isBattle = location.pathname.startsWith('/battle');
        const next = isBattle ? 'battle' : 'menu';
        if (next === activeRef.current) return;

        const prev = activeRef.current === 'menu' ? menuRef.current : battleRef.current;
        const nextAudio = next === 'menu' ? menuRef.current : battleRef.current;

        prev?.pause();
        if (nextAudio) {
            nextAudio.currentTime = 0;
            void nextAudio.play();
        }
        activeRef.current = next;
    }, [location.pathname, started, muted]);

    // Play/pause active track when mute toggles
    useEffect(() => {
        if (!started) return;
        const active = activeRef.current === 'menu' ? menuRef.current : battleRef.current;
        if (!active) return;
        if (muted) {
            active.pause();
        } else {
            active.play().catch(() => {});
        }
    }, [muted, started]);

    const toggleMute = useCallback(() => {
        if (!started) {
            const isBattle = location.pathname.startsWith('/battle');
            activeRef.current = isBattle ? 'battle' : 'menu';
            const track = isBattle ? battleRef.current : menuRef.current;
            if (track) {
                track.currentTime = 0;
                void track.play();
            }
            setStarted(true);
            setMuted(false);
            return;
        }
        setMuted(prev => !prev);
    }, [started, location.pathname]);

    return (
        <AudioCtx.Provider value={{ muted, started, toggleMute }}>
            {children}
        </AudioCtx.Provider>
    );
}

export function useAudio() {
    const ctx = useContext(AudioCtx);
    if (!ctx) throw new Error('useAudio must be used within AudioProvider');
    return ctx;
}
