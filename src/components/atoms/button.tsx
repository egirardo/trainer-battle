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