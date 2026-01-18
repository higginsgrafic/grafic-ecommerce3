import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';

export default function NikeTambePage() {
  const [bgMetrics, setBgMetrics] = useState(null);
  const [bgOn, setBgOn] = useState(true);
  const [respescaMinHeightPx, setRespescaMinHeightPx] = useState(null);
  const pageRef = useRef(null);
  const respescaRef = useRef(null);

  useEffect(() => {
    let raf = null;
    let ro = null;

    const read = () => {
      const left = document.getElementById('dev-header-left');
      const user = document.getElementById('dev-header-user');
      const pageEl = pageRef.current;
      if (!left || !user) {
        setBgMetrics(null);
        return;
      }

      if (!pageEl) {
        setBgMetrics(null);
        return;
      }

      const leftRect = left.getBoundingClientRect();
      const userRect = user.getBoundingClientRect();
      const pageRect = pageEl.getBoundingClientRect();

      const pageWidth = Math.max(0, Math.round(pageRect.width));

      const width = Math.max(0, userRect.left - leftRect.right);
      const x = Math.max(0, leftRect.right - pageRect.left);

      const devLeftRaw = Math.max(0, leftRect.left - pageRect.left);
      const userRightRaw = Math.max(0, userRect.right - pageRect.left);

      const devLeft = Math.min(devLeftRaw, Math.max(0, pageWidth - cardBlockWidthPx));
      const userRight = Math.min(userRightRaw, pageWidth);

      setBgMetrics({ x, width, devLeft, userRight, pageWidth });
    };

    const scheduleRead = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(read);
    };

    scheduleRead();
    scheduleRead();
    setTimeout(scheduleRead, 50);
    setTimeout(scheduleRead, 250);

    window.addEventListener('resize', scheduleRead);

    try {
      ro = new ResizeObserver(scheduleRead);
      ro.observe(left);
      ro.observe(user);
      if (pageRef.current) ro.observe(pageRef.current);
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('resize', scheduleRead);
      if (raf) cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
    };
  }, []);

  useEffect(() => {
    let raf = null;

    const measure = () => {
      const sectionEl = respescaRef.current;
      if (!sectionEl) {
        setRespescaMinHeightPx(null);
        return;
      }

      const sectionRect = sectionEl.getBoundingClientRect();
      const cards = sectionEl.querySelectorAll('[data-component="product-card"]');

      let maxBottom = 0;
      cards.forEach((el) => {
        const r = el.getBoundingClientRect();
        const bottom = r.bottom - sectionRect.top;
        if (Number.isFinite(bottom)) maxBottom = Math.max(maxBottom, bottom);
      });

      if (maxBottom <= 0) {
        setRespescaMinHeightPx(null);
        return;
      }

      const viewportMin = typeof window !== 'undefined' ? window.innerHeight : 0;
      const next = Math.ceil(Math.max(maxBottom, viewportMin));
      setRespescaMinHeightPx(next);
    };

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    schedule();
    schedule();
    window.addEventListener('resize', schedule);

    return () => {
      window.removeEventListener('resize', schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [bgMetrics]);

  useEffect(() => {
    const readBgOn = () => {
      try {
        const raw = window.localStorage.getItem('NIKE_TAMBE_BG_ON');
        if (raw === null) return true;
        return raw === '1';
      } catch {
        return true;
      }
    };

    const sync = () => {
      setBgOn(readBgOn());
    };

    sync();

    const onStorage = (e) => {
      if (!e || e.key !== 'NIKE_TAMBE_BG_ON') return;
      sync();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('nike-tambe-bg-toggle-changed', sync);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('nike-tambe-bg-toggle-changed', sync);
    };
  }, []);

  const cardHref = '/nike-tambe';
  const imageAlt = 'Producte';
  const imageSrc = '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_black_gpr-4-0_front.png';

  const tileStyle = {
    width: '450px',
    height: '450px',
    backgroundColor: '#f5f5f5',
    position: 'relative',
    transform: 'scale(0.8822222222)',
    transformOrigin: 'bottom left',
    boxShadow: 'none'
  };

  const textBlockStyle = {
    width: '397px'
  };

  const cardBlockWidthPx = 397;

  return (
    <div
      ref={pageRef}
      data-page="nike-tambe"
      className="min-h-screen bg-white"
      style={{
        backgroundImage: bgOn ? 'url(/tmp/tambe%204.png)' : 'none',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: bgMetrics ? `${bgMetrics.x - 38}px 100px` : 'center 100px',
        backgroundSize: bgMetrics ? `${Math.max(0, (bgMetrics.width * 1.0561925) - 1)}px auto` : '75% auto'
      }}
    >
      <SEO title="Nike: També et pot agradar" description="Rail/carrusel de recomanacions (demo)." />

      <div
        ref={respescaRef}
        className="relative min-h-screen"
        data-section="respesca"
        style={respescaMinHeightPx ? { minHeight: `${respescaMinHeightPx}px` } : undefined}
      >
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-10" data-container="cards-row">
          {[0, 1, 2].map((idx) => {
            const left1 = bgMetrics ? bgMetrics.devLeft : 0;
            const left3 = bgMetrics ? Math.max(0, bgMetrics.userRight - cardBlockWidthPx) : 0;
            const left2 = Math.round(left1 + (left3 - left1) / 2);
            const leftPx = idx === 0 ? left1 : idx === 1 ? left2 : left3;

            return (
              <Link
                key={idx}
                to={cardHref}
                className="block"
                data-component="product-card"
                data-card-index={idx}
                style={{
                  position: 'absolute',
                  top: '161px',
                  left: `${leftPx}px`
                }}
              >
                <div style={{ ...textBlockStyle, position: 'relative' }}>
                  {idx === 0 ? (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-122px',
                        left: '-3px',
                        fontFamily: 'Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif',
                        color: '#111'
                      }}
                    >
                      <div style={{ fontSize: '32pt', lineHeight: 1.1, color: '#111' }}>
                        també et pot interessar
                      </div>
                      <div style={{ position: 'relative', top: '6px', left: '2px', marginTop: '2px', fontSize: '13pt', fontWeight: 500, lineHeight: 1.2, color: '#9ca3af', fontKerning: 'normal', letterSpacing: '0.08em' }}>
                        COSES DIFERENTS
                      </div>
                    </div>
                  ) : null}

                  <div className="overflow-hidden flex items-center justify-center" style={tileStyle} data-component="product-tile">
                    {idx === 2 ? (
                      <div
                        style={{
                          position: 'absolute',
                          top: '20px',
                          right: '20px',
                          display: 'flex',
                          gap: '10px',
                          zIndex: 2
                        }}
                      >
                        <button
                          type="button"
                          aria-label="Anterior"
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '9999px',
                            backgroundColor: '#e5e5e5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'none'
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          aria-label="Següent"
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '9999px',
                            backgroundColor: '#e5e5e5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'none'
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 6L15 12L9 18" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    ) : null}

                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={imageAlt}
                        className="h-[71.25%] w-[71.25%] object-contain"
                        loading="lazy"
                        decoding="async"
                        onLoad={() => {
                          try {
                            window.dispatchEvent(new Event('resize'));
                          } catch {
                            // ignore
                          }
                        }}
                      />
                    ) : null}
                  </div>

                  <div style={{ marginTop: '8px', fontFamily: 'Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif' }}>
                    <div>
                      <div style={{ position: 'relative', top: '3px', marginTop: '2px', fontSize: '10px', fontWeight: 500, lineHeight: 1.2, color: '#9ca3af', fontKerning: 'normal', letterSpacing: '0.14em' }}>
                        THE HUMAN INSIDE
                      </div>
                      <div style={{ position: 'relative', top: '6px', fontSize: '14px', fontWeight: 500, lineHeight: 1.1, color: '#111' }}>
                        IRON KONG
                      </div>
                      <div style={{ position: 'relative', top: '7px', left: '-1px', marginTop: '6px', fontSize: '14px', fontWeight: 400, lineHeight: 1.1, color: '#111' }}>
                        19,99 €
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div data-section="footer">
        <Footer />
      </div>
    </div>
  );
}
