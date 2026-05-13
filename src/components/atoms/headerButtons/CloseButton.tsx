import styles from './HeaderButton.module.css'
import closeIcon from '../../../assets/sprites/icons/close-icon.png'
import type { ButtonHTMLAttributes } from 'react'


export default function CloseButton(props: ButtonHTMLAttributes<HTMLButtonElement>){
    return(
        <button {...props} type="button" className={styles.btnDef} aria-label="Close">
            <img src={closeIcon} alt="" aria-hidden="true"/>
        </button>
    )
}