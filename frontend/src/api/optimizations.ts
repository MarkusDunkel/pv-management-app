import { httpClient } from './httpClient';

export interface PanelOptimizationRequest {
  electricityCosts: number;
  electricitySellingPrice: number;
  currentCapacity: number;
  performanceRatio: number;
  reininvesttime: number;
  panelcost: number;
}

export interface DiurnalPoint {
  timestamp: string;
  value: number;
}

export interface PanelOptimizationResponse {
  diurnalAggregatedConsumption: DiurnalPoint[];
  diurnalAggregatedProductions: DiurnalPoint[][];
  pvCapacities: number[];
  fitAmounts: number[];
  excessAmounts: number[];
  lackAmounts: number[];
  totalAmounts: number[];
}

export const optimizationApi = {
  async run(powerStationId: number, payload: PanelOptimizationRequest) {
    const { data } = await httpClient.post<PanelOptimizationResponse>(
      `/powerstations/${powerStationId}/optimizations`,
      payload,
    );
    return data;
  },
};
