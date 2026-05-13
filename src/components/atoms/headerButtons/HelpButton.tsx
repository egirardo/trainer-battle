import styles from './HeaderButton.module.css'
import helpIcon from '../../../assets/sprites/icons/help-icon.png'
import type { ButtonHTMLAttributes } from 'react'

export default function HelpButton(props: ButtonHTMLAttributes<HTMLButtonElement>){
    return(
        <button {...props} type="button" className={styles.btnDef} aria-label="Help">
            <img src={helpIcon} alt="" aria-hidden="true"/>
        </button>
    )
}