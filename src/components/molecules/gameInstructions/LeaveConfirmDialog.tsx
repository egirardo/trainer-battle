import styles from './LeaveConfirmDialog.module.css';
import Button from '@/components/atoms/button';

interface Props {
    onConfirm: () => void
    onCancel: () => void
}

export default function LeaveConfirmDialog({ onConfirm, onCancel }: Props) {
    return (
        <div className={styles.overlay}>
            <div className={styles.dialog}>
                <h2>Leave game?</h2>
                <p>If you return, you will be charged <strong>1.50€</strong> to re-enter.</p>
                <div className={styles.actions}>
                    <Button onClick={onCancel}>Stay</Button>
                    <Button variant='danger' onClick={onConfirm}>Leave</Button>
                </div>
            </div>
        </div>
    )
}