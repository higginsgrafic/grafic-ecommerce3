import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Copy } from 'lucide-react';
import SEO from '@/components/SEO';

const demos = [
  {
    title: 'Adidas Demo',
    description: 'Header + mega-menú + layout demo.',
    path: '/adidas-demo',
  },
  {
    title: 'Nike Hero Demo',
    description: 'Hero slider tipus Nike.',
    path: '/nike-hero-demo',
  },
  {
    title: 'Nike: També et pot agradar',
    description: 'Rail/carrusel de recomanacions (demo).',
    path: '/nike-tambe',
  },
];

const routes = [
  {
    group: 'Demos',
    items: demos,
  },
  {
    group: 'Admin Studio',
    items: [
      { title: 'Admin Studio', description: 'Home (eines)', path: '/admin/studio' },
      { title: 'Promotions', description: 'Gestor de promocions', path: '/admin/studio/promotions' },
      { title: 'EC Config', description: 'Configuració e-commerce', path: '/admin/studio/ec-config' },
      { title: 'System Messages', description: 'Missatges del sistema', path: '/admin/studio/system-messages' },
      { title: 'Media', description: 'Gestor de media', path: '/admin/studio/media' },
      { title: 'Visual Optimizer', description: 'Optimització visual', path: '/admin/studio/visual-optimizer' },
      { title: 'Hero', description: 'Configuració del hero', path: '/admin/studio/hero' },
      { title: 'Collections', description: 'Configuració de col·leccions', path: '/admin/studio/collections' },
      { title: 'Mockups', description: 'Gestor de mockups', path: '/admin/studio/mockups' },
      { title: 'Upload', description: 'Pujada de fitxers', path: '/admin/studio/upload' },
      { title: 'Fulfillment', description: 'Gestió de productes Gelato', path: '/admin/studio/fulfillment' },
      { title: 'Fulfillment Settings', description: 'Configuració API/Store Gelato', path: '/admin/studio/fulfillment-settings' },
      { title: 'Gelato Sync', description: 'Sincronització Gelato', path: '/admin/studio/gelato-sync' },
      { title: 'Gelato Blank', description: 'Productes blanc Gelato', path: '/admin/studio/gelato-blank' },
      { title: 'Gelato Templates', description: 'Plantilles Gelato', path: '/admin/studio/gelato-templates' },
      { title: 'Products Overview', description: 'Visió general productes', path: '/admin/studio/products-overview' },
    ],
  },
];

export default function AdminDemosPage() {
  const copyUrl = async (path) => {
    const fullUrl = `${window.location.origin}${path}`;

    const fallbackCopy = () => {
      const ta = document.createElement('textarea');
      ta.value = fullUrl;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    };

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullUrl);
        return;
      }
      fallbackCopy();
    } catch {
      // ignore
    }
  };

  return (
    <>
      <SEO title="Demos" description="Recull de pàgines demo" />

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-[0.18em] text-black/50">ADMIN</div>
          <h1 className="mt-2 text-2xl font-semibold text-black">Demos</h1>
          <div className="mt-1 text-sm text-black/55">Accés ràpid a totes les pàgines demo.</div>
        </div>

        <Link
          to="/admin"
          className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black/80 shadow-sm hover:bg-black/5"
        >
          <ArrowLeft className="h-4 w-4" />
          Tornar
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
        <div className="text-sm font-semibold text-gray-900">Demos disponibles</div>
        <div className="mt-1 text-xs text-gray-600">Accés ràpid a totes les pàgines demo.</div>

        <div className="mt-4 divide-y divide-gray-100">
          {demos.map((demo) => (
            <div key={demo.path} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{demo.title}</div>
                <div className="mt-0.5 text-xs text-gray-600">{demo.description}</div>
                <div className="mt-1 text-[11px] text-gray-400 font-mono">{demo.path}</div>
              </div>

              <Link
                to={demo.path}
                className="shrink-0 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-medium text-white hover:bg-black/90"
              >
                Obrir
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
        <div className="text-sm font-semibold text-gray-900">Rutes</div>
        <div className="mt-1 text-xs text-gray-600">Rutes copiables per obrir-les o compartir-les.</div>

        {routes.map((section) => (
          <div key={section.group} className="mt-5">
            <div className="text-xs font-semibold tracking-[0.16em] text-black/50">{section.group}</div>
            <div className="mt-2 divide-y divide-gray-100">
              {section.items.map((r) => (
                <div key={`${section.group}-${r.path}`} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{r.title}</div>
                    <div className="mt-0.5 text-xs text-gray-600">{r.description}</div>
                    <div className="mt-1 text-[11px] text-gray-400 font-mono">{r.path}</div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyUrl(r.path)}
                      className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-3 py-2 text-xs font-medium text-black/80 hover:bg-black/5"
                      aria-label={`Copiar ${r.path}`}
                      title="Copiar URL"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copiar
                    </button>
                    <Link
                      to={r.path}
                      className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-medium text-white hover:bg-black/90"
                    >
                      Obrir
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
