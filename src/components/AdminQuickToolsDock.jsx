import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { useAdminTools } from '@/contexts/AdminToolsContext';

export default function AdminQuickToolsDock() {
  const { tools, toggleTool } = useAdminTools();

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[99999] flex items-center gap-2 bg-white/90 backdrop-blur border border-gray-200 shadow-lg rounded-full px-2 py-2 debug-exempt"
      role="toolbar"
      aria-label="Admin quick tools"
    >
      <button
        type="button"
        onClick={() => toggleTool('layoutInspector')}
        className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${tools?.layoutInspector ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        aria-pressed={!!tools?.layoutInspector}
        aria-label="Mostrar/Ocultar inspector de layout"
        title="Inspector de layout"
      >
        <LayoutGrid className="h-5 w-5" />
      </button>
    </div>
  );
}
