import styles from './IconButton.module.css';
import React from 'react';

// Children are intentionally excluded from the props since the button's content is always an image.
export default function IconButton({
    className,
    image,
    ariaLabel,
    ariaPressed,
    iconSize,
    isSelected,
    type = 'button',
    ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    image?: string;
    ariaLabel: string;
    ariaPressed?: boolean;
    iconSize?: 'S' | 'M' | 'L';
    isSelected?: boolean;
}) {
    const sizeClass = iconSize ? styles[iconSize] : styles.S;
    return (
        <button
            className={[styles.iconButton, sizeClass, isSelected && styles.selected, className].filter(Boolean).join(' ')}
            type={type}
            {...props}
            aria-label={ariaLabel}
            aria-pressed={ariaPressed ?? isSelected}
        >
        {image && <img className={styles.image} src={image} alt="" />}
        </button>
    );
}

// Usage:
// image and ariaLabel are required. ariaLabel is used as the button's accessible name —
// always describe the action, not the icon (e.g. "Open settings", not "Gear icon").
// iconSize defaults to S when omitted.
//
// <IconButton image={settingsIcon} ariaLabel="Open settings" />
// <IconButton image={closeIcon} ariaLabel="Close menu" iconSize="S" onClick={handleClose} />
// <IconButton image={attackIcon} ariaLabel="Attack" iconSize="L" type="submit" />

