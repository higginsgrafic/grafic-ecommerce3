import React, { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'devGuidesV2';
const RULER_SIZE = 6;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function DevGuidesOverlay() {
  const [vGuides, setVGuides] = useState([]);
  const [hGuides, setHGuides] = useState([]);
  const draggingRef = useRef(null);
  const [anchorRect, setAnchorRect] = useState({ left: 0, top: 0, width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      const el = document.getElementById('main-content');
      const rect = el?.getBoundingClientRect?.();
      if (!rect || !rect.width || !rect.height) {
        setAnchorRect((prev) => (prev.width || prev.height ? { left: 0, top: 0, width: 0, height: 0 } : prev));
        return;
      }
      const next = {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
      setAnchorRect((prev) => (prev.left === next.left && prev.top === next.top && prev.width === next.width && prev.height === next.height ? prev : next));
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, []);

  const toLocalX = (clientX) => Math.round(clientX - anchorRect.left);
  const toLocalY = (clientY) => Math.round(clientY - anchorRect.top);

  const onDragMove = (e) => {
    const drag = draggingRef.current;
    if (!drag) return;

    const maxW = anchorRect.width || window.innerWidth;
    const maxH = anchorRect.height || window.innerHeight;

    if (drag.kind === 'v') {
      const x = clamp(toLocalX(e.clientX), 0, maxW);
      setVGuides((prev) => prev.map((vv, i) => (i === drag.idx ? x : vv)));
    } else {
      const y = clamp(toLocalY(e.clientY), 0, maxH);
      setHGuides((prev) => prev.map((hh, i) => (i === drag.idx ? y : hh)));
    }
  };

  const endDrag = () => {
    draggingRef.current = null;
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const vv = Array.isArray(parsed?.v) ? parsed.v : [];
      const hh = Array.isArray(parsed?.h) ? parsed.h : [];
      setVGuides(vv.filter((n) => Number.isFinite(n)));
      setHGuides(hh.filter((n) => Number.isFinite(n)));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: vGuides, h: hGuides }));
    } catch {
      // ignore
    }
  }, [vGuides, hGuides]);

  const viewport = useMemo(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 0;
    const h = typeof window !== 'undefined' ? window.innerHeight : 0;
    return { w, h };
  }, []);

  useEffect(() => {
    const onResize = () => {
      const maxW = anchorRect.width || window.innerWidth;
      const maxH = anchorRect.height || window.innerHeight;
      setVGuides((prev) => prev.map((x) => clamp(Math.round(x), 0, maxW)));
      setHGuides((prev) => prev.map((y) => clamp(Math.round(y), 0, maxH)));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [anchorRect.height, anchorRect.width]);

  const onRulerTopClick = (e) => {
    const maxW = anchorRect.width || window.innerWidth;
    const x = clamp(toLocalX(e.clientX), 0, maxW);
    setVGuides((prev) => [...prev, x]);
  };

  const onRulerLeftClick = (e) => {
    const maxH = anchorRect.height || window.innerHeight;
    const y = clamp(toLocalY(e.clientY), 0, maxH);
    setHGuides((prev) => [...prev, y]);
  };

  const beginDrag = (kind, idx, e) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = { kind, idx };
    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  };

  const removeGuide = (kind, idx) => {
    if (kind === 'v') setVGuides((prev) => prev.filter((_, i) => i !== idx));
    else setHGuides((prev) => prev.filter((_, i) => i !== idx));
  };

  const square = useMemo(() => {
    const xs = [...vGuides].filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
    const ys = [...hGuides].filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
    if (xs.length < 2 || ys.length < 2) return null;
    return {
      xL: Math.round(xs[0]),
      xR: Math.round(xs[xs.length - 1]),
      yT: Math.round(ys[0]),
      yB: Math.round(ys[ys.length - 1]),
    };
  }, [vGuides, hGuides]);

  const copySquare = async () => {
    if (!square) return;
    const text = `xL=${square.xL} xR=${square.xR} yT=${square.yT} yB=${square.yB}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    try {
      window.__DEV_GUIDES_SQUARE__ = square;
      window.__DEV_GUIDES_COPY_COORDS__ = () => {
        copySquare();
      };
    } catch {
      // ignore
    }
  }, [square]);

  return (
    <div className="fixed inset-0 z-[99990] pointer-events-none debug-exempt" aria-hidden="true" data-dev-overlay="true">
      {/* Rulers */}
      <div
        className="fixed pointer-events-auto debug-exempt"
        style={{
          left: `${anchorRect.left}px`,
          top: `${anchorRect.top}px`,
          width: `${anchorRect.width}px`,
          height: `${RULER_SIZE}px`,
          backgroundColor: '#337AC6',
        }}
        onClick={onRulerTopClick}
      />
      <div
        className="fixed pointer-events-auto debug-exempt"
        style={{
          left: `${anchorRect.left}px`,
          top: `${anchorRect.top}px`,
          width: `${RULER_SIZE}px`,
          height: `${anchorRect.height}px`,
          backgroundColor: '#337AC6',
        }}
        onClick={onRulerLeftClick}
      />
      <div
        className="fixed"
        style={{
          left: `${anchorRect.left}px`,
          top: `${anchorRect.top}px`,
          width: `${RULER_SIZE}px`,
          height: `${RULER_SIZE}px`,
          backgroundColor: '#337AC6',
        }}
      />

      {/* Vertical guides */}
      {vGuides.map((x, idx) => (
        <div
          key={`v-${idx}-${x}`}
          className="fixed debug-exempt"
          style={{ left: `${anchorRect.left + x}px`, top: `${anchorRect.top}px`, height: `${anchorRect.height}px`, width: '1px', background: 'rgba(255, 0, 0, 0.65)', pointerEvents: 'auto', cursor: 'col-resize' }}
          onPointerDown={(e) => beginDrag('v', idx, e)}
          onDoubleClick={() => removeGuide('v', idx)}
        >
          <div
            className="debug-exempt"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '-6px',
              width: '13px',
              pointerEvents: 'none',
            }}
            onPointerDown={(e) => beginDrag('v', idx, e)}
            onDoubleClick={() => removeGuide('v', idx)}
          />
          <div
            className="debug-exempt"
            style={{
              position: 'absolute',
              top: `${RULER_SIZE + 6}px`,
              left: '6px',
              background: 'rgba(0,0,0,0.75)',
              color: 'white',
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '8px',
              whiteSpace: 'nowrap',
              pointerEvents: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>x={x}</span>
            <button
              type="button"
              className="debug-exempt"
              style={{
                border: 'none',
                background: 'transparent',
                color: 'rgba(255,255,255,0.9)',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
              }}
              aria-label="Eliminar guia"
              title="Eliminar"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeGuide('v', idx);
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}

      {/* Horizontal guides */}
      {hGuides.map((y, idx) => (
        <div
          key={`h-${idx}-${y}`}
          className="fixed debug-exempt"
          style={{ top: `${anchorRect.top + y}px`, left: `${anchorRect.left}px`, width: `${anchorRect.width}px`, height: '1px', background: 'rgba(0, 120, 255, 0.65)', pointerEvents: 'auto', cursor: 'row-resize' }}
          onPointerDown={(e) => beginDrag('h', idx, e)}
          onDoubleClick={() => removeGuide('h', idx)}
        >
          <div
            className="debug-exempt"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '-6px',
              height: '13px',
              pointerEvents: 'none',
            }}
            onPointerDown={(e) => beginDrag('h', idx, e)}
            onDoubleClick={() => removeGuide('h', idx)}
          />
          <div
            className="debug-exempt"
            style={{
              position: 'absolute',
              left: `${RULER_SIZE + 6}px`,
              top: '6px',
              background: 'rgba(0,0,0,0.75)',
              color: 'white',
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '8px',
              whiteSpace: 'nowrap',
              pointerEvents: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>y={y}</span>
            <button
              type="button"
              className="debug-exempt"
              style={{
                border: 'none',
                background: 'transparent',
                color: 'rgba(255,255,255,0.9)',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
              }}
              aria-label="Eliminar guia"
              title="Eliminar"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeGuide('h', idx);
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
