import React, { useMemo } from 'react';
import SEO from '@/components/SEO';
import DevHeader from '@/components/DevHeader';

export default function AdminControlsPage() {
  const title = useMemo(() => 'Controls globals', []);

  return (
    <>
      <SEO title={title} description="Controls globals de tema i aparença" />

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configura tokens globals. Ara mateix: STRONG/SOFT (i WHITE_STRONG/WHITE_SOFT).
          </p>
        </div>

        <div className="rounded-lg border border-border bg-background p-4 shadow-sm">
          <DevHeader />
        </div>

        <div className="mt-8 rounded-lg border border-border bg-background p-4">
          <div className="text-sm font-semibold text-foreground">Futur</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Aquest espai està preparat per afegir controls globals addicionals (hover/focus, botons, ombres, radi, espaiat, tipografia, etc.).
          </div>
        </div>
      </div>
    </>
  );
}
