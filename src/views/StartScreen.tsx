import { Link } from "react-router-dom";
import styles from './StartScreen.module.css'
import testcreature1 from '@/assets/sprites/creatures/fire-creature.png';
import testcreature2 from '@/assets/sprites/creatures/water-creature.png';
import Button from "@/components/atoms/button";

export default function StartScreen(){
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
                <Link to={"/character-select"}>
                       <Button className={styles.startButton}>
                            New game
                        </Button>
                </Link>
                <Link to={"/login"}>
                       <Button className={styles.startButton}>
                            Continue
                        </Button>
                </Link>
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