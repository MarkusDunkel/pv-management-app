import { create } from 'zustand';

export interface PowerflowPoint {
  timestamp: string;
  pvW: number | null;
  batteryW: number | null;
  loadW: number | null;
  gridW: number | null;
  socPercent: number | null;
}

export type PowerflowHistory = PowerflowPoint[];

export interface DashboardState {
  isLoading: boolean;
  currentPowerflow: PowerflowPoint | null;
  powerflowHistory:  PowerflowPoint[];
  forecast: Array<{ date: string; summary: string; high: number | null; low: number | null }>;
  setLoading: (isLoading: boolean) => void;
  setPowerflowHistory: (history: PowerflowHistory | []) => void;
  setPowerflow: (point: PowerflowPoint | null) => void;
  setForecast: (items: DashboardState['forecast']) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isLoading: false,
  currentPowerflow: null,
  forecast: [],
  powerflowHistory: [],
  setPowerflowHistory: (powerflowHistory) => set({powerflowHistory}),
  setLoading: (isLoading) => set({ isLoading }),
  setPowerflow: (point) => set({ currentPowerflow: point }),
  setForecast: (items) => set({ forecast: items })
}));
