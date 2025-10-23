import { useEffect } from 'react';
import { dashboardApi } from '@/api/dashboard';
import { useDashboardStore } from '@/store/dashboardStore';

export const useDashboardData = (powerStationId: number) => {
  const { setLoading, setPowerflow, setPowerflowHistory, setForecast } = useDashboardStore();

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const summary = await dashboardApi.getDashboard(powerStationId);
        if (!active) return;

        if (summary.currentMeasurements) {
          const current = summary.currentMeasurements;
          setPowerflow({
            timestamp: current.timestamp,
            pvW: current.pvPowerW ?? null,
            batteryW: current.batteryPowerW ?? null,
            loadW: current.loadPowerW ?? null,
            gridW: current.gridPowerW ?? null,
            socPercent: current.stateOfCharge ?? null,
          });
        }

        if (Array.isArray(summary.history)) {
          setPowerflowHistory(
            summary.history.map((point) => ({
              timestamp: point.timestamp,
              pvW: point.pvW ?? null,
              batteryW: point.batteryW ?? null,
              loadW: point.loadW ?? null,
              gridW: point.gridW ?? null,
              socPercent: point.socPercent ?? null,
            })),
          );
        }

        if (Array.isArray(summary.forecast)) {
          setForecast(
            summary.forecast.map((item) => ({
              date: item.forecastDate,
              summary: item.summaryDay,
              high: item.temperatureMax ?? null,
              low: item.temperatureMin ?? null,
            })),
          );
        }
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    load();
    const interval = window.setInterval(load, 60_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [powerStationId, setForecast, setLoading, setPowerflow, setPowerflowHistory]);
};
