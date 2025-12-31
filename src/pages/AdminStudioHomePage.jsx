import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Megaphone,
  Construction,
  Image,
  Package,
  MessageSquare,
  Film,
  Layers,
  Boxes,
  Settings,
  ImageIcon,
  Database,
  Upload
} from 'lucide-react';
import SEO from '@/components/SEO';
import { useAdminTools } from '@/contexts/AdminToolsContext';

const toolsColumn1 = [
  {
    title: 'Editor de Textos',
    description: 'Edita els textos del lloc web, seccions i contingut estàtic',
    path: '/admin/index',
    icon: FileText,
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Textos de Sistema',
    description: 'Gestiona missatges del sistema, notificacions i feedback de l\'aplicació',
    path: '/admin/system-messages',
    icon: MessageSquare,
    color: 'from-pink-500 to-pink-600',
  },
];

const toolsColumn2 = [
  {
    title: 'Configuració "En Construcció"',
    description: 'Gestiona la pàgina de manteniment i missatges temporals',
    path: '/admin/ec-config',
    icon: Construction,
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    title: 'Gestor de Contingut Visual',
    description: 'Administra imatges, vídeos i altres elements multimèdia',
    path: '/admin/media',
    icon: Image,
    color: 'from-green-500 to-green-600',
  },
];

const toolsColumn3 = [
  {
    title: 'Gestió de Productes Gelato',
    description: 'Sincronitza i gestiona productes amb el servei de fulfillment',
    path: '/admin/fulfillment',
    icon: Package,
    color: 'from-teal-500 to-teal-600',
  },
  {
    title: 'Visualització de Productes',
    description: 'Veure tots els productes mock de Supabase per col·leccions',
    path: '/admin/products-overview',
    icon: Database,
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    title: 'Plantilles Gelato',
    description: 'Explora i configura plantilles de productes disponibles',
    path: '/admin/gelato-templates',
    icon: Boxes,
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Configuració de Fulfillment',
    description: 'Configura l\'API key i el Store ID de Gelato',
    path: '/admin/fulfillment-settings',
    icon: Settings,
    color: 'from-cyan-500 to-cyan-600',
  },
];

const toolsColumn4 = [
  {
    title: 'Gestor de Promocions',
    description: 'Gestiona el banner de promocions i ofertes destacades',
    path: '/admin/promotions',
    icon: Megaphone,
    color: 'from-orange-500 to-orange-600',
  },
  {
    title: 'Configuració del Hero',
    description: 'Gestiona els slides del hero, vídeos i contingut principal',
    path: '/admin/hero',
    icon: Film,
    color: 'from-red-500 to-red-600',
  },
  {
    title: 'Configuració de Col·leccions',
    description: 'Gestiona l\'ordre, visibilitat i configuració de les col·leccions',
    path: '/admin/collections',
    icon: Layers,
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    title: 'Gestor de Mockups',
    description: 'Gestiona les imatges de previsualització dels productes per colors i variants',
    path: '/admin/mockups',
    icon: ImageIcon,
    color: 'from-teal-500 to-teal-600',
  },
  {
    title: 'Upload de Fitxers',
    description: 'Puja fitxers, arxius .zip i carpetes al sistema',
    path: '/admin/upload',
    icon: Upload,
    color: 'from-green-500 to-green-600',
  },
];

export default function AdminStudioHomePage() {
  const { tools, toggleTool } = useAdminTools();

  return (
    <>
      <SEO
        title="Administració"
        description="Panell d'administració i gestió de contingut"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 lg:col-span-1">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Eines ràpides</h2>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => toggleTool('layoutInspector')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${tools.layoutInspector ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'}`}
            >
              <span className="text-sm text-gray-900">Debug</span>
              <span className={`text-xs font-medium ${tools.layoutInspector ? 'text-orange-700' : 'text-gray-500'}`}>{tools.layoutInspector ? 'Activat' : 'Desactivat'}</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Drecera</h2>
          <p className="text-sm text-gray-600">Les icones flotants es mostren a qualsevol pantalla quan estàs en mode admin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[toolsColumn1, toolsColumn2, toolsColumn3, toolsColumn4].map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-4">
            {column.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-gray-300"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                  <div className="relative p-4">
                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${tool.color} shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
                      {tool.title}
                    </h3>

                    <p className="text-gray-600 text-xs leading-relaxed">
                      {tool.description}
                    </p>

                    <div className="mt-3 flex items-center text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                      Accedir
                      <svg
                        className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
