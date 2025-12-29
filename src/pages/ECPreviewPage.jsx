import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabase-products';
import { useAdmin } from '@/contexts/AdminContext';

function ECPreviewPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();

  useEffect(() => {
    loadECPage();
  }, []);

  const loadECPage = async () => {
    try {
      const { data, error } = await supabase
        .from('media_pages')
        .select('*')
        .eq('slug', 'default')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig({
          backgroundType: data.background_type,
          videoUrl: data.video_url,
          imageUrl: data.image_url,
          backgroundColor: data.background_color || '#000000',
          gradientStops: data.gradient_stops || null,
          gradientAngle: data.gradient_angle ?? 180,
          title: data.title ?? '',
          subtitle: data.subtitle ?? '',
          description: data.description ?? '',
          buttonText: data.button_text ?? '',
          buttonLink: data.button_link ?? '/',
          showButton: data.show_button ?? false,
          textColor: data.text_color || '#ffffff',
          redirectUrl: data.redirect_url ?? '',
          autoRedirect: data.auto_redirect ?? false
        });
      }
    } catch (error) {
      console.error('Error loading EC page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoEnd = () => {
    if (config?.autoRedirect && config?.redirectUrl) {
      if (config.redirectUrl.startsWith('http://') || config.redirectUrl.startsWith('https://')) {
        window.location.href = config.redirectUrl;
      } else {
        navigate(config.redirectUrl);
      }
    }
  };

  const handleScreenClick = () => {
    // Only redirect if there's a button link and button is NOT shown (otherwise button handles it)
    if (config?.buttonLink && !config?.showButton) {
      if (config.buttonLink.startsWith('http://') || config.buttonLink.startsWith('https://')) {
        window.location.href = config.buttonLink;
      } else {
        navigate(config.buttonLink);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Carregant...</div>
      </div>
    );
  }

  // Values from config (no defaults to allow empty strings)
  const title = config?.title ?? '';
  const subtitle = config?.subtitle ?? '';
  const description = config?.description ?? '';
  const textColor = config?.textColor || '#ffffff';
  const showButton = config?.showButton ?? false;
  const buttonText = config?.buttonText ?? '';
  const buttonLink = config?.buttonLink ?? '/';

  const isDev = import.meta.env.DEV;
  const showDevNote = isDev && !isAdmin;

  const getBackgroundStyle = () => {
    if (!config) return { backgroundColor: '#000000' };

    if (config.gradientStops && config.gradientStops.length > 0) {
      const sortedStops = [...config.gradientStops].sort((a, b) => a.position - b.position);
      const gradient = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
      return { background: `linear-gradient(${config.gradientAngle}deg, ${gradient})` };
    }

    return { backgroundColor: config.backgroundColor || '#000000' };
  };

  return (
    <>
      <Helmet>
        <title>En Construcció - GRÀFIC</title>
        <meta name="description" content="Pàgina en construcció" />
      </Helmet>

      <div
        className="relative w-full h-screen overflow-hidden cursor-pointer"
        onClick={handleScreenClick}
      >
        {showDevNote && (
          <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div
              className="pointer-events-auto w-[34rem] max-w-[90vw] min-h-[18rem] rounded-2xl border border-white/20 bg-red-600/70 backdrop-blur-md px-8 py-16 text-white flex flex-col justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto inline-flex flex-col items-start">
                <div className="text-sm font-semibold mb-3">Mode DEV · Accés ràpid</div>
                <div className="text-sm opacity-90 w-full">
                  <div>1. Cmd+Shift+P</div>
                  <div>2. Simple Browser: Show</div>
                  <div>3. http://localhost:3000/admin-login</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Background Media */}
        {config?.backgroundType === 'video' && config.videoUrl && (
          <video
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ filter: 'contrast(1.5)', zIndex: 0 }}
            autoPlay
            muted
            loop={!config.autoRedirect}
            playsInline
            preload="auto"
            src={config.videoUrl}
            onEnded={handleVideoEnd}
          />
        )}

        {config?.backgroundType === 'image' && config.imageUrl && (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${config.imageUrl})` }}
          />
        )}

        {/* Default or Color Background */}
        {(!config || config.backgroundType === 'color') && (
          <div
            className="absolute inset-0 w-full h-full"
            style={getBackgroundStyle()}
          />
        )}

        {/* Content */}
        {(title || subtitle || description || showButton) && (
          <div className="relative z-10 h-full flex flex-col justify-center items-center px-6 md:px-12 lg:px-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl text-center"
            >
              {title && (
                <h1
                  className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
                  style={{ color: textColor }}
                >
                  {title}
                </h1>
              )}

              {subtitle && (
                <p
                  className="text-xl md:text-2xl lg:text-3xl mb-8"
                  style={{ color: textColor, opacity: 0.9 }}
                >
                  {subtitle}
                </p>
              )}

              {description && (
                <p
                  className="text-lg md:text-xl mb-8"
                  style={{ color: textColor, opacity: 0.8 }}
                >
                  {description}
                </p>
              )}

              {showButton && buttonText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <Link
                    to={buttonLink}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-block px-8 py-4 bg-white/20 backdrop-blur-sm rounded-lg font-medium transition-all hover:bg-white/30 hover:scale-105"
                    style={{ color: textColor }}
                  >
                    {buttonText}
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}

      </div>
    </>
  );
}

export default ECPreviewPage;
