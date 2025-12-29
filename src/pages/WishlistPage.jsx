import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useProductContext } from '@/contexts/ProductContext';
import ProductCard from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';

function WishlistPage({ onAddToCart, cartItems, onUpdateQuantity }) {
  const { wishlistItems, clearWishlist } = useProductContext();

  return (
    <>
      <Helmet>
        <title>Els meus Favorits | GRÀFIC</title>
        <meta name="description" content="Els teus productes favorits de GRÀFIC" />
      </Helmet>

      <div className="min-h-screen bg-white pt-[129px] lg:pt-[145px] pb-6 sm:pb-8 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Breadcrumbs */}
          <div className="mb-6 sm:mb-8">
            <Breadcrumbs items={[
              { label: 'Favorits' }
            ]} />
          </div>

          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Heart className="h-8 w-8 sm:h-10 sm:w-10 fill-current text-red-500" />
                <h1 className="font-oswald text-3xl sm:text-4xl md:text-5xl font-bold uppercase">
                  Els meus Favorits
                </h1>
              </div>
              {wishlistItems.length > 0 && (
                <button
                  onClick={clearWishlist}
                  className="text-sm text-gray-600 hover:text-black transition-colors underline"
                >
                  Esborrar tot
                </button>
              )}
            </div>
            <p className="mt-4 text-gray-600 font-roboto text-lg">
              {wishlistItems.length === 0
                ? 'Encara no tens cap producte favorit'
                : `Tens ${wishlistItems.length} ${wishlistItems.length === 1 ? 'producte favorit' : 'productes favorits'}`
              }
            </p>
          </div>

          {/* Contingut */}
          {wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-24 w-24 mx-auto text-gray-300 mb-6" />
              <h2 className="font-oswald text-2xl font-bold mb-4">
                La teva llista de favorits està buida
              </h2>
              <p className="text-gray-600 mb-8 font-roboto">
                Explora les nostres col·leccions i marca els teus productes preferits amb el cor
              </p>
              <Link
                to="/first-contact"
                className="inline-block bg-black text-white px-8 py-3 font-oswald font-bold uppercase hover:bg-gray-800 transition-colors"
              >
                Veure col·leccions
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlistItems.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  cartItems={cartItems}
                  onUpdateQuantity={onUpdateQuantity}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default WishlistPage;
