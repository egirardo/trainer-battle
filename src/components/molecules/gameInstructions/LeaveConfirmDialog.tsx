import styles from './LeaveConfirmDialog.module.css';
import Button from '@/components/atoms/button';
import { useEffect, useRef } from 'react';

interface Props {
    onConfirm: () => void
    onCancel: () => void
    entryFee?: number
}

export default function LeaveConfirmDialog({ onConfirm, onCancel, entryFee = 1.50 }: Props) {
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dialogRef.current?.focus()
    }, [])

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onCancel()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onCancel])

    return (
        <div className={styles.overlay}>
            <div className={styles.dialog} ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="leave-dialog-title">
                <h2 id="leave-dialog-title">Leave game?</h2>
                <p>If you return, you will be charged <strong>{entryFee.toFixed(2)}€</strong> to re-enter. Your progress will be saved if you leave.</p>
                <div className={styles.actions}>
                    <Button onClick={onCancel}>Stay</Button>
                    <Button variant='danger' onClick={onConfirm}>Leave</Button>
                </div>
            </div>
        </div>
    )
}