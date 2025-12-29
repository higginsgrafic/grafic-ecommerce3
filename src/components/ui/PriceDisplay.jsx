import React from 'react';

function PriceDisplay({
  price,
  className = '',
  fontSize = 'clamp(1.25rem, 3vw, 1.40625rem)'
}) {
  const formattedPrice = price.toFixed(2);
  const [integerPart, decimalPart] = formattedPrice.split('.');

  return (
    <span
      className={`font-oswald font-medium text-gray-900 ${className}`}
      style={{
        fontSize,
        whiteSpace: 'nowrap'
      }}
    >
      {integerPart},{decimalPart} €
    </span>
  );
}

export default PriceDisplay;
