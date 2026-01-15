import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useProductContext } from '@/contexts/ProductContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminTools } from '@/contexts/AdminToolsContext';
import { initAnalytics, trackPageView } from '@/utils/analytics';
import { useOffersConfig } from '@/hooks/useOffersConfig';
import { useGlobalRedirect } from '@/hooks/useGlobalRedirect';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingScreen from '@/components/LoadingScreen';
import SkipLink from '@/components/SkipLink';
import OffersHeader from '@/components/OffersHeader';
import AdminBanner from '@/components/AdminBanner';
import Header from '@/components/Header';
import NikeInspiredHeader from '@/components/NikeInspiredHeader';
import ScrollToTop from '@/components/ScrollToTop';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import UserSidebar from '@/components/UserSidebar';
import Checkout from '@/components/Checkout';
import AdminStudioLayout from '@/components/AdminStudioLayout';
import SupabaseCollectionRoute from '@/pages/SupabaseCollectionRoute.jsx';
import DevGuidesOverlay from '@/components/DevGuidesOverlay.jsx';

const FulfillmentPage = lazy(() => import('@/pages/FulfillmentPage'));
const FulfillmentSettingsPage = lazy(() => import('@/pages/FulfillmentSettingsPage'));
const ProductDetailPageEnhanced = lazy(() => import('@/pages/ProductDetailPageEnhanced'));
const ProductPage = lazy(() => import('@/pages/ProductPage'));

