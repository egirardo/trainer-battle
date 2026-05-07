import React from 'react';
import styles from './InputField.module.css';

type WithLabel = { hasLabel?: true; labelName: string; id: string };
type WithoutLabel = { hasLabel: false; labelName?: never; id?: string };

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & (WithLabel | WithoutLabel) & {
    error?: string;
    orientation?: 'vertical' | 'horizontal';
};

export default function InputField({
    hasLabel = true,
    labelName,
    id,
    className,
    style,
    error,
    orientation = 'vertical',
    ...props
}: InputFieldProps) {
  const errorId = error && id ? `${id}-error` : undefined;
  return (
    <div className={[styles.fieldLabelWrapper, orientation === 'horizontal' && styles.horizontal].filter(Boolean).join(' ')}>
      { hasLabel &&
        <label htmlFor={id}>{labelName}</label>
      }
      <div className={[styles.wrapper, error && styles.hasError, className].filter(Boolean).join(' ')} style={style}>
        <input
          id={id}
          {...props}
          aria-describedby={errorId}
          aria-invalid={!!error}
          className={[styles.input, className].filter(Boolean).join(' ')}
        />
      </div>
      { error &&
        <span id={errorId} className={styles.errorMessage} role="alert">{error}</span>
      }
    </div>
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