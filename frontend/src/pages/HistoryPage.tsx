import { FormEvent, useMemo, useState } from 'react';
import { formatISO, subDays } from 'date-fns';
import { historyApi } from '@/api/history';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/button';
import styles from './HistoryPage.module.scss';

const DEFAULT_POWER_STATION_ID = 1;

interface HistoryState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  message?: string;
}

const HistoryPage = () => {
  const [from, setFrom] = useState(() => subDays(new Date(), 7));
  const [to, setTo] = useState(new Date());
  const [state, setState] = useState<HistoryState>({ status: 'idle' });
  const [data, setData] = useState<Awaited<ReturnType<typeof historyApi.fetch>> | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setState({ status: 'loading' });

    try {
      const response = await historyApi.fetch(DEFAULT_POWER_STATION_ID, {
        from: from.toISOString(),
        to: to.toISOString()
      });
      setData(response);
      setState({ status: 'ready' });
    } catch (error) {
      console.error('Failed to load history data', error);
      setState({ status: 'error', message: 'Unable to load history for the selected range.' });
    }
  };

  const summary = useMemo(() => {
    if (!data) return null;
    const production = data.dailyKpi.reduce((sum, kpi) => sum + (kpi.productionKWh ?? 0), 0);
    const peak = data.powerflow.reduce((max, item) => Math.max(max, item.pvW ?? 0), 0);
    return { production, peak };
  }, [data]);

  return (
    <div className={styles.historyShell}>
      <section className={`${styles.filterCard} card`}>
        <div className="card-heading">
          <h2>Historical Overview</h2>
          <span className="text-muted">Choose a date range to inspect energy trends.</span>
        </div>
        <form onSubmit={handleSubmit} className={styles.filterForm}>
          <div>
            <label htmlFor="from">From</label>
            <input
              id="from"
              type="date"
              value={formatISO(from, { representation: 'date' })}
              onChange={(event) => setFrom(new Date(event.target.value))}
              required
            />
          </div>
          <div>
            <label htmlFor="to">To</label>
            <input
              id="to"
              type="date"
              value={formatISO(to, { representation: 'date' })}
              onChange={(event) => setTo(new Date(event.target.value))}
              required
            />
          </div>
          <Button type="submit">Update timeline</Button>
        </form>
      </section>

      {state.status === 'loading' && <LoadingScreen message="Aggregating energy history..." />}
      {state.status === 'error' && <p className={styles.error}>{state.message}</p>}

      {state.status === 'ready' && data && (
        <section className={`${styles.resultsCard} card`}>
          <div className={styles.resultsHeader}>
            <div>
              <h3>Production Summary</h3>
              <p className="text-muted">
                Total generation for the selected range along with the peak PV output observed.
              </p>
            </div>
            <div className={styles.kpiStrip}>
              <article>
                <span>Total Production</span>
                <strong>{summary ? summary.production.toFixed(2) : '—'} kWh</strong>
              </article>
              <article>
                <span>Peak PV Output</span>
                <strong>{summary ? summary.peak.toFixed(0) : '—'} W</strong>
              </article>
            </div>
          </div>
          <div className={styles.timeline}>
            {data.powerflow.map((point) => (
              <div key={point.timestamp} className={styles.timelineRow}>
                <span>{new Date(point.timestamp).toLocaleString()}</span>
                <div className={styles.timelineBars}>
                  <div style={{ width: `${Math.min(100, (point.pvW ?? 0) / 50)}%` }} />
                </div>
                <span>{point.pvW?.toFixed(0) ?? '—'} W</span>
              </div>
            ))}
            {data.powerflow.length === 0 && <p className="text-muted">No samples recorded for this range.</p>}
          </div>
        </section>
      )}
    </div>
  );
};

export default HistoryPage;
