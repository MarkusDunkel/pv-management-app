import { httpClient } from './httpClient';

export interface HistoryRequest {
  from: string;
  to: string;
}

export interface HistoryResponse {
  powerflow: Array<{
    timestamp: string;
    pvW: number | null;
    batteryW: number | null;
    loadW: number | null;
    gridW: number | null;
    socPercent: number | null;
  }>;
  inverter: Array<{
    timestamp: string;
    inverterSerial: string;
    pacW: number | null;
    outputPowerW: number | null;
    batteryPowerW: number | null;
  }>;
  dailyKpi: Array<{
    date: string;
    productionKWh: number | null;
    totalProductionKWh: number | null;
  }>;
}

export const historyApi = {
  async fetch(powerStationId: number, range: HistoryRequest) {
    const { data } = await httpClient.post<HistoryResponse>(`/measurements/history/${powerStationId}`, range);
    return data;
  }
};
