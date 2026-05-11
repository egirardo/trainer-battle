import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import { useAuth } from '../hooks/useAuth';
import styles from './StartScreen.module.css'
import testcreature1 from '@/assets/sprites/creatures/fire-creature.png';
import testcreature2 from '@/assets/sprites/creatures/water-creature.png';
import Button from "@/components/atoms/button";
import GameInstructions from "@/components/molecules/gameInstructions/GameInstructions";

export default function StartScreen(){
    const navigate = useNavigate();
    const [showInstructions, setShowInstructions] = useState(false);
    const user = useAuth().user;

    return(
        <main className={styles.mainScreen}>
            <div>
                <h1 className={styles.logoContainer}>
                    <span className={styles.gameLogo}>- Trainer -</span>
                    <span className={styles.gameLogo}>Battle</span>
                </h1>
                <div className={styles.logoImgContainer}>
                    <img className={styles.logoImg} src={testcreature1} alt="Creature image" aria-hidden="true"/>
                    <img className={styles.logoImg} src={testcreature2} alt="Creature image" aria-hidden="true"/>
                </div>
            </div>
            <div className={styles.navContainer}>
                <Button className={styles.startButton} onClick={() => user ? navigate(ROUTES.characterSelect) : navigate(ROUTES.register)}>
                    New game
                </Button>
                <Button className={styles.startButton} onClick={() => navigate(ROUTES.login)}>
                    Continue
                </Button>
            </div>
            <div className={styles.extrasContainer}>
                {/* TODO: Pop up creds and instructions */}
                <Button className={`${styles.startButton} ${styles.small}`}>
                    Credits
                </Button>
                <Button className={`${styles.startButton} ${styles.small}`} onClick={() => setShowInstructions(true)}>
                    How do I play?
                </Button>
            </div>
            {showInstructions && (
                <div className={styles.instructionsOverlay}>
                    <GameInstructions onClose={() => setShowInstructions(false)} />
                </div>
            )}
        </main>
    )
}
