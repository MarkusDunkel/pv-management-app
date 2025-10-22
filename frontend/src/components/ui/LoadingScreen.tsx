import { useTranslation } from '@/hooks/useTranslation';
import styles from './LoadingScreen.module.scss';

interface Props {
  message?: string;
}

export const LoadingScreen = ({ message }: Props) => {
  const { t } = useTranslation();
  const resolvedMessage = message ?? t('common.loading');

  return (
    <div className={styles.loader}>
      <div className={styles.spinner} />
      <p>{resolvedMessage}</p>
    </div>
  );
};
