import React, { useState } from 'react';
import AdidasInspiredHeader from '@/components/AdidasInspiredHeader';
import NikeHeroSlider from '@/components/NikeHeroSlider.jsx';

function Tile({ title, body }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.06),0_18px_40px_rgba(0,0,0,0.06)]">
      <div className="text-xs font-semibold tracking-wide text-black/60">PLACEHOLDER</div>
      <div className="mt-2 text-xl font-semibold tracking-tight text-black">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-black/60">{body}</div>
    </div>
  );
}

function PlaceholderMedia({ label }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 10%, rgba(0,0,0,0.08), transparent 45%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.08), transparent 55%)',
        }}
      />
      <div className="relative flex h-[320px] w-full items-end p-4 sm:h-[420px]">
        <div className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-black/70 backdrop-blur">
          {label}
        </div>
      </div>
    </div>
  );
}

export default function AdidasDemoPage() {
  const [stripeDebugHit, setStripeDebugHit] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <AdidasInspiredHeader forceStripeDebugHit={stripeDebugHit} ignoreStripeDebugFromUrl />

      <div className="fixed bottom-4 right-4 z-[9999]">
        <button
          type="button"
          className={`h-10 rounded-full border px-4 text-sm font-semibold shadow-sm hover:bg-black/5 ${
            stripeDebugHit ? 'border-emerald-400/60 bg-emerald-50 text-emerald-900' : 'border-black/15 bg-white text-black/80'
          }`}
          onClick={() => setStripeDebugHit((v) => !v)}
        >
          Stripe debug {stripeDebugHit ? 'ON' : 'OFF'}
        </button>
      </div>

      <main className="pt-[calc(var(--appHeaderOffset,0px)+64px)] lg:pt-[calc(var(--appHeaderOffset,0px)+80px)]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="py-8 lg:py-10">
            <div className="text-xs font-semibold tracking-[0.18em] text-black/50">ADIDAS-STYLE DEMO</div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-black sm:text-5xl">
              Header + Mega-menú (placeholders)
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/60">
              Aquesta pàgina és una demo per iterar ràpidament sobre un header tipus adidas.es: sticky, mega-menú desktop,
              menú mobile i layout de categories. Les lògiques les podem ajustar fins trobar el que busques.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-12">
              <NikeHeroSlider
                flush
                slides={[
                  {
                    id: 'adidas-demo-1',
                    imageSrc:
                      '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_royal_gpr-4-0_front.png',
                    kicker: 'Per marcar la diferència',
                    headline: 'Mou-te i marca la diferència',
                    primaryCta: { label: 'Compra', href: '#' },
                    secondaryCta: { label: 'Descobreix', href: '#' },
                  },
                  {
                    id: 'adidas-demo-2',
                    imageSrc:
                      '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_black_gpr-4-0_front.png',
                    kicker: 'Essencials',
                    headline: 'Minimalisme que combina amb tot',
                    primaryCta: { label: 'Compra', href: '#' },
                    secondaryCta: { label: 'Veure novetats', href: '#' },
                  },
                  {
                    id: 'adidas-demo-3',
                    imageSrc:
                      '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_forest-green_gpr-4-0_front.png',
                    kicker: 'Studio',
                    headline: 'Confort i presència, sense soroll',
                    primaryCta: { label: 'Compra', href: '#' },
                    secondaryCta: { label: 'Explora col·lecció', href: '#' },
                  },
                ]}
              />
            </div>
            <div className="lg:col-span-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Tile title="Noves arribades" body="Blocs de producte/col·lecció. Placeholder." />
              <Tile title="Drops" body="Espai per destacats o col·laboracions. Placeholder." />
              <Tile title="Outlet" body="CTA amb descompte i promocions. Placeholder." />
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
            <Tile title="Running" body="Cards de categories. Placeholder." />
            <Tile title="Lifestyle" body="Cards de categories. Placeholder." />
            <Tile title="Training" body="Cards de categories. Placeholder." />
            <Tile title="Football" body="Cards de categories. Placeholder." />
          </div>

          <div className="mt-10 lg:mt-14">
            <div className="grid gap-4 lg:grid-cols-3">
              <Tile title="Banner 1" body="Secció llarga per simular scroll. Placeholder." />
              <Tile title="Banner 2" body="Secció llarga per simular scroll. Placeholder." />
              <Tile title="Banner 3" body="Secció llarga per simular scroll. Placeholder." />
            </div>
          </div>

          <div className="mt-12 pb-20 lg:mt-16">
            <div className="rounded-3xl bg-black p-10 text-white">
              <div className="text-xs font-semibold tracking-[0.2em] text-white/70">PLACEHOLDER FOOTER STRIP</div>
              <div className="mt-3 text-2xl font-black tracking-tight">Newsletter + USP bar</div>
              <div className="mt-2 max-w-2xl text-sm text-white/75">
                Exemple d’un strip inferior típic amb USP/CTA. No substitueix el footer global del site.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
