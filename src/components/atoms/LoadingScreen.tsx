import styles from './LoadingScreen.module.css';

interface Props {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: Props) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.message}>{message}</p>
      <div className={styles.barTrack}>
        <div className={styles.barFill} />
      </div>
    </div>
  );
}
