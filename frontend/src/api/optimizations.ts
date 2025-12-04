import { httpClient } from './httpClient';

export interface PanelOptimizationRequest {
  electricityCosts: number;
  electricitySellingPrice: number;
  currentCapacity: number;
  reininvesttime: number;
  panelcost: number;
}

export interface DiurnalPoint {
  timestamp: string;
  value: number;
}

export interface PanelOptimizationResponse {
  diurnalConsumptionProfile: DiurnalPoint[];
  diurnalProductionProfiles: DiurnalPoint[][];
  pvCapacities: number[];
  fitAmounts: number[];
  excessAmounts: number[];
  lackAmounts: number[];
  totalAmounts: number[];
  request: PanelOptimizationRequest;
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
