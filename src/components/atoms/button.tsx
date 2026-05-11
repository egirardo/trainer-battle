import React from 'react';
import styles from './Button.module.css';

type ButtonProps<C extends React.ElementType = 'button'> = {
  as?: C;
  children: React.ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<C>, 'children' | 'className'>;

export default function Button<C extends React.ElementType = 'button'>({
  as,
  children,
  className,
  ...props
}: ButtonProps<C>) {
  const Component = as ?? 'button';
  const extraProps = !as ? { type: (props as React.ButtonHTMLAttributes<HTMLButtonElement>).type ?? 'button' } : {};
  return (
    <Component
      className={className ? `${styles.button} ${className}` : styles.button}
      {...extraProps}
      {...props}
    >
      {children}
    </Component>
  );
}

// Usage:
// Accepts all standard <button> HTML attributes. type defaults to "button" to prevent
// accidental form submissions. Pass type="submit" explicitly when used inside a <form>.
//
// <Button onClick={() => console.log('clicked')}>Click me</Button>
// <Button type="submit">Submit</Button>
// <Button onClick={handleSave} className={styles.customStyle}>Save</Button>