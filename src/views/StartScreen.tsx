import { Link } from "react-router-dom";
import { ROUTES } from '@/routes';

export default function StartScreen(){
    return(
        <main>
            <h1>
                Trainer Battle
            </h1>
            <h2>
                Main screen
            </h2>
            <p>Login or start new game</p>
            <Link to={ROUTES.characterSelect}>Start - Char select</Link>
        </main>
    )
}