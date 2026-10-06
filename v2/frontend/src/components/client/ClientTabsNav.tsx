import React from 'react';
import { Sparkles, Settings, ShieldCheck, CalendarDays, CreditCard } from 'lucide-react';

export type ClientTabId = 'overview' | 'citas' | 'pagos' | 'configuracion' | 'seguridad';

interface ClientTabsNavProps {
  activeTab: ClientTabId;
  onTabChange: (tab: ClientTabId) => void;
  lang?: 'es' | 'en';
}

export const ClientTabsNav: React.FC<ClientTabsNavProps> = ({
  activeTab,
  onTabChange,
  lang = 'es',
}) => {
  const tabs: Array<{
    id: ClientTabId;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: 'overview',
      label: lang === 'en' ? 'Tattoos & Gallery' : 'Tatuajes & Galería',
      icon: <Sparkles size={18} />,
    },
    {
      id: 'citas',
      label: lang === 'en' ? 'Appointments' : 'Citas',
      icon: <CalendarDays size={18} />,
    },
    {
      id: 'pagos',
      label: lang === 'en' ? 'Payments' : 'Pagos',
      icon: <CreditCard size={18} />,
    },
    {
      id: 'configuracion',
      label: lang === 'en' ? 'Settings' : 'Configuración',
      icon: <Settings size={18} />,
    },
    {
      id: 'seguridad',
      label: lang === 'en' ? 'Security & Privacy' : 'Seguridad',
      icon: <ShieldCheck size={18} />,
    },
  ];

  return (
    <nav
      className="flex items-center gap-2 p-1.5 bg-gray-900/90 border border-white/10 rounded-2xl mb-8 backdrop-blur-md overflow-x-auto shadow-xl"
      aria-label="Navegación del panel de cliente"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-primary to-[#ff7a29] text-white shadow-[0_0_20px_rgba(230,81,0,0.45)] ring-1 ring-white/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className={isActive ? 'text-white' : 'text-gray-400'}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
