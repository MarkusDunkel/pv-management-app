import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './AuthPage.module.scss';

const DemoInvalidPage = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.authCard}>
      <h1>{t('demo.invalid.title')}</h1>
      <p>{t('demo.invalid.description')}</p>
      <Link to="/login">{t('demo.invalid.backToLogin')}</Link>
    </div>
  );
};

export default DemoInvalidPage;
