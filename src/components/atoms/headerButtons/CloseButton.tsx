import styles from './HeaderButton.module.css'

interface Props {
    onClick?: () => void;
}

export default function CloseButton({ onClick }: Props){
    return(
        <button type="button" className={styles.btnDef} aria-label="Close" onClick={onClick}>
            <img src='src/assets/sprites/icons/close-icon.png' alt="" aria-hidden="true"/>
        </button>
    )
}