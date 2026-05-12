import styles from './HeaderButton.module.css'

export default function MenuButton(){
    return(
        <button type="button" className={styles.btnDef} aria-label="Menu">
            <img src='src/assets/sprites/icons/menu-icon.png' alt="" aria-hidden="true"/>
        </button>
    )
}