import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

export default function NikeTambePage() {
  const [bgMetrics, setBgMetrics] = useState(null);
  const pageRef = useRef(null);

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

      const width = Math.max(0, userRect.left - leftRect.right);
      const x = Math.max(0, leftRect.right - pageRect.left);

      setBgMetrics({ x, width });
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

  const dotStyle = (hex) => {
    const bg = hex || '#9ca3af';
    const border = bg.toLowerCase() === '#ffffff' ? '1px solid rgba(0,0,0,0.25)' : '1px solid rgba(0,0,0,0)';
    return { background: bg, border };
  };

  const cards = [
    {
      key: 'nike-mind-001-home',
      href: '/nike-tambe',
      imageAlt: 'Producte 1',
      imageSrc: null,
      dots: ['#111111', '#d11a2a', '#9ca3af'],
      status: { text: 'Producte esgotat', color: '#d11a2a' },
      name: 'Nike Mind 001',
      subtitle: 'Esclops per a abans del partit · Home',
      colorsText: '3 colors',
      priceText: '89,99 €'
    },
    {
      key: 'nike-mind-001-dona',
      href: '/nike-tambe',
      imageAlt: 'Producte 2',
      imageSrc: null,
      dots: ['#111111', '#d11a2a', '#9ca3af'],
      status: { text: 'Pròximament', color: '#d11a2a' },
      name: 'Nike Mind 001',
      subtitle: 'Esclops per a abans del partit · Dona',
      colorsText: '3 colors',
      priceText: '89,99 €'
    },
    {
      key: 'nike-victory',
      href: '/nike-tambe',
      imageAlt: 'Producte 3',
      imageSrc: null,
      dots: ['#111111', '#d946ef', '#22c55e'],
      status: { text: 'Materials reciclats', color: '#f97316' },
      name: 'Nike Victory',
      subtitle: 'Faldilla de tennis amb vol Dri-FIT · Dona',
      colorsText: '4 colors',
      priceText: '49,99 €'
    }
  ];

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-white"
      style={{
        backgroundImage: 'url(/tmp/tambe%204.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: bgMetrics ? `${(bgMetrics.x - 38) + (bgMetrics.width * 1.0615 * 0.0025)}px top` : 'top center',
        backgroundSize: bgMetrics ? `${bgMetrics.width * 1.0561925}px auto` : '75% auto'
      }}
    >
      <SEO title="Nike: També et pot agradar" description="Rail/carrusel de recomanacions (demo)." />

      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-10">
        <div className="border-t border-gray-200 pt-10 pb-12">
          <h2 className="font-roboto text-[15px] font-normal mb-6" style={{ color: '#141414' }}>
            també et pot agradar
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {cards.map((card) => (
              <Link key={card.key} to={card.href} className="block">
                <div className="w-full">
                  <div className="w-full aspect-square bg-black/30 overflow-hidden">
                    {card.imageSrc ? (
                      <img
                        src={card.imageSrc}
                        alt={card.imageAlt}
                        className="h-full w-full object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {card.dots.map((hex, idx) => (
                          <span
                            key={`${hex}-${idx}`}
                            className="inline-block h-2 w-2 rounded-full"
                            style={dotStyle(hex)}
                          />
                        ))}
                      </div>

                      <div className="text-[13px] font-roboto" style={{ color: card.status.color }}>
                        {card.status.text}
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="font-roboto text-[15px] font-semibold" style={{ color: '#111111' }}>
                        {card.name}
                      </div>
                      <div className="font-roboto text-[13px]" style={{ color: '#6b7280' }}>
                        {card.subtitle}
                      </div>
                      <div className="mt-1 font-roboto text-[13px]" style={{ color: '#6b7280' }}>
                        {card.colorsText}
                      </div>
                      <div className="mt-2 font-roboto text-[15px] font-semibold" style={{ color: '#111111' }}>
                        {card.priceText}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
