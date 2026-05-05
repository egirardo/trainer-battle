import { Link } from "react-router-dom";

export default function ResultScreen(){
    return(
        <main>
            <h1>This is result page</h1>
            <p>Here we can show the result of finished battle or that player ran away.</p>
            <Link to="/lobby"> Play again</Link>
            <Link to="/game-menu">Main menu</Link>
        </main>
    )
}