import { ApiService } from '@/lib/api';
import { useApi } from './useApi';

// Global auto-refresh control via env
const AUTO_REFRESH_ENABLED = process.env.NEXT_PUBLIC_ENABLE_AUTO_REFRESH === 'true';
const REFRESH_10 = AUTO_REFRESH_ENABLED ? 10000 : 0;
const REFRESH_30 = AUTO_REFRESH_ENABLED ? 30000 : 0;
const REFRESH_60 = AUTO_REFRESH_ENABLED ? 60000 : 0;

// Hook para veículos
export function useVehicles(autoRefresh = REFRESH_30) {
  return useApi(() => ApiService.getVehicles(), autoRefresh);
}

// Hook para motoristas
export function useDrivers(autoRefresh = REFRESH_60) {
  return useApi(() => ApiService.getDrivers(), autoRefresh);
}

// Hook para status dos motoristas
export function useDriverStatus(autoRefresh = REFRESH_30) {
  return useApi(() => ApiService.getDriverStatus(), autoRefresh);
}

// Hook para rotas
export function useRoutes() {
  return useApi(() => ApiService.getRoutes());
}

// Hook para planos de viagem
export function useTripPlans() {
  return useApi(() => ApiService.getTripPlans());
}

// Hook para smartboxes
export function useSmartboxes(autoRefresh = REFRESH_60) {
  return useApi(() => ApiService.getSmartboxes(), autoRefresh);
}

// Hook para veículos autorizados
export function useAuthorizedVehicles() {
  return useApi(() => ApiService.getAuthorizedVehicles());
}

// Hook para áreas de informação
export function useInformationRegions() {
  return useApi(() => ApiService.getInformationRegions());
}

// Hook para log de áreas
export function useInformationRegionsLog() {
  return useApi(() => ApiService.getInformationRegionsLog());
}

// Hook para comandos OBC
export function useObcCommands() {
  return useApi(() => ApiService.getObcCommands());
}

// Hook para posições específicas de um veículo
export function useVehiclePositions(vehicleCode: string) {
  return useApi(() => ApiService.getVehiclePositions(vehicleCode));
}