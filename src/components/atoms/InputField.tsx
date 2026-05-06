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

// Usage:
// Accepts all standard <input> HTML attributes. The pixel art border and background are
// handled by a wrapper div — className and style are applied to the wrapper, not the input.
// Use type, placeholder, value, onChange etc. as normal.
//
// <InputField type="text" placeholder="Enter name..." onChange={e => setName(e.target.value)} />
// <InputField type="password" placeholder="Password" value={password} onChange={handleChange} />
// <InputField type="text" className={styles.wide} defaultValue="Ash" />