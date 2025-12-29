import { useState, useEffect } from 'react';
import { supabase } from '@/api/supabase-products';

export function useGlobalRedirect(bypassEnabled = false) {
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkGlobalRedirect = async () => {
      try {
        // Si el bypass està activat, no redirigim
        if (bypassEnabled) {
          setShouldRedirect(false);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('media_pages')
          .select('global_redirect, is_active')
          .eq('slug', 'default')
          .eq('is_active', true)
          .eq('global_redirect', true)
          .maybeSingle();

        if (error) throw error;

        const redirect = !!data;
        setShouldRedirect(redirect);
      } catch (error) {
        console.error('Error checking global redirect:', error);
        setShouldRedirect(false);
      } finally {
        setLoading(false);
      }
    };

    checkGlobalRedirect();
  }, [bypassEnabled]);

  return { shouldRedirect, loading };
}
