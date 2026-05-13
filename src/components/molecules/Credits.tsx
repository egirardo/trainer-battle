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
            <p>Hardwork of:</p>
            <p>John Ahlenhed</p>
            <p>Laura Kotlinska</p>
            <p>Elsa Girardo</p>
        </div>
    )
}