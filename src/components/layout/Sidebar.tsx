'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Car,
  MapPin,
  Users,
  Route,
  AlertTriangle,
  BarChart3,
  Settings,
  Home,
  Package,
  MessageSquare,
  Map,
} from 'lucide-react';

const sidebarItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    name: 'Veículos',
    href: '/vehicles',
    icon: Car,
  },
  /*
  {
    name: 'Posições',
    href: '/positions',
    icon: MapPin,
  },
  */
  {
    name: 'Motoristas',
    href: '/drivers',
    icon: Users,
  },
  {
    name: 'Rotas',
    href: '/routes',
    icon: Route,
  },
  /*
  {
    name: 'Alertas',
    href: '/alerts',
    icon: AlertTriangle,
  },
  */

];

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isOpen ? 256 : 80,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-slate-900 text-white h-full fixed left-0 top-0 z-40 border-r border-slate-800"
    >
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5" />
          </div>
          <motion.div
            initial={false}
            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <h1 className="text-xl font-bold whitespace-nowrap">ATIC Dashboard</h1>
          </motion.div>
        </div>
      </div>

      <nav className="mt-6">
        <div className="px-3">
          {sidebarItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={item.href} prefetch={false}>
                  <div
                    className={cn(
                      'flex items-center space-x-3 px-3 py-3 rounded-lg mb-1 transition-all duration-200',
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <motion.span
                      initial={false}
                      animate={{ 
                        opacity: isOpen ? 1 : 0,
                        width: isOpen ? 'auto' : 0
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>
    </motion.aside>
  );
}