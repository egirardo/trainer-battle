import IconButton from "./IconButton";
import backArrow from '@/assets/sprites/components/back-arrow.svg';
import { ROUTES } from "@/routes";
import styles from "./ArrowBackNav.module.css"
import { useNavigate } from "react-router-dom";

export default function ArrowBackNav(){
    const navigate = useNavigate();
    return(
        <nav className={styles.bottomNav}>
            <IconButton image={backArrow} ariaLabel="Back to game menu screen" onClick={() => void navigate(ROUTES.gameMenu)}/>
        </nav>
    )
}