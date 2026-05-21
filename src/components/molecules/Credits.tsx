import CloseButton from "../atoms/headerButtons/CloseButton";
import StickyHeader from "../atoms/StickyHeader";

interface Props {
    onClose?: () => void;
}

export default function Credits({ onClose }: Props){
    return(
        <div>
            <StickyHeader 
                label="Credits"
                action={<CloseButton onClick={onClose}/>}
            />
            <h2>Developers:</h2>
            <p>John Ahlenhed</p>
            <p>Laura Kotlinska</p>
            <p>Elsa Girardo</p>

            <h2>Music</h2>
            {/* <p>Best Game Console by Krzysztof Szymanski</p> */}
            <p>Boogie by Pecan Pie</p>
            <p>Boss Time by David Renda</p>
        </div>
    )
}