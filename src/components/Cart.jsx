import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useGridDebug } from '@/contexts/GridDebugContext';
import { trackRemoveFromCart } from '@/utils/analytics';

const Cart = ({ isOpen, onClose, items, onUpdateQuantity, onRemove, totalPrice, onCheckout, onUpdateSize }) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('none');
  const cartRef = useRef(null);
  const { getDebugStyle, isSectionEnabled } = useGridDebug();

  useFocusTrap(isOpen, cartRef);

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.classList.add('cart-open');

      const header = document.querySelector('header');
      if (header) {
        header.classList.add('cart-open');
      }

      const offersHeaders = document.querySelectorAll('.fixed.top-0');
      offersHeaders.forEach(el => el.classList.add('offers-header-cart-open'));
    } else {
      document.documentElement.style.removeProperty('--scrollbar-width');
      document.body.style.paddingRight = '';
      document.body.classList.remove('cart-open');

      const header = document.querySelector('header');
      if (header) {
        header.classList.remove('cart-open');
      }

      const offersHeaders = document.querySelectorAll('.fixed.top-0');
      offersHeaders.forEach(el => el.classList.remove('offers-header-cart-open'));
    }

    return () => {
      document.documentElement.style.removeProperty('--scrollbar-width');
      document.body.style.paddingRight = '';
      document.body.classList.remove('cart-open');

      const header = document.querySelector('header');
      if (header) {
        header.classList.remove('cart-open');
      }

      const offersHeaders = document.querySelectorAll('.fixed.top-0');
      offersHeaders.forEach(el => el.classList.remove('offers-header-cart-open'));
    };
  }, [isOpen]);

  const handleGoToCart = () => {
    navigate('/cart');
    onClose();
  };

  const handleSizeChange = (item, newSize) => {
    if (onUpdateSize) {
      onUpdateSize(item.id, item.size, newSize, item.quantity);
    }
  };

  const sortedItems = React.useMemo(() => {
    const itemsCopy = [...items];

    switch(sortBy) {
      case 'design':
        return itemsCopy.sort((a, b) => a.name.localeCompare(b.name));
      case 'color':
        return itemsCopy.sort((a, b) => (a.color || a.name).localeCompare(b.color || b.name));
      case 'size':
        const sizeOrder = { 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5 };
        return itemsCopy.sort((a, b) => (sizeOrder[a.size] || 0) - (sizeOrder[b.size] || 0));
      case 'price-asc':
        return itemsCopy.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return itemsCopy.sort((a, b) => b.price - a.price);
      default:
        return itemsCopy;
    }
  }, [items, sortBy]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="cart-backdrop"
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          <motion.div
            key="cart-panel"
            ref={cartRef}
            className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white z-50 shadow-2xl flex flex-col h-full"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              ...(isSectionEnabled('cart') ? getDebugStyle('cart', 'main') : {})
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
          >
        <div className="p-4 sm:p-6 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 id="cart-title" className="text-xl sm:text-2xl font-oswald font-bold uppercase" style={{ color: '#141414' }}>El teu cistell</h2>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Tanca el cistell">
              <X className="h-6 w-6" style={{ color: '#141414' }} />
            </Button>
          </div>

          {items.length > 0 && (
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-9 px-3 pr-8 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none"
                style={{ color: '#141414' }}
              >
                <option value="none">Sense ordenar</option>
                <option value="design">Ordenar per disseny</option>
                <option value="color">Ordenar per color</option>
                <option value="size">Ordenar per talla</option>
                <option value="price-asc">Preu: Menor a Major</option>
                <option value="price-desc">Preu: Major a Menor</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#141414', opacity: 0.4 }} />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <img
                src="/custom_logos/icons/basket-empty.svg"
                alt="Cistell buit"
                className="h-16 w-16 opacity-30"
              />
              <p className="font-oswald text-lg font-medium" style={{ color: '#141414' }}>El cistell és buit</p>
              <p className="font-roboto text-sm" style={{ color: '#141414', opacity: 0.6 }}>Afegeix productes per començar</p>
              <Button onClick={onClose} className="mt-4 rounded-sm">
                Continua comprant
              </Button>
            </div>
          ) : (
            sortedItems.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                className="flex gap-3 sm:gap-4 items-start pb-4 border-b border-gray-100 last:border-0"
              >
                <div className="w-24 sm:w-28 h-24 sm:h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between h-full min-h-[112px]">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <h3 className="font-oswald uppercase text-base font-bold line-clamp-2 leading-tight" style={{ color: '#141414' }}>{item.name}</h3>
                    </div>
                    <button
                      onClick={() => {
                        trackRemoveFromCart(item, item.quantity);
                        onRemove(item.id, item.size);
                      }}
                      className="hover:text-red-500 transition-colors p-1"
                      style={{ color: '#141414', opacity: 0.4 }}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="font-oswald text-xl leading-none mt-1 font-normal" style={{ color: '#141414' }}>
                    {(item.price * item.quantity).toFixed(2).replace('.', ',')} €
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <select
                      value={item.size}
                      onChange={(e) => handleSizeChange(item, e.target.value)}
                      className="flex-1 h-8 px-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      style={{ color: '#141414' }}
                    >
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                    </select>

                    <div className="flex items-center border border-gray-300 rounded-md h-8">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.size, Math.max(0, item.quantity - 1))}
                        className="px-3 hover:bg-gray-100 transition-colors h-full flex items-center"
                        aria-label="Disminuir quantitat"
                        style={{ color: '#141414' }}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium" style={{ color: '#141414' }}>{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.size, item.quantity + 1)}
                        className="px-3 hover:bg-gray-100 transition-colors h-full flex items-center"
                        aria-label="Augmentar quantitat"
                        style={{ color: '#141414' }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 sm:p-6 border-t bg-gray-50 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="font-oswald text-xl sm:text-2xl font-normal" style={{ color: '#141414' }}>Total</span>
              <span className="font-oswald text-xl sm:text-2xl font-normal" style={{ color: '#141414' }}>{totalPrice.toFixed(2).replace('.', ',')} €</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                onClick={onClose}
                className="w-full h-12 text-sm font-oswald uppercase tracking-wider hover:bg-gray-300 rounded-sm"
                style={{ backgroundColor: '#E5E7EB', color: '#141414' }}
              >
                Continua comprant
              </Button>

              <Button
                onClick={handleGoToCart}
                className="w-full h-12 text-sm font-oswald uppercase tracking-wider hover:bg-gray-800 rounded-sm"
                style={{ backgroundColor: '#141414', color: '#FFFFFF' }}
              >
                Ves al cistell
              </Button>
            </div>
          </div>
        )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export default Cart;
