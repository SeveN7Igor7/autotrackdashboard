'use client';

import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useObcCommands } from '@/hooks/useApiHooks';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  Car,
  MapPin,
  Zap,
  Fuel,
  Thermometer,
  Search,
  RefreshCw,
  Filter,
  CheckCircle,
  XCircle,
  Bell,
  Shield,
  Eye,
} from 'lucide-react';

// Os dados são mapeados a partir dos comandos OBC retornados pela API. Campos opcionais são exibidos apenas quando disponíveis.

export default function AlertsPage() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');

  const obcCommands = useObcCommands();

  const handleRefresh = async () => {
    showToast({
      type: 'info',
      title: 'Atualizando alertas...',
      duration: 2000,
    });

    try {
      await obcCommands.refetch();
      showToast({
        type: 'success',
        title: 'Alertas atualizados!',
        message: 'Lista de alertas atualizada com sucesso',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erro na atualização',
        message: 'Não foi possível atualizar os alertas',
      });
    }
  };

  const apiAlerts = useMemo(() => (obcCommands.data as any[]) || [], [obcCommands.data]);
  const filteredAlerts = apiAlerts.filter((alert: any) => {
    const title = (alert.title || alert.command || '').toLowerCase();
    const vehiclePlate = (alert.vehiclePlate || alert.plate || '').toLowerCase();
    const vehicleCode = (alert.vehicleCode || alert.vehicle || alert.vehicleId || '').toLowerCase();
    const location = (alert.location || '').toLowerCase();
    const type = (alert.type || alert.category || '').toLowerCase();
    const severity = (alert.severity || alert.level || '').toLowerCase();
    const status = (alert.status || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch = title.includes(term) || vehiclePlate.includes(term) || vehicleCode.includes(term) || location.includes(term);
    const matchesType = typeFilter === 'all' || type === typeFilter;
    const matchesSeverity = severityFilter === 'all' || severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesType && matchesSeverity && matchesStatus;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <Bell className="w-4 h-4" />;
      case 'medium': return <AlertCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <XCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'speed': return <Zap className="w-5 h-5" />;
      case 'fuel': return <Fuel className="w-5 h-5" />;
      case 'temperature': return <Thermometer className="w-5 h-5" />;
      case 'geofence': return <MapPin className="w-5 h-5" />;
      case 'maintenance': return <Clock className="w-5 h-5" />;
      case 'security': return <Shield className="w-5 h-5" />;
      case 'driver': return <Eye className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-50';
      case 'acknowledged': return 'text-yellow-600 bg-yellow-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertCircle className="w-4 h-4" />;
      case 'acknowledged': return <Eye className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
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
    if (hours < 24) return `${hours}h atrás`;
    
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  const isLoading = obcCommands.loading;
  const obcDisabled = !process.env.NEXT_PUBLIC_ENABLE_OBC_COMMANDS || process.env.NEXT_PUBLIC_ENABLE_OBC_COMMANDS !== 'true';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Alertas</h1>
            <p className="text-slate-600">Monitoramento de alertas e eventos críticos</p>
            {obcCommands.lastUpdated && (
              <p className="text-sm text-slate-500 mt-1">
                Última atualização: {obcCommands.lastUpdated.toLocaleString('pt-BR')}
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
              {filteredAlerts.length} de {apiAlerts.length} alertas
            </div>
          </div>
        </div>

        {obcDisabled && (
          <Card>
            <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800">Comandos OBC desativados</h3>
                <p className="text-yellow-700 text-sm">
                  As chamadas ao endpoint /obccommands estão desativadas. Para habilitar, defina NEXT_PUBLIC_ENABLE_OBC_COMMANDS=true no .env.local e recarregue o app.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar alertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="acknowledged">Reconhecidos</option>
              <option value="resolved">Resolvidos</option>
            </select>
            
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas as Severidades</option>
              <option value="critical">Crítico</option>
              <option value="high">Alto</option>
              <option value="medium">Médio</option>
              <option value="low">Baixo</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Tipos</option>
              <option value="speed">Velocidade</option>
              <option value="fuel">Combustível</option>
              <option value="temperature">Temperatura</option>
              <option value="geofence">Geocerca</option>
              <option value="maintenance">Manutenção</option>
              <option value="security">Segurança</option>
              <option value="driver">Motorista</option>
            </select>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Ativos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {apiAlerts.filter((a: any) => (a.status || '').toLowerCase() === 'active').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Críticos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {apiAlerts.filter((a: any) => (a.severity || a.level || '').toLowerCase() === 'critical').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Reconhecidos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {apiAlerts.filter((a: any) => (a.status || '').toLowerCase() === 'acknowledged').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Resolvidos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {apiAlerts.filter((a: any) => (a.status || '').toLowerCase() === 'resolved').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
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
            filteredAlerts.map((alert: any, index: number) => (
              <motion.div
                key={alert.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`hover:shadow-lg transition-all cursor-pointer border-l-4 ${getSeverityColor((alert.severity || alert.level || '').toLowerCase())}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getSeverityColor((alert.severity || alert.level || '').toLowerCase())}`}>
                        {getTypeIcon((alert.type || alert.category || 'unknown').toLowerCase())}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{alert.title || alert.command || 'Alerta'}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getSeverityColor((alert.severity || alert.level || '').toLowerCase())}`}>
                            {getSeverityIcon((alert.severity || alert.level || '').toLowerCase())}
                            <span className="capitalize">{(alert.severity || alert.level || '').toLowerCase() || 'info'}</span>
                          </span>
                        </div>
                        {alert.description && (
                          <p className="text-slate-600 text-sm mb-2">{alert.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Car className="w-4 h-4" />
                            <span>{(alert.vehiclePlate || alert.plate || '—')} ({alert.vehicleCode || alert.vehicle || alert.vehicleId || '—'})</span>
                          </div>
                          
                          {alert.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{alert.location}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{getTimeDiff(alert.timestamp || alert.createdAt || alert.time || new Date().toISOString())}</span>
                          </div>
                        </div>
                        
                        {alert.value !== undefined && alert.threshold !== undefined && (
                          <div className="mt-2 text-sm">
                            <span className="text-slate-600">
                              Valor: <span className="font-medium">{alert.value}{alert.unit}</span>
                              {' '}(Limite: {alert.threshold}{alert.unit})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor((alert.status || '').toLowerCase())}`}>
                        {getStatusIcon((alert.status || '').toLowerCase())}
                        <span className="capitalize">
                          {(alert.status || '').toLowerCase() === 'active' ? 'Ativo' :
                           (alert.status || '').toLowerCase() === 'acknowledged' ? 'Reconhecido' : 'Resolvido'}
                        </span>
                      </span>
                      
                      <div className="text-xs text-slate-500 text-right">
                        {new Date(alert.timestamp || alert.createdAt || alert.time || Date.now()).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {!isLoading && filteredAlerts.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum alerta encontrado</h3>
              <p className="text-slate-600">Tente ajustar os filtros de busca ou o sistema está operando normalmente.</p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}