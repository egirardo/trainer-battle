import styles from './IconButton.module.css';
import React from 'react';

// Children are intentionally excluded from the props since the button's content is always an image.
export default function IconButton({
    className,
    image,
    ariaLabel,
    iconSize,
    type = 'button',
    ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    image: string;
    ariaLabel: string;
    iconSize?: 'S' | 'M' | 'L';
}) {
    const sizeClass = iconSize ? styles[iconSize] : styles.M;
    return (
        <button
            className={[styles.iconButton, sizeClass, className].filter(Boolean).join(' ')}
            type={type}
            {...props}
            aria-label={ariaLabel}
        >
        <img className={styles.image} src={image} alt="" />
        </button>
    );
}

// Usage:
// image and ariaLabel are required. ariaLabel is used as the button's accessible name —
// always describe the action, not the icon (e.g. "Open settings", not "Gear icon").
// iconSize defaults to M when omitted.
//
// <IconButton image={settingsIcon} ariaLabel="Open settings" />
// <IconButton image={closeIcon} ariaLabel="Close menu" iconSize="S" onClick={handleClose} />
// <IconButton image={attackIcon} ariaLabel="Attack" iconSize="L" type="submit" />

