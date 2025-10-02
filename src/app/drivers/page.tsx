'use client';

import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useDrivers, useDriverStatus } from '@/hooks/useApiHooks';
import { motion } from 'framer-motion';
import { type Driver as ApiDriver } from '@/lib/api';
import {
  Users,
  User,
  Clock,
  MapPin,
  Phone,
  Mail,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  UserCheck,
} from 'lucide-react';

export default function DriversPage() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Using hooks for data fetching
  const drivers = useDrivers();
  const driverStatus = useDriverStatus();

  const handleRefresh = async () => {
    showToast({
      type: 'info',
      title: 'Atualizando motoristas...',
      duration: 2000,
    });

    try {
      await Promise.all([drivers.refetch(), driverStatus.refetch()]);
      showToast({
        type: 'success',
        title: 'Dados atualizados!',
        message: 'Informações dos motoristas foram atualizadas',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erro na atualização',
        message: 'Não foi possível atualizar os dados',
      });
    }
  };

  // Map backend field names to frontend expectations
  const apiDrivers = useMemo(() => {
    return ((drivers.data as any[]) || []).map((d: any) => ({
      ...d,
      code: d.Code || d.code,
      name: d.Name || d.name,
      id: d.Code || d.id,
      cpf: d.DriverCPF || d.cpf,
      status: d.status || 'active', // Default since backend doesn't provide status
    }));
  }, [drivers.data]);

  const filteredDrivers = apiDrivers.filter((driver: any) => {
    const name = String(driver.name || '').toLowerCase();
    const code = String(driver.code || driver.id || '').toLowerCase();
    const cpf = String(driver.cpf || '').toLowerCase();
    const status = String(driver.status || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch = name.includes(term) || code.includes(term) || cpf.includes(term);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'offline': return 'text-red-600 bg-red-50';
      case 'break': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'offline': return <AlertCircle className="w-4 h-4" />;
      case 'break': return <Clock className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'offline': return 'Offline';
      case 'break': return 'Pausa';
      default: return status;
    }
  };

  const isLoading = drivers.loading || driverStatus.loading;
  const activeCount = apiDrivers.filter(d => (d.status || '').toLowerCase() === 'active').length;
  const breakCount = apiDrivers.filter(d => (d.status || '').toLowerCase() === 'break').length;
  const offlineCount = apiDrivers.filter(d => (d.status || '').toLowerCase() === 'offline').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Motoristas</h1>
            <p className="text-slate-600">Gerenciamento e monitoramento de motoristas</p>
            {drivers.lastUpdated && (
              <p className="text-sm text-slate-500 mt-1">
                Última atualização: {drivers.lastUpdated.toLocaleString('pt-BR')}
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
              Total: {filteredDrivers.length} motoristas
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
                placeholder="Buscar por nome, código ou CNH..."
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
                <option value="offline">Offline</option>
                <option value="break">Em Pausa</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Ativos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {activeCount}
                </p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Em Pausa</p>
                <p className="text-2xl font-bold text-slate-900">
                  {breakCount}
                </p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Offline</p>
                <p className="text-2xl font-bold text-slate-900">
                  {offlineCount}
                </p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">{apiDrivers.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            filteredDrivers.map((driver, index) => (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer">
                  <div className="space-y-4">
                    {/* Driver Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{driver.name}</h3>
                          <p className="text-sm text-slate-600">{driver.code || driver.id}</p>
                        </div>
                      </div>
                      {(() => {
                        const status = (driver.status || '').toLowerCase();
                        return (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(status)}`}>
                            {getStatusIcon(status)}
                            <span>{status ? getStatusText(status) : '—'}</span>
                          </span>
                        );
                      })()}
                    </div>

                    {/* Driver Info */}
                    <div className="space-y-2">
                      {(driver as any).license && (
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span>CNH: {(driver as any).license}</span>
                        </div>
                      )}
                      
                      {(driver as any).currentVehicle && (
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Users className="w-4 h-4" />
                          <span>Veículo: {(driver as any).currentVehicle}</span>
                        </div>
                      )}

                      {(driver as any).phone && (
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4" />
                          <span>{(driver as any).phone}</span>
                        </div>
                      )}

                      {(driver as any).email && (
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{(driver as any).email}</span>
                        </div>
                      )}

                      {(driver as any).workingHours && (
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span>Jornada: {(driver as any).workingHours}</span>
                        </div>
                      )}
                    </div>

                    {/* Last Activity */}
                    {(driver as any).lastLogin && (
                      <div className="text-xs text-slate-500 pt-2 border-t">
                        Último login: {new Date((driver as any).lastLogin).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {!isLoading && filteredDrivers.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum motorista encontrado</h3>
              <p className="text-slate-600">Tente ajustar os filtros de busca.</p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}