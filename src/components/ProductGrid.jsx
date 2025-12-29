import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import { typography, getTypographyClasses } from '@/config/typography';
import { useGridDebug } from '@/contexts/GridDebugContext';

const useResponsiveFontSize = (config) => {
  const [fontSize, setFontSize] = useState(config.fontSize?.mobile || config.fontSize?.base || '14px');

  useEffect(() => {
    const updateFontSize = () => {
      const width = window.innerWidth;
      if (width >= 1024 && config.fontSize?.desktop) {
        setFontSize(config.fontSize.desktop);
      } else {
        // Manté la mida mobile fins a 1024px per evitar salts
        setFontSize(config.fontSize?.mobile || config.fontSize?.base || '14px');
      }
    };

    updateFontSize();
    window.addEventListener('resize', updateFontSize);
    return () => window.removeEventListener('resize', updateFontSize);
  }, [config]);

  return fontSize;
};

function ProductGrid({
  title,
  description,
  products,
  onAddToCart,
  cartItems,
  onUpdateQuantity,
  collectionPath,
  backgroundColor
}) {
  const { getDebugStyle, isSectionEnabled } = useGridDebug();
  const gridTitleFontSize = useResponsiveFontSize(typography.productGrid.title);
  const gridDescriptionFontSize = useResponsiveFontSize(typography.productGrid.description);
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const safeProducts = Array.isArray(products)
    ? products
        .filter(Boolean)
        .filter(p => p?.id || p?.slug || p?.gelatoProductId)
    : [];

  return (
    <section
      style={isSectionEnabled('layout') ? getDebugStyle('layout', 'main') : {}}
    >
      {/* Fons blanc que inclou títol, descripció i productes */}
      <div className="bg-white w-full">
        {/* Títol i descripció dins del fons gris - padding 75% del desktop */}
        <div className="max-w-7xl mx-auto px-3 lg:px-8 pt-16 lg:pt-20">
          <div className="text-center mb-9 lg:mb-12 px-1 lg:px-4">
            {collectionPath ? (
              <Link to={collectionPath} className="inline-block group">
                <h2 className={`${getTypographyClasses(typography.productGrid.title)} mb-2 sm:mb-2 md:mb-2 lg:mb-4 uppercase group-hover:opacity-80 transition-opacity text-gray-900`} style={{ fontSize: gridTitleFontSize }}>
                  {title}
                </h2>
              </Link>
            ) : (
              <h2 className={`${getTypographyClasses(typography.productGrid.title)} mb-2 sm:mb-2 md:mb-2 lg:mb-4 uppercase text-gray-900`} style={{ fontSize: gridTitleFontSize }}>
                {title}
              </h2>
            )}
            {/*
               Description adjustments:
               1. Single line, no wrap - FORCED
               2. Responsive sizes
               3. Centered
            */}
            <div className="w-full px-4">
              <p className={`${getTypographyClasses(typography.productGrid.description)} text-center overflow-hidden text-gray-900`} style={{
                opacity: 0.7,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                display: 'block',
                width: '100%',
                fontSize: gridDescriptionFontSize
              }}>
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Grid de productes - Responsive millorat amb més breakpoints */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-16 lg:pb-20">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 lg:gap-x-6 lg:gap-y-10"
          >
            {safeProducts.map((product, index) => (
              <motion.div key={product.id || product.slug || String(product.gelatoProductId)} variants={item} className="h-full">
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  cartItems={cartItems}
                  onUpdateQuantity={onUpdateQuantity}
                  listName={title}
                  position={index}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
export default ProductGrid;
