import { Link } from "react-router-dom";
import { ROUTES } from '../routes';

export default function LobbyScreen(){
    return(
        <main>
            <h1>This is lobby</h1>
            <p>Here we show peeps in the lobby</p>
            <p>Some time counter</p>
            <Link to={ROUTES.battle}>To battle</Link>
        </main>
    )
}