import { useState, useEffect } from 'react';
import { supabase } from '@/api/supabase-products';

export function useGlobalRedirect(bypassEnabled = false) {
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkGlobalRedirect = async () => {
      try {
        // Si el bypass està activat, no redirigim
        if (bypassEnabled) {
          setShouldRedirect(false);
          setRedirectUrl(null);
          setLoading(false);
          return;
        }

        if (!supabase) {
          setShouldRedirect(false);
          setRedirectUrl(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('media_pages')
          .select('global_redirect, is_active, redirect_url')
          .eq('slug', 'default')
          .eq('is_active', true)
          .eq('global_redirect', true)
          .maybeSingle();

        if (error) throw error;

        const redirect = !!data;
        setShouldRedirect(redirect);
        setRedirectUrl(data?.redirect_url || null);
      } catch (error) {
        console.error('Error checking global redirect:', error);
        setShouldRedirect(false);
        setRedirectUrl(null);
      } finally {
        setLoading(false);
      }
    };

    checkGlobalRedirect();
  }, [bypassEnabled]);

  return { shouldRedirect, redirectUrl, loading };
}
