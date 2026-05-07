import React from 'react';
import styles from './InputField.module.css';

type WithLabel = { hasLabel?: true; labelName: string; id: string };
type WithoutLabel = { hasLabel: false; labelName?: never; id?: string };

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & (WithLabel | WithoutLabel);

export default function InputField({
    hasLabel = true,
    labelName,
    id,
    className,
    style,
  ...props
}: InputFieldProps) {
  return (
    <>
      { hasLabel &&
        <label htmlFor={id}>{labelName}</label>
      }
      <div className={[styles.wrapper, className].filter(Boolean).join(' ')} style={style}>
        <input
          id={id}
          {...props}
          className={[styles.input, className].filter(Boolean).join(' ')}
        />
      </div>
    </>
  );
}

// Usage:
// Accepts all standard <input> HTML attributes. The pixel art border and background are
// handled by a wrapper div — style is applied to the wrapper, and className is applied to
// both the wrapper and the input. Use type, placeholder, value, onChange etc. as normal.
//
// <InputField type="text" placeholder="Enter name..." onChange={e => setName(e.target.value)} />
// <InputField type="password" placeholder="Password" value={password} onChange={handleChange} />
// <InputField type="text" className={styles.wide} defaultValue="Ash" />