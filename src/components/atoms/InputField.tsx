import React from 'react';
import styles from './InputField.module.css';

export default function InputField({
    className,
    style,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
     <div className={[styles.wrapper, className].filter(Boolean).join(' ')} style={style}>
       <input
         {...props}
         className={[styles.input, className].filter(Boolean).join(' ')}
       />
    </div>
  );
}