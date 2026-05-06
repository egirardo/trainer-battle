import React from 'react';
import styles from './InputField.module.css';

// labelName is not a native input attribute
type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  hasLabel?: boolean;
  labelName?: string;
}

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