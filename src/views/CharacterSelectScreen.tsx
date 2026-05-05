import { Link } from "react-router-dom";

export default function CharacterSelectScreen(){
    return(
        <main>
            <h1>This is Char Select</h1>
            <p>Choose your name</p>
            <p>Choose your trainer</p>
            <Link to="/monster-select">Next to monster select</Link>
        </main>
    )
}