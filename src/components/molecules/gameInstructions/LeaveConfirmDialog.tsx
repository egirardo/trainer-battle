import styles from './LeaveConfirmDialog.module.css';
import Button from '@/components/atoms/button';

interface Props {
    onConfirm: () => void
    onCancel: () => void
    entryFee?: number
}

export default function LeaveConfirmDialog({ onConfirm, onCancel, entryFee = 1.50 }: Props) {
    return (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="leave-dialog-title">
            <div className={styles.dialog}>
                <h2 id="leave-dialog-title">Leave game?</h2>
                <p>If you return, you will be charged <strong>{entryFee.toFixed(2)}€</strong> to re-enter.</p>
                <div className={styles.actions}>
                    <Button onClick={onCancel}>Stay</Button>
                    <Button variant='danger' onClick={onConfirm}>Leave</Button>
                </div>
            </div>
        </div>
    )
}