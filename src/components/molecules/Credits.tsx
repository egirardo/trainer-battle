import styles from './Credits.module.css';
import CloseButton from "../atoms/headerButtons/CloseButton";
import StickyHeader from "../atoms/StickyHeader";
import { useEffect, useRef } from 'react';

interface Props {
    onClose?: () => void;
}

export default function Credits({ onClose }: Props) {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        sectionRef.current?.focus();
    }, [])

    useEffect(() => {
        if (!onClose) return;
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose?.()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    return (
        <section ref={sectionRef} tabIndex={-1}>
            <StickyHeader
                label="Credits"
                action={<CloseButton onClick={onClose} />}
            />
            <article className={styles.contentContainer}>

                <div className={styles.contentSection}>
                    <h2>Development</h2>
                    <ul className={styles.list}>
                        <li><span className={styles.accentText}>John Ahlenhed</span> - Backend/Devops</li>
                        <li><span className={styles.accentText}>Laura Kotlinska</span> - Frontend Logic/Backend/Design</li>
                        <li><span className={styles.accentText}>Elsa Girardo</span> - Frontend/Art & Design/Scrum Master</li>
                    </ul>
                </div>

                <div className={styles.contentSection}>
                    <h2>Art &amp; Sprites</h2>
                    <p><span className={styles.accentText}>Elsa Girardo</span></p>
                </div>

                <div className={styles.contentSection}>
                    <h2>Music</h2>
                    <p>Boogie — <span className={styles.accentText}>Pecan Pie</span></p>
                    <p>Boss Time — <span className={styles.accentText}>David Renda</span></p>
                </div>

                <div className={styles.contentSection}>
                    <h2>Font</h2>
                    <p><span className={styles.accentText}>Minecraft Standard</span></p>
                    <p className={styles.subText}>Faithful OpenType recreation of the Minecraft GUI font · CC PD</p>
                </div>

                <div className={styles.contentSection}>
                    <h2>Built with</h2>
                    <div className={styles.techRow}>
                        <span className={styles.techTag}>React</span>
                        <span className={styles.techTag}>TypeScript</span>
                        <span className={styles.techTag}>Vite</span>
                        <span className={styles.techTag}>Supabase</span>
                        <span className={styles.techTag}>React Router</span>
                    </div>
                </div>

                <div className={styles.contentSection}>
                    <h2>Special Thanks</h2>
                    <p><span className={styles.accentText}>Yrgo WU25</span></p>
                </div>

            </article>
        </section>
    );
}
