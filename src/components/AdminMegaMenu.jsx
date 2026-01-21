import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';

function normalizeText(value) {
  return (value || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function groupFilter(groups, query) {
  const q = normalizeText(query).trim();
  if (!q) return groups;
  return groups
    .map((g) => {
      const items = (g.items || []).filter((it) => {
        const label = typeof it.label === 'string' ? it.label : '';
        const hay = normalizeText(`${label} ${it.path || ''}`);
        return hay.includes(q);
      });
      return { ...g, items };
    })
    .filter((g) => (g.items || []).length > 0);
}

function MenuSection({ title, items, onNavigate }) {
  return (
    <div className="border-l border-border">
      <div className="pl-3 pr-4 text-xs font-semibold text-foreground uppercase tracking-wide">{title}</div>
      <div className="mt-2">
        {items.map((it) => (
          <Link
            key={it.path}
            to={it.path}
            title={it.path}
            onClick={onNavigate}
            className="flex items-start gap-3 pl-3 pr-4 py-2 text-sm font-light text-foreground hover:bg-muted/60"
          >
            <span className="min-w-0 flex-1 whitespace-normal break-words text-left">{it.label}</span>
            <span className="mt-0.5 text-xs text-muted-foreground">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function AdminMegaMenu({ className = '' }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const groups = useMemo(
    () => [
      {
        title: 'Controls globals',
        items: [{ label: 'Tema / Controls', path: '/admin/controls' }],
      },
      {
        title: 'Storefront',
        items: [
          { label: 'Promocions', path: '/admin/promotions' },
          { label: 'Hero', path: '/admin/hero' },
          { label: 'Col·leccions', path: '/admin/collections' },
        ],
      },
      {
        title: 'Contingut',
        items: [
          { label: 'Editor de Textos', path: '/admin/index' },
          { label: 'Textos de Sistema', path: '/admin/system-messages' },
        ],
      },
      {
        title: 'Catàleg / Assets',
        items: [
          { label: 'Media', path: '/admin/media' },
          { label: 'Mockups', path: '/admin/mockups' },
          { label: 'Upload', path: '/admin/upload' },
        ],
      },
      {
        title: 'Operació',
        items: [
          { label: 'Fulfillment', path: '/admin/fulfillment' },
          { label: 'Fulfillment Settings', path: '/admin/fulfillment-settings' },
          { label: 'Gelato Sync', path: '/admin/gelato-sync' },
          { label: 'Gelato Blank', path: '/admin/gelato-blank' },
          { label: 'Gelato Templates', path: '/admin/gelato-templates' },
          { label: 'Products Overview', path: '/admin/products-overview' },
        ],
      },
      {
        title: 'Utilitats',
        items: [
          { label: 'Demos', path: '/admin/demos' },
          { label: 'Unitats', path: '/admin/unitats' },
          { label: 'EC Config', path: '/admin/ec-config' },
        ],
      },
    ],
    []
  );

  const filtered = useMemo(() => groupFilter(groups, query), [groups, query]);

  const isHome = location.pathname === '/admin';

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          onClick={() => setOpen(true)}
          aria-label="Obrir mega-menú d'admin"
        >
          <Menu className="h-4 w-4" />
          Menú
        </button>

        {isHome ? null : (
          <Link
            to="/admin"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Inici
          </Link>
        )}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[9999]">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/30"
            onClick={close}
            aria-label="Tancar mega-menú"
          />

          <div className="absolute left-1/2 top-6 w-[min(1100px,calc(100vw-32px))] -translate-x-1/2 rounded-lg border border-border bg-background shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">Admin</div>
                <div className="text-xs text-muted-foreground">{location.pathname}</div>
              </div>

              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-muted"
                onClick={close}
                aria-label="Tancar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-4 py-3 border-b border-border">
              <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cerca..."
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </label>
            </div>

            <div className="grid gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((g) => (
                <MenuSection
                  key={g.title}
                  title={g.title}
                  items={g.items}
                  onNavigate={close}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
