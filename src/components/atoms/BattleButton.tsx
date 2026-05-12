import Button from '@/components/atoms/button';
import type React from 'react';
import styles from './BattleButton.module.css';

type BattleButtonProps = React.ComponentPropsWithoutRef<'button'> & {
    children: React.ReactNode;
    className?: string;
};

export default function BattleButton({ className, children, ...props }: BattleButtonProps) {
    return (
        <Button
            className={className ? `${styles.battleBtn} ${className}` : styles.battleBtn}
            {...props}
        >
            {children}
        </Button>
    );
}
