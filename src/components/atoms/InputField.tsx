import React from 'react';
import styles from './InputField.module.css';

export default function InputField({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={styles.wrapper}>
      <input className={styles.input} {...props} />
    </div>
  );
}