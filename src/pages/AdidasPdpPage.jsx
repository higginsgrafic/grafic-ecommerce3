import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AdidasInspiredHeader from '@/components/AdidasInspiredHeader';
import Footer from '@/components/Footer';
import ProductTeaserCard from '@/components/ProductTeaserCard';

export default function AdidasPdpPage() {
  const [stripeDebugHit, setStripeDebugHit] = useState(false);
  const [separatorTitleGapPx, setSeparatorTitleGapPx] = useState(96);
  const mediaRef = useRef(null);
  const separatorRef = useRef(null);

  const stripeItemLeftOffsetPxByIndex = useMemo(
    () => ({
      13: -12,
    }),
    []
  );

  useEffect(() => {
    let raf = null;

    const measure = () => {
      const mediaEl = mediaRef.current;
      const sepEl = separatorRef.current;
      if (!mediaEl || !sepEl) return;

      const mediaRect = mediaEl.getBoundingClientRect();
      const sepRect = sepEl.getBoundingClientRect();
      const gap = sepRect.top - mediaRect.bottom;
      if (!Number.isFinite(gap)) return;

      const next = Math.round(Math.max(0, Math.min(240, gap)));
      setSeparatorTitleGapPx((prev) => (prev === next ? prev : next));
    };

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('resize', schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const scheduleSeparatorMeasure = () => {
    try {
      window.dispatchEvent(new Event('resize'));
    } catch {
      // ignore
    }
  };

  const product = useMemo(
    () => ({
      title: 'IRON KONG',
      subtitle: 'THE HUMAN INSIDE',
      price: '19,99 €',
      description:
        'PDP demo (adidas-inspired). Objectiu: provar header, jerarquia tipogràfica i una secció de recomanacions en document flow.',
      imgSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_black_gpr-4-0_front.png',
    }),
    []
  );

  return (
    <div className="min-h-screen bg-white" data-page="adidas-pdp">
      <AdidasInspiredHeader
        forceStripeDebugHit={stripeDebugHit}
        ignoreStripeDebugFromUrl
        stripeItemLeftOffsetPxByIndex={stripeItemLeftOffsetPxByIndex}
        redistributeStripeBetweenFirstAndLast
      />

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
          <div className="relative -translate-y-[50px]">
            <nav className="pt-6" aria-label="Breadcrumb" data-component="breadcrumbs">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-black/45">
                <li>
                  <Link to="/" className="hover:text-black">
                    Inici
                  </Link>
                </li>
                <li aria-hidden="true" className="text-black/25">
                  /
                </li>
                <li>
                  <Link to="/adidas-demo" className="hover:text-black">
                    Adidas
                  </Link>
                </li>
                <li aria-hidden="true" className="text-black/25">
                  /
                </li>
                <li className="text-black/70">{product.title}</li>
              </ol>
            </nav>

            <div
              className="pt-10 lg:pt-14 flex items-center"
              style={{
                minHeight: 'calc(100vh - var(--appHeaderOffset, 0px) - 220px)',
              }}
              data-section="pdp"
            >
              <div className="mx-auto w-full">
                <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-2 lg:gap-16">
                  <div ref={mediaRef} className="bg-black/[0.04]" data-component="pdp-media">
                    <div className="aspect-square w-full">
                      <img
                        src={product.imgSrc}
                        alt={product.title}
                        className="h-full w-full object-contain"
                        loading="lazy"
                        decoding="async"
                        onLoad={scheduleSeparatorMeasure}
                      />
                    </div>
                  </div>

                  <div className="min-w-0" data-component="pdp-info">
                    <div className="text-[10px] font-semibold tracking-[0.14em] text-black/45">{product.subtitle}</div>
                    <h1 className="mt-3 text-3xl font-black tracking-tight text-black sm:text-4xl">{product.title}</h1>
                    <div className="mt-4 text-[16px] font-semibold text-black">{product.price}</div>
                    <p className="mt-5 max-w-prose text-sm leading-relaxed text-black/60">{product.description}</p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        className="h-12 rounded-full bg-black px-6 text-xs font-semibold tracking-[0.18em] uppercase text-white"
                      >
                        Afegir al carro
                      </button>
                      <button
                        type="button"
                        className="h-12 rounded-full border border-black/15 bg-white px-6 text-xs font-semibold tracking-[0.18em] uppercase text-black/70 hover:bg-black/5"
                      >
                        Guardar
                      </button>
                    </div>

                    <div className="mt-12 grid gap-4 text-xs text-black/60">
                      <div className="flex items-center justify-between border-t border-black/10 pt-4">
                        <div>Fitxa (demo)</div>
                        <div className="font-semibold text-black/70">Gildan 5000</div>
                      </div>
                      <div className="flex items-center justify-between border-t border-black/10 pt-4">
                        <div>Impressió</div>
                        <div className="font-semibold text-black/70">DTF</div>
                      </div>
                      <div className="flex items-center justify-between border-t border-black/10 pt-4">
                        <div>Enviament</div>
                        <div className="font-semibold text-black/70">48/72h</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <section className="pb-12 lg:pb-16 lg:-mt-[100px]" data-section="respesca">
              <div className="lg:px-[100px]">
                <div ref={separatorRef} className="border-t border-black/10" style={{ paddingTop: `${separatorTitleGapPx}px` }}>
                  <div style={{ fontSize: '32pt', lineHeight: 1.1, color: '#111', fontFamily: 'Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif' }}>
                    també et pot interessar
                  </div>
                  <div
                    style={{
                      marginTop: '2px',
                      fontSize: '13pt',
                      fontWeight: 500,
                      lineHeight: 1.2,
                      color: '#9ca3af',
                      fontKerning: 'normal',
                      letterSpacing: '0.08em',
                      fontFamily: 'Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif',
                    }}
                  >
                    COSES DIFERENTS
                  </div>

                  <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3" data-container="related-grid">
                    <ProductTeaserCard
                      to="/adidas-pdp"
                      imgSrc={product.imgSrc}
                      name="IRON KONG"
                      subtitle="THE HUMAN INSIDE"
                      status={null}
                      colors={[]}
                      price="19,99 €"
                    />
                    <ProductTeaserCard
                      to="/adidas-pdp"
                      imgSrc={product.imgSrc}
                      name="MAZINGER"
                      subtitle="THE HUMAN INSIDE"
                      status={null}
                      colors={[]}
                      price="19,99 €"
                    />
                    <ProductTeaserCard
                      to="/adidas-pdp"
                      imgSrc={product.imgSrc}
                      name="ROBOCOP"
                      subtitle="THE HUMAN INSIDE"
                      status={null}
                      colors={[]}
                      price="19,99 €"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div data-section="footer">
          <Footer />
        </div>
      </main>
    </div>
  );
}
