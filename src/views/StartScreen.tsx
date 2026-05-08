import { Link } from "react-router-dom";
import styles from './StartScreen.module.css'
import testcreature1 from '@/assets/sprites/creatures/test-character.png';
import testcreature2 from '@/assets/sprites/creatures/test-character2.png';

export default function StartScreen(){
    return(
        <main>
            <h1>
                <span className={styles.gameLogo}>- Trainer -</span>
                <span className={styles.gameLogo}>Battle</span>
            </h1>
            <div className={styles.logoImgContainer}>
                <img className={styles.logoImg} src={testcreature1} />
                <img className={styles.logoImg} src={testcreature2} />
            </div>
            <div className={styles.navContainer}>
                <Link 
                    className={styles.startButton} 
                    to={"/character-select"}>
                        New game
                </Link>
                <Link 
                    className={styles.startButton} 
                    to={"/login"}>
                        Continue
                </Link>
            </div>
            <div className={styles.extrasContainer}>
                <Link to="#">Credits</Link>
                <Link to="#">How do I play?</Link>
            </div>
        </main>
    )
}