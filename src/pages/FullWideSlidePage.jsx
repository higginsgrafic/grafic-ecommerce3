import React from 'react';
import FullWideSlideHeaderMegaMenu from '@/components/FullWideSlideHeaderMegaMenu';

export default function FullWideSlidePage() {
  return (
    <div className="min-h-[calc(100vh-var(--appHeaderOffset,0px))] bg-background">
      <FullWideSlideHeaderMegaMenu />
    </div>
  );
}
