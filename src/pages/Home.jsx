import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Trash2, Search, X, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DockSection from '@/components/DockSection';
import { useProductContext } from '@/contexts/ProductContext';
import { useTexts } from '@/hooks/useTexts';
import { supabase } from '@/api/supabase-products';
import { useToast } from '@/components/ui/use-toast';
import { typography, getTypographyClasses } from '@/config/typography';
import { useAdmin } from '@/contexts/AdminContext';
import HeroSettingsPage from '@/pages/HeroSettingsPage';

const useResponsiveFontSize = (config) => {
  const [fontSize, setFontSize] = useState(config.fontSize?.mobile || config.fontSize?.base || '14px');

  useEffect(() => {
    const updateFontSize = () => {
      const width = window.innerWidth;
      if (width >= 1024 && config.fontSize?.desktop) {
        setFontSize(config.fontSize.desktop);
      } else {
        setFontSize(config.fontSize?.mobile || config.fontSize?.base || '14px');
      }
    };

    updateFontSize();
    window.addEventListener('resize', updateFontSize);
    return () => window.removeEventListener('resize', updateFontSize);
  }, [config]);

  return fontSize;
};

function Home({ onAddToCart, cartItems, onUpdateQuantity }) {
  const texts = useTexts();
  const navigate = useNavigate();
  const { getRandomProductsByCollection } = useProductContext();
  const [collections, setCollections] = useState([]);
  const { toast } = useToast();
  const { isAdmin } = useAdmin();

  // Hero editor states
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [autoplayInterval, setAutoplayInterval] = useState(8000);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [editMode, setEditMode] = useState(false);
  const [searchDialog, setSearchDialog] = useState({ open: false, type: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [editingInterval, setEditingInterval] = useState(false);
  const [tempInterval, setTempInterval] = useState({ seconds: 8, milliseconds: 0 });
  const initialLoadRef = useRef(true);
  const isDragging = useRef(false);
  const [showHeroSettings, setShowHeroSettings] = useState(false);

  const titleFontSize = useResponsiveFontSize(typography.hero.title);
  const subtitleFontSize = useResponsiveFontSize(typography.hero.subtitle);

  const availableRoutes = [
    { path: '/', label: 'Inici' },
    { path: '/first-contact', label: 'First Contact' },
    { path: '/about', label: 'Sobre nosaltres' },
    { path: '/contact', label: 'Contacte' },
  ];

  const availableVideos = [
    { id: 'I0VjId1PtNA', label: 'First Contact' },
  ];

  const defaultSlides = [
    {
      slide_index: 0,
      title: "First Contact",
      subtitle: "Explora el primer contacte amb altres civilitzacions",
      video_url: "I0VjId1PtNA",
      path: "/first-contact",
      bg_type: "video",
      bg_value: "I0VjId1PtNA",
      bg_opacity: 0.6,
      autoplay_enabled: true,
      autoplay_interval: 8000,
      active: true,
      order: 0
    }
  ];

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setCollections(data);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  useEffect(() => {
    if (initialLoadRef.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      saveSlides();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [slides, autoplay, autoplayInterval]);

  useEffect(() => {
    if (!autoplay || editMode || slides.length === 0) return;

    const timer = setInterval(() => {
      if (!isDragging.current) {
        nextSlide();
      }
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [autoplay, autoplayInterval, currentSlide, editMode, slides.length]);

  useEffect(() => {
    const seconds = Math.floor(autoplayInterval / 1000);
    const milliseconds = autoplayInterval % 1000;
    setTempInterval({ seconds, milliseconds });
  }, [autoplayInterval]);

  const openSearchDialog = (type) => {
    setSearchDialog({ open: true, type });
    setSearchQuery('');
  };

  const closeSearchDialog = () => {
    setSearchDialog({ open: false, type: null });
    setSearchQuery('');
  };

  const selectValue = (value) => {
    if (searchDialog.type === 'video') {
      updateSlide(currentSlide, 'bg_value', value);
    } else if (searchDialog.type === 'route') {
      updateSlide(currentSlide, 'path', value);
    }
    closeSearchDialog();
  };

  const getFilteredOptions = () => {
    const query = searchQuery.toLowerCase();
    if (searchDialog.type === 'video') {
      return availableVideos.filter(v =>
        v.id.toLowerCase().includes(query) ||
        v.label.toLowerCase().includes(query)
      );
    } else if (searchDialog.type === 'route') {
      return availableRoutes.filter(r =>
        r.path.toLowerCase().includes(query) ||
        r.label.toLowerCase().includes(query)
      );
    }
    return [];
  };

  const handleIntervalClick = () => {
    setEditingInterval(true);
  };

  const handleIntervalChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setTempInterval(prev => ({
      ...prev,
      [field]: Math.max(0, numValue)
    }));
  };

  const handleIntervalBlur = () => {
    const newInterval = (tempInterval.seconds * 1000) + tempInterval.milliseconds;
    if (newInterval >= 1000) {
      setAutoplayInterval(newInterval);
    } else {
      const seconds = Math.floor(autoplayInterval / 1000);
      const milliseconds = autoplayInterval % 1000;
      setTempInterval({ seconds, milliseconds });
    }
    setEditingInterval(false);
  };

  const handleIntervalKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleIntervalBlur();
    } else if (e.key === 'Escape') {
      const seconds = Math.floor(autoplayInterval / 1000);
      const milliseconds = autoplayInterval % 1000;
      setTempInterval({ seconds, milliseconds });
      setEditingInterval(false);
    }
  };

  const loadSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_config')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        setSlides(defaultSlides);
      } else {
        setSlides(data);
        if (data.length > 0) {
          setAutoplay(data[0].autoplay_enabled);
          setAutoplayInterval(data[0].autoplay_interval);
        }
      }
    } catch (error) {
      console.error('Error loading slides:', error);
      setSlides(defaultSlides);
    } finally {
      setLoading(false);
      setTimeout(() => {
        initialLoadRef.current = false;
      }, 100);
    }
  };

  const saveSlides = async () => {
    if (slides.length === 0) return;

    try {
      setSaving(true);

      const { error: deleteError } = await supabase
        .from('hero_config')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) throw deleteError;

      const slidesToSave = slides.map((slide, index) => {
        const { id, created_at, ...slideData } = slide;
        return {
          ...slideData,
          order: index,
          autoplay_enabled: autoplay,
          autoplay_interval: autoplayInterval
        };
      });

      const { error: insertError } = await supabase
        .from('hero_config')
        .insert(slidesToSave);

      if (insertError) throw insertError;
    } catch (error) {
      console.error('Error saving slides:', error);
      toast({
        title: "Error",
        description: "No s'ha pogut guardar la configuració",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSlide = (index, field, value) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const addSlide = () => {
    const newSlide = {
      slide_index: slides.length,
      title: "Nou Slide",
      subtitle: "Descripció del nou slide",
      video_url: "I0VjId1PtNA",
      path: "/",
      bg_type: "video",
      bg_value: "I0VjId1PtNA",
      bg_opacity: 0.6,
      autoplay_enabled: true,
      autoplay_interval: 8000,
      active: true,
      order: slides.length
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
  };

  const handleDragStart = () => {
    isDragging.current = true;
  };

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;

    setTimeout(() => {
      isDragging.current = false;
    }, 100);

    if (info.offset.x < -swipeThreshold) {
      nextSlide();
    } else if (info.offset.x > swipeThreshold) {
      prevSlide();
    }
  };

  const handleContainerClick = () => {
    if (!isDragging.current && !editMode && slides[currentSlide]?.path) {
      navigate(slides[currentSlide].path);
    }
  };

  const deleteSlide = (index) => {
    if (slides.length <= 1) {
      toast({
        title: "Error",
        description: "Has de mantenir almenys un slide",
        variant: "destructive"
      });
      return;
    }

    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(newSlides.length - 1);
    }
  };

  const getEmbedUrl = (videoId) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1&disablekb=1`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Carregant...</div>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <>
      <Helmet>
        <title>{texts.home.seo.title}</title>
        <meta name="description" content={texts.home.seo.description} />
      </Helmet>

      {/* Hero Editor Section */}
      {showHeroSettings ? (
        <div
          className="relative"
          style={{
            marginTop: 'calc(var(--appHeaderOffset, 0px) * -1)',
            paddingTop: 'var(--appHeaderOffset, 0px)'
          }}
        >
          <HeroSettingsPage
            mode="embedded"
            onRequestClose={() => setShowHeroSettings(false)}
          />
        </div>
      ) : (
        <section
          className="relative h-[70vh] min-h-[500px] overflow-hidden text-center text-white bg-black"
          style={{
            marginTop: 'calc(var(--appHeaderOffset, 0px) * -1)',
            paddingTop: 'var(--appHeaderOffset, 0px)'
          }}
        >
          {!editMode && (
            <motion.div
              className="absolute left-0 right-0 bottom-0 z-30 cursor-pointer active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onClick={handleContainerClick}
              style={{ touchAction: 'pan-y', top: 0 }}
            />
          )}

        <AnimatePresence mode='wait'>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0"
          >
            {slides[currentSlide]?.bg_type === 'video' && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <iframe
                  className="absolute top-1/2 left-1/2 w-[225%] h-[225%] -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
                  src={getEmbedUrl(slides[currentSlide].bg_value || slides[currentSlide].video_url)}
                  title="Background Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{
                    pointerEvents: 'none',
                    opacity: 1 - (slides[currentSlide].bg_opacity ?? 0.6)
                  }}
                />
              </div>
            )}
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: slides[currentSlide]?.bg_opacity ?? 0.5 }}
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute top-6 left-0 right-0 z-[10002]">
          <div className="relative h-8 px-6">
            {isAdmin && editMode && (
              <div className="absolute left-6 top-0 h-8 flex items-center gap-3 text-xs font-medium uppercase tracking-wide">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`transition-colors ${
                    activeTab === 'text'
                      ? 'text-white'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  Text
                </button>
                <div className="w-px h-4 bg-white/30" />
                <button
                  onClick={() => setActiveTab('background')}
                  className={`transition-colors ${
                    activeTab === 'background'
                      ? 'text-white'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  Background
                </button>
                <div className="w-px h-4 bg-white/30" />
                <button
                  onClick={addSlide}
                  className="flex items-center gap-1 transition-colors text-white/50 hover:text-white"
                  title="Afegir slide"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <div className="w-px h-4 bg-white/30" />
                <button
                  onClick={() => setDeleteConfirmDialog(true)}
                  className="flex items-center gap-1 transition-colors text-white/50 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {isAdmin && editMode && (
              <div className="absolute left-1/2 -translate-x-1/2 top-0 h-8 flex items-center gap-2 text-white/90 font-mono text-sm">
                {editingInterval ? (
                  <>
                    <input
                      type="number"
                      value={tempInterval.seconds}
                      onChange={(e) => handleIntervalChange('seconds', e.target.value)}
                      onBlur={handleIntervalBlur}
                      onKeyDown={handleIntervalKeyDown}
                      onWheel={(e) => e.stopPropagation()}
                      className="w-12 h-6 px-1 py-0.5 bg-white/20 text-white text-center rounded border border-white/30 focus:border-white/60 focus:outline-none"
                      min="0"
                      autoFocus
                    />
                    <span>s</span>
                    <input
                      type="number"
                      value={tempInterval.milliseconds}
                      onChange={(e) => handleIntervalChange('milliseconds', e.target.value)}
                      onBlur={handleIntervalBlur}
                      onKeyDown={handleIntervalKeyDown}
                      onWheel={(e) => e.stopPropagation()}
                      className="w-16 h-6 px-1 py-0.5 bg-white/20 text-white text-center rounded border border-white/30 focus:border-white/60 focus:outline-none"
                      min="0"
                      max="999"
                    />
                    <span className="text-white/50">ms</span>
                  </>
                ) : (
                  <button
                    onClick={handleIntervalClick}
                    className="flex items-center gap-2 hover:bg-white/10 px-2 h-6 rounded transition-colors cursor-pointer"
                  >
                    <span className="text-white/50">⏱</span>
                    <span>{tempInterval.seconds}s</span>
                    <span className="text-white/50">{String(tempInterval.milliseconds).padStart(3, '0')}ms</span>
                  </button>
                )}
              </div>
            )}

            {isAdmin && (
              <div className="absolute right-6 top-6 z-[12000] h-8 flex items-center gap-3">
                <div className="min-w-[280px] flex items-center justify-end">
                  <AnimatePresence mode="wait">
                    {editMode && activeTab === 'text' && (
                      <motion.div
                        key="text-controls"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-3 text-xs font-medium text-white/90"
                      >
                        <label className="flex items-center gap-2">
                          <span>Opacitat fons:</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={currentSlideData?.bg_opacity ?? 0.6}
                            onChange={(e) => updateSlide(currentSlide, 'bg_opacity', parseFloat(e.target.value))}
                            className="w-24 accent-white"
                          />
                          <span>{Math.round((currentSlideData?.bg_opacity ?? 0.6) * 100)}%</span>
                        </label>
                        <div className="w-px h-4 bg-white/30" />
                      </motion.div>
                    )}
                    {editMode && activeTab === 'background' && (
                      <motion.div
                        key="background-controls"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-3 text-xs font-medium text-white/90"
                      >
                        <button
                          onClick={() => openSearchDialog('video')}
                          className="bg-transparent text-white border-b border-transparent hover:border-white/30 focus:border-white/60 focus:outline-none px-1 py-0.5 cursor-pointer transition-colors leading-none"
                        >
                          {currentSlideData?.bg_value ?? currentSlideData?.video_url ?? 'ID vídeo'}
                        </button>
                        <div className="w-px h-4 bg-white/30" />
                        <button
                          onClick={() => openSearchDialog('route')}
                          className="bg-transparent text-white border-b border-transparent hover:border-white/30 focus:border-white/60 focus:outline-none px-1 py-0.5 cursor-pointer transition-colors leading-none"
                        >
                          {currentSlideData?.path ?? '/ruta'}
                        </button>
                        <div className="w-px h-4 bg-white/30" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="w-8 flex items-center justify-center shrink-0">
                  <button
                    onClick={() => setShowHeroSettings((v) => !v)}
                    className={`transition-colors ${
                      editMode
                        ? 'text-white'
                        : 'text-white/50 hover:text-white/80'
                    }`}
                    aria-label={showHeroSettings ? 'Tancar hero settings' : 'Obrir hero settings'}
                  >
                    {showHeroSettings ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center p-4">
          {isAdmin && editMode && activeTab === 'text' ? (
            <div className="max-w-4xl mx-auto px-4 w-full pointer-events-auto">
              <input
                type="text"
                value={currentSlideData?.title || ''}
                onChange={(e) => updateSlide(currentSlide, 'title', e.target.value)}
                className={`${getTypographyClasses(typography.hero.title)} mb-3 lg:mb-4 text-white uppercase w-full text-center bg-transparent border-2 border-white/30 rounded-lg px-4 py-2 focus:border-white/60 focus:outline-none placeholder-white/50`}
                style={{ fontSize: titleFontSize }}
                placeholder="Títol del slide"
              />
              <textarea
                value={currentSlideData?.subtitle || ''}
                onChange={(e) => updateSlide(currentSlide, 'subtitle', e.target.value)}
                rows={2}
                className={`${getTypographyClasses(typography.hero.subtitle)} max-w-4xl mx-auto text-gray-100 px-4 py-2 w-full text-center bg-transparent border-2 border-white/30 rounded-lg focus:border-white/60 focus:outline-none placeholder-white/50 resize-none`}
                style={{ fontSize: subtitleFontSize }}
                placeholder="Subtítol del slide"
              />
            </div>
          ) : (
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentSlide}
                className="max-w-4xl mx-auto px-4"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <motion.h1
                  className={`${getTypographyClasses(typography.hero.title)} mb-3 lg:mb-4 drop-shadow-lg text-white uppercase`}
                  style={{ fontSize: titleFontSize }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {slides[currentSlide]?.title}
                </motion.h1>
                <motion.p
                  className={`${getTypographyClasses(typography.hero.subtitle)} max-w-4xl mx-auto drop-shadow-md text-gray-100 px-2`}
                  style={{ fontSize: subtitleFontSize }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {slides[currentSlide]?.subtitle}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div className="absolute bottom-8 left-0 right-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-4 h-9 pointer-events-auto">
            {isAdmin && editMode && (
              <button
                onClick={prevSlide}
                className="w-9 h-9 flex items-center justify-center transition-colors"
                aria-label="Slide anterior"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            )}

            {!editMode && (
              <div className="flex items-center gap-2 h-9">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Anar al slide ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {isAdmin && editMode && (
              <button
                onClick={nextSlide}
                className="w-9 h-9 flex items-center justify-center transition-colors"
                aria-label="Slide següent"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>
        </section>
      )}

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirmDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setDeleteConfirmDialog(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Esborrar slide
                  </h3>
                  <button
                    onClick={() => setDeleteConfirmDialog(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  Estàs segur que vols esborrar aquest slide? Aquesta acció no es pot desfer.
                </p>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setDeleteConfirmDialog(false)}
                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel·lar
                  </button>
                  <button
                    onClick={() => {
                      deleteSlide(currentSlide);
                      setDeleteConfirmDialog(false);
                    }}
                    className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Esborrar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Dialog */}
      <AnimatePresence>
        {searchDialog.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={closeSearchDialog}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {searchDialog.type === 'video' ? 'Selecciona un vídeo' : 'Selecciona una ruta'}
                  </h3>
                  <button
                    onClick={closeSearchDialog}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div className="max-h-80 overflow-y-auto space-y-1">
                  {getFilteredOptions().map((option) => (
                    <button
                      key={searchDialog.type === 'video' ? option.id : option.path}
                      onClick={() => selectValue(searchDialog.type === 'video' ? option.id : option.path)}
                      className="w-full text-left px-4 py-3 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        {searchDialog.type === 'video' ? option.id : option.path}
                      </div>
                      <div className="text-sm text-gray-500">
                        {option.label}
                      </div>
                    </button>
                  ))}
                  {getFilteredOptions().length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No s'han trobat resultats
                    </div>
                  )}
                </div>

                {searchDialog.type === 'video' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          selectValue(searchQuery.trim());
                        }
                      }}
                      placeholder="O escriu un ID personalitzat"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => searchQuery.trim() && selectValue(searchQuery.trim())}
                      disabled={!searchQuery.trim()}
                      className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Usar ID personalitzat
                    </button>
                  </div>
                )}

                {searchDialog.type === 'route' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          selectValue(searchQuery.trim());
                        }
                      }}
                      placeholder="O escriu una ruta personalitzada"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => searchQuery.trim() && selectValue(searchQuery.trim())}
                      disabled={!searchQuery.trim()}
                      className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Usar ruta personalitzada
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Collection Sections */}
      <div>
        <div className="space-y-0">
          {collections.map((collection) => (
            <DockSection
              key={collection.slug}
              collectionSlug={collection.slug}
              onAddToCart={onAddToCart}
              cartItems={cartItems}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;
