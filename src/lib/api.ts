// API Service para comunicação com o backend
// USA PROXY INTERNO PARA EVITAR MIXED CONTENT - SOLUÇÃO DEFINITIVA

// Declare process as global to avoid TypeScript errors
declare const process: {
  env: {
    NEXT_PUBLIC_API_BASE_URL?: string;
    NEXT_PUBLIC_ENABLE_OBC_COMMANDS?: string;
    NODE_ENV?: string;
  };
};

// Função para determinar a URL base da API
const getApiBaseUrl = () => {
  // Se estamos no navegador e a página é HTTPS, usa o proxy interno
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return '/api/proxy'; // Proxy interno que redireciona para HTTP
  }
  
  // Em desenvolvimento ou quando não há problema de mixed content, usa direto
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.111.10:3000';
};

const API_BASE_URL = getApiBaseUrl();
const ENABLE_OBC_COMMANDS = process.env.NEXT_PUBLIC_ENABLE_OBC_COMMANDS === 'true';

console.log('[ApiService] Using API_BASE_URL:', API_BASE_URL);

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Type definitions
export interface Vehicle {
  id: string;
  code: string;
  plate?: string;
  model?: string;
  status?: string;
  lastPosition?: any;
}

export interface Driver {
  id: string;
  name: string;
  code?: string;
  status?: string;
}

export interface Route {
  id: string;
  name: string;
  origin?: string;
  destination?: string;
}

export interface Smartbox {
  id: string;
  code: string;
  status?: string;
}

export interface ObcCommand {
  id: string;
  command: string;
  status?: string;
}

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Backend returns { Data: [...] } but frontend expects { data: [...] }
      // Normalize the response structure
      let normalizedData = responseData;
      if (responseData && typeof responseData === 'object' && responseData.Data) {
        normalizedData = responseData.Data;
      }
      
      return { data: normalizedData };
    } catch (error) {
      console.error('API Error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Métodos para cada endpoint da API
  static async getAccounts() {
    return this.request<any[]>('/accounts');
  }

  static async getVehicles() {
    return this.request<Vehicle[]>('/vehicles');
  }

  static async getVehiclePositions(vehicleCode: string) {
    return this.request(`/vehicles/${vehicleCode}/positions`);
  }

  static async addAuthorizedVehicle(vehicleCode: string) {
    return this.request(`/authorizedvehicles/${vehicleCode}`, {
      method: 'POST',
    });
  }

  static async getVehicleAlerts(vehicleCode: string) {
    return this.request(`/vehicles/${vehicleCode}/expandedalerts`);
  }

  static async getReturnMessages(vehicleCode: string) {
    return this.request(`/vehicles/${vehicleCode}/returnmessages`);
  }

  static async getForwardMessages(vehicleCode: string) {
    return this.request(`/vehicles/${vehicleCode}/forwardmessages`);
  }

  static async getDriverLogs(vehicleCode: string) {
    return this.request(`/vehicles/${vehicleCode}/driverlogs`);
  }

  static async getAuthorizedVehicles() {
    return this.request('/authorizedvehicles');
  }

  static async getSmartboxes() {
    return this.request<Smartbox[]>('/smartboxes');
  }

  static async getSmartboxPositions(smartboxCode: string) {
    return this.request(`/smartboxes/${smartboxCode}/positions`);
  }

  static async getDriverStatus() {
    return this.request<any[]>('/driverstatus');
  }

  static async getDrivers() {
    return this.request<Driver[]>('/drivers');
  }

  static async getRoutes() {
    return this.request<Route[]>('/routes');
  }

  static async getTripPlans() {
    return this.request('/tripplans');
  }

  static async getTrailerIdentifiers() {
    return this.request('/traileridentifiers');
  }

  static async getTrailerEvents(trailerCode: string) {
    return this.request(`/traileridentifier/${trailerCode}/events`);
  }

  static async getInformationRegions() {
    return this.request('/informationregions');
  }

  static async getInformationRegionsLog() {
    return this.request('/informationregionslog');
  }

  static async getObcCommands() {
    // Por solicitação, não executar o endpoint /obccommands no frontend por padrão.
    // Para reativar, defina NEXT_PUBLIC_ENABLE_OBC_COMMANDS=true no .env.local
    if (!ENABLE_OBC_COMMANDS) {
      if (typeof console !== 'undefined') {
        console.warn('[ApiService] OBC commands disabled (no request to /obccommands).');
      }
      return { data: [] as ObcCommand[] };
    }
    return this.request<ObcCommand[]>('/obccommands');
  }

  static async getActivityPoints() {
    return this.request('/activitypoints');
  }

  static async getActivityPoint(pointCode: string) {
    return this.request(`/activitypoints/${pointCode}`);
  }

  static async getActivityPointVehicles(pointCode: string) {
    return this.request(`/activitypoints/${pointCode}/vehicles`);
  }

  static async getVehicleActivityPoints(vehicleCode: string) {
    return this.request(`/activitypoints/vehicles/${vehicleCode}`);
  }
}