import styles from './StickyHeader.module.css'
import type { ReactNode } from 'react'

interface Props {
    label: string;
    action?: ReactNode;
}

export default function StickyHeader({ label, action }: Props) {
    return(
        <div className={styles.stickyHeader}>
            <h1>{label}</h1>
            {action}
        </div>
    )
}