import { Link } from "react-router-dom";

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
            <Link to={"/character-select"}>Start - Char select</Link>
        </main>
    )
}