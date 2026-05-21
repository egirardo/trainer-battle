import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import { useAuth } from '../hooks/useAuth';
import styles from './StartScreen.module.css'
import femaleTrainer from '@/assets/sprites/trainers/avatar-f.png';
import maleTrainer from '@/assets/sprites/trainers/avatar-m.png';
import Button from "@/components/atoms/button";
import GameInstructions from "@/components/molecules/gameInstructions/GameInstructions";
import Credits from '@/components/molecules/Credits';

export default function StartScreen(){
    const navigate = useNavigate();
    const [showInstructions, setShowInstructions] = useState(false);
    const [showCredits, setShowCredits] = useState(false);
    const user = useAuth().user;

    return(
        <main className={styles.mainScreen}>
            <div>
                <h1 className={styles.logoContainer}>
                    <span className={styles.gameLogo}>- Trainer -</span>
                    <span className={styles.gameLogo}>Battle</span>
                </h1>
                <div className={styles.logoImgContainer}>
                    <img className={styles.logoImg} src={femaleTrainer} alt="" aria-hidden="true"/>
                    <img className={styles.logoImg} src={maleTrainer} alt="" aria-hidden="true"/>
                </div>
            </div>
            <div className={styles.navContainer}>
                <Button className={styles.startButton} onClick={() => user ? void navigate(ROUTES.characterSelect) : void navigate(ROUTES.register)}>
                    New game
                </Button>
                <Button className={styles.startButton} onClick={() => void navigate(ROUTES.login)}>
                    Continue
                </Button>
            </div>

            <div className={styles.extrasContainer}>
                <Button className={`${styles.startButton} ${styles.small}`} onClick={() => setShowCredits(true)}>
                    Credits
                </Button>
                <Button className={`${styles.startButton} ${styles.small}`} onClick={() => setShowInstructions(true)}>
                    How to play
                </Button>
            </div>

            {showCredits && (
                <div className={styles.infoOverlay}>
                    <Credits onClose={() => setShowCredits(false)} />
                </div>
            )}

            {showInstructions && (
                <div className={styles.infoOverlay}>
                    <GameInstructions onClose={() => setShowInstructions(false)} />
                </div>
            )}
        
        </main>
    )
}
