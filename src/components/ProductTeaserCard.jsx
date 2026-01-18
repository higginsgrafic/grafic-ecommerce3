import React from 'react';
import { Link } from 'react-router-dom';

function ProductTeaserCard({
  to,
  imgSrc,
  name,
  subtitle,
  status,
  colors = [],
  price,
  colorDotStyle,
}) {
  const safeColors = Array.isArray(colors) ? colors.filter(Boolean) : [];
  const colorCount = safeColors.length;
  const dots = safeColors.slice(0, 3);

  const priceText = (() => {
    if (typeof price === 'number') return `${price.toFixed(2).replace('.', ',')} €`;
    if (typeof price === 'string') return price;
    return null;
  })();

  return (
    <Link to={to} className="block">
      <div className="w-full">
        <div className="w-full aspect-square bg-[#f5f5f5] overflow-hidden p-10">
          <img src={imgSrc} alt={name} className="h-full w-full object-contain" loading="lazy" decoding="async" />
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {dots.map((c) => (
                <span key={c} className="inline-block h-2 w-2 rounded-full" style={colorDotStyle ? colorDotStyle(c) : undefined} />
              ))}
              {colorCount > 3 ? (
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#6b7280' }} />
              ) : null}
            </div>

            {status ? (
              <div className="text-[13px] font-roboto" style={{ color: '#d11a2a' }}>
                {status}
              </div>
            ) : null}
          </div>

          <div className="mt-2">
            <div className="font-roboto text-[15px] font-semibold" style={{ color: '#111111' }}>
              {name}
            </div>
            {subtitle ? (
              <div className="font-roboto text-[13px]" style={{ color: '#6b7280' }}>
                {subtitle}
              </div>
            ) : null}
            <div className="mt-1 font-roboto text-[13px]" style={{ color: '#6b7280' }}>
              {colorCount > 0 ? `${colorCount} colors` : null}
            </div>
            <div className="mt-2 font-roboto text-[15px] font-semibold" style={{ color: '#111111' }}>
              {priceText}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductTeaserCard;
