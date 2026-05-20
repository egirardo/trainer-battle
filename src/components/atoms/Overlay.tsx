import styles from './Overlay.module.css';

interface Props {
    children: React.ReactNode;
    className?: string;
}

export default function Overlay({ children, className }: Props) {
    return (
        <div className={`${styles.overlay}${className ? ` ${className}` : ''}`}>
            {children}
        </div>
    );
}
