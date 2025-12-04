import { type PanelOptimizationRequest } from '@/api/optimizations';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import styles from '@/pages/PanelSizeOptimizerPage.module.scss';
import { ChangeEvent, useState } from 'react';

interface Props {
  onSubmit: () => void;
  formValues: Record<keyof PanelOptimizationRequest, string>;
  setFormValues: React.Dispatch<
    React.SetStateAction<Record<keyof PanelOptimizationRequest, string>>
  >;
  error: string | null;
  isLoading: boolean;
  hasChanged?: boolean;
}

export const Parameters = ({
  onSubmit,
  error,
  isLoading,
  formValues,
  setFormValues,
  hasChanged = false,
}: Props) => {
  const { t } = useTranslation();

  const handleInputChange =
    (field: keyof PanelOptimizationRequest) => (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  return (
    <>
      <div className="card-heading">
        <div>
          <h2>{t('optimizer.parameters.title')}</h2>
          <p className="text-muted">{t('optimizer.parameters.description')}</p>
        </div>
      </div>
      <form
        className={styles.formFields}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <label className={styles.formField}>
          <span>{t('optimizer.parameters.electricityCosts')}</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={formValues.electricityCosts}
            onChange={handleInputChange('electricityCosts')}
            required
          />
        </label>
        <label className={styles.formField}>
          <span>{t('optimizer.parameters.electricitySellingPrice')}</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={formValues.electricitySellingPrice}
            onChange={handleInputChange('electricitySellingPrice')}
            required
          />
        </label>
        <label className={styles.formField}>
          <span>{t('optimizer.parameters.currentCapacity')}</span>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={formValues.currentCapacity}
            onChange={handleInputChange('currentCapacity')}
            required
          />
        </label>
        <label className={styles.formField}>
          <span>{t('optimizer.parameters.reininvesttime')}</span>
          <input
            type="number"
            min="1"
            step="1"
            value={formValues.reininvesttime}
            onChange={handleInputChange('reininvesttime')}
            required
          />
        </label>
        <label className={styles.formField}>
          <span>{t('optimizer.parameters.panelcost')}</span>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={formValues.panelcost}
            onChange={handleInputChange('panelcost')}
            required
          />
        </label>
        <div className={styles.runRow}>
          <Button type="submit" disabled={isLoading || !hasChanged}>
            {isLoading ? t('optimizer.parameters.submitting') : t('optimizer.parameters.submit')}
          </Button>
          {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
      </form>
    </>
  );
};
