import React from 'react';
import { Link } from 'react-router-dom';

function LabDemosPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-black/45">LAB</div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-black sm:text-4xl">Demos</h1>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-black/60">
              Demos i eines de desenvolupament. Proves (col·lecció LAB) segueix a{' '}
              <Link to="/lab/proves" className="font-semibold text-black/80 underline underline-offset-4 hover:text-black">
                /lab/proves
              </Link>
              .
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/lab/proves"
              className="h-10 shrink-0 rounded-full border border-black/15 bg-white px-4 text-xs font-semibold tracking-[0.18em] uppercase text-black/70 hover:bg-black/5"
            >
              LAB Proves
            </Link>
            <Link
              to="/lab/proves"
              className="h-10 shrink-0 rounded-full border border-black/15 bg-white px-4 text-xs font-semibold tracking-[0.18em] uppercase text-black/70 hover:bg-black/5"
            >
              Anar a col·lecció
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="text-[12px] font-semibold tracking-[0.18em] uppercase text-black/45">Demos</h2>
            <div className="mt-4 grid gap-3">
              <Link to="/proves/demo-adidas" className="rounded-xl border border-black/10 p-4 hover:bg-black/[0.03]">
                <div className="text-sm font-semibold text-black">Adidas demo</div>
                <div className="mt-1 text-xs text-black/60">/proves/demo-adidas</div>
              </Link>
              <Link to="/proves/demo-adidas-pdp" className="rounded-xl border border-black/10 p-4 hover:bg-black/[0.03]">
                <div className="text-sm font-semibold text-black">Adidas PDP demo</div>
                <div className="mt-1 text-xs text-black/60">/proves/demo-adidas-pdp</div>
              </Link>
              <Link to="/proves/demo-nike-tambe" className="rounded-xl border border-black/10 p-4 hover:bg-black/[0.03]">
                <div className="text-sm font-semibold text-black">Nike també</div>
                <div className="mt-1 text-xs text-black/60">/proves/demo-nike-tambe</div>
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-[12px] font-semibold tracking-[0.18em] uppercase text-black/45">Dev</h2>
            <div className="mt-4 grid gap-3">
              <Link to="/proves/dev-links" className="rounded-xl border border-black/10 p-4 hover:bg-black/[0.03]">
                <div className="text-sm font-semibold text-black">Dev links</div>
                <div className="mt-1 text-xs text-black/60">/proves/dev-links</div>
              </Link>
              <Link to="/proves/dev-adidas-stripe-zoom" className="rounded-xl border border-black/10 p-4 hover:bg-black/[0.03]">
                <div className="text-sm font-semibold text-black">Adidas stripe zoom dev</div>
                <div className="mt-1 text-xs text-black/60">/proves/dev-adidas-stripe-zoom</div>
              </Link>
            </div>

            <div className="mt-10 rounded-xl border border-black/10 bg-black/[0.02] p-4 text-sm text-black/60">
              Per WIP, fes servir{' '}
              <Link to="/lab/wip" className="font-semibold text-black/80 underline underline-offset-4 hover:text-black">
                /lab/wip
              </Link>
              .
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default LabDemosPage;
