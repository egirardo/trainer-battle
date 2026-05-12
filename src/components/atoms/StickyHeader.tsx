import styles from './StickyHeader.module.css'

interface Props {
    label: string;
    action?: React.ReactNode;
}

export default function StickyHeader({ label, action }: Props) {
    return(
        <div className={styles.stickyHeader}>
            <h2>{label}</h2>
            {action}
        </div>
    )
}