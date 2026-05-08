import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import styles from './StartScreen.module.css'
import testcreature1 from '@/assets/sprites/creatures/fire-creature.png';
import testcreature2 from '@/assets/sprites/creatures/water-creature.png';
import Button from "@/components/atoms/button";

export default function StartScreen(){
    const navigate = useNavigate();
    return(
        <main className={styles.mainScreen}>
            <div>
                <h1 className={styles.logoContainer}>
                    <span className={styles.gameLogo}>- Trainer -</span>
                    <span className={styles.gameLogo}>Battle</span>
                </h1>
                <div className={styles.logoImgContainer}>
                    <img className={styles.logoImg} src={testcreature1} />
                    <img className={styles.logoImg} src={testcreature2} />
                </div>
            </div>
            <div className={styles.navContainer}>
                <Button className={styles.startButton} onClick={() => navigate(ROUTES.characterSelect)}>
                    New game
                </Button>
                <Button className={styles.startButton} onClick={() => navigate(ROUTES.login)}>
                    Continue
                </Button>
            </div>
            <div className={styles.extrasContainer}>
                {
                    // TODO: Pop up creds and instructions
                }
                <Button className={`${styles.startButton} ${styles.small}`}>
                    Credits
                </Button>                       
                <Button className={`${styles.startButton} ${styles.small}`}>
                    How do I play?
                </Button>
            </div>
        </main>
    )
}