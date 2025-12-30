import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useProductContext } from '@/contexts/ProductContext';
import { useAdmin } from '@/contexts/AdminContext';
import { initAnalytics, trackPageView } from '@/utils/analytics';
import { useOffersConfig } from '@/hooks/useOffersConfig';
import { useGlobalRedirect } from '@/hooks/useGlobalRedirect';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingScreen from '@/components/LoadingScreen';
import SkipLink from '@/components/SkipLink';
import OffersHeader from '@/components/OffersHeader';
import AdminBanner from '@/components/AdminBanner';
import Header from '@/components/Header';

import ScrollToTop from '@/components/ScrollToTop';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import UserSidebar from '@/components/UserSidebar';
import Checkout from '@/components/Checkout';
import ViewportIndicator from '@/components/ViewportIndicator';
import RulerTool from '@/components/RulerTool';

const FulfillmentPage = lazy(() => import('@/pages/FulfillmentPage'));
const FulfillmentSettingsPage = lazy(() => import('@/pages/FulfillmentSettingsPage'));
const ProductDetailPageEnhanced = lazy(() => import('@/pages/ProductDetailPageEnhanced'));
const ProductPage = lazy(() => import('@/pages/ProductPage'));

// Lazy loading de pàgines per millorar performance (code splitting)
const Home = lazy(() => import('@/pages/Home'));
const FirstContactPage = lazy(() => import('@/pages/FirstContactPage'));
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
const GelatoProductDetailPage = lazy(() => import('@/pages/GelatoProductDetailPage'));
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

const OutcastedPage = lazy(() => import('@/pages/OutcastedPage'));

const AdminPage = lazy(() => import('@/pages/AdminPage'));
const IndexPage = lazy(() => import('@/pages/IndexPage'));
const ECPreviewPage = lazy(() => import('@/pages/ECPreviewPage'));
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

