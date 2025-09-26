import styles from './LoadingScreen.module.scss';

interface Props {
  message?: string;
}

export const LoadingScreen = ({ message = 'Loading...' }: Props) => (
  <div className={styles.loader}>
    <div className={styles.spinner} />
    <p>{message}</p>
  </div>
);
