import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

export default function NikeTambePage() {
  return (
    <div className="min-h-screen bg-white">
      <SEO title="Nike: També et pot agradar" description="Rail/carrusel de recomanacions (demo)." />

      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-[0.18em] text-black/50">DEMO</div>
            <h1 className="mt-2 text-2xl font-semibold text-black">Nike: També et pot agradar</h1>
            <div className="mt-1 text-sm text-black/55">Pàgina placeholder (demo). La implementació del rail la fem demà.</div>
          </div>

          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-medium text-black/80 shadow-sm hover:bg-black/5"
          >
            Tornar a Demos
          </Link>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="text-sm text-black/70">
            Aquesta ruta existia com a demo però el fitxer s'havia eliminat/renombrat. Ara torna a existir per evitar que el `lazy import` trenqui el render global.
          </div>
        </div>
      </div>
    </div>
  );
}
