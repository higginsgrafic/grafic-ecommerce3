import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { formatPrice } from '@/utils/formatters';

function resolveButtonVariant(raw) {
  if (!raw) return undefined;
  const v = String(raw).toLowerCase();
  if (v === 'primary') return undefined;
  if (v === 'secondary') return 'secondary';
  if (v === 'destructive') return 'destructive';
  if (v === 'ghost') return 'ghost';
  return undefined;
}

function resolvePresetRef(preset, ref) {
  if (!preset || typeof preset !== 'object') return null;
  if (!ref || typeof ref !== 'string') return null;
  const parts = ref.split('.').filter(Boolean);
  if (parts.length === 0) return null;

  let cur = preset;
  for (let i = 0; i < parts.length; i += 1) {
    const key = parts[i];

    // Special-case: ui.regions.<regionId> (ui.regions is array)
    if (key === 'regions' && parts[i - 1] === 'ui') {
      const nextId = parts[i + 1];
      const regions = cur?.regions;
      if (!Array.isArray(regions) || !nextId) return null;
      cur = regions.find((r) => r?.id === nextId) || null;
      i += 1;
      continue;
    }

    // Special-case: ui.modals.<modalId> (ui.modals is array)
    if (key === 'modals' && parts[i - 1] === 'ui') {
      const nextId = parts[i + 1];
      const modals = cur?.modals;
      if (!Array.isArray(modals) || !nextId) return null;
      cur = modals.find((m) => m?.id === nextId) || null;
      i += 1;
      continue;
    }

    if (cur == null) return null;
    cur = cur[key];
  }

  return cur ?? null;
}

function ToolsBar({ preset, onTool }) {
  const tools = preset?.tools;
  const order = Array.isArray(tools?.order) ? tools.order : null;
  const catalog = tools?.catalog && typeof tools.catalog === 'object' ? tools.catalog : null;

  const [confirmState, setConfirmState] = useState({ open: false, toolId: '', cfg: null, modalId: '' });

  if (!order || !catalog) return null;

  const activeModal = confirmState.modalId
    ? (preset?.ui?.modals || []).find((m) => m?.id === confirmState.modalId)
    : null;

  return (
    <>
      {order
        .map((toolId) => {
          const tool = catalog[toolId];
          if (!tool || typeof tool !== 'object') return null;
          if (tool.type !== 'action') return null;

          const cfg = resolvePresetRef(preset, tool.ref);
          const variant = resolveButtonVariant(cfg?.variant || cfg?.style);
          const label = cfg?.label || toolId;

          const presentation = tool?.presentation && typeof tool.presentation === 'object' ? tool.presentation : null;
          const isIconOnly = presentation?.mode === 'icon';

          const handleClick = () => {
            const modalId = cfg?.confirmModalId;
            if (modalId) {
              setConfirmState({ open: true, toolId, cfg, modalId });
              return;
            }
            onTool?.(toolId, cfg);
          };

          const btnClass = toolId === 'checkout' ? 'rounded-sm flex-1' : 'rounded-sm';

          if (isIconOnly) {
            const icon = presentation?.icon;
            return (
              <Button key={toolId} variant={variant || 'ghost'} className={btnClass} onClick={handleClick} aria-label={label} title={label}>
                {icon === 'trash' ? <Trash2 className="h-5 w-5" /> : label}
              </Button>
            );
          }

          return (
            <Button key={toolId} variant={variant} className={btnClass} onClick={handleClick}>
              {label}
            </Button>
          );
        })
        .filter(Boolean)}

      <SimpleConfirmModal
        open={confirmState.open}
        title={activeModal?.title || 'Confirmar?'}
        body={activeModal?.body || ''}
        confirmLabel={(activeModal?.actions || []).find((a) => a.id === 'confirm')?.label || 'Confirmar'}
        cancelLabel={(activeModal?.actions || []).find((a) => a.id === 'cancel')?.label || 'Cancel·lar'}
        confirmVariant={resolveButtonVariant((activeModal?.actions || []).find((a) => a.id === 'confirm')?.variant) || 'destructive'}
        cancelVariant={resolveButtonVariant((activeModal?.actions || []).find((a) => a.id === 'cancel')?.variant) || 'secondary'}
        onCancel={() => setConfirmState({ open: false, toolId: '', cfg: null, modalId: '' })}
        onConfirm={() => {
          const { toolId, cfg } = confirmState;
          setConfirmState({ open: false, toolId: '', cfg: null, modalId: '' });
          if (toolId) onTool?.(toolId, cfg);
        }}
      />
    </>
  );
}

