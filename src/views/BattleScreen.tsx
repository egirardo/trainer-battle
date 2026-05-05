import { Link } from "react-router-dom";

export default function BattleScreen(){
    return(
        <main>
            <h1>This is battle screen</h1>
            <p>Shows opponent and monster</p>
            <p>Shows player and monster</p>
            <p>And some battle menu</p>
            <Link to="/battle-result">Run away</Link>
        </main>
    )
}