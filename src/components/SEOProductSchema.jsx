import React from 'react';
import { Helmet } from 'react-helmet';

/**
 * Component per afegir structured data (JSON-LD) a les pàgines de producte
 * Això ajuda Google i altres motors de cerca a entendre millor el contingut
 */
const SEOProductSchema = ({ product }) => {
  if (!product) return null;

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "offers": {
      "@type": "Offer",
      "url": `https://grafic.com/product/${product.id}`,
      "priceCurrency": "EUR",
      "price": product.price.toFixed(2),
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "GRÀFIC"
      }
    },
    "brand": {
      "@type": "Brand",
      "name": "GRÀFIC"
    }
  };

  // Afegir aggregateRating si tenim reviews (futur)
  if (product.rating && product.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewCount
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default SEOProductSchema;
