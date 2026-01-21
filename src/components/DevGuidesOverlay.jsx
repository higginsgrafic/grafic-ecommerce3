import React from 'react';
import RulersGuidesOverlay from '@/components/RulersGuidesOverlay.jsx';

export default function DevGuidesOverlay({ guidesEnabled = true }) {
  return (
    <RulersGuidesOverlay
      guidesEnabled={guidesEnabled}
      storageKey="devGuidesV2"
      anchorElementId="main-content"
      headerOffsetCssVar="--appHeaderOffset"
      rulerSize={18}
      zIndex={35000}
    />
  );
}
