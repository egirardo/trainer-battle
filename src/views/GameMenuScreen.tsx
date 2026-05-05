import { Link } from "react-router-dom";

export default function GameMenuScreen(){
    return(
        <main>
            <h1>Gameplay menu</h1>
            <p>Inventory</p>
            <p>Your monsters</p>
            <p>Shop</p>
            <Link to="/lobby">Play - go to lobby</Link>
        </main>
    )
}