import { httpClient } from './httpClient';

export interface CurrentMeasurementsDto {
  timestamp: string;
  pvPowerW: number | null;
  batteryPowerW: number | null;
  loadPowerW: number | null;
  gridPowerW: number | null;
  stateOfCharge: number | null;
  inverters: Array<{
    serialNumber: string;
    name: string;
    status: string;
    pacW: number | null;
    etotalKWh: number | null;
    temperatureC: number | null;
    socPercent: number | null;
  }>;
  kpi: {
    powerStationName: string;
    kpiTimestamp: string;
    productionTodayKWh: number | null;
    totalProductionKWh: number | null;
    pacW: number | null;
    yieldRate: number | null;
    dayIncomeEur: number | null;
  } | null;
}

export interface ForecastDto {
  forecastDate: string;
  summaryDay: string;
  summaryNight: string;
  pop: number | null;
  uvIndex: number | null;
  temperatureMin: number | null;
  temperatureMax: number | null;
  windDirection: string | null;
  windSpeedKph: number | null;
}

export interface DashboardSummaryDto {
  powerStation: {
    id: number;
    stationname: string;
    capacityKWp: number | null;
    batteryCapacityKWh: number | null;
    status: string | null;
  };
  currentMeasurements: CurrentMeasurementsDto | null;
  forecast: ForecastDto[];
}

export const dashboardApi = {
  async getDashboard(powerStationId: number) {
    const { data } = await httpClient.get<DashboardSummaryDto>(`/powerstations/${powerStationId}/dashboard`);
    return data;
  },
  async getCurrent(powerStationId: number) {
    const { data } = await httpClient.get<CurrentMeasurementsDto>(`/measurements/current/${powerStationId}`);
    return data;
  }
};
