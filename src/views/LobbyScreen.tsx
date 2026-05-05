import { Link } from "react-router-dom";

export default function LobbyScreen(){
    return(
        <main>
            <h1>This is lobby</h1>
            <p>Here we show peeps in the lobby</p>
            <p>Some time counter</p>
            <Link to={"/battle"}>To battle</Link>
        </main>
    )
}