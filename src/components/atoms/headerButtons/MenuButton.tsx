import styles from './HeaderButton.module.css'
import menuIcon from '../../../assets/sprites/icons/menu-icon.png'
import type { ButtonHTMLAttributes } from 'react'

export default function MenuButton(props: ButtonHTMLAttributes<HTMLButtonElement>){
    return(
        <button {...props} type="button" className={styles.btnDef} aria-label="Menu">
            <img src={menuIcon} alt="" aria-hidden="true"/>
        </button>
    )
}