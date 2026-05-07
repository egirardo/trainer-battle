import { Link } from "react-router-dom";

export default function CreatureSelectScreen(){
    return(
        <main>
            <h1>This is Monster Select</h1>
            <p>Choose your monster</p>
            <Link to="/game-menu">To gameplay menu screen</Link>
        </main>
    )
}