// Lazy loading de pàgines per millorar performance (code splitting)
const Home = lazy(() => import('@/pages/Home'));
const NewPage = lazy(() => import('@/pages/NewPage'));
const OrderStatusPage = lazy(() => import('@/pages/OrderStatusPage'));
const OrderTrackingPage = lazy(() => import('@/pages/OrderTrackingPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const OffersPage = lazy(() => import('@/pages/OffersPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const ShippingPage = lazy(() => import('@/pages/ShippingPage'));
const SizeGuidePage = lazy(() => import('@/pages/SizeGuidePage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const CreativeCommonsPage = lazy(() => import('@/pages/CreativeCommonsPage'));

// Outcasted now uses the config-driven CollectionPage

const AdminStudioHomePage = lazy(() => import('@/pages/AdminStudioHomePage'));
const AdminDemosPage = lazy(() => import('@/pages/AdminDemosPage'));
const IndexPage = lazy(() => import('@/pages/IndexPage'));
const ECPreviewPage = lazy(() => import('@/pages/ECPreviewPage'));
const ECPreviewLitePage = lazy(() => import('@/pages/ECPreviewLitePage'));
const PromotionsManagerPage = lazy(() => import('@/pages/PromotionsManagerPage'));
const ECConfigPage = lazy(() => import('@/pages/ECConfigPage'));
const SystemMessagesPage = lazy(() => import('@/pages/SystemMessagesPage'));
const AdminMediaPage = lazy(() => import('@/pages/AdminMediaPage'));
const UserIconPicker = lazy(() => import('@/pages/UserIconPicker'));
const HeroSettingsPage = lazy(() => import('@/pages/HeroSettingsPage'));
const AdminLoginPage = lazy(() => import('@/pages/AdminLoginPage'));
const ColleccioSettingsPage = lazy(() => import('@/pages/ColleccioSettingsPage'));
const DocumentationFilesPage = lazy(() => import('@/pages/DocumentationFilesPage'));
const GelatoTemplatesPage = lazy(() => import('@/pages/GelatoTemplatesPage'));
const MockupsManagerPage = lazy(() => import('@/pages/MockupsManagerPage'));
const GelatoProductsManagerPage = lazy(() => import('@/pages/GelatoProductsManagerPage'));
const ProductsOverviewPage = lazy(() => import('@/pages/ProductsOverviewPage'));
const GelatoBlankProductsPage = lazy(() => import('@/pages/GelatoBlankProductsPage'));
const AdminUploadPage = lazy(() => import('@/pages/AdminUploadPage'));
const UnitatsCanviPage = lazy(() => import('@/pages/UnitatsCanviPage'));

const NikeTambePage = lazy(() => import('@/pages/NikeTambePage.jsx'));
const AdidasDemoPage = lazy(() => import('@/pages/AdidasDemoPage'));
const AdidasStripeZoomDevPage = lazy(() => import('@/pages/AdidasStripeZoomDevPage'));
const DevLinksPage = lazy(() => import('@/pages/DevLinksPage'));

// Pàgines administratives
const AppsPage = lazy(() => import('@/pages/AppsPage'));
const DocumentationPage = lazy(() => import('@/pages/DocumentationPage'));

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedContainerToken, setSelectedContainerToken] = useState('');
  const [copyContainerStatus, setCopyContainerStatus] = useState('idle');
  const [selectionStatus, setSelectionStatus] = useState('idle');
  const [layoutInspectorEnabled, setLayoutInspectorEnabled] = useState(false);
  const [debugCaptureClicks, setDebugCaptureClicks] = useState(false);
  const [guidesEnabled, setGuidesEnabled] = useState(false);
  const debugButtonsWrapRef = useRef(null);
  const [debugButtonsRect, setDebugButtonsRect] = useState({ left: 16, top: 0, width: 150, height: 60 });
  const selectedElementNodeRef = useRef(null);
  const lastCopiedTokenRef = useRef('');
  const pickCycleRef = useRef({ x: null, y: null, idx: 0, sig: '' });
  const [contentContainerLeft, setContentContainerLeft] = useState(null);
  const [contentContainerRight, setContentContainerRight] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [layoutInspectorPickEnabled, setLayoutInspectorPickEnabled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const productContext = useProductContext();
  const { isAdmin, bypassUnderConstruction } = useAdmin();
  const { tools, toggleTool } = useAdminTools();
  const { enabled: offersEnabled, loading: offersLoading } = useOffersConfig();
  const { shouldRedirect, redirectUrl, loading: redirectLoading } = useGlobalRedirect(bypassUnderConstruction);

  useEffect(() => {
    try {
      localStorage.removeItem('debugCaptureClicks');
      localStorage.removeItem('layoutInspectorPickEnabled');
      localStorage.removeItem('adminTools');
      localStorage.removeItem('NIKE_DEMO_MANUAL');
      localStorage.removeItem('NIKE_DEMO_PHASE');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    window.__GLOBAL_REDIRECT_STATE__ = {
      shouldRedirect,
      redirectUrl,
      redirectLoading,
      bypassUnderConstruction,
      isAdmin,
      path: location.pathname
    };
  }, [shouldRedirect, redirectUrl, redirectLoading, bypassUnderConstruction, isAdmin, location.pathname]);

  if (!productContext) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Error: ProductContext no disponible</h1>
        <p>Si us plau, recarrega la pàgina.</p>
      </div>
    </div>;
  }

  const { cartItems, getTotalItems, getTotalPrice, addToCart, updateQuantity, removeFromCart, updateSize, clearCart, loading, error, products } = productContext;

  // ALL HOOKS MUST BE BEFORE ANY EARLY RETURNS
  // Loading state on route change
  useEffect(() => {
    setIsNavigating(true);

    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [location.pathname]);

  // Inicialitzar analytics
  useEffect(() => {
    initAnalytics();
  }, []);

  // Track page views
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  // Track viewport size for responsive padding
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle global redirect
  useEffect(() => {
    if (redirectLoading) return;

    const enableInDev = String(import.meta?.env?.VITE_ENABLE_GLOBAL_REDIRECT_IN_DEV || '').toLowerCase() === 'true';
    const hostname = (typeof window !== 'undefined' ? window.location?.hostname : '') || '';
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';

    const adminRoutes = [
      '/admin',
      '/admin-login',
      '/user-icon-picker',
      // Legacy admin routes (redirected)
      '/index',
      '/promotions',
      '/ec-config',
      '/system-messages',
      '/colleccio-settings',
      '/mockups',
      '/fulfillment',
      '/fulfillment-settings'
    ];

    const isAdminRoute = adminRoutes.includes(location.pathname) ||
                         location.pathname.startsWith('/fulfillment/') ||
                         location.pathname.startsWith('/admin');
    const isECPreview = location.pathname === '/ec-preview';
    const isECPreviewLite = location.pathname === '/ec-preview-lite';

    const hasExternalTarget = !!redirectUrl && /^https?:\/\//i.test(redirectUrl);

    // If global redirect is enabled and an external target is configured,
    // always send non-admin routes outside.
    if (shouldRedirect && hasExternalTarget && !isAdminRoute && !isECPreview && !isECPreviewLite) {
      if ((import.meta?.env?.DEV || isLocalhost) && !enableInDev) {
        return;
      }
      window.location.replace(redirectUrl);
      return;
    }

    // Si hem de redirigir i no estem en una ruta admin ni ja a ec-preview-lite
    if (shouldRedirect && !isAdminRoute && !isECPreviewLite) {
      navigate('/ec-preview-lite', { replace: true });
      return;
    }

    // Si NO hem de redirigir però estem a ec-preview-lite, sortim
    if (!shouldRedirect && isECPreviewLite) {
      navigate('/', { replace: true });
      return;
    }
  }, [shouldRedirect, redirectUrl, redirectLoading, location.pathname, navigate, bypassUnderConstruction]);

  const isNikeDemoRoute = location.pathname === '/nike-tambe';
  const isNikeHeroDemoRoute = false;
  const isAdidasDemoRoute = location.pathname === '/adidas-demo' || location.pathname.startsWith('/adidas-demo/');
  const isDevDemoRoute = isNikeDemoRoute || isAdidasDemoRoute;
  const layoutInspectorActive = (isAdmin || isDevDemoRoute) && location.pathname !== '/ec-preview' && location.pathname !== '/ec-preview-lite' && layoutInspectorEnabled;

  const [nikeDemoManualEnabled, setNikeDemoManualEnabled] = useState(false);
  const [nikeDemoPhaseOverride, setNikeDemoPhaseOverride] = useState(null);

  useEffect(() => {
    if (!isDevDemoRoute) {
      setNikeDemoManualEnabled(false);
      setNikeDemoPhaseOverride(null);
      return undefined;
    }

    const readControls = () => {
      try {
        const enabled = window.localStorage.getItem('NIKE_DEMO_MANUAL') === '1';
        const phase = window.localStorage.getItem('NIKE_DEMO_PHASE');
        setNikeDemoManualEnabled(enabled);
        setNikeDemoPhaseOverride(phase === 'rest' || phase === 'expanded' ? phase : null);
      } catch {
        setNikeDemoManualEnabled(false);
        setNikeDemoPhaseOverride(null);
      }
    };

    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (e.key === 'NIKE_DEMO_MANUAL' || e.key === 'NIKE_DEMO_PHASE') {
        readControls();
      }
    };

    readControls();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [isDevDemoRoute]);

  const writeNikeDemoControls = ({ enabled, phase }) => {
    try {
      window.localStorage.setItem('NIKE_DEMO_MANUAL', enabled ? '1' : '0');
      if (enabled) {
        window.localStorage.setItem('NIKE_DEMO_PHASE', phase);
      } else {
        window.localStorage.removeItem('NIKE_DEMO_PHASE');
      }
    } catch {
      // ignore
    }

    try {
      window.dispatchEvent(new Event('nike-demo-controls-changed'));
    } catch {
      // ignore
    }

    setNikeDemoManualEnabled(enabled);
    setNikeDemoPhaseOverride(phase === 'rest' || phase === 'expanded' ? phase : null);
  };

  useEffect(() => {
    try {
      localStorage.setItem('layoutInspectorPickEnabled', JSON.stringify(layoutInspectorPickEnabled));
    } catch {
      // ignore
    }
  }, [layoutInspectorPickEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('debugCaptureClicks', JSON.stringify(debugCaptureClicks));
    } catch {
      // ignore
    }
  }, [debugCaptureClicks]);

  useEffect(() => {
    const el = debugButtonsWrapRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      if (!rect?.width || !rect?.height) return;
      setDebugButtonsRect({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [isAdmin, isDevDemoRoute, location.pathname]);

  useEffect(() => {
    const update = () => {
      const candidates = Array.from(document.querySelectorAll('.mx-auto[class*="max-w-[1400px]"]'));
      const best = candidates
        .map((el) => ({ el, rect: el?.getBoundingClientRect?.() }))
        .filter((x) => x.rect && Number.isFinite(x.rect.left) && Number.isFinite(x.rect.width) && x.rect.width > 0)
        .sort((a, b) => b.rect.width - a.rect.width)[0];

      const rect = best?.rect;
      if (!rect || !Number.isFinite(rect.left) || rect.left <= 0) {
        setContentContainerLeft(null);
        setContentContainerRight(null);
        return;
      }
      setContentContainerLeft(rect.left);
      setContentContainerRight(rect.left + rect.width);
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [location.pathname]);

  // Handle layout inspector element click
  useEffect(() => {
    if (!layoutInspectorActive) {
      setSelectedElement(null);
      selectedElementNodeRef.current = null;
      setSelectedContainerToken('');
      setCopyContainerStatus('idle');
      setSelectionStatus('idle');
      lastCopiedTokenRef.current = '';
      return;
    }

    const isFixedElement = (el) => {
      if (!el || !(el instanceof Element)) return false;
      try {
        return window.getComputedStyle(el).position === 'fixed';
      } catch {
        return false;
      }
    };

    const isDevOverlay = (el) => !!(el && el instanceof Element && el.closest('[data-dev-overlay="true"]'));

    const pickElementInMain = (clientX, clientY) => {
      const main = document.getElementById('main-content');
      if (!main) return null;
      if (!document.elementsFromPoint) return null;
      const stack = document.elementsFromPoint(clientX, clientY);
      const toolbar = debugButtonsWrapRef.current;

      const filtered = stack
        .filter((el) => el instanceof Element)
        .filter((el) => main.contains(el))
        .filter((el) => !isDevOverlay(el))
        .filter((el) => !(toolbar && toolbar.contains(el)))
        .filter((el) => !isFixedElement(el))
        .filter((el) => {
          try {
            const cs = window.getComputedStyle(el);
            if (cs.pointerEvents === 'none') return false;
            if (cs.visibility === 'hidden') return false;
            if (cs.display === 'none') return false;
          } catch {
            // ignore
          }
          return true;
        });

      if (!filtered.length) return null;

      const signature = filtered
        .slice(0, 12)
        .map((el) => {
          const tag = (el.tagName || '').toLowerCase();
          const id = (el.getAttribute('id') || '').trim();
          const cls = (el.getAttribute('class') || '').toString();
          return `${tag}#${id}.${cls}`;
        })
        .join('|');

      const samePoint = pickCycleRef.current.x === clientX && pickCycleRef.current.y === clientY && pickCycleRef.current.sig === signature;
      const nextIdx = samePoint ? pickCycleRef.current.idx + 1 : 0;
      const idx = nextIdx % filtered.length;
      pickCycleRef.current = { x: clientX, y: clientY, idx, sig: signature };

      return filtered[idx];
    };

    const clearSelection = () => {
      const previousSelected = document.querySelector('.debug-selected');
      if (previousSelected) previousSelected.classList.remove('debug-selected');
      setSelectedElement(null);
      selectedElementNodeRef.current = null;
      setSelectedContainerToken('');
      setCopyContainerStatus('idle');
      setSelectionStatus('idle');
    };

    const onPointerDown = (e) => {
      if (!layoutInspectorActive) {
        return;
      }
      const toolbar = debugButtonsWrapRef.current;
      if (toolbar && toolbar.contains(e.target)) return;
      if (e.target && e.target.closest && e.target.closest('.debug-exempt,[data-debug-exempt="true"]')) return;
      if (isDevOverlay(e.target)) return;
      if (typeof e.clientX !== 'number' || typeof e.clientY !== 'number') return;
      const main = document.getElementById('main-content');
      if (!(main && e.target instanceof Element && main.contains(e.target))) return;
      const pickedFromPoint = pickElementInMain(e.clientX, e.clientY);
      const pickedFromTarget = (main && main.contains(e.target) && !isDevOverlay(e.target) && !isFixedElement(e.target)) ? e.target : null;
      const picked = pickedFromPoint || pickedFromTarget;
      if (!picked) {
        clearSelection();
        return;
      }

      if (layoutInspectorPickEnabled && debugCaptureClicks) {
        e.preventDefault();
        e.stopPropagation();
      }

      const target = picked;
      const previousSelected = document.querySelector('.debug-selected');
      if (previousSelected) previousSelected.classList.remove('debug-selected');
      if (target.classList) target.classList.add('debug-selected');

      selectedElementNodeRef.current = target;
      const token = buildContainerToken(target);
      setSelectedContainerToken((prev) => {
        const isSame = prev && prev === token;
        setSelectionStatus(isSame ? 'selected_same' : 'selected_new');
        window.setTimeout(() => setSelectionStatus('idle'), 900);
        return token;
      });
      setCopyContainerStatus('ready');
    };

    const onClickCapture = (e) => {
      if (!layoutInspectorPickEnabled) return;
      if (!debugCaptureClicks) return;
      if (!(e.target instanceof Element)) return;
      const main = document.getElementById('main-content');
      if (!(main && main.contains(e.target))) return;
      if (isFixedElement(e.target)) return;
      const toolbar = debugButtonsWrapRef.current;
      if (toolbar && toolbar.contains(e.target)) return;
      if (e.target.closest('.debug-exempt,[data-debug-exempt="true"]')) return;
      if (isDevOverlay(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener('pointerdown', onPointerDown, { capture: true, passive: !debugCaptureClicks });
    window.addEventListener('click', onClickCapture, { capture: true, passive: false });

    return () => {
      window.removeEventListener('pointerdown', onPointerDown, { capture: true });
      window.removeEventListener('click', onClickCapture, { capture: true });
      const selected = document.querySelector('.debug-selected');
      if (selected) selected.classList.remove('debug-selected');
      selectedElementNodeRef.current = null;
    };
  }, [layoutInspectorActive, layoutInspectorPickEnabled, debugCaptureClicks]);

  const buildContainerToken = (el) => {
    if (!el || !(el instanceof Element)) return '';
    const tagNameRaw = (el.tagName || '').toLowerCase();
    const idRaw = (el.getAttribute('id') || '').trim();
    const classRaw = (el.getAttribute('class') || '').replace(/\bdebug-selected\b/g, '').trim();
    const firstClass = classRaw ? String(classRaw).split(/\s+/).filter(Boolean)[0] : '';

    const buildPath = () => {
      const parts = [];
      let cur = el;
      while (cur && cur instanceof Element && cur !== document.body) {
        const tag = (cur.tagName || '').toLowerCase();
        const parent = cur.parentElement;
        const idx = parent ? Math.max(0, Array.from(parent.children).indexOf(cur)) : 0;
        parts.unshift(`${tag}[${idx}]`);
        if (cur.getAttribute('id')) break;
        cur = parent;
      }
      return parts.join('>');
    };

    const hint = idRaw
      ? `#${idRaw}`
      : firstClass
        ? `.${firstClass}`
        : '';

    return `${buildPath()}${hint ? ` ${tagNameRaw}${hint}` : ''}`.trim();
  };

  const copySelectedContainer = async () => {
    const mainContent = document.getElementById('main-content');
    const node = selectedElementNodeRef.current;
    const nodeIsValid = !!(mainContent && node && node instanceof Element && mainContent.contains(node) && !node.closest('[data-dev-overlay="true"]') && (window.getComputedStyle(node).position !== 'fixed'));

    const tokenNow = nodeIsValid ? buildContainerToken(node) : '';
    if (!tokenNow) return;
    const text = tokenNow;
    if (text !== selectedContainerToken) {
      setSelectedContainerToken(text);
    }

    const fallbackCopy = () => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    };

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ok = fallbackCopy();
        if (!ok) throw new Error('copy_failed');
      }
      setCopyContainerStatus((prev) => {
        const isRepeat = lastCopiedTokenRef.current && lastCopiedTokenRef.current === text;
        return isRepeat ? 'copied_again' : 'copied';
      });
      lastCopiedTokenRef.current = text;
      window.setTimeout(() => setCopyContainerStatus('ready'), 1200);
    } catch {
      setCopyContainerStatus('ready');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error && (!products || products.length === 0)) {
    console.error('❌ Error loading products:', error);
    return <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-black">Error carregant productes</h1>
        <p className="text-gray-600 mb-4">{error.message || 'Si us plau, torna-ho a intentar.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Recarregar
        </button>
      </div>
    </div>;
  }

  // Obrir cistell quan s'afegeix un producte
  const handleAddToCart = (product, size, quantity = 1, shouldOpenCart = true) => {
    addToCart(product, size, quantity);
    if (shouldOpenCart) {
      setIsCartOpen(true);
    }
  };

  // Shared props for pages
  const pageProps = {
    onAddToCart: handleAddToCart,
    cartItems,
    onUpdateQuantity: updateQuantity
  };

  const isFullScreenRoute = location.pathname === '/ec-preview' || location.pathname === '/ec-preview-lite';
  const isAdminRoute = ['/admin', '/index', '/promotions', '/ec-config', '/system-messages', '/fulfillment', '/fulfillment-settings', '/admin/media', '/admin-login', '/colleccio-settings', '/user-icon-picker', '/mockups', '/admin/gelato-sync', '/admin/gelato-blank', '/admin/products-overview', '/admin/draft', '/admin/draft/fulfillment-settings', '/admin/draft/mockup-settings'].includes(location.pathname) || location.pathname.startsWith('/fulfillment/') || location.pathname.startsWith('/admin');
  const isHeroSettingsDevRoute = location.pathname === '/hero-settings';
  // DEV layout routes: hide offers/footer, show AdminBanner, etc.
  const isDevLayoutRoute = isHeroSettingsDevRoute || isDevDemoRoute;
  // DEV header routes: inject the global white DEV header with links.
  // EXCEPTIONS: header-demo pages keep their own headers, so don't override them.
  const isDevHeaderRoute =
    isHeroSettingsDevRoute ||
    (isDevDemoRoute && !isAdidasDemoRoute && !isNikeHeroDemoRoute);

  const isAdminStudioRoute = location.pathname.startsWith('/admin/studio');
  const devHeaderVisible = !isFullScreenRoute && (isDevHeaderRoute || isAdminStudioRoute);

  const offersHeaderVisible = !isAdminRoute && !isFullScreenRoute && !isDevLayoutRoute && offersEnabled && !offersLoading;

  const baseHeaderHeight = isLargeScreen ? 80 : 64;
  const heroSettingsDevHeaderHeight = isDevHeaderRoute ? baseHeaderHeight : 0;
  const offersHeaderHeight = offersHeaderVisible ? 40 : 0;
  const adminBannerVisible = isAdmin || isDevDemoRoute || isAdminRoute;
  const adminBannerHeight = adminBannerVisible ? 40 : 0;
  const adminRouteDevHeaderHeight = (isAdminRoute && devHeaderVisible) ? baseHeaderHeight : 0;
  const adminRouteOffset = `${adminBannerHeight + adminRouteDevHeaderHeight}px`;
  const appHeaderOffset = `${(isDevHeaderRoute ? heroSettingsDevHeaderHeight : baseHeaderHeight) + offersHeaderHeight + adminBannerHeight}px`;
  const adidasHeaderOffset = `${adminBannerHeight}px`;

  return (
  <ErrorBoundary>
    <>
      <SkipLink />
      {isNavigating && !isAdminRoute && <LoadingScreen />}

      {adminBannerVisible && <AdminBanner />}

      {!isFullScreenRoute && !isAdminRoute && !isDevLayoutRoute && offersHeaderVisible && (
        <OffersHeader adminBannerVisible={adminBannerVisible} />
      )}

      {devHeaderVisible && (
        <div className="fixed left-0 right-0 z-[20000] bg-white border-b border-gray-200" style={{ top: `${adminBannerHeight}px` }}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-16 lg:h-20 flex items-center gap-2 text-xs text-gray-700">
          <button type="button" onClick={() => navigate('/nike-tambe')} className="hover:text-black">Nike També</button>
          <span className="text-gray-300">/</span>
          <button type="button" onClick={() => navigate('/adidas-demo')} className="hover:text-black">Adidas</button>
          <span className="text-gray-300">/</span>
          <button type="button" onClick={() => navigate('/hero-settings')} className="hover:text-black">Hero Settings</button>
        </div>
      </div>
      )}

      {/* Main Header - NO mostrar a pàgines full-screen ni admin ni a dev tools */}
      {!isFullScreenRoute && !isAdminRoute && !isAdidasDemoRoute && !isDevHeaderRoute && (
        isNikeDemoRoute ? (
          <NikeInspiredHeader
            cartItemCount={getTotalItems()}
            onCartClick={() => setIsCartOpen(true)}
            onUserClick={() => setIsUserSidebarOpen(true)}
            offersHeaderVisible={offersHeaderVisible}
            adminBannerVisible={adminBannerVisible}
          />
        ) : (
          <Header
            cartItemCount={getTotalItems()}
            onCartClick={() => setIsCartOpen(true)}
            onUserClick={() => setIsUserSidebarOpen(true)}
            offersHeaderVisible={offersHeaderVisible}
            adminBannerVisible={adminBannerVisible}
          />
        )
      )}

        <main
          id="main-content"
          className={`flex-grow ${isAdminRoute ? 'overflow-y-auto' : ''} ${!isFullScreenRoute ? 'transition-[padding-top] duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)]' : ''} ${(layoutInspectorActive && layoutInspectorPickEnabled) ? 'debug-containers' : ''}`}
          style={!isFullScreenRoute ? (
            isAdminRoute
              ? { paddingTop: adminRouteOffset, '--appHeaderOffset': adminRouteOffset }
              : {
                  paddingTop: isAdidasDemoRoute ? adidasHeaderOffset : appHeaderOffset,
                  '--appHeaderOffset': isAdidasDemoRoute ? adidasHeaderOffset : appHeaderOffset,
                }
          ) : {}}
          tabIndex={-1}
        >
          <Suspense fallback={<LoadingScreen />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Home {...pageProps} />
                  </motion.div>
                } />
                <Route path="/first-contact" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <SupabaseCollectionRoute collectionKey="first-contact" {...pageProps} />
                  </motion.div>
                } />

                <Route path="/outcasted" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <SupabaseCollectionRoute collectionKey="outcasted" {...pageProps} />
                  </motion.div>
                } />

                <Route path="/proves" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <SupabaseCollectionRoute collectionKey="proves" {...pageProps} />
                  </motion.div>
                } />

                <Route
                  path="/proves/product/:id"
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ProductDetailPage {...pageProps} />
                    </motion.div>
                  }
                />

                {/* Product Detail Page */}
                <Route
                  path="/product/:id"
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ProductDetailPage {...pageProps} />
                    </motion.div>
                  }
                />

                {/* Gelato Product Detail Page */}
                <Route
                  path="/product-gelato/:id"
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ProductDetailPage {...pageProps} />
                    </motion.div>
                  }
                />

                {/* Search Page */}
                <Route
                  path="/search"
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <SearchPage {...pageProps} />
                    </motion.div>
                  }
                />

                {/* Cart Page */}
                <Route
                  path="/cart"
                  element={
                    <CartPage
                      cartItems={cartItems}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  }
                />

                {/* Wishlist/Favorits Page */}
                <Route
                  path="/wishlist"
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <WishlistPage {...pageProps} />
                    </motion.div>
                  }
                />

                {/* Profile Page */}
                <Route
                  path="/profile"
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ProfilePage />
                    </motion.div>
                  }
                />

                {/* Checkout Page */}
                <Route
                  path="/checkout"
                  element={
                    <CheckoutPage
                      cartItems={cartItems}
                      onClearCart={clearCart}
                    />
                  }
                />

                {/* Order Confirmation Page */}
                <Route
                  path="/order-confirmation/:orderId"
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <OrderConfirmationPage />
                    </motion.div>
                  }
                />

                {/* Footer Service Pages - Només català */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/shipping" element={<ShippingPage />} />
                <Route path="/sizing" element={<SizeGuidePage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/cc" element={<CreativeCommonsPage />} />
                <Route path="/offers" element={<OffersPage />} />

                <Route path="/new" element={<NewPage />} />
                <Route path="/adidas-demo" element={<AdidasDemoPage />} />
                <Route path="/adidas-stripe-zoom-dev" element={<AdidasStripeZoomDevPage />} />
                <Route path="/dev-links" element={<DevLinksPage />} />
                <Route path="/nike-tambe" element={<NikeTambePage />} />
                <Route path="/status" element={<OrderStatusPage />} />
                <Route path="/track" element={<OrderTrackingPage />} />

                {/* Full Screen Media Page */}
                <Route path="/ec-preview" element={<Navigate to="/ec-preview-lite" replace />} />

                <Route path="/ec-preview-lite" element={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ECPreviewLitePage />
                  </motion.div>
                } />

                {/* TECHNICAL ROUTES - COMMENTED OUT FOR PRODUCTION */}

                {/* Admin Login - Login d'administrador */}
                <Route path="/admin-login" element={<AdminLoginPage />} />

                {/* Admin Studio - Multi-page under /admin/... */}
                <Route path="/admin" element={<AdminDemosPage />} />

                <Route path="/admin/studio" element={<AdminStudioLayout />}>
                  <Route index element={<AdminStudioHomePage />} />
                  <Route path="demos" element={<AdminDemosPage />} />
                  <Route path="index" element={<IndexPage />} />
                  <Route path="promotions" element={<PromotionsManagerPage />} />
                  <Route path="ec-config" element={<ECConfigPage />} />
                  <Route path="system-messages" element={<SystemMessagesPage />} />
                  <Route path="media" element={<AdminMediaPage />} />
                  <Route path="hero" element={<HeroSettingsPage />} />
                  <Route path="collections" element={<ColleccioSettingsPage {...pageProps} />} />
                  <Route path="mockups" element={<MockupsManagerPage />} />
                  <Route path="upload" element={<AdminUploadPage />} />
                  <Route path="fulfillment" element={<FulfillmentPage />} />
                  <Route path="fulfillment-settings" element={<FulfillmentSettingsPage />} />
                  <Route path="gelato-sync" element={<GelatoProductsManagerPage />} />
                  <Route path="gelato-blank" element={<GelatoBlankProductsPage />} />
                  <Route path="gelato-templates" element={<GelatoTemplatesPage />} />
                  <Route path="products-overview" element={<ProductsOverviewPage />} />
                  <Route path="unitats" element={<UnitatsCanviPage />} />
                  <Route path="draft" element={<Navigate to="/admin/studio" replace />} />
                  <Route path="draft/fulfillment-settings" element={<FulfillmentSettingsPage />} />
                  <Route path="draft/mockup-settings" element={<Navigate to="/admin/studio" replace />} />
                </Route>

                {/* Legacy admin routes -> redirects to Admin Studio */}
                <Route path="/index" element={<Navigate to="/admin/studio/index" replace />} />
                <Route path="/promotions" element={<Navigate to="/admin/studio/promotions" replace />} />
                <Route path="/ec-config" element={<Navigate to="/admin/studio/ec-config" replace />} />
                <Route path="/system-messages" element={<Navigate to="/admin/studio/system-messages" replace />} />
                <Route path="/hero-settings" element={<HeroSettingsPage />} />
                <Route path="/colleccio-settings" element={<Navigate to="/admin/studio/collections" replace />} />
                <Route path="/mockups" element={<Navigate to="/admin/studio/mockups" replace />} />
                <Route path="/fulfillment" element={<Navigate to="/admin/studio/fulfillment" replace />} />
                <Route path="/fulfillment-settings" element={<Navigate to="/admin/studio/fulfillment-settings" replace />} />

                <Route path="/fulfillment/:id" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <ProductDetailPageEnhanced />
                  </motion.div>
                } />

                {/* User Icon Picker - Temporal */}
                <Route path="/user-icon-picker" element={<UserIconPicker />} />

                {/* Documentation Files - Temporal */}
                <Route path="/documentation-files" element={<DocumentationFilesPage />} />

                {/* 404 Page - Must be last */}
                <Route path="*" element={<NotFoundPage />} />

              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>

        {/* Footer - NO mostrar a pàgines full-screen ni admin */}
        {!isFullScreenRoute && !isAdminRoute && !isDevLayoutRoute && <Footer />}

        <ScrollToTop />

        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onUpdateSize={updateSize}
          totalPrice={getTotalPrice()}
        />

        <UserSidebar
          isOpen={isUserSidebarOpen}
          onClose={() => setIsUserSidebarOpen(false)}
        />

        <Checkout
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cartItems}
          totalPrice={getTotalPrice()}
          onComplete={() => {
            clearCart();
            setIsCheckoutOpen(false);
          }}
        />

        {/* Toggle button for Debug - Moved outside debug-containers */}
        {(isAdmin || isDevDemoRoute) && location.pathname !== '/ec-preview' && location.pathname !== '/ec-preview-lite' && (
          <>
            <div ref={debugButtonsWrapRef} className="fixed bottom-4 left-4 z-[99999] flex items-center gap-2 debug-exempt">
              <button
                onClick={() => setLayoutInspectorEnabled((v) => !v)}
                className="h-12 w-12 bg-gradient-to-br from-orange-600 to-red-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center debug-exempt"
                aria-label="Mostrar/Ocultar debug"
              >
                <svg
                  className="block w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>

              <button
                type="button"
                className={`h-12 rounded-full border px-4 text-[12px] font-semibold shadow-lg active:bg-black/10 debug-exempt ${
                  debugCaptureClicks
                    ? 'border-slate-900/15 bg-slate-900 text-white hover:bg-slate-800'
                    : 'border-black/15 bg-white text-black/80 hover:bg-black/5'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDebugCaptureClicks((v) => !v);
                }}
              >
                {debugCaptureClicks ? 'Clicks OFF' : 'Clicks ON'}
              </button>

              <button
                type="button"
                className={`h-12 rounded-full border px-4 text-[12px] font-semibold shadow-lg active:bg-black/10 debug-exempt ${
                  guidesEnabled
                    ? 'border-[#337AC6]/40 bg-[#337AC6]/10 text-[#0f172a] hover:bg-[#337AC6]/15'
                    : 'border-black/15 bg-white text-black/80 hover:bg-black/5'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setGuidesEnabled((v) => !v);
                }}
              >
                Guides
              </button>

              <button
                type="button"
                className={`h-12 rounded-full border px-4 text-[12px] font-semibold shadow-lg active:bg-black/10 disabled:opacity-50 disabled:cursor-not-allowed debug-exempt ${
                  selectedContainerToken
                    ? 'border-emerald-500/50 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                    : 'border-black/15 bg-white text-black/80 hover:bg-black/5'
                } ${selectionStatus === 'selected_new' ? 'ring-2 ring-emerald-400/60' : ''} ${selectionStatus === 'selected_same' ? 'ring-2 ring-amber-400/60' : ''}`}
                disabled={!layoutInspectorActive || !selectedContainerToken}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  copySelectedContainer();
                }}
                aria-label="Copiar contenidor seleccionat"
              >
                {copyContainerStatus === 'copied'
                  ? 'Copied'
                  : copyContainerStatus === 'copied_again'
                    ? 'Copied again'
                    : selectionStatus === 'selected_new'
                      ? 'Selected'
                      : selectionStatus === 'selected_same'
                        ? 'Same'
                        : 'Copy container'}
              </button>

              {isDevDemoRoute && (
                <div className="flex items-center gap-2">
                  {isNikeHeroDemoRoute && (
                    <button
                      type="button"
                      className="h-12 rounded-full border border-black/15 bg-white px-3 text-[11px] font-medium text-black/80 shadow-sm hover:bg-black/5 disabled:opacity-40"
                      disabled={!nikeDemoManualEnabled}
                      onClick={() => {
                        const current = (nikeDemoPhaseOverride === 'rest' || nikeDemoPhaseOverride === 'expanded') ? nikeDemoPhaseOverride : 'expanded';
                        const next = current === 'expanded' ? 'rest' : 'expanded';
                        writeNikeDemoControls({ enabled: nikeDemoManualEnabled, phase: next });
                      }}
                    >
                      {(nikeDemoPhaseOverride || 'expanded') === 'expanded' ? 'Repòs' : 'Expandir'}
                    </button>
                  )}

                  <button
                    type="button"
                    className="h-12 rounded-full border border-black/15 bg-white px-3 text-[11px] font-medium text-black/80 shadow-sm hover:bg-black/5"
                    onClick={() => {
                      const nextEnabled = !nikeDemoManualEnabled;
                      const phase = (nikeDemoPhaseOverride === 'rest' || nikeDemoPhaseOverride === 'expanded') ? nikeDemoPhaseOverride : 'expanded';
                      writeNikeDemoControls({ enabled: nextEnabled, phase });
                    }}
                  >
                    Manual: {nikeDemoManualEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        {(isAdmin || isDevDemoRoute) && location.pathname !== '/ec-preview' && location.pathname !== '/ec-preview-lite' && guidesEnabled && (
          <DevGuidesOverlay />
        )}
      </>
    </ErrorBoundary>
  );
}

export default App;
