import { Link } from "react-router-dom";

export default function MonsterScreen(){
    return(
        <main>
            <h1>This is Monster Select</h1>
            <p>Choose your monster</p>
            <Link to="/menu">To gameplay menu screen</Link>
        </main>
    )
}