function FastViewBlocksGrid({ preset, onLogout }) {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const logoutModal = preset?.ui?.modals?.find((m) => m.id === 'logoutConfirm');
  const toolsAvailable = !!(preset?.tools?.catalog && Array.isArray(preset?.tools?.order));
  const blocks = Array.isArray(preset?.ui?.blocks) ? preset.ui.blocks : [];
  const gridStyle = useMemo(() => buildGridStyle(preset), [preset]);

  const renderRegion = (regionId) => {
    if (regionId === 'identity') {
      return (
        <div className="border border-border rounded-lg p-4 bg-white">
          <div className="text-sm text-muted-foreground">Usuari</div>
          <div className="mt-1 text-base font-semibold text-foreground">Sessió</div>
        </div>
      );
    }

    if (regionId === 'primaryActions') {
      return (
        <div className="border border-border rounded-lg p-4 bg-white">
          <div className="text-sm text-muted-foreground">Accions</div>
          <div className="mt-1 text-sm text-foreground">(MVP) Encara no connectat</div>
        </div>
      );
    }

    if (regionId === 'ordersSummary') {
      return (
        <div className="border border-border rounded-lg p-4 bg-white">
          <div className="text-sm text-muted-foreground">Comandes</div>
          <div className="mt-1 text-sm text-foreground">(MVP) Encara no connectat</div>
        </div>
      );
    }

    if (regionId === 'recentlyViewed') {
      return (
        <div className="border border-border rounded-lg p-4 bg-white">
          <div className="text-sm text-muted-foreground">Darreres vistes</div>
          <div className="mt-1 text-sm text-foreground">(MVP) Encara no connectat</div>
        </div>
      );
    }

    if (regionId === 'helpAndSession') {
      return (
        <div className="border border-border rounded-lg p-4 bg-white flex flex-col gap-3 justify-between h-full min-h-0">
          <div>
            <div className="text-sm text-muted-foreground">Ajuda</div>
            <div className="mt-1 text-sm text-foreground">(MVP) Encara no connectat</div>
          </div>
          <div className="flex justify-end">
            {toolsAvailable ? (
              <div className="flex gap-2">
                <ToolsBar
                  preset={preset}
                  onTool={(toolId) => {
                    if (toolId === 'logout') onLogout?.();
                  }}
                />
              </div>
            ) : (
              <Button variant="ghost" onClick={() => setConfirmLogout(true)}>
                Tancar sessió
              </Button>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div className="p-4 sm:p-6 border-b bg-white">
        <h2 className="text-xl sm:text-2xl font-oswald font-bold uppercase text-foreground">Compte</h2>
        <p className="mt-1 text-sm text-muted-foreground">Vista ràpida</p>
      </div>

      <div className="flex-1 min-h-0 p-4 sm:p-6" style={gridStyle}>
        {blocks
          .filter((b) => b && typeof b === 'object')
          .filter((b) => b.visible !== false)
          .map((b) => {
            const regionId = b.regionId || b.id;
            if (!b.gridArea) return null;
            if ((b.type || 'region') !== 'region') return null;
            return (
              <div key={b.id} style={{ gridArea: b.gridArea, minHeight: 0 }} className="min-h-0">
                {renderRegion(regionId)}
              </div>
            );
          })
          .filter(Boolean)}
      </div>

      <SimpleConfirmModal
        open={confirmLogout}
        title={logoutModal?.title || 'Tancar sessió?'}
        body={logoutModal?.body || "Perdràs l'accés al teu compte fins que tornis a iniciar sessió."}
        confirmLabel={(logoutModal?.actions || []).find((a) => a.id === 'confirm')?.label || 'Tancar sessió'}
        cancelLabel={(logoutModal?.actions || []).find((a) => a.id === 'cancel')?.label || 'Cancel·lar'}
        confirmVariant={resolveButtonVariant((logoutModal?.actions || []).find((a) => a.id === 'confirm')?.variant) || 'destructive'}
        cancelVariant={resolveButtonVariant((logoutModal?.actions || []).find((a) => a.id === 'cancel')?.variant) || 'secondary'}
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          onLogout?.();
        }}
      />
    </>
  );
}

function canRenderBlocksGrid(preset) {
  const templateAreas = preset?.layout?.grid?.templateAreas;
  const blocks = preset?.ui?.blocks;
  if (!Array.isArray(templateAreas) || templateAreas.some((row) => typeof row !== 'string')) return false;
  if (!Array.isArray(blocks) || blocks.length === 0) return false;
  return true;
}

function buildGridStyle(preset) {
  const templateAreas = preset?.layout?.grid?.templateAreas;
  const cols = Number(preset?.layout?.grid?.cols) || 6;
  const rows = Number(preset?.layout?.grid?.rows) || 6;

  const gapRaw = preset?.layout?.grid?.gap;
  const gapPx = gapRaw === 'sm' ? 8 : gapRaw === 'lg' ? 20 : 12;

  const cssAreas = Array.isArray(templateAreas) ? templateAreas.map((row) => `"${row}"`).join(' ') : undefined;
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
    gridTemplateAreas: cssAreas,
    gap: `${gapPx}px`,
    height: '100%',
    minHeight: 0,
  };
}

function CartBlocksGrid({
  preset,
  cartItems,
  totalPrice,
  onUpdateQuantity,
  onRemove,
  onUpdateSize,
  onViewCart,
  onCheckout,
  onClearCart,
}) {
  const [confirmClear, setConfirmClear] = useState(false);

  const safeCartItems = useMemo(() => {
    if (!Array.isArray(cartItems)) return [];
    return cartItems.filter((item) => item && (item.id != null || item.productId != null));
  }, [cartItems]);

  const actionsCfg = preset?.ui?.regions?.find((r) => r.id === 'cartActions')?.actions || {};
  const checkoutVariant = resolveButtonVariant(actionsCfg?.checkout?.variant) ?? undefined;
  const viewCartVariant = resolveButtonVariant(actionsCfg?.viewCart?.variant) ?? 'secondary';
  const clearCartVariant = resolveButtonVariant(actionsCfg?.clearCart?.variant) ?? 'ghost';
  const checkoutLabel = actionsCfg?.checkout?.label || 'Anar a caixa';
  const viewCartLabel = actionsCfg?.viewCart?.label || 'Veure cistell';

  const toolsAvailable = !!(preset?.tools?.catalog && Array.isArray(preset?.tools?.order));

  const scrollCfg = preset?.ui?.regions?.find((r) => r.id === 'cartItems')?.scroll;
  const threshold = Number(scrollCfg?.enableWhenCountGreaterThan);
  const shouldScroll = Number.isFinite(threshold) ? safeCartItems.length > threshold : safeCartItems.length > 3;

  const clearModal = preset?.ui?.modals?.find((m) => m.id === 'clearCartConfirm');

  const blocks = Array.isArray(preset?.ui?.blocks) ? preset.ui.blocks : [];
  const gridStyle = useMemo(() => buildGridStyle(preset), [preset]);

  const renderRegion = (regionId) => {
    if (regionId === 'cartHeader') {
      return (
        <div className="p-4 sm:p-6 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-oswald font-bold uppercase text-foreground">El teu cistell</h2>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {safeCartItems.length} {safeCartItems.length === 1 ? 'producte' : 'productes'}
            </div>
            <div className="text-sm font-semibold">{Number.isFinite(totalPrice) ? formatPrice(totalPrice) : ''}</div>
          </div>
        </div>
      );
    }

    if (regionId === 'cartSummary') {
      return (
        <div className="p-4 sm:p-6 bg-white border-b">
          <div className="text-sm text-muted-foreground">Subtotal</div>
          <div className="mt-1 text-base font-semibold text-foreground">{Number.isFinite(totalPrice) ? formatPrice(totalPrice) : ''}</div>
        </div>
      );
    }

    if (regionId === 'cartActions') {
      return (
        <div className="border-b bg-white p-4 sm:p-6 flex items-center gap-2">
          {toolsAvailable ? (
            <ToolsBar
              preset={preset}
              onTool={(toolId) => {
                if (toolId === 'checkout') onCheckout?.();
                if (toolId === 'viewCart') onViewCart?.();
                if (toolId === 'clearCart') onClearCart?.();
              }}
            />
          ) : (
            <>
              <Button variant={checkoutVariant} className="rounded-sm flex-1" onClick={onCheckout}>
                {checkoutLabel}
              </Button>
              <Button variant={viewCartVariant} className="rounded-sm" onClick={onViewCart}>
                {viewCartLabel}
              </Button>
              <Button
                variant={clearCartVariant}
                className="rounded-sm"
                onClick={() => setConfirmClear(true)}
                aria-label="Buidar cistell"
                title="Buidar cistell"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      );
    }

    if (regionId === 'cartItems') {
      return (
        <div className={`min-h-0 ${shouldScroll ? 'overflow-y-auto' : ''} p-4 sm:p-6 space-y-4`}>
          {safeCartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <p className="font-oswald text-lg font-medium text-foreground">El cistell és buit</p>
              <p className="font-roboto text-sm text-muted-foreground">Afegeix productes per començar</p>
            </div>
          ) : (
            safeCartItems.map((item, idx) => (
              <div key={`${item.id || item.productId || idx}-${item.size || ''}`} className="flex gap-3 sm:gap-4 items-start pb-4 border-b border-border last:border-0">
                <div className="w-24 sm:w-28 h-24 sm:h-28 bg-muted rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                  {item?.image ? (
                    <img src={item.image} alt={item.name || 'Producte'} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  ) : null}
                </div>

                <div className="flex-1 flex flex-col justify-between h-full min-h-[112px]">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <h3 className="font-oswald uppercase text-base font-bold line-clamp-2 leading-tight text-foreground">{item.name || 'Producte'}</h3>
                      <div className="mt-1 text-xs text-muted-foreground">{item.size ? `Talla: ${item.size}` : ''}</div>
                    </div>

                    <button
                      onClick={() => onRemove?.(item.id, item.size)}
                      className="hover:text-red-500 transition-colors p-1"
                      style={{ color: 'hsl(var(--foreground))', opacity: 0.4 }}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onUpdateQuantity?.(item.id, item.size, Math.max(1, (item.quantity || 1) - 1))}
                      >
                        -
                      </Button>
                      <div className="min-w-[28px] text-center text-sm">{item.quantity}</div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onUpdateQuantity?.(item.id, item.size, (item.quantity || 1) + 1)}
                      >
                        +
                      </Button>
                    </div>

                    <div className="text-sm font-semibold">{Number.isFinite(item.price) ? formatPrice(item.price) : ''}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div style={gridStyle} className="min-h-0">
        {blocks
          .filter((b) => b && typeof b === 'object')
          .filter((b) => b.visible !== false)
          .map((b) => {
            const regionId = b.regionId || b.id;
            if (!b.gridArea) return null;
            if ((b.type || 'region') !== 'region') return null;

            return (
              <div key={b.id} style={{ gridArea: b.gridArea, minHeight: 0 }} className="min-h-0">
                {renderRegion(regionId)}
              </div>
            );
          })
          .filter(Boolean)}
      </div>

      <SimpleConfirmModal
        open={confirmClear}
        title={clearModal?.title || 'Buidar cistell?'}
        body={clearModal?.body || "S'eliminaran tots els productes del cistell."}
        confirmLabel={(clearModal?.actions || []).find((a) => a.id === 'confirm')?.label || 'Buidar'}
        cancelLabel={(clearModal?.actions || []).find((a) => a.id === 'cancel')?.label || 'Cancel·lar'}
        confirmVariant={resolveButtonVariant((clearModal?.actions || []).find((a) => a.id === 'confirm')?.variant) || 'destructive'}
        cancelVariant={resolveButtonVariant((clearModal?.actions || []).find((a) => a.id === 'cancel')?.variant) || 'secondary'}
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          setConfirmClear(false);
          onClearCart?.();
        }}
      />
    </>
  );
}

class SlideContentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    try {
      console.error('[SlideShell] content render error:', error);
    } catch {
      // ignore
    }
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div className="p-6">
          <div className="text-sm font-semibold text-foreground">Error renderitzant el slide</div>
          <div className="mt-2 text-xs text-muted-foreground" style={{ whiteSpace: 'pre-wrap' }}>
            {String(error?.message || error)}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function resolvePreset(config, presetId) {
  const presets = config?.slides?.presets;
  const preset = presets && presetId ? presets[presetId] : null;
  return preset || null;
}

function SimpleConfirmModal({
  open,
  title,
  body,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancel·lar',
  confirmVariant,
  cancelVariant,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const modal = (
    <div className="fixed inset-0 z-[25000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
        {body ? <p className="text-gray-600 mb-6">{body}</p> : null}
        <div className="flex gap-3 justify-end">
          <Button variant={cancelVariant || 'secondary'} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant || 'destructive'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return modal;
  return createPortal(modal, document.body);
}

function CartContent({
  preset,
  cartItems,
  totalPrice,
  onUpdateQuantity,
  onRemove,
  onUpdateSize,
  onViewCart,
  onCheckout,
  onClearCart,
}) {
  const [confirmClear, setConfirmClear] = useState(false);
  const safeCartItems = useMemo(() => {
    if (!Array.isArray(cartItems)) return [];
    return cartItems.filter((item) => item && (item.id != null || item.productId != null));
  }, [cartItems]);

  const actionsCfg = preset?.ui?.regions?.find((r) => r.id === 'cartActions')?.actions || {};
  const checkoutVariant = resolveButtonVariant(actionsCfg?.checkout?.variant) ?? undefined;
  const viewCartVariant = resolveButtonVariant(actionsCfg?.viewCart?.variant) ?? 'secondary';
  const clearCartVariant = resolveButtonVariant(actionsCfg?.clearCart?.variant) ?? 'ghost';
  const checkoutLabel = actionsCfg?.checkout?.label || 'Anar a caixa';
  const viewCartLabel = actionsCfg?.viewCart?.label || 'Veure cistell';

  const toolsAvailable = !!(preset?.tools?.catalog && Array.isArray(preset?.tools?.order));

  const scrollCfg = preset?.ui?.regions?.find((r) => r.id === 'cartItems')?.scroll;
  const threshold = Number(scrollCfg?.enableWhenCountGreaterThan);
  const shouldScroll = Number.isFinite(threshold) ? safeCartItems.length > threshold : safeCartItems.length > 3;

  const clearModal = preset?.ui?.modals?.find((m) => m.id === 'clearCartConfirm');

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 sm:p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-oswald font-bold uppercase text-foreground">El teu cistell</h2>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {safeCartItems.length} {safeCartItems.length === 1 ? 'producte' : 'productes'}
          </div>
          <div className="text-sm font-semibold">{Number.isFinite(totalPrice) ? formatPrice(totalPrice) : ''}</div>
        </div>
      </div>

      <div className="border-b bg-white p-4 sm:p-6 flex items-center gap-2">
        {toolsAvailable ? (
          <ToolsBar
            preset={preset}
            onTool={(toolId) => {
              if (toolId === 'checkout') onCheckout?.();
              if (toolId === 'viewCart') onViewCart?.();
              if (toolId === 'clearCart') onClearCart?.();
            }}
          />
        ) : (
          <>
            <Button variant={checkoutVariant} className="rounded-sm flex-1" onClick={onCheckout}>
              {checkoutLabel}
            </Button>
            <Button variant={viewCartVariant} className="rounded-sm" onClick={onViewCart}>
              {viewCartLabel}
            </Button>
            <Button
              variant={clearCartVariant}
              className="rounded-sm"
              onClick={() => setConfirmClear(true)}
              aria-label="Buidar cistell"
              title="Buidar cistell"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      <div className={`flex-1 ${shouldScroll ? 'overflow-y-auto' : ''} p-4 sm:p-6 space-y-4`}>
        {safeCartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <p className="font-oswald text-lg font-medium text-foreground">El cistell és buit</p>
            <p className="font-roboto text-sm text-muted-foreground">Afegeix productes per començar</p>
          </div>
        ) : (
          safeCartItems.map((item, idx) => (
            <div key={`${item.id || item.productId || idx}-${item.size || ''}`} className="flex gap-3 sm:gap-4 items-start pb-4 border-b border-border last:border-0">
              <div className="w-24 sm:w-28 h-24 sm:h-28 bg-muted rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                {item?.image ? (
                  <img src={item.image} alt={item.name || 'Producte'} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : null}
              </div>

              <div className="flex-1 flex flex-col justify-between h-full min-h-[112px]">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <h3 className="font-oswald uppercase text-base font-bold line-clamp-2 leading-tight text-foreground">{item.name || 'Producte'}</h3>
                    <div className="mt-1 text-xs text-muted-foreground">{item.size ? `Talla: ${item.size}` : ''}</div>
                  </div>

                  <button
                    onClick={() => onRemove?.(item.id, item.size)}
                    className="hover:text-red-500 transition-colors p-1"
                    style={{ color: 'hsl(var(--foreground))', opacity: 0.4 }}
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onUpdateQuantity?.(item.id, item.size, Math.max(1, (item.quantity || 1) - 1))}
                    >
                      -
                    </Button>
                    <div className="min-w-[28px] text-center text-sm">{item.quantity}</div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onUpdateQuantity?.(item.id, item.size, (item.quantity || 1) + 1)}
                    >
                      +
                    </Button>
                  </div>

                  <div className="text-sm font-semibold">{Number.isFinite(item.price) ? formatPrice(item.price) : ''}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <SimpleConfirmModal
        open={confirmClear}
        title={clearModal?.title || 'Buidar cistell?'}
        body={clearModal?.body || "S'eliminaran tots els productes del cistell."}
        confirmLabel={(clearModal?.actions || []).find((a) => a.id === 'confirm')?.label || 'Buidar'}
        cancelLabel={(clearModal?.actions || []).find((a) => a.id === 'cancel')?.label || 'Cancel·lar'}
        confirmVariant={resolveButtonVariant((clearModal?.actions || []).find((a) => a.id === 'confirm')?.variant) || 'destructive'}
        cancelVariant={resolveButtonVariant((clearModal?.actions || []).find((a) => a.id === 'cancel')?.variant) || 'secondary'}
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          setConfirmClear(false);
          onClearCart?.();
        }}
      />
    </div>
  );
}

function FastViewContent({ preset, onLogout }) {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const logoutModal = preset?.ui?.modals?.find((m) => m.id === 'logoutConfirm');
  const logoutActionCfg = preset?.ui?.regions?.find((r) => r.id === 'helpAndSession')?.actions?.logout;
  const logoutVariant = resolveButtonVariant(logoutActionCfg?.variant || logoutActionCfg?.style) ?? 'ghost';
  const logoutLabel = logoutActionCfg?.label || 'Tancar sessió';

  const toolsAvailable = !!(preset?.tools?.catalog && Array.isArray(preset?.tools?.order));

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 sm:p-6 border-b bg-white">
        <h2 className="text-xl sm:text-2xl font-oswald font-bold uppercase text-foreground">Compte</h2>
        <p className="mt-1 text-sm text-muted-foreground">Vista ràpida</p>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        <div className="border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Usuari</div>
          <div className="mt-1 text-base font-semibold text-foreground">Sessió</div>
        </div>

        <div className="border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Darreres vistes</div>
          <div className="mt-1 text-sm text-foreground">(MVP) Encara no connectat</div>
        </div>

        <div className="border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Comandes</div>
          <div className="mt-1 text-sm text-foreground">(MVP) Encara no connectat</div>
        </div>

        <div className="pt-2 flex justify-end">
          {toolsAvailable ? (
            <div className="flex gap-2">
              <ToolsBar
                preset={preset}
                onTool={(toolId) => {
                  if (toolId === 'logout') onLogout?.();
                }}
              />
            </div>
          ) : (
            <Button variant={logoutVariant} onClick={() => setConfirmLogout(true)}>
              {logoutLabel}
            </Button>
          )}
        </div>
      </div>

      {!toolsAvailable ? (
        <SimpleConfirmModal
          open={confirmLogout}
          title={logoutModal?.title || 'Tancar sessió?'}
          body={logoutModal?.body || "Perdràs l'accés al teu compte fins que tornis a iniciar sessió."}
          confirmLabel={(logoutModal?.actions || []).find((a) => a.id === 'confirm')?.label || 'Tancar sessió'}
          cancelLabel={(logoutModal?.actions || []).find((a) => a.id === 'cancel')?.label || 'Cancel·lar'}
          confirmVariant={resolveButtonVariant((logoutModal?.actions || []).find((a) => a.id === 'confirm')?.variant) || 'destructive'}
          cancelVariant={resolveButtonVariant((logoutModal?.actions || []).find((a) => a.id === 'cancel')?.variant) || 'secondary'}
          onCancel={() => setConfirmLogout(false)}
          onConfirm={() => {
            setConfirmLogout(false);
            onLogout?.();
          }}
        />
      ) : null}
    </div>
  );
}

export default function SlideShell({
  open,
  presetId,
  slidesConfig,
  onClose,
  cartItems,
  totalPrice,
  onUpdateQuantity,
  onRemove,
  onUpdateSize,
  onViewCart,
  onCheckout,
  onClearCart,
  onLogout,
}) {
  const panelRef = useRef(null);
  const preset = useMemo(() => resolvePreset(slidesConfig, presetId), [slidesConfig, presetId]);
  const shellVariant = preset?.shell?.variant || 'right-drawer';
  const isFullWide = shellVariant === 'full-wide';

  const supportsBlocksGrid = useMemo(() => canRenderBlocksGrid(preset), [preset]);

  useFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) return undefined;

    let needsComp = false;
    try {
      needsComp = !(window.CSS && typeof window.CSS.supports === 'function' && window.CSS.supports('scrollbar-gutter: stable'));
    } catch {
      needsComp = true;
    }

    if (needsComp) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
      document.documentElement.classList.add('scrollbar-compensate');
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.classList.add('cart-open');

    const header = document.querySelector('[data-main-header="true"]');
    if (header) header.classList.add('cart-open');

    const offersHeaders = document.querySelectorAll('[data-offers-header="true"]');
    offersHeaders.forEach((el) => el.classList.add('offers-header-cart-open'));

    return () => {
      document.documentElement.style.removeProperty('--scrollbar-width');
      document.documentElement.classList.remove('scrollbar-compensate');
      document.body.style.paddingRight = '';
      document.body.classList.remove('cart-open');

      const h = document.querySelector('[data-main-header="true"]');
      if (h) h.classList.remove('cart-open');

      const o = document.querySelectorAll('[data-offers-header="true"]');
      o.forEach((el) => el.classList.remove('offers-header-cart-open'));
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="slide-backdrop"
            onClick={onClose}
            className="fixed inset-0 z-50 backdrop-blur-sm"
            style={{ backgroundColor: 'hsl(var(--foreground) / 0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          <motion.div
            key="slide-panel"
            ref={panelRef}
            className={
              isFullWide
                ? 'fixed inset-0 w-full h-full bg-white z-50 shadow-2xl flex flex-col'
                : 'fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white z-50 shadow-2xl flex flex-col h-full'
            }
            initial={isFullWide ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 }}
            animate={isFullWide ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
            exit={isFullWide ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="p-2 border-b bg-white flex items-center justify-end">
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Tancar">
                <X className="h-6 w-6 text-foreground" />
              </Button>
            </div>

            <div className="flex-1 min-h-0">
              <SlideContentErrorBoundary>
                {presetId === 'FastCartSlide' && supportsBlocksGrid ? (
                  <CartBlocksGrid
                    preset={preset}
                    cartItems={cartItems}
                    totalPrice={totalPrice}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemove={onRemove}
                    onUpdateSize={onUpdateSize}
                    onViewCart={onViewCart}
                    onCheckout={onCheckout}
                    onClearCart={onClearCart}
                  />
                ) : presetId === 'FastCartSlide' ? (
                  <CartContent
                    preset={preset}
                    cartItems={cartItems}
                    totalPrice={totalPrice}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemove={onRemove}
                    onUpdateSize={onUpdateSize}
                    onViewCart={onViewCart}
                    onCheckout={onCheckout}
                    onClearCart={onClearCart}
                  />
                ) : presetId === 'FastViewSlide' && supportsBlocksGrid ? (
                  <FastViewBlocksGrid preset={preset} onLogout={onLogout} />
                ) : presetId === 'FastViewSlide' ? (
                  <FastViewContent preset={preset} onLogout={onLogout} />
                ) : (
                  <div className="p-6 text-sm text-muted-foreground">Preset no disponible</div>
                )}
              </SlideContentErrorBoundary>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
