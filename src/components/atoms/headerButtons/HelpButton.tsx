import styles from './HeaderButton.module.css'

export default function HelpButton(){
    return(
        <button type="button" className={styles.btnDef} aria-label="Help">
            <img src='src/assets/sprites/icons/help-icon.png' alt="" aria-hidden="true"/>
        </button>
    )
}