import React from 'react';
import styles from './Button.module.css';

 type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
   children: React.ReactNode;
 };

export default function Button({
  children,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={className ? `${styles.button} ${className}` : styles.button}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

// Usage:
// Accepts all standard <button> HTML attributes. type defaults to "button" to prevent
// accidental form submissions. Pass type="submit" explicitly when used inside a <form>.
//
// <Button onClick={() => console.log('clicked')}>Click me</Button>
// <Button type="submit">Submit</Button>
// <Button onClick={handleSave} className={styles.customStyle}>Save</Button>