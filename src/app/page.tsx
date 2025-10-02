'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { 
  useVehicles,
  useDrivers,
  useRoutes,
  useSmartboxes,
  useObcCommands
} from '@/hooks/useApiHooks';
import {
  Car,
  Users,
  MapPin,
  AlertTriangle,
  Package,
  Route,
  Activity,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

// Helper function to calculate vehicle status distribution
const calculateVehicleStatus = (vehiclesData: any) => {
  const list: any[] = Array.isArray(vehiclesData) ? vehiclesData : [];
  const statusCounts = { active: 0, inactive: 0, maintenance: 0 };
  
  list.forEach(vehicle => {
    if (vehicle.status === 'active' || vehicle.ativo === true || vehicle.status === 1) {
      statusCounts.active++;
    } else if (vehicle.status === 'maintenance' || vehicle.manutencao === true) {
      statusCounts.maintenance++;
    } else {
      statusCounts.inactive++;
    }
  });
  
  return [
    { name: 'Ativos', value: statusCounts.active, color: '#3b82f6' },
    { name: 'Inativos', value: statusCounts.inactive, color: '#ef4444' },
    { name: 'Manutenção', value: statusCounts.maintenance, color: '#f59e0b' },
  ];
};

// Helper function to generate recent activity from real data
const generateRecentActivity = (vehiclesIn: any, driversIn: any, commandsIn: any) => {
  const vehicles: any[] = Array.isArray(vehiclesIn) ? vehiclesIn : [];
  const drivers: any[] = Array.isArray(driversIn) ? driversIn : [];
  const commands: any[] = Array.isArray(commandsIn) ? commandsIn : [];
  const activities: Array<{
    time: string;
    action: string;
    type: 'info' | 'warning' | 'success';
  }> = [];
  
  
  return activities.slice(0, 4); // Limit to 4 activities
};

export default function Dashboard() {
  const { showToast } = useToast();
  
  // Using custom hooks for data fetching with auto-refresh
  const vehicles = useVehicles();
  const drivers = useDrivers();
  const routes = useRoutes();
  const smartboxes = useSmartboxes();
  const obcCommands = useObcCommands();

  const handleRefreshAll = async () => {
    showToast({
      type: 'info',
      title: 'Atualizando dados...',
      message: 'Carregando informações mais recentes',
      duration: 2000,
    });

    try {
      await Promise.all([
        vehicles.refetch(),
        drivers.refetch(),
        routes.refetch(),
        smartboxes.refetch(),
        obcCommands.refetch(),
      ]);

      showToast({
        type: 'success',
        title: 'Dados atualizados!',
        message: 'Todas as informações foram atualizadas com sucesso',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erro na atualização',
        message: 'Alguns dados não puderam ser atualizados',
      });
    }
  };

  // Calculate stats from real data
  const totalVehicles = vehicles.data?.length || 0;
  const totalDrivers = drivers.data?.length || 0;
  const activeRoutes = routes.data?.length || 0;
  const totalSmartboxes = smartboxes.data?.length || 0;
  const alertsCount = obcCommands.data?.length || 0;

  // Calculate real data for charts
  const vehicleStatusData = calculateVehicleStatus(vehicles.data || []);
  const recentActivity = generateRecentActivity(
    vehicles.data || [], 
    drivers.data || [], 
    obcCommands.data || []
  );

  // Generate monthly data based on current stats (placeholder until historical data is available)
  const monthlyData = [
    { name: 'Atual', vehicles: totalVehicles, alerts: alertsCount }
  ];

  const hasError = vehicles.error || drivers.error || routes.error || smartboxes.error || obcCommands.error;
  const isLoading = vehicles.loading || drivers.loading || routes.loading || smartboxes.loading || obcCommands.loading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Visão geral do sistema de rastreamento ATIC</p>
            {vehicles.lastUpdated && (
              <p className="text-sm text-slate-500 mt-1">
                Última atualização: {vehicles.lastUpdated.toLocaleString('pt-BR')}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefreshAll}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
            <div className="flex items-center space-x-2">
              <Activity className={`w-5 h-5 ${hasError ? 'text-red-500' : 'text-green-500'}`} />
              <span className="text-sm text-slate-600">
                {hasError ? 'Sistema com Problemas' : 'Sistema Online'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total de Veículos"
            value={isLoading ? '...' : totalVehicles}
            icon={Car}
          />
          <StatCard
            title="Motoristas Ativos"
            value={isLoading ? '...' : totalDrivers}
            icon={Users}
          />
          <StatCard
            title="Rotas Ativas"
            value={isLoading ? '...' : activeRoutes}
            icon={Route}
          />
          <StatCard
            title="Comandos OBC"
            value={isLoading ? '...' : alertsCount}
            icon={AlertTriangle}
          />
          <StatCard
            title="Smartboxes"
            value={isLoading ? '...' : totalSmartboxes}
            icon={Package}
          />
        </div>

        {/* Error State */}
        {hasError && (
          <Card>
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">Problemas de Conexão</h3>
                <p className="text-red-700 text-sm">
                  Alguns dados podem não estar atualizados. Verifique a conexão com o servidor.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Estatísticas Atuais" subtitle="Dados em tempo real">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="vehicles" 
                  fill="#3b82f6" 
                  name="Veículos"
                />
                <Bar 
                  dataKey="alerts" 
                  fill="#ef4444" 
                  name="Comandos OBC"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Status da Frota" subtitle="Distribuição por status">
            {vehicleStatusData.some(item => item.value > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={vehicleStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {vehicleStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-4 mt-4">
                  {vehicleStatusData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-slate-600">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-500">
                {isLoading ? 'Carregando dados...' : 'Nenhum dado de veículo disponível'}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <Card title="Atividade Recente" subtitle="Últimas atualizações do sistema">
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <span className="text-sm text-slate-500 min-w-[60px]">{activity.time}</span>
                  <span className="text-sm text-slate-700">{activity.action}</span>
                </motion.div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8 text-slate-500">
                {isLoading ? 'Carregando atividades...' : 'Nenhuma atividade recente encontrada'}
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}