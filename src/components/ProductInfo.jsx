import React, { useLayoutEffect, useState } from 'react';
import { Heart, Share2 } from 'lucide-react';

const ProductInfo = ({
  product,
  selectedSize,
  selectedColor,
  selectedVariant,
  availableSizes = ['S', 'M', 'L', 'XL'],
  availableColors = [],
  onSizeChange,
  onColorChange,
  onWishlistToggle,
  onCheckout,
  onShare,
  isInWishlist,
  cartItems,
  onAddToCart,
  layout = 'desktop'
}) => {
  // Utilitzar les talles disponibles passades com a prop
  const SIZES = availableSizes;

  const humanizeLabel = (value) => {
    const raw = (value || '').toString();
    const cleaned = raw
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Fix common abbreviation formatting
    if (/^arthur\s+d\s+the\s+second$/i.test(cleaned)) return 'Arthur D. The Second';

    // Fix possessive apostrophe
    if (/^vulcans\s+end$/i.test(cleaned)) return "Vulcan's End";

    return cleaned;
  };

  if (layout === 'desktop') {
    const [pillWidth, setPillWidth] = useState(null);

    useLayoutEffect(() => {
      const compute = () => {
        const cartButton = document.querySelector('[data-cart-button="1"]');
        const desktopContainer = document.querySelector('[data-pdp-desktop="1"]');
        if (!cartButton || !desktopContainer) return;

        const cartRect = cartButton.getBoundingClientRect();
        const desktopRect = desktopContainer.getBoundingClientRect();

        const left = 645;
        const rightLimit = cartRect.right - desktopRect.left;
        const width = Math.max(0, Math.round(rightLimit - left));
        if (width > 0) setPillWidth(`${width}px`);
      };

      const raf1 = requestAnimationFrame(compute);
      const raf2 = requestAnimationFrame(compute);
      window.addEventListener('resize', compute);
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
        window.removeEventListener('resize', compute);
      };
    }, []);

    return (
      <>
        <h1 className="font-oswald leading-none font-bold uppercase" style={{ position: 'absolute', top: '8px', left: '645px', fontSize: '35.25pt', color: '#141414', transform: 'scale(1.01)' }}>
          {humanizeLabel(product.name)}
        </h1>

        <div style={{ position: 'absolute', top: '74px', left: '645px', width: pillWidth || '322.5px', height: '40px', backgroundColor: '#F9FAFB', borderRadius: '4px', transform: 'scale(1.01)', zIndex: 1 }} />

        <p className="font-oswald leading-none font-normal" style={{ position: 'absolute', top: '78px', left: '655px', fontSize: '22.5pt', color: '#141414', transform: 'scale(1.01)', zIndex: 2 }}>
          {product.price.toFixed(2).replace('.', ',')} €
        </p>

        {/* Botonera d'acció (Desktop) - ubicada on abans hi havia "COLOR" */}
        <div className="flex items-center gap-4" style={{ position: 'absolute', top: '360px', left: '645px', transform: 'scale(1.01)', zIndex: 10 }}>
          <button
            onClick={onWishlistToggle}
            className="bg-[#F9FAFB] hover:bg-gray-300 transition-all flex items-center justify-center"
            style={{ width: '70px', height: '35px', position: 'relative', top: '0px', left: '0.5px', clipPath: 'polygon(0 0, calc(100% - 10.1px) 0, 100% 50%, calc(100% - 10.1px) 100%, 0 100%)', borderRadius: '6px 0 0 6px' }}
            aria-label="Afegir a favorits"
          >
            <Heart className={`h-6 w-6 ${isInWishlist ? 'fill-current text-red-500' : ''}`} />
          </button>
          <button
            onClick={onCheckout}
            className="bg-[#F9FAFB] hover:bg-gray-300 transition-all font-oswald text-xl tracking-wide"
            style={{ width: '154.5px', height: '35px', position: 'relative', top: '0px', left: '-0.75px', clipPath: 'polygon(0 0, calc(100% - 10.1px) 0, 100% 50%, calc(100% - 10.1px) 100%, 0 100%)', borderRadius: '6px 0 0 6px', fontWeight: 500 }}
            aria-label="Checkout"
          >
            CHECKOUT
          </button>
          <button
            onClick={onShare}
            className="bg-[#F9FAFB] hover:bg-gray-300 transition-all flex items-center justify-center"
            style={{ width: '70px', height: '35px', position: 'relative', top: '0px', left: '-2px', clipPath: 'polygon(0 0, calc(100% - 10.1px) 0, 100% 50%, calc(100% - 10.1px) 100%, 0 100%)', borderRadius: '6px 0 0 6px' }}
            aria-label="Compartir"
          >
            <Share2 className="h-6 w-6" />
          </button>
        </div>

        {/* Selector de talles (Desktop) */}
        <div className="flex items-center gap-4" style={{ position: 'absolute', top: '410px', left: '645px', transform: 'scale(1.01)', zIndex: 9 }}>
          {SIZES.map((size, idx) => {
            const leftPosition = idx === 0 ? '0px' : idx === 1 ? '-0.67px' : idx === 2 ? '-1.34px' : '-4px';

            if (size === 'XL') {
              return (
                <div key={size} style={{ position: 'relative', width: '70px', height: '35px', left: leftPosition }}>
                  <button
                    onClick={() => onSizeChange(size)}
                    data-size-button={size}
                    data-size-layout="desktop"
                    className={`transition-all duration-200 rounded-md text-xl font-oswald
                      ${selectedSize === size
                        ? 'bg-black text-white font-semibold'
                        : 'bg-[#F9FAFB] text-black font-light hover:bg-gray-300'}`}
                    style={{ width: '70px', height: '35px', position: 'relative', top: '0px', left: '0px', zIndex: 5 }}
                  >
                    {size}
                  </button>

                  <button
                    onClick={onAddToCart}
                    data-cart-button="1"
                    className="bg-transparent rounded-md flex items-end justify-center"
                    style={{ width: '70px', height: '35px', position: 'absolute', top: '0px', left: '91px', zIndex: 10, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', lineHeight: '0' }}
                    aria-label="Afegeix al cistell"
                  >
                    {cartItems.length > 0 ? (
                      <span
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, calc(-35% - 2.5px))',
                          backgroundColor: 'transparent',
                          color: '#141414',
                          fontSize: '20px',
                          fontWeight: 500,
                          lineHeight: '20px',
                          zIndex: 20,
                          pointerEvents: 'none'
                        }}
                      >
                        {cartItems.length}
                      </span>
                    ) : null}
                    <img
                      src={cartItems.length > 0 ? "/custom_logos/icons/basket-full-1.svg" : "/custom_logos/icons/basket-empty.svg"}
                      alt={cartItems.length > 0 ? "Cistell amb productes" : "Cistell buit"}
                      style={{ height: '35px', width: '70px', display: 'block', objectFit: 'contain', objectPosition: 'center bottom', transform: 'scale(1.27)', transformOrigin: 'center bottom' }}
                    />
                  </button>
                </div>
              );
            }

            return (
              <button
                key={size}
                onClick={() => onSizeChange(size)}
                data-size-button={size}
                data-size-layout="desktop"
                className={`transition-all duration-200 rounded-md text-xl font-oswald
                  ${selectedSize === size
                    ? 'bg-black text-white font-semibold'
                    : 'bg-[#F9FAFB] text-black font-light hover:bg-gray-300'}`}
                style={{ width: '70px', height: '35px', position: 'relative', top: '0px', left: leftPosition }}
              >
                {size}
              </button>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="font-oswald text-3xl sm:text-4xl font-bold uppercase mb-4">
        {product.name}
      </h1>

      {/* Selector de colors (Mobile) */}
      {availableColors.length > 0 && onColorChange && (
        <div className="mb-6">
          <h3 className="font-oswald text-sm font-bold uppercase mb-3">Color</h3>
          <div className="flex flex-wrap gap-3">
            {availableColors.map((colorObj, idx) => (
              <button
                key={idx}
                onClick={() => onColorChange(colorObj.color)}
                className={`transition-all duration-200 rounded-full border-2 overflow-hidden ${
                  selectedColor === colorObj.color
                    ? 'border-black ring-2 ring-black ring-offset-2'
                    : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{
                  width: '45px',
                  height: '45px',
                  backgroundColor: colorObj.hex || '#FFFFFF'
                }}
                title={colorObj.color}
                aria-label={`Seleccionar color ${colorObj.color}`}
              >
                {colorObj.thumbnail ? (
                  <img
                    src={colorObj.thumbnail}
                    alt={colorObj.color}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
              </button>
            ))}
          </div>
          {selectedColor && (
            <p className="mt-2 text-sm text-gray-600 capitalize">
              Seleccionat: {selectedColor}
            </p>
          )}
        </div>
      )}

      {/* Selector de talles (Mobile) */}
      <div className="mb-6">
        <h3 className="font-oswald text-sm font-bold uppercase mb-3">Talla</h3>
        <div className="grid grid-cols-4 gap-3">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => onSizeChange(size)}
              className={`py-3 rounded-md text-lg font-oswald transition-all ${
                selectedSize === size
                  ? 'bg-black text-white font-semibold'
                  : 'bg-[#F9FAFB] text-black font-light hover:bg-gray-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={onWishlistToggle}
          className="bg-[#F9FAFB] hover:bg-gray-300 p-3 rounded-md transition-all flex items-center justify-center"
        >
          <Heart className={`h-6 w-6 ${isInWishlist ? 'fill-current text-red-500' : ''}`} />
        </button>
        <button
          onClick={onCheckout}
          className="flex-1 bg-black text-white py-3 px-6 rounded-md font-oswald text-lg hover:bg-gray-800 transition-all"
          style={{ fontWeight: 500 }}
        >
          CHECKOUT
        </button>
        <button
          onClick={onShare}
          className="bg-[#F9FAFB] hover:bg-gray-300 p-3 rounded-md transition-all flex items-center justify-center"
        >
          <Share2 className="h-6 w-6" />
        </button>
      </div>
    </>
  );
};

export default ProductInfo;
