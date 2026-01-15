import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from '@/components/SEO';

export default function DevLinksPage() {
  const location = useLocation();
  const [selectedByPath, setSelectedByPath] = useState({});
  const [copyStatus, setCopyStatus] = useState('idle');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('devLinks:selectedByPath');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') setSelectedByPath(parsed);
    } catch {
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('devLinks:selectedByPath', JSON.stringify(selectedByPath));
    } catch {
    }
  }, [selectedByPath]);

  const getTagsForPath = (path, groupTitle, manualTags = []) => {
    const tags = new Set(manualTags);
    const p = String(path || '');

    if (groupTitle === 'Demos') tags.add('DEMO');
    if (groupTitle === 'Admin') tags.add('ADMIN');
    if (groupTitle === 'Utility') tags.add('UTIL');

    if (p.includes('/tmp')) tags.add('TMP');
    if (p.includes('dev')) tags.add('DEV');
    if (p.startsWith('/admin')) tags.add('ADMIN');

    return Array.from(tags);
  };

  const badgeClassByTag = {
    ADMIN: 'border-orange-500/30 bg-orange-500/10 text-orange-800',
    DEMO: 'border-[#337AC6]/35 bg-[#337AC6]/10 text-[#0f172a]',
    DEV: 'border-violet-500/30 bg-violet-500/10 text-violet-800',
    TMP: 'border-amber-500/30 bg-amber-500/10 text-amber-800',
    UTIL: 'border-slate-500/25 bg-slate-500/10 text-slate-800',
    WIP: 'border-red-500/30 bg-red-500/10 text-red-800',
    LEGACY: 'border-black/20 bg-black/5 text-black/70',
  };

  const groups = useMemo(
    () => [
      {
        title: 'Demos',
        items: [
          { path: '/adidas-demo', label: 'Adidas Demo' },
          { path: '/adidas-stripe-zoom-dev', label: 'Adidas Stripe Zoom Dev' },
          { path: '/nike-hero-demo', label: 'Nike Hero Demo' },
          { path: '/nike-tambe', label: 'Nike: També et pot agradar' },
        ],
      },
      {
        title: 'Admin',
        items: [
          { path: '/admin-login', label: 'Admin Login' },
          { path: '/admin', label: 'Admin Studio' },
          { path: '/admin/demos', label: 'Admin Demos' },
          { path: '/admin/index', label: 'Admin Index' },
          { path: '/admin/ec-config', label: 'Admin EC Config' },
          { path: '/admin/media', label: 'Admin Media' },
          { path: '/admin/visual-optimizer', label: 'Admin Visual Optimizer' },
          { path: '/admin/collections', label: 'Admin Collections' },
          { path: '/admin/mockups', label: 'Admin Mockups' },
          { path: '/admin/upload', label: 'Admin Upload' },
          { path: '/admin/gelato-sync', label: 'Admin Gelato Sync' },
          { path: '/admin/gelato-blank', label: 'Admin Gelato Blank Products' },
          { path: '/admin/gelato-templates', label: 'Admin Gelato Templates' },
          { path: '/admin/products-overview', label: 'Admin Products Overview' },
          { path: '/admin/hero', label: 'Admin Hero Settings' },
          { path: '/admin/apps', label: 'Admin Apps' },
          { path: '/admin/documentation', label: 'Admin Documentation' },
          { path: '/admin/fulfillment', label: 'Admin Fulfillment' },
          { path: '/admin/fulfillment-settings', label: 'Admin Fulfillment Settings' },
          { path: '/admin/system-messages', label: 'Admin System Messages' },
          { path: '/admin/promotions', label: 'Admin Promotions' },
        ],
      },
      {
        title: 'Utility',
        items: [
          { path: '/', label: 'Home' },
          { path: '/new', label: 'New' },
          { path: '/cart', label: 'Cart' },
          { path: '/checkout', label: 'Checkout' },
          { path: '/wishlist', label: 'Wishlist' },
          { path: '/profile', label: 'Profile' },
          { path: '/search', label: 'Search' },
          { path: '/ec-preview-lite', label: 'EC Preview' },
          { path: '/user-icon-picker', label: 'User Icon Picker' },
          { path: '/documentation-files', label: 'Documentation Files' },
        ],
      },
    ],
    []
  );

  const allPaths = useMemo(() => groups.flatMap((g) => g.items.map((i) => i.path)), [groups]);
  const selectedPaths = useMemo(
    () => allPaths.filter((p) => selectedByPath[p]),
    [allPaths, selectedByPath]
  );

  const setAllSelected = (nextValue) => {
    setSelectedByPath(() => {
      const next = {};
      for (const p of allPaths) next[p] = nextValue;
      return next;
    });
  };

  const toggleSelected = (path) => {
    setSelectedByPath((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const copySelected = async () => {
    const text = selectedPaths.join('\n');
    if (!text) {
      setCopyStatus('empty');
      window.setTimeout(() => setCopyStatus('idle'), 900);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('ok');
      window.setTimeout(() => setCopyStatus('idle'), 900);
    } catch {
      setCopyStatus('err');
      window.setTimeout(() => setCopyStatus('idle'), 900);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO title="Dev links" description="Índex d'enllaços ràpids" />

      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="text-xs font-semibold tracking-[0.18em] text-black/50">DEV</div>
        <h1 className="mt-2 text-2xl font-semibold text-black">Índex</h1>
        <div className="mt-1 text-sm text-black/55">Links ràpids a pàgines útils del projecte.</div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="text-sm text-black/70">
            Seleccionats: <span className="font-semibold text-black">{selectedPaths.length}</span> / {allPaths.length}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-black/80 hover:bg-black/5"
              onClick={() => setAllSelected(true)}
            >
              Seleccionar tot
            </button>
            <button
              type="button"
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-black/80 hover:bg-black/5"
              onClick={() => setAllSelected(false)}
            >
              Netejar
            </button>
            <button
              type="button"
              className="rounded-full border border-black/10 bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-black/90"
              onClick={copySelected}
            >
              Copiar seleccionats
            </button>

            {copyStatus !== 'idle' && (
              <div className="text-xs font-semibold text-black/60">
                {copyStatus === 'ok' && 'Copiat'}
                {copyStatus === 'empty' && 'No hi ha selecció'}
                {copyStatus === 'err' && 'Error copiant'}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group.title} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-black/80">{group.title}</div>

              <div className="mt-3 flex flex-col gap-2">
                {group.items.map((item) => {
                  const active = location.pathname === item.path;
                  const tags = getTagsForPath(item.path, group.title, item.tags);
                  const selected = !!selectedByPath[item.path];
                  return (
                    <div
                      key={item.path}
                      className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                        active
                          ? 'border-[#337AC6]/40 bg-[#337AC6]/10 text-[#0f172a]'
                          : 'border-black/10 bg-white text-black/75 hover:bg-black/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <label
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-black/10 bg-white text-black/70 hover:bg-black/5"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            aria-label={selected ? 'Desseleccionar' : 'Seleccionar'}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSelected(item.path);
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              className="h-4 w-4"
                            />
                          </label>

                          <Link to={item.path} className="min-w-0">
                            <div className="min-w-0 truncate font-medium">{item.label}</div>
                          </Link>

                          <div className="flex flex-wrap items-center gap-1">
                            {tags.map((t) => (
                              <span
                                key={t}
                                className={`inline-flex items-center rounded-full border px-2 py-[2px] text-[10px] font-semibold leading-none ${
                                  badgeClassByTag[t] || 'border-black/10 bg-black/5 text-black/70'
                                }`}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-[11px] text-black/40">{item.path}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
