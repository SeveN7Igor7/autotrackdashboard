'use client';

import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useVehicles } from '@/hooks/useApiHooks';
import { motion } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Clock,
  Zap,
  Fuel,
  Thermometer,
  Search,
  RefreshCw,
  Car,
  Activity,
  Map,
} from 'lucide-react';

// As posições são derivadas do último ponto (lastPosition) de cada veículo fornecido pela API.

export default function PositionsPage() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');

  const vehicles = useVehicles();

  const handleRefresh = async () => {
    showToast({
      type: 'info',
      title: 'Atualizando posições...',
      duration: 2000,
    });

    try {
      await vehicles.refetch();
      showToast({
        type: 'success',
        title: 'Posições atualizadas!',
        message: 'Dados de rastreamento atualizados com sucesso',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erro na atualização',
        message: 'Não foi possível atualizar as posições',
      });
    }
  };

  // Deriva lista de posições a partir da API de veículos
  const positions = useMemo(() => {
    const list: any[] = [];
    const data = vehicles.data || [];
    for (const v of data as any[]) {
      const lp = v.lastPosition || null;
      if (!lp || typeof lp.latitude !== 'number' || typeof lp.longitude !== 'number') continue;
      list.push({
        id: v.id || v.code,
        vehicleCode: v.code || v.id || '',
        vehiclePlate: v.plate || v.placa || '',
        latitude: lp.latitude,
        longitude: lp.longitude,
        speed: lp.speed ?? 0,
        heading: lp.heading ?? undefined,
        timestamp: lp.timestamp || lp.dataHora || new Date().toISOString(),
        address: lp.address || lp.endereco || '',
        fuel: lp.fuel ?? undefined,
        temperature: lp.temperature ?? undefined,
        odometer: lp.odometer ?? undefined,
        engineStatus: lp.engineStatus ?? lp.ignition ?? undefined,
      });
    }
    return list;
  }, [vehicles.data]);

  const filteredPositions = positions.filter((position: any) => {
    const term = searchTerm.toLowerCase();
    const plate = (position.vehiclePlate || '').toLowerCase();
    const code = (position.vehicleCode || '').toLowerCase();
    const address = (position.address || '').toLowerCase();
    const matchesSearch = plate.includes(term) || code.includes(term) || address.includes(term);
    const matchesVehicle = selectedVehicle === 'all' || position.vehicleCode === selectedVehicle;
    return matchesSearch && matchesVehicle;
  });

  const getSpeedColor = (speed: number) => {
    if (speed === 0) return 'text-red-600 bg-red-50';
    if (speed <= 60) return 'text-green-600 bg-green-50';
    if (speed <= 80) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getFuelColor = (fuel: number) => {
    if (fuel >= 50) return 'text-green-600';
    if (fuel >= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const getTimeDiff = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000 / 60);
    
    if (diff < 1) return 'Agora';
    if (diff === 1) return '1 min atrás';
    if (diff < 60) return `${diff} min atrás`;
    
    const hours = Math.floor(diff / 60);
    if (hours === 1) return '1h atrás';
    return `${hours}h atrás`;
  };

  const isLoading = vehicles.loading;
  const movingCount = positions.filter((p: any) => (p.speed ?? 0) > 0).length;
  const stoppedCount = positions.filter((p: any) => (p.speed ?? 0) === 0).length;
  const engineOnCount = positions.filter((p: any) => p.engineStatus === true).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Posições</h1>
            <p className="text-slate-600">Rastreamento em tempo real dos veículos</p>
            {vehicles.lastUpdated && (
              <p className="text-sm text-slate-500 mt-1">
                Última atualização: {vehicles.lastUpdated.toLocaleString('pt-BR')}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-500" />
              <span className="text-sm text-slate-600">Rastreamento Ativo</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por placa, código ou endereço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Car className="w-5 h-5 text-slate-400" />
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Veículos</option>
                {positions.map((position: any) => (
                  <option key={position.vehicleCode} value={position.vehicleCode}>
                    {position.vehiclePlate || '—'} - {position.vehicleCode}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Navigation className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Em Movimento</p>
                <p className="text-2xl font-bold text-slate-900">{movingCount}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Parados</p>
                <p className="text-2xl font-bold text-slate-900">{stoppedCount}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Motor Ligado</p>
                <p className="text-2xl font-bold text-slate-900">{engineOnCount}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Map className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Rastreado</p>
                <p className="text-2xl font-bold text-slate-900">{positions.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Positions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-6 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
              </Card>
            ))
          ) : (
            filteredPositions.map((position: any, index: number) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer">
                  <div className="space-y-4">
                    {/* Vehicle Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Car className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{position.vehiclePlate}</h3>
                          <p className="text-sm text-slate-600">{position.vehicleCode}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSpeedColor(position.speed ?? 0)}`}>
                        {position.speed ?? 0} km/h
                      </span>
                    </div>

                    {/* Position Info */}
                    <div className="space-y-2">
                      {position.address && (
                        <div className="flex items-start space-x-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="break-words">{position.address}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Navigation className="w-4 h-4" />
                        <span>{formatCoordinates(position.latitude, position.longitude)}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        {position.fuel !== undefined && (
                          <div className="flex items-center space-x-2">
                            <Fuel className={`w-4 h-4 ${getFuelColor(position.fuel)}`} />
                            <span className="text-sm text-slate-600">{position.fuel}%</span>
                          </div>
                        )}
                        
                        {position.temperature !== undefined && (
                          <div className="flex items-center space-x-2">
                            <Thermometer className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{position.temperature}°C</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Zap className={`w-4 h-4 ${position.engineStatus ? 'text-green-500' : 'text-red-500'}`} />
                          <span className="text-sm text-slate-600">
                            {position.engineStatus ? 'Ligado' : 'Desligado'}
                          </span>
                        </div>
                        
                        {position.odometer && (
                          <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{position.odometer.toLocaleString()} km</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeDiff(position.timestamp)}</span>
                      </div>
                      <span>{new Date(position.timestamp).toLocaleTimeString('pt-BR')}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {!isLoading && filteredPositions.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma posição encontrada</h3>
              <p className="text-slate-600">Tente ajustar os filtros de busca.</p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}