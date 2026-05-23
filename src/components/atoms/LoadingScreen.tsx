import styles from './LoadingScreen.module.css';

interface Props {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: Props) {
  return (
    <main className={styles.wrapper}>
      <p className={styles.message} role="status" aria-live="polite">{message}</p>
      <div className={styles.barTrack} aria-hidden="true">
        <div className={styles.barFill} />
      </div>
    </main>
  );
}
