'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useVehicles, useRoutes } from '@/hooks/useApiHooks';
import { ApiService } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  Car,
  MapPin,
  Clock,
  Fuel,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
  Navigation,
  ExternalLink,
  Plus,
} from 'lucide-react';

export default function VehiclesPage() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [selectedVehiclePositions, setSelectedVehiclePositions] = useState<any | null>(null);
  const [loadingPositions, setLoadingPositions] = useState(false);

  const vehicles = useVehicles();
  const routes = useRoutes();

  const handleRefresh = async () => {
    showToast({
      type: 'info',
      title: 'Atualizando veículos...',
      duration: 2000,
    });

    try {
      await vehicles.refetch();
      showToast({
        type: 'success',
        title: 'Veículos atualizados!',
        message: 'Lista de veículos atualizada com sucesso',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erro na atualização',
        message: 'Não foi possível atualizar os veículos',
      });
    }
  };

  // Map backend field names to frontend expectations
  const apiVehicles = (vehicles.data || []).map((v: any) => ({
    ...v,
    code: v.Code || v.code,
    name: v.Name || v.name,
    plate: v.LicensePlate || v.plate,
    id: v.Code || v.id,
    status: v.status || 'active', // Default since backend doesn't provide status
  }));

  const filteredVehicles = apiVehicles.filter((vehicle: any) => {
    const plate = String(vehicle.plate || '').toLowerCase();
    const name = String(vehicle.name || '').toLowerCase();
    const code = String(vehicle.code || vehicle.id || '').toLowerCase();
    const vStatus = String(vehicle.status || '').toLowerCase();

    const term = searchTerm.toLowerCase();
    const matchesSearch = plate.includes(term) || name.includes(term) || code.includes(term);
    const matchesStatus = statusFilter === 'all' || vStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Function to find routes for a specific vehicle
  const findVehicleRoutes = (vehicleCode: string) => {
    const routesData = routes.data || [];
    // Since routes don't have vehicle association in the API response,
    // we'll show all available routes for now
    return routesData.map((route: any) => ({
      ...route,
      code: route.Code || route.code,
      name: route.Name || route.name,
      description: route.Description || route.description,
    }));
  };

  const handleVehicleRouteSearch = (vehicle: any) => {
    const vehicleRoutes = findVehicleRoutes(vehicle.code);
    setSelectedVehicle({ ...vehicle, routes: vehicleRoutes });
    
    showToast({
      type: 'info',
      title: `Rotas para ${vehicle.plate}`,
      message: `Encontradas ${vehicleRoutes.length} rotas disponíveis`,
    });
  };

  const handleVehiclePositionSearch = async (vehicle: any) => {
    setLoadingPositions(true);
    
    try {
      const result = await ApiService.getVehiclePositions(vehicle.code);
      
      if (result.error) {
        // Verificar se é erro 422 (veículo não autorizado)
        if (result.error.includes('422')) {
          setSelectedVehiclePositions({
            vehicle,
            error: 'not_authorized',
            positions: []
          });
          
          showToast({
            type: 'warning',
            title: 'Veículo não autorizado',
            message: `O veículo ${vehicle.plate} não está cadastrado nas unidades autorizadas`,
          });
        } else {
          showToast({
            type: 'error',
            title: 'Erro ao buscar posições',
            message: result.error,
          });
        }
      } else {
        // Mapear dados da resposta
        const positionsData = Array.isArray(result.data) ? result.data : [];
        const allPositions = positionsData.map((pos: any) => ({
          ...pos,
          latitude: pos.Latitude,
          longitude: pos.Longitude,
          positionTime: pos.PositionTime,
          landmark: pos.Landmark,
          velocity: pos.Velocity,
          odometer: pos.Odometer,
          vehicleName: pos.VehicleName,
          county: pos.County,
          uf: pos.UF,
          ignition: pos.VehicleIgnition,
        }));

        // Remover posições duplicadas baseado em coordenadas e timestamp
        const uniquePositions = allPositions.filter((position, index, array) => {
          return array.findIndex(p => 
            p.latitude === position.latitude && 
            p.longitude === position.longitude && 
            p.positionTime === position.positionTime
          ) === index;
        });

        // Ordenar por timestamp mais recente primeiro
        const positions = uniquePositions.sort((a, b) => 
          new Date(b.positionTime).getTime() - new Date(a.positionTime).getTime()
        );

        setSelectedVehiclePositions({
          vehicle,
          positions,
          error: null
        });

        showToast({
          type: 'success',
          title: `Posições de ${vehicle.plate}`,
          message: `Encontradas ${positions.length} posições`,
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erro na requisição',
        message: 'Não foi possível buscar as posições do veículo',
      });
    } finally {
      setLoadingPositions(false);
    }
  };

  const handleAuthorizeVehicle = async (vehicle: any) => {
    try {
      const result = await ApiService.addAuthorizedVehicle(vehicle.code);
      
      if (result.error) {
        showToast({
          type: 'error',
          title: 'Erro ao autorizar veículo',
          message: result.error,
        });
      } else {
        showToast({
          type: 'success',
          title: 'Veículo autorizado!',
          message: `${vehicle.plate} foi cadastrado nas unidades autorizadas`,
        });
        
        // Tentar buscar posições novamente
        setTimeout(() => {
          handleVehiclePositionSearch(vehicle);
        }, 1000);
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erro na autorização',
        message: 'Não foi possível autorizar o veículo',
      });
    }
  };

  const generateGoogleMapsLink = (latitude: number, longitude: number, label: string) => {
    return `https://www.google.com/maps/place/${latitude},${longitude}/@${latitude},${longitude},15z/data=!3m1!4b1!4m5!3m4!1s0x0:0x0!8m2!3d${latitude}!4d${longitude}?entry=ttu&g_ep=EgoyMDI1MDkyOS4wIKXMDSoASAFQAw%3D%3D`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-red-600 bg-red-50';
      case 'maintenance': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <AlertCircle className="w-4 h-4" />;
      case 'maintenance': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Veículos</h1>
            <p className="text-slate-600">Gerenciamento da frota de veículos</p>
            {vehicles.lastUpdated && (
              <p className="text-sm text-slate-500 mt-1">
                Última atualização: {vehicles.lastUpdated.toLocaleString('pt-BR')}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={vehicles.loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${vehicles.loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
            <div className="text-sm text-slate-600">
              Total: {apiVehicles.length} veículos
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
                placeholder="Buscar por placa, nome, código ou código do veículo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="maintenance">Manutenção</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.loading ? (
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
            filteredVehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id || vehicle.code || String(index)}
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
                          <h3 className="font-semibold text-slate-900">{vehicle.plate || '—'}</h3>
                          <p className="text-sm text-slate-600">{vehicle.code || vehicle.id}</p>
                        </div>
                      </div>
                      {(() => {
                        const status = (vehicle.status || '').toLowerCase();
                        return (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(status)}`}>
                            {getStatusIcon(status)}
                            <span className="capitalize">{status ? (status === 'active' ? 'Ativo' : status === 'inactive' ? 'Inativo' : status) : 'Ativo'}</span>
                          </span>
                        );
                      })()}
                    </div>

                    {/* Vehicle Info */}
                    <div className="space-y-2">
                      {vehicle.name && (
                        <p className="text-sm text-slate-600">{vehicle.name}</p>
                      )}
                      
                      {vehicle.Address && (
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span>Endereço: {vehicle.Address}</span>
                        </div>
                      )}

                      {vehicle.PositionTime && (
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(vehicle.PositionTime).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      )}
                      
                      {/* Vehicle Action Buttons */}
                      <div className="space-y-2">
                        <button
                          onClick={() => handleVehicleRouteSearch(vehicle)}
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors w-full"
                        >
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">Buscar Rotas</span>
                        </button>
                        
                        <button
                          onClick={() => handleVehiclePositionSearch(vehicle)}
                          disabled={loadingPositions}
                          className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors w-full disabled:opacity-50"
                        >
                          <Navigation className="w-4 h-4" />
                          <span className="text-sm">
                            {loadingPositions ? 'Carregando...' : 'Ver Posições'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    {vehicle.ObcProfileName && (
                      <div className="text-xs text-slate-500 pt-2 border-t">
                        Perfil OBC: {vehicle.ObcProfileName}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {!vehicles.loading && filteredVehicles.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum veículo encontrado</h3>
              <p className="text-slate-600">Tente ajustar os filtros de busca.</p>
            </div>
          </Card>
        )}

        {/* Vehicle Routes Modal */}
        {selectedVehicle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="text-xl font-bold">Rotas para {selectedVehicle.plate}</h2>
                  <p className="text-slate-600">Código: {selectedVehicle.code}</p>
                </div>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-4">
                {selectedVehicle.routes && selectedVehicle.routes.length > 0 ? (
                  <div className="space-y-3">
                    {selectedVehicle.routes.map((route: any, index: number) => (
                      <div key={route.code || index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{route.name}</h3>
                            <p className="text-sm text-slate-600">Código: {route.code}</p>
                            {route.description && (
                              <p className="text-sm text-slate-500 mt-1">{route.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">Nenhuma rota encontrada para este veículo.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Vehicle Positions Modal */}
        {selectedVehiclePositions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="text-xl font-bold">Posições de {selectedVehiclePositions.vehicle.plate}</h2>
                  <p className="text-slate-600">Código: {selectedVehiclePositions.vehicle.code}</p>
                </div>
                <button
                  onClick={() => setSelectedVehiclePositions(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-4">
                {selectedVehiclePositions.error === 'not_authorized' ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Veículo não autorizado</h3>
                    <p className="text-slate-600 mb-6">
                      Este veículo não está cadastrado na lista de unidades autorizadas.
                    </p>
                    <button
                      onClick={() => handleAuthorizeVehicle(selectedVehiclePositions.vehicle)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Cadastrar Veículo</span>
                    </button>
                  </div>
                ) : selectedVehiclePositions.positions && selectedVehiclePositions.positions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-blue-700">
                        <strong>{selectedVehiclePositions.positions.length}</strong> posições encontradas 
                        (duplicatas removidas, ordenadas por mais recentes)
                      </p>
                    </div>
                    
                    {selectedVehiclePositions.positions.map((position: any, index: number) => (
                      <div key={`${position.latitude}-${position.longitude}-${position.positionTime}-${index}`} className="p-4 border rounded-lg hover:bg-slate-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center space-x-2">
                              <Navigation className="w-5 h-5 text-blue-600" />
                              <h3 className="font-medium">{position.vehicleName?.trim() || selectedVehiclePositions.vehicle.plate}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${position.ignition === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {position.ignition === 1 ? 'Ligado' : 'Desligado'}
                              </span>
                              {position.velocity > 0 && (
                                <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
                                  Em movimento
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="space-y-1">
                                <p className="font-medium text-slate-700">Localização</p>
                                <p><strong>Coordenadas:</strong> {position.latitude?.toFixed(6)}, {position.longitude?.toFixed(6)}</p>
                                <p><strong>Local:</strong> {position.landmark || 'Não informado'}</p>
                                <p><strong>Cidade:</strong> {position.county}, {position.uf}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="font-medium text-slate-700">Dados do Veículo</p>
                                <p><strong>Velocidade:</strong> {position.velocity} km/h</p>
                                <p><strong>Odômetro:</strong> {position.odometer?.toLocaleString() || 0} km</p>
                                <p><strong>Horímetro:</strong> {position.Hourmeter || 0}h</p>
                              </div>
                              <div className="space-y-1">
                                <p className="font-medium text-slate-700">Timestamp</p>
                                <p><strong>Posição:</strong> {new Date(position.positionTime).toLocaleString('pt-BR')}</p>
                                {position.ReceivedTime && (
                                  <p><strong>Recebido:</strong> {new Date(position.ReceivedTime).toLocaleString('pt-BR')}</p>
                                )}
                                <p className="text-xs text-slate-500">
                                  {index === 0 ? '(Mais recente)' : `${Math.abs(new Date(selectedVehiclePositions.positions[0].positionTime).getTime() - new Date(position.positionTime).getTime()) / (1000 * 60)} min atrás`}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            <a
                              href={generateGoogleMapsLink(position.latitude, position.longitude, `${selectedVehiclePositions.vehicle.plate} - ${new Date(position.positionTime).toLocaleString('pt-BR')}`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span className="text-sm">Google Maps</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Navigation className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">Nenhuma posição encontrada para este veículo.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}