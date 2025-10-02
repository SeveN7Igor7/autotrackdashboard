'use client';

import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useRoutes, useTripPlans } from '@/hooks/useApiHooks';
import { motion } from 'framer-motion';
import {
  Route,
  MapPin,
  Clock,
  Car,
  Navigation,
  Search,
  RefreshCw,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Calendar,
  Timer,
} from 'lucide-react';

// Os dados exibidos abaixo são derivados da API real. Campos opcionais só aparecem quando enviados pelo backend.

export default function RoutesPage() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const routes = useRoutes();
  const tripPlans = useTripPlans();

  const handleRefresh = async () => {
    showToast({
      type: 'info',
      title: 'Atualizando rotas...',
      duration: 2000,
    });

    try {
      await Promise.all([routes.refetch(), tripPlans.refetch()]);
      showToast({
        type: 'success',
        title: 'Rotas atualizadas!',
        message: 'Dados de rotas e planos de viagem atualizados',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erro na atualização',
        message: 'Não foi possível atualizar as rotas',
      });
    }
  };

  // Map backend field names to frontend expectations
  const apiRoutes = useMemo(() => {
    return ((routes.data as any[]) || []).map((r: any) => ({
      ...r,
      code: r.Code || r.code,
      name: r.Name || r.name,
      id: r.Code || r.id,
      description: r.Description || r.description,
      tolerance: r.Tolerance || r.tolerance,
      status: r.status || 'active', // Default since backend doesn't provide status
    }));
  }, [routes.data]);

  const filteredRoutes = apiRoutes.filter((route: any) => {
    const name = String(route.name || '').toLowerCase();
    const code = String(route.code || route.id || '').toLowerCase();
    const description = String(route.description || '').toLowerCase();
    const status = String(route.status || '').toLowerCase();

    const term = searchTerm.toLowerCase();
    const matchesSearch = name.includes(term) || code.includes(term) || description.includes(term);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'completed': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'inactive': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'inactive': return 'Inativa';
      case 'completed': return 'Concluída';
      default: return status;
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const formatDistance = (km: number) => {
    return `${km.toLocaleString()} km`;
  };

  const isLoading = routes.loading || tripPlans.loading;
  const activeCount = apiRoutes.filter((r: any) => (r.status || '').toLowerCase() === 'active').length;
  const inactiveCount = apiRoutes.filter((r: any) => (r.status || '').toLowerCase() === 'inactive').length;
  const completedCount = apiRoutes.filter((r: any) => (r.status || '').toLowerCase() === 'completed').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Rotas</h1>
            <p className="text-slate-600">Gerenciamento de rotas e planos de viagem</p>
            {routes.lastUpdated && (
              <p className="text-sm text-slate-500 mt-1">
                Última atualização: {routes.lastUpdated.toLocaleString('pt-BR')}
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
            <div className="text-sm text-slate-600">
              Total: {filteredRoutes.length} rotas
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
                placeholder="Buscar por nome, código, origem ou destino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Route className="w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativas</option>
                <option value="inactive">Inativas</option>
                <option value="completed">Concluídas</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Ativas</p>
                <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Pause className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Inativas</p>
                <p className="text-2xl font-bold text-slate-900">{inactiveCount}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Concluídas</p>
                <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Route className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">{apiRoutes.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-6 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
              </Card>
            ))
          ) : (
            filteredRoutes.map((route: any, index: number) => (
              <motion.div
                key={route.id || String(index)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer">
                  <div className="space-y-4">
                    {/* Route Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Route className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{route.name || '—'}</h3>
                          <p className="text-sm text-slate-600">{route.code || route.id}</p>
                        </div>
                      </div>
                      {(() => {
                        const status = (route.status || '').toLowerCase();
                        return (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(status)}`}>
                            {getStatusIcon(status)}
                            <span>{status ? getStatusText(status) : '—'}</span>
                          </span>
                        );
                      })()}
                    </div>

                    {/* Route Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-green-500" />
                          <span>{route.origin || '—'}</span>
                        </div>
                        <Navigation className="w-4 h-4 text-slate-400" />
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span>{route.destination || '—'}</span>
                        </div>
                      </div>

                      {/* Progress Bar for Active Routes (se fornecida pela API) */}
                      {route.status === 'active' && route.currentProgress !== undefined && (
                        <div>
                          <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                            <span>Progresso</span>
                            <span>{route.currentProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${route.currentProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        {typeof route.distance === 'number' && (
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <Navigation className="w-4 h-4" />
                            <span>{formatDistance(route.distance)}</span>
                          </div>
                        )}
                        
                        {typeof route.estimatedTime === 'number' && (
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <Timer className="w-4 h-4" />
                            <span>{formatTime(route.estimatedTime)}</span>
                          </div>
                        )}

                        {route.assignedVehicle && (
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <Car className="w-4 h-4" />
                            <span>{route.assignedVehicle}</span>
                          </div>
                        )}

                        {route.startTime && (
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(route.startTime).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        )}
                      </div>

                      {/* Waypoints (se fornecidos pela API) */}
                      {route.waypoints && route.waypoints.length > 2 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-slate-500 mb-1">Pontos de Parada:</p>
                          <div className="flex flex-wrap gap-1">
                            {route.waypoints.slice(1, -1).map((waypoint: any, idx: number) => (
                              <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                {waypoint.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timestamps */}
                    <div className="text-xs text-slate-500 pt-2 border-t">
                      {route.status === 'completed' && route.endTime ? (
                        <div className="flex items-center justify-between">
                          <span>Concluída: {new Date(route.endTime).toLocaleString('pt-BR')}</span>
                          <span>Duração: {formatTime(Math.floor((new Date(route.endTime).getTime() - new Date(route.startTime!).getTime()) / 60000))}</span>
                        </div>
                      ) : route.startTime ? (
                        <span>Iniciada: {new Date(route.startTime).toLocaleString('pt-BR')}</span>
                      ) : (
                        <span>Rota programada</span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {!isLoading && filteredRoutes.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Route className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma rota encontrada</h3>
              <p className="text-slate-600">Tente ajustar os filtros de busca.</p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}