// Pàgines administratives
const AppsPage = lazy(() => import('@/pages/AppsPage'));
const DocumentationPage = lazy(() => import('@/pages/DocumentationPage'));

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showViewportIndicator, setShowViewportIndicator] = useState(false);
  const [debugContainers, setDebugContainers] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const location = useLocation();
  const navigate = useNavigate();

  const productContext = useProductContext();
  const { isAdmin, bypassUnderConstruction } = useAdmin();
  const { enabled: offersEnabled, loading: offersLoading } = useOffersConfig();
  const { shouldRedirect, loading: redirectLoading } = useGlobalRedirect(bypassUnderConstruction);

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

    const adminRoutes = [
      '/admin',
      '/index',
      '/promotions',
      '/ec-config',
      '/system-messages',
      '/fulfillment',
      '/fulfillment-settings',
      '/admin/media',
      '/hero-settings',
      '/admin-login',
      '/colleccio-settings',
      '/user-icon-picker',
      '/mockups',
      '/admin/gelato-sync',
      '/admin/gelato-blank',
      '/admin/products-overview'
    ];

    const isAdminRoute = adminRoutes.includes(location.pathname) ||
                         location.pathname.startsWith('/fulfillment/') ||
                         location.pathname.startsWith('/admin');
    const isECPreview = location.pathname === '/ec-preview';

    // Si hem de redirigir i no estem en una ruta admin ni ja a ec-preview
    if (shouldRedirect && !isAdminRoute && !isECPreview) {
      navigate('/ec-preview', { replace: true });
      return;
    }

    // Si NO hem de redirigir però estem a ec-preview, sortim
    if (!shouldRedirect && isECPreview) {
      navigate('/', { replace: true });
      return;
    }
  }, [shouldRedirect, redirectLoading, location.pathname, navigate, bypassUnderConstruction]);

  // Handle debug element click
  useEffect(() => {
    if (!debugContainers) {
      setSelectedElement(null);
      return;
    }

    const handleElementClick = (e) => {
      // Check if the clicked element or any parent has debug-exempt class
      let element = e.target;
      while (element && element !== document.body) {
        // Check for debug-exempt class using multiple methods for SVG compatibility
        if (
          (element.classList && element.classList.contains('debug-exempt')) ||
          (element.className && typeof element.className === 'string' && element.className.includes('debug-exempt')) ||
          element.hasAttribute('data-debug-exempt')
        ) {
          // Allow the click to pass through for exempt elements
          return;
        }
        element = element.parentElement;
      }

      e.preventDefault();
      e.stopPropagation();

      // Remove previous selection
      const previousSelected = document.querySelector('.debug-selected');
      if (previousSelected) {
        previousSelected.classList.remove('debug-selected');
      }

      // Add selection to clicked element
      e.target.classList.add('debug-selected');

      // Get element info
      const tagName = e.target.tagName.toLowerCase();
      const className = e.target.className.replace('debug-selected', '').trim();
      const id = e.target.id;

      // Determine element type and color
      let type = 'Element';
      let color = 'rgba(255, 0, 0, 0.3)';

      if (tagName === 'header') {
        type = 'Header';
        color = 'rgba(0, 150, 255, 0.8)';
      } else if (tagName === 'main') {
        type = 'Main';
        color = 'rgba(0, 255, 0, 0.8)';
      } else if (tagName === 'footer') {
        type = 'Footer';
        color = 'rgba(255, 140, 0, 0.8)';
      } else if (className.includes('container')) {
        type = 'Container';
        color = 'rgba(255, 0, 255, 0.6)';
      } else if (className.includes('grid')) {
        type = 'Grid';
        color = 'rgba(0, 255, 255, 0.6)';
      } else if (className.includes('flex')) {
        type = 'Flex';
        color = 'rgba(255, 255, 0, 0.6)';
      }

      // Get hierarchy (parents)
      const getHierarchy = (el) => {
        const hierarchy = [];
        let current = el.parentElement;
        let depth = 0;
        while (current && depth < 5) {
          const tag = current.tagName.toLowerCase();
          const cls = current.className ? `.${current.className.split(' ')[0]}` : '';
          hierarchy.push(`${tag}${cls}`);
          current = current.parentElement;
          depth++;
        }
        return hierarchy.join(' > ');
      };

      setSelectedElement({
        tagName,
        className,
        id,
        type,
        color,
        hierarchy: getHierarchy(e.target),
        width: e.target.offsetWidth,
        height: e.target.offsetHeight
      });
    };

    // Add click listeners to all elements (in capture phase to intercept before React)
    document.addEventListener('click', handleElementClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleElementClick, { capture: true });
      const selected = document.querySelector('.debug-selected');
      if (selected) {
        selected.classList.remove('debug-selected');
      }
    };
  }, [debugContainers]);

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

  const isFullScreenRoute = location.pathname === '/ec-preview';
  const isAdminRoute = ['/admin', '/index', '/promotions', '/ec-config', '/system-messages', '/fulfillment', '/fulfillment-settings', '/admin/media', '/hero-settings', '/admin-login', '/colleccio-settings', '/user-icon-picker', '/mockups', '/admin/gelato-sync', '/admin/gelato-blank', '/admin/products-overview', '/admin/draft', '/admin/draft/fulfillment-settings', '/admin/draft/mockup-settings'].includes(location.pathname) || location.pathname.startsWith('/fulfillment/') || location.pathname.startsWith('/admin');

  const offersHeaderVisible = !isAdminRoute && !isFullScreenRoute && offersEnabled && !offersLoading;

  const baseHeaderHeight = isLargeScreen ? 80 : 64;
  const offersHeaderHeight = offersHeaderVisible ? 40 : 0;
  const adminBannerHeight = isAdmin ? 40 : 0;
  const appHeaderOffset = `${baseHeaderHeight + offersHeaderHeight + adminBannerHeight}px`;

  return (
    <ErrorBoundary>
      <>
        <SkipLink />
        {isNavigating && !isAdminRoute && <LoadingScreen />}



          <div
            className={`${isAdminRoute ? 'min-h-screen' : 'min-h-screen'} bg-white flex flex-col overflow-x-hidden ${debugContainers ? 'debug-containers' : ''}`}
          >
        {/* AdminBanner - només visible per a administradors */}
        {isAdmin && (
          <div className="fixed top-0 left-0 right-0 z-[10001] pointer-events-auto">
            <AdminBanner />
          </div>
        )}

        {/* OffersHeader només visible a pàgines no admin ni full-screen */}
        {offersHeaderVisible && (
          <OffersHeader adminBannerVisible={isAdmin} />
        )}

        {/* Main Header - NO mostrar a pàgines full-screen ni admin */}
        {!isFullScreenRoute && !isAdminRoute && (
          <Header
            cartItemCount={getTotalItems()}
            onCartClick={() => setIsCartOpen(true)}
            onUserClick={() => setIsUserSidebarOpen(true)}
            offersHeaderVisible={offersHeaderVisible}
            adminBannerVisible={isAdmin}
          />
        )}

        <main
          id="main-content"
          className={`flex-grow ${isAdminRoute ? 'overflow-y-auto' : ''} ${!isFullScreenRoute ? 'transition-[padding-top] duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)]' : ''}`}
          style={!isFullScreenRoute ? (
            isAdminRoute
              ? { paddingTop: '40px', '--appHeaderOffset': '40px' }
              : {
                  paddingTop: appHeaderOffset,
                  '--appHeaderOffset': appHeaderOffset,
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
                    <FirstContactPage {...pageProps} />
                  </motion.div>
                } />

                <Route path="/outcasted" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <OutcastedPage {...pageProps} />
                  </motion.div>
                } />

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
                      <GelatoProductDetailPage />
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
                <Route path="/status" element={<OrderStatusPage />} />
                <Route path="/track" element={<OrderTrackingPage />} />

                {/* Full Screen Media Page */}
                <Route path="/ec-preview" element={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ECPreviewPage />
                  </motion.div>
                } />

                {/* TECHNICAL ROUTES - COMMENTED OUT FOR PRODUCTION */}

                {/* Pàgines Admin - Apps i Documentation */}
                <Route path="/admin/apps" element={<AppsPage />} />
                <Route path="/admin/documentation" element={<DocumentationPage />} />
                <Route path="/admin/gelato-templates" element={<GelatoTemplatesPage />} />

                {/* Admin Login - Login d'administrador */}
                <Route path="/admin-login" element={<AdminLoginPage />} />

                {/* Admin Dashboard - Central admin panel */}
                <Route path="/admin" element={<AdminPage />} />

                {/* Index Page - Site texts editor */}
                <Route path="/index" element={<IndexPage />} />

                {/* Hero Settings - Gestor de slides del hero */}
                <Route path="/hero-settings" element={<HeroSettingsPage />} />

                {/* Promotions Manager - Gestor del banner de promocions */}
                <Route path="/promotions" element={<PromotionsManagerPage />} />

                {/* EC Config - Gestor de la pàgina "En Construcció" */}
                <Route path="/ec-config" element={<ECConfigPage />} />

                {/* System Messages - Gestor de missatges del sistema */}
                <Route path="/system-messages" element={<SystemMessagesPage />} />

                {/* Admin Media Manager - Gestor visual d'imatges */}
                <Route path="/admin/media" element={<AdminMediaPage />} />

                {/* Collections Settings - Gestor de configuració de col·leccions */}
                <Route path="/colleccio-settings" element={<ColleccioSettingsPage {...pageProps} />} />

                {/* Mockups Manager - Gestor de mockups de productes */}
                <Route path="/mockups" element={<MockupsManagerPage />} />

                {/* Gelato Products Manager - Sincronització i gestió de productes de Gelato */}
                <Route path="/admin/gelato-sync" element={<GelatoProductsManagerPage />} />

                {/* Gelato Blank Products - Productes en blanc de Gelato per comparació */}
                <Route path="/admin/gelato-blank" element={<GelatoBlankProductsPage />} />

                {/* Products Overview - Visualització de tots els productes mock */}
                <Route path="/admin/products-overview" element={<ProductsOverviewPage />} />

                {/* Admin Upload Page - Upload de fitxers i carpetes */}
                <Route path="/admin/upload" element={<AdminUploadPage />} />

                <Route path="/fulfillment" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <FulfillmentPage />
                  </motion.div>
                } />

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

                <Route path="/fulfillment-settings" element={<FulfillmentSettingsPage />} />

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
        {!isFullScreenRoute && !isAdminRoute && <Footer />}

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

        {/* Viewport Indicator - Hidden on ec-preview page */}
        {location.pathname !== '/ec-preview' && (
          <ViewportIndicator
            visible={showViewportIndicator}
            onClose={() => setShowViewportIndicator(false)}
          />
        )}

        {/* Debug Containers Indicator - Hidden on ec-preview page */}
        {location.pathname !== '/ec-preview' && debugContainers && (
          <div className="debug-indicator debug-exempt">
            <h3>MODE DEBUG ACTIU</h3>
            <p style={{ marginBottom: '12px', fontSize: '11px', color: '#888' }}>
              Clica el botó taronja per desactivar
            </p>
            <ul>
              <li>
                <div className="color-box" style={{ background: 'rgba(0, 150, 255, 0.8)' }}></div>
                <span>Header</span>
              </li>
              <li>
                <div className="color-box" style={{ background: 'rgba(0, 255, 0, 0.8)' }}></div>
                <span>Main</span>
              </li>
              <li>
                <div className="color-box" style={{ background: 'rgba(255, 140, 0, 0.8)' }}></div>
                <span>Footer</span>
              </li>
              <li>
                <div className="color-box" style={{ background: 'rgba(255, 0, 255, 0.6)' }}></div>
                <span>Containers</span>
              </li>
              <li>
                <div className="color-box" style={{ background: 'rgba(0, 255, 255, 0.6)' }}></div>
                <span>Grid</span>
              </li>
              <li>
                <div className="color-box" style={{ background: 'rgba(255, 255, 0, 0.6)' }}></div>
                <span>Flex</span>
              </li>
              <li>
                <div className="color-box" style={{ background: 'rgba(255, 0, 0, 0.3)' }}></div>
                <span>Altres elements</span>
              </li>
            </ul>

            {selectedElement && (
              <div className="selected-info">
                <h4>Element seleccionat</h4>
                <p>
                  <span className="tag">&lt;{selectedElement.tagName}&gt;</span>
                </p>
                <p>
                  <strong>Tipus:</strong> {selectedElement.type}
                </p>
                {selectedElement.id && (
                  <p>
                    <strong>ID:</strong> {selectedElement.id}
                  </p>
                )}
                {selectedElement.className && (
                  <p>
                    <strong>Classes:</strong>
                    <br />
                    <span className="class">{selectedElement.className}</span>
                  </p>
                )}
                <p>
                  <strong>Dimensions:</strong> {selectedElement.width}x{selectedElement.height}px
                </p>
                <p>
                  <strong>Color:</strong>
                  <div
                    className="color-box"
                    style={{
                      background: selectedElement.color,
                      display: 'inline-block',
                      marginLeft: '8px',
                      verticalAlign: 'middle'
                    }}
                  ></div>
                </p>
                {selectedElement.hierarchy && (
                  <p>
                    <strong>Jerarquia:</strong>
                    <br />
                    <span className="hierarchy">{selectedElement.hierarchy}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

          </div>

          {/* Toggle button for Debug Containers - Moved outside debug-containers */}
          {location.pathname !== '/ec-preview' && (
            <button
              onClick={() => setDebugContainers(!debugContainers)}
              className="fixed bottom-4 left-4 bg-gradient-to-br from-orange-600 to-red-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 group debug-exempt"
              style={{ zIndex: 99999 }}
              aria-label="Mostrar/Ocultar mode debug"
              title="Mostrar/Ocultar mode debug"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {debugContainers ? 'Ocultar' : 'Mostrar'} debug
              </span>
            </button>
          )}

          {/* Ruler Tool - Moved outside debug-containers */}
          {location.pathname !== '/ec-preview' && <RulerTool />}
        </>
    </ErrorBoundary>
  );
}

export default App;
