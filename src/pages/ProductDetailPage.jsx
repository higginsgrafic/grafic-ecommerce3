import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProductGallery from '@/components/ProductGallery';
import ProductInfo from '@/components/ProductInfo';
import ProductMockups from '@/components/ProductMockups';
import EpisodeControls from '@/components/EpisodeControls';
import EpisodeDisplay from '@/components/EpisodeDisplay';
import SEOProductSchema from '@/components/SEOProductSchema';
import { trackProductView, trackAddToCart, trackAddToWishlist, trackShare } from '@/utils/analytics';
import { useProductContext } from '@/contexts/ProductContext';
import { useToast } from '@/contexts/ToastContext';

const EPISODES_VERSION = '1.3';

const episodes = [
  {
    season: 1,
    episode: 28,
    originalTitle: "The City on the Edge of Forever",
    title: "LA CIUTAT A LA FRONTERA DEL FUTUR",
    text: "McCoy desapareix, com si res,  per un portal temporal i, amb ell, tot record de la Federació. Així, Kirk troba l'amor perdut en una època inexistent. Compra'm."
  },
  {
    season: 1,
    episode: 22,
    originalTitle: "Space Seed",
    title: "LA LLAVOR DE L'ESPAI",
    text: "Khan, el superhome del passat, té grans somnis i es desperta amb fam de conquesta. Traïció, seducció i ambició. El preu del poder serà molt car. Compra'm."
  },
  {
    season: 2,
    episode: 5,
    originalTitle: "Amok Time",
    title: "L'ÈPOCA DE L'AMOK",
    text: "Es trenca l'amistat quan has de lluitar fins a la mort? El foc de Vulcà, ancestral, crema dins de Spock. L'hora greu tomba sobre el combat ritual. Compra'm."
  },
  {
    season: 2,
    episode: 10,
    originalTitle: "Mirror, Mirror",
    title: "MIRALLET, MIRALLET",
    text: "I si existís un lloc on la Federació és un Imperi brutal i cruel que conquereix amb violència tot allò que vol? Kirk n'haurà de fugir per poder tornar a casa. Compra'm."
  },
  {
    season: 2,
    episode: 13,
    originalTitle: "The Trouble with Tribbles",
    title: "EL PROBLEMA DELS TRIBBLES",
    text: "Avui, unes entranyables boles de pèl han començat a envair cada racó de la nau. Es multipliquen sense parar i consumeixen tot el que troben. Compra'm."
  },
  {
    season: 1,
    episode: 14,
    originalTitle: "Balance of Terror",
    title: "L'EQUILIBRI DE LA POR",
    text: "Una nau fantasma travessa la fosca de l'espai tot trencant el silenci. Els Romulans han tornat cent anys després! Què deuen tramar aquests, ara. Compra'm."
  },
  {
    season: 1,
    episode: 18,
    originalTitle: "Arena",
    title: "ARENA",
    text: "Kirk s'enfronta, en una platja, enmig del no-res, a un Gorn -la il·lustració contra l'instint. Ha de superar el repte de l'explorador: sobreviure. Compra'm."
  },
  {
    season: 2,
    episode: 6,
    originalTitle: "The Doomsday Machine",
    title: "LA MÀQUINA DEL JUDICI FINAL",
    text: "Decker, capità desaparegut mesos enrere i obsessionat amb venjar la seva tripulació, vol, com sigui, destruir l'arma \"devoradora de planetes\". Compra'm."
  },
  {
    season: 2,
    episode: 15,
    originalTitle: "Journey to Babel",
    title: "VIATGE A BABEL",
    text: "Sarek i Spock naveguen en silenci mentre un assassí vaga entre els ambaixadors. L'honor contra l'amor xoquen amb força. Compra'm."
  },
  {
    season: 1,
    episode: 25,
    originalTitle: "The Devil in the Dark",
    title: "EL MONSTRE AMAGAT",
    text: "A Janus VI hi passen coses estranyes, no ho has pas sentit? Hi ha accidents misteriosos. La Federació creu que hi ha d'haver una explicació. Compra'm."
  },
  {
    season: 1,
    episode: 27,
    originalTitle: "Errand of Mercy",
    title: "ELS SALVADORS, SALVATS",
    text: "La guerra contra els Klingon, ja és aquí. La Federació arriba a Orgània per oferir ajut defensiu, malgrat que, la gent, no sembli gens preocupada. Compra'm."
  },
  {
    season: 1,
    episode: 11,
    originalTitle: "The Menagerie",
    title: "EL ZOO",
    text: "Spock navega cap a un món prohibit on la mort és el càstig segur. La lleialtat supera la freda lògica. L'amistat crida des del dolor intens. Compra'm."
  }
];

const ProductDetailPage = ({ onAddToCart, cartItems = [], onUpdateQuantity }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, getProductById, toggleWishlist, isInWishlist } = useProductContext();
  const { success } = useToast();

  const product = getProductById(id);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    window.__CURRENT_PRODUCT__ = product || null;
  }, [product]);

  const validVariants = (product?.variants || []).filter(v => {
    if (!v) return false;
    if (!v.size || !v.color) return false;
    // Treat missing isAvailable as available to keep backwards compatibility
    if (v.isAvailable === false) return false;
    return true;
  });

  // Obtenir talles i colors disponibles de les variants
  const availableSizes = validVariants.length > 0
    ? [...new Set(validVariants.map(v => v.size))].sort()
    : ['S', 'M', 'L', 'XL'];

  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryImageIndex, setGalleryImageIndex] = useState(0);

  const inferDesignInkColor = (p) => {
    const haystack = `${p?.slug || ''} ${p?.name || ''} ${p?.description || ''}`.toLowerCase();
    if (haystack.includes('white') || haystack.includes('blanc')) return 'white';
    if (haystack.includes('black') || haystack.includes('negre')) return 'black';
    return 'black';
  };

  const normalizeToCanonicalColor = (value) => {
    const v = (value || '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const vv = v
      .replace(/%20/g, ' ')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!vv) return null;

    if (vv === 'blanc' || vv === 'white') return 'Blanc';
    if (vv === 'negre' || vv === 'black') return 'Negre';
    if (vv === 'vermell' || vv === 'red') return 'Vermell';
    if (vv === 'green' || vv.includes('militar') || vv.includes('military') || vv.includes('army')) return 'Militar';
    if (vv.includes('forest')) return 'Forest';
    if (vv.includes('royal')) return 'Royal';
    if (vv.includes('navy') || vv.includes('marina')) return 'Navy';

    return null;
  };

  const extractCanonicalColorFromImageUrl = (url) => {
    const normalized = (url || '').toString().replace(/\\/g, '/');
    const parts = normalized.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    // Ignore filename so we only match directory segments (Collection/Design/Color/file)
    const end = Math.max(0, parts.length - 1);
    for (let i = end - 1; i >= 0; i -= 1) {
      const canonical = normalizeToCanonicalColor(parts[i]);
      if (canonical) return canonical;
    }

    return null;
  };

  const extractDesignFromImageUrl = (url) => {
    const normalized = (url || '').toString().replace(/\\/g, '/');
    const parts = normalized.split('/').filter(Boolean);
    if (parts.length < 3) return null;

    // Ignore filename so we only match directory segments
    const end = Math.max(0, parts.length - 1);
    for (let i = end - 1; i >= 1; i -= 1) {
      const canonical = normalizeToCanonicalColor(parts[i]);
      if (canonical) {
        return parts[i - 1] || null;
      }
    }

    return parts[parts.length - 3] || null;
  };

  const normalizeLooseKey = (value) => {
    return (value || '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const humanizeLabel = (value) => {
    return (value || '')
      .toString()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
  };

  const formatProductName = (value) => {
    const cleaned = humanizeLabel(value);
    if (/^arthur\s+d\s+the\s+second$/i.test(cleaned)) return 'Arthur D. The Second';
    if (/^vulcans\s+end$/i.test(cleaned)) return "Vulcan's End";
    return cleaned;
  };

  const availableColors = useMemo(() => {
    if (validVariants.length === 0) return [];

    const defaultPreferredOrder = ['Blanc', 'Vermell', 'Militar', 'Forest', 'Royal', 'Navy', 'Negre'];
    const normalizeKey = (value) => {
      return (value || '')
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    const collectionKey = normalizeKey(product?.collection);
    const designKey = normalizeKey(product?.name);
    const isColorDesign = collectionKey === 'austen' || collectionKey === 'cube' || designKey === 'dj-vader';

    const inkColor = inferDesignInkColor(product);
    const excludedCanonical = isColorDesign ? null : (inkColor === 'white' ? 'Blanc' : 'Negre');

    const byColor = new Map();
    for (const v of validVariants) {
      if (v.size !== selectedSize) continue;

      const canonical = normalizeToCanonicalColor(v.color);
      if (!canonical) continue;
      if (excludedCanonical && canonical === excludedCanonical) continue;

      if (!byColor.has(canonical)) {
        byColor.set(canonical, {
          color: canonical,
          hex: v.colorHex,
          thumbnail: null
        });
      } else {
        const existing = byColor.get(canonical);
        byColor.set(canonical, existing);
      }
    }

    // If Gelato only provides a single mockup and Supabase stores per-color images
    // under Collection/DesignName/Color/file, use product.images as a source of
    // thumbnails per color.
    const productImages = Array.isArray(product?.images) ? product.images : [];
    for (const imgUrl of productImages) {
      const canonical = extractCanonicalColorFromImageUrl(imgUrl);
      if (!canonical) continue;
      if (excludedCanonical && canonical === excludedCanonical) continue;

      if (!byColor.has(canonical)) {
        byColor.set(canonical, {
          color: canonical,
          hex: null,
          thumbnail: imgUrl
        });
      } else {
        const existing = byColor.get(canonical);
        if (!existing.thumbnail && imgUrl) {
          byColor.set(canonical, { ...existing, thumbnail: imgUrl });
        }
      }
    }

    const rawColors = Array.from(byColor.values());

    const hasBlanc = rawColors.some((c) => normalizeKey(c?.color) === normalizeKey('Blanc'));
    const hasNegre = rawColors.some((c) => normalizeKey(c?.color) === normalizeKey('Negre'));

    let preferredOrder = defaultPreferredOrder;
    let filteredColors = rawColors;

    // Heurística per dissenys monocrom: si hi ha Negre i no hi ha Blanc -> dibuix blanc
    // si hi ha Blanc i no hi ha Negre -> dibuix negre
    if (hasNegre && !hasBlanc) {
      preferredOrder = ['Vermell', 'Militar', 'Forest', 'Royal', 'Navy', 'Negre'];
      filteredColors = rawColors.filter((c) => normalizeKey(c?.color) !== normalizeKey('Blanc'));
    } else if (hasBlanc && !hasNegre) {
      preferredOrder = ['Blanc', 'Vermell', 'Militar', 'Forest', 'Royal', 'Navy'];
      filteredColors = rawColors.filter((c) => normalizeKey(c?.color) !== normalizeKey('Negre'));
    }

    const orderedPreferred = preferredOrder
      .map((color) => {
        return filteredColors.find((c) => normalizeKey(c.color) === normalizeKey(color));
      })
      .filter(Boolean);

    const remaining = filteredColors
      .filter((colorObj) => {
        return !orderedPreferred.some((ordered) => normalizeKey(ordered.color) === normalizeKey(colorObj.color));
      })
      .sort((a, b) => (a?.color || '').localeCompare(b?.color || ''));

    return [...orderedPreferred, ...remaining];
  }, [validVariants, selectedSize, product?.images, product?.collection, product?.name]);

  // Obtenir la variant actual seleccionada
  const selectedVariant = validVariants.find((v) => {
    if (!v) return false;
    if (v.size !== selectedSize) return false;
    if (!selectedColor) return true;
    return normalizeToCanonicalColor(v.color) === normalizeToCanonicalColor(selectedColor);
  }) || validVariants[0];

  const colorThumbnails = useMemo(() => {
    const productImages = Array.isArray(product?.images) ? product.images : [];
    const targetDesignKey = normalizeLooseKey(selectedVariant?.design || product?.name);
    return (availableColors || []).map((c) => {
      const colorKey = normalizeToCanonicalColor(c?.color);
      const thumbByDesignAndColor = productImages.find((imgUrl) => {
        const imgColorKey = extractCanonicalColorFromImageUrl(imgUrl);
        if (imgColorKey !== colorKey) return false;
        const imgDesignKey = normalizeLooseKey(extractDesignFromImageUrl(imgUrl));
        if (!imgDesignKey || !targetDesignKey) return false;
        return imgDesignKey === targetDesignKey;
      }) || null;

      const thumb = thumbByDesignAndColor;
      return {
        ...c,
        thumbnail: c?.thumbnail || thumb
      };
    });
  }, [availableColors, product?.images, selectedVariant?.design, product?.name]);

  useEffect(() => {
    if (!product) return;

    // Ensure the selected size exists
    if (!availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0] || 'M');
      return;
    }

    // Ensure the selected color exists for the selected size
    const colorsForSize = validVariants
      .filter(v => v.size === selectedSize)
      .map(v => normalizeToCanonicalColor(v.color) || v.color)
      .filter(Boolean);
    const uniqueColorsForSize = [...new Set(colorsForSize)];

    if (uniqueColorsForSize.length === 0) {
      setSelectedColor(null);
      return;
    }

    const selectedCanonical = normalizeToCanonicalColor(selectedColor) || selectedColor;
    if (!selectedCanonical) {
      setSelectedColor(uniqueColorsForSize[0]);
      return;
    }

    if (!uniqueColorsForSize.includes(selectedCanonical)) {
      // If the color exists for some other size, switch to that size instead of overriding the color.
      const anyVariantForColor = validVariants.find((v) => {
        return normalizeToCanonicalColor(v?.color) === normalizeToCanonicalColor(selectedCanonical);
      });

      if (anyVariantForColor?.size && anyVariantForColor.size !== selectedSize) {
        setSelectedSize(anyVariantForColor.size);
        return;
      }

      // If the color doesn't exist in any variant (e.g. we show a fixed-order slot like
      // 'Militar' but the product has no Militar variant), keep selectedColor so the UI
      // can still show a placeholder main image and keep the slot highlighted.
    }
  }, [product?.id, availableSizes.join('|'), selectedSize, selectedColor, validVariants]);

  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(() => {
    const savedIndex = localStorage.getItem(`episodeIndex_${product?.id}`);
    return savedIndex ? parseInt(savedIndex) : (product?.id % episodes.length || 0);
  });

  const [editableEpisodes, setEditableEpisodes] = useState(() => {
    const savedVersion = localStorage.getItem(`episodesVersion_${product?.id}`);
    const saved = localStorage.getItem(`editableEpisodes_${product?.id}`);

    if (savedVersion === EPISODES_VERSION && saved) {
      return JSON.parse(saved);
    }

    localStorage.setItem(`episodesVersion_${product?.id}`, EPISODES_VERSION);
    return episodes;
  });
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const ROTATION_INTERVAL = 16000;
  const currentEpisode = editableEpisodes[selectedEpisodeIndex];

  // Obtenir imatges del producte
  // Prioritat: 1) Imatges de la variant, 2) Imatges del producte, 3) Mockups, 4) Imatges per defecte
  const getProductImages = () => {
    const dedupeUrlsPreserveOrder = (urls) => {
      const out = [];
      const seen = new Set();
      for (const u of urls || []) {
        const url = (u || '').toString().trim();
        if (!url) continue;
        if (seen.has(url)) continue;
        seen.add(url);
        out.push(url);
      }
      return out;
    };

    const variantImages = (Array.isArray(validVariants) ? validVariants : [])
      .filter((v) => {
        if (!v) return false;
        const img = v.image_url || v.image;
        if (!img) return false;
        if (!selectedSize) return true;
        return v.size === selectedSize;
      })
      .map((v) => v.image_url || v.image);

    if (product?.images && product.images.length > 0) {
      // Merge per-variant images even when product.images exists, because some products
      // only store a subset of images at product level.
      return dedupeUrlsPreserveOrder([...(product.images || []), ...variantImages]);
    }

    if (variantImages.length > 0) {
      return dedupeUrlsPreserveOrder(variantImages);
    }

    const selectedVariantImage = selectedVariant?.image_url || selectedVariant?.image;
    if (selectedVariantImage) {
      return dedupeUrlsPreserveOrder([selectedVariantImage]);
    }

    const fallback = product?.image || '/placeholder-product.svg';
    return dedupeUrlsPreserveOrder([fallback]);
  };

  const rawImages = getProductImages();

  const { images, thumbnailRows } = useMemo(() => {
    const normalizeKey = (value) => {
      return (value || '')
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    };

    const normalizeSlugKey = (value) => {
      return (value || '')
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    const inferInkFromDesignSegment = (designSegment) => {
      const d = normalizeKey(designSegment);
      if (!d) return null;
      if (d.includes('white') || d.includes('blanc')) return 'white';
      if (d.includes('black') || d.includes('negre')) return 'black';
      return null;
    };

    const inferInkFromImageUrl = (url) => {
      const normalized = (url || '').toString().replace(/\\/g, '/');
      const parts = normalized.split('/').filter(Boolean);
      if (parts.length < 2) return null;

      const colorSegment = parts[parts.length - 2] || '';
      const designSegment = parts.length >= 3 ? (parts[parts.length - 3] || '') : '';
      const fileName = parts[parts.length - 1] || '';

      const haystack = normalizeKey(`${designSegment} ${fileName}`);
      const colorKey = normalizeKey(colorSegment);

      const withoutColor = haystack
        ? haystack.replace(new RegExp(`\\b${colorKey}\\b`, 'g'), '').trim()
        : '';

      if (!withoutColor) return null;
      if (withoutColor.includes('white') || withoutColor.includes('blanc')) return 'white';
      if (withoutColor.includes('black') || withoutColor.includes('negre')) return 'black';
      return null;
    };

    const preferredRow1 = ['Negre', 'Vermell', 'Militar', 'Forest', 'Royal', 'Navy'];
    const preferredRow2 = ['Blanc', 'Vermell', 'Militar', 'Forest', 'Royal', 'Navy'];

    const colorHexByCanonical = new Map(
      (Array.isArray(availableColors) ? availableColors : [])
        .filter((c) => c && c.color)
        .map((c) => [c.color, c.hex])
    );

    const fallbackHexByCanonical = new Map([
      ['Blanc', '#FFFFFF'],
      ['Negre', '#000000'],
      ['Vermell', '#D00000'],
      ['Militar', '#556B2F'],
      ['Forest', '#0B3D2E'],
      ['Royal', '#0052CC'],
      ['Navy', '#001F3F']
    ]);

    const candidates = Array.isArray(rawImages) ? rawImages : [];
    if (candidates.length === 0) {
      return { images: candidates, thumbnailRows: null };
    }

    const byDesign = new Map();

    // For Outcasted, we store two ink sets in two folders:
    // - .../<design>/blanc/<file> => white ink set (files typically start with 'white-...')
    // - .../<design>/negre/<file> => black ink set (files typically start with 'black-...')
    // We group by that folder segment + the *actual* shirt color.
    const byShirtBase = new Map();

    // IMPORTANT: For Outcasted (and similar), the mockup URL often contains the shirt base
    // color as a directory segment (e.g. /negre/) while the *actual* shirt color (Vermell,
    // Forest, etc.) is encoded in the filename. Since we intentionally ignore the filename
    // in extractCanonicalColorFromImageUrl(), we must rely on variant data for color/design.
    const variantCandidates = Array.isArray(validVariants) ? validVariants : [];
    for (const v of variantCandidates) {
      const url = v?.image_url || v?.image;
      if (!url) continue;
      const canonicalColor = normalizeToCanonicalColor(v?.color);
      const design = (v?.design || '').toString().trim() || extractDesignFromImageUrl(url);
      if (!design || !canonicalColor) continue;

      const normalizedUrl = (url || '').toString().replace(/\\/g, '/');
      const parts = normalizedUrl.split('/').filter(Boolean);
      const folderBeforeFile = parts.length >= 2 ? parts[parts.length - 2] : null;
      const baseCanonical = normalizeToCanonicalColor(folderBeforeFile);
      if (baseCanonical === 'Blanc' || baseCanonical === 'Negre') {
        if (!byShirtBase.has(baseCanonical)) byShirtBase.set(baseCanonical, new Map());
        const baseMap = byShirtBase.get(baseCanonical);
        if (!baseMap.has(canonicalColor)) baseMap.set(canonicalColor, url);
      }

      if (!byDesign.has(design)) byDesign.set(design, new Map());
      const byColor = byDesign.get(design);
      if (!byColor.has(canonicalColor)) byColor.set(canonicalColor, url);
    }

    const extractOutcastedColorFromFilename = (url) => {
      const normalized = (url || '').toString().replace(/\\/g, '/');
      const parts = normalized.split('/').filter(Boolean);
      const file = (parts[parts.length - 1] || '').toLowerCase();
      if (!file) return null;

      // Special cases where filename contains both ink + shirt color tokens.
      // Example: '...-white-black.png' means white ink on black shirt => Negre shirt.
      if (file.includes('white-black')) return 'Negre';
      if (file.includes('black-white')) return 'Blanc';

      if (file.includes('forest')) return 'Forest';
      if (file.includes('royal')) return 'Royal';
      if (file.includes('navy')) return 'Navy';
      if (file.includes('red') || file.includes('vermell')) return 'Vermell';
      if (file.includes('militar') || file.includes('military') || file.includes('-green') || file.includes(' green')) return 'Militar';
      if (file.includes('white') || file.includes('blanc')) return 'Blanc';
      if (file.includes('black') || file.includes('negre')) return 'Negre';

      return null;
    };

    const productImages = Array.isArray(product?.images) ? product.images : [];
    for (const imgUrl of productImages) {
      const normalizedUrl = (imgUrl || '').toString().replace(/\\/g, '/');
      const parts = normalizedUrl.split('/').filter(Boolean);
      if (parts.length < 2) continue;

      const folderBeforeFile = parts[parts.length - 2] || null;
      const baseCanonical = normalizeToCanonicalColor(folderBeforeFile);
      if (baseCanonical !== 'Blanc' && baseCanonical !== 'Negre') continue;

      const design = extractDesignFromImageUrl(imgUrl);
      if (!design) continue;

      const canonicalColor =
        extractOutcastedColorFromFilename(imgUrl) ||
        extractCanonicalColorFromImageUrl(imgUrl) ||
        null;
      if (!canonicalColor) continue;

      if (!byShirtBase.has(baseCanonical)) byShirtBase.set(baseCanonical, new Map());
      const baseMap = byShirtBase.get(baseCanonical);
      if (!baseMap.has(canonicalColor)) baseMap.set(canonicalColor, imgUrl);

      if (!byDesign.has(design)) byDesign.set(design, new Map());
      const byColor = byDesign.get(design);
      if (!byColor.has(canonicalColor)) byColor.set(canonicalColor, imgUrl);
    }

    const collectionKey = normalizeSlugKey(product?.collection);
    const hasOutcastedBases =
      collectionKey === 'outcasted' &&
      byShirtBase.has('Negre') &&
      byShirtBase.has('Blanc') &&
      ((byShirtBase.get('Negre') || new Map()).size > 0 || (byShirtBase.get('Blanc') || new Map()).size > 0);

    if (hasOutcastedBases) {
      const buildBaseRow = (baseCanonical, colorOrder, keyPrefix) => {
        const map = byShirtBase.get(baseCanonical) || new Map();
        return colorOrder.map((color) => {
          const url = map.get(color) || null;
          const label = color === 'Militar' ? 'Green' : color;
          return {
            key: `${keyPrefix}-${color}`,
            color,
            label,
            url,
            hex: colorHexByCanonical.get(color) || fallbackHexByCanonical.get(color) || null
          };
        });
      };

      // Row 1 (starts with Negre) is the white-ink set => folder 'Blanc'
      // Row 2 (starts with Blanc) is the black-ink set => folder 'Negre'
      const rowForWhiteInk = buildBaseRow('Blanc', preferredRow1, 'ink-white');
      const rowForBlackInk = buildBaseRow('Negre', preferredRow2, 'ink-black');

      const ordered = [];
      const seen = new Set();
      const pushUrl = (u) => {
        if (!u) return;
        if (seen.has(u)) return;
        seen.add(u);
        ordered.push(u);
      };

      for (const item of rowForWhiteInk) pushUrl(item.url);
      for (const item of rowForBlackInk) pushUrl(item.url);
      for (const u of candidates) pushUrl(u);

      const indexByUrl = new Map();
      ordered.forEach((u, i) => indexByUrl.set(u, i));

      const finalizeRow = (items) =>
        items.map((it) => ({
          ...it,
          index: it.url ? (indexByUrl.get(it.url) ?? -1) : -1
        }));

      return {
        images: ordered,
        thumbnailRows: [finalizeRow(rowForWhiteInk), finalizeRow(rowForBlackInk)]
      };
    }

    // Fallback: if variants didn't populate anything (older products), try to infer from URLs.
    if (byDesign.size === 0) {
      for (const url of candidates) {
        const design = extractDesignFromImageUrl(url);
        const canonicalColor = extractCanonicalColorFromImageUrl(url);
        if (!design || !canonicalColor) continue;
        if (!byDesign.has(design)) byDesign.set(design, new Map());
        const byColor = byDesign.get(design);
        if (!byColor.has(canonicalColor)) byColor.set(canonicalColor, url);
      }
    }

    const designs = Array.from(byDesign.keys());
    let whiteDesign = null;
    let blackDesign = null;

    // Primary inference for monochrome: infer ink color by which shirt colors exist.
    // - If a design has Negre but not Blanc -> white ink (white print needs dark shirt)
    // - If a design has Blanc but not Negre -> black ink (black print needs light shirt)
    for (const d of designs) {
      if (whiteDesign && blackDesign) break;
      const map = byDesign.get(d) || new Map();
      const hasBlanc = map.has('Blanc');
      const hasNegre = map.has('Negre');
      if (hasNegre && !hasBlanc && !whiteDesign) whiteDesign = d;
      if (hasBlanc && !hasNegre && !blackDesign) blackDesign = d;
    }

    for (const d of designs) {
      const ink = inferInkFromDesignSegment(d);
      if (ink === 'white' && !whiteDesign) whiteDesign = d;
      if (ink === 'black' && !blackDesign) blackDesign = d;
    }

    if ((!whiteDesign || !blackDesign) && designs.length > 0) {
      // Secondary inference: look at actual URL tokens (excluding the shirt color segment)
      for (const d of designs) {
        if (whiteDesign && blackDesign) break;
        const map = byDesign.get(d) || new Map();
        const sampleUrl = map.values().next().value || null;
        const ink = sampleUrl ? inferInkFromImageUrl(sampleUrl) : null;
        if (ink === 'white' && !whiteDesign) whiteDesign = d;
        if (ink === 'black' && !blackDesign) blackDesign = d;
      }
    }

    if ((!whiteDesign || !blackDesign) && designs.length === 2) {
      // Deterministic fallback when we have exactly two designs
      whiteDesign = whiteDesign || designs[0];
      blackDesign = blackDesign || designs[1];
    }

    if (!whiteDesign || !blackDesign) {
      const inkColor = inferDesignInkColor(product);
      if (!whiteDesign && inkColor === 'white') whiteDesign = designs[0] || null;
      if (!blackDesign && inkColor === 'black') blackDesign = designs[0] || null;

      const fallbackOther = designs.find((d) => d !== (whiteDesign || blackDesign));
      if (!whiteDesign && fallbackOther) whiteDesign = fallbackOther;
      if (!blackDesign && fallbackOther) blackDesign = fallbackOther;
    }

    if (!whiteDesign || !blackDesign || whiteDesign === blackDesign) {
      // If variants gave us a usable design->color map, build the row from that.
      // This avoids relying on URL parsing, which can be misleading for Outcasted.
      const soleDesignKey = designs.length === 1 ? designs[0] : null;
      const soleMap = soleDesignKey ? (byDesign.get(soleDesignKey) || new Map()) : null;
      const hasVariantMap = soleMap && soleMap.size > 0;

      const presentCanonicals = hasVariantMap
        ? new Set(Array.from(soleMap.keys()))
        : new Set(candidates.map((u) => extractCanonicalColorFromImageUrl(u)).filter(Boolean));

      const hasBlanc = presentCanonicals.has('Blanc');
      const hasNegre = presentCanonicals.has('Negre');

      // If only one of Blanc/Negre is present, force the row to start with that
      // to match the intended fixed-order grids.
      let singleOrder = preferredRow2;
      if (hasNegre && !hasBlanc) singleOrder = preferredRow1;
      else if (hasBlanc && !hasNegre) singleOrder = preferredRow2;

      const singleRow = singleOrder.map((color) => {
        const url = hasVariantMap
          ? (soleMap.get(color) || null)
          : (candidates.find((u) => extractCanonicalColorFromImageUrl(u) === color) || null);
        const idx = url ? candidates.indexOf(url) : -1;
        const label = color === 'Militar' ? 'Green' : color;
        return {
          key: `${color}`,
          color,
          label,
          url,
          hex: colorHexByCanonical.get(color) || fallbackHexByCanonical.get(color) || null,
          index: idx
        };
      });

      return { images: candidates, thumbnailRows: [singleRow] };
    }

    const buildRow = (designKey, colorOrder) => {
      const map = byDesign.get(designKey) || new Map();
      return colorOrder.map((color) => {
        const url = map.get(color) || null;
        const label = color === 'Militar' ? 'Green' : color;
        return {
          key: `${designKey}-${color}`,
          color,
          label,
          url,
          hex: colorHexByCanonical.get(color) || fallbackHexByCanonical.get(color) || null
        };
      });
    };

    const rowForWhiteInkDesign = buildRow(whiteDesign, preferredRow1);
    const rowForBlackInkDesign = buildRow(blackDesign, preferredRow2);

    const ordered = [];
    const seen = new Set();
    const pushUrl = (u) => {
      if (!u) return;
      if (seen.has(u)) return;
      seen.add(u);
      ordered.push(u);
    };

    for (const item of rowForWhiteInkDesign) pushUrl(item.url);
    for (const item of rowForBlackInkDesign) pushUrl(item.url);
    for (const u of candidates) pushUrl(u);

    const indexByUrl = new Map();
    ordered.forEach((u, i) => indexByUrl.set(u, i));

    const finalizeRow = (items) =>
      items.map((it) => ({
        ...it,
        index: it.url ? (indexByUrl.get(it.url) ?? -1) : -1
      }));

    return {
      images: ordered,
      thumbnailRows: [finalizeRow(rowForWhiteInkDesign), finalizeRow(rowForBlackInkDesign)]
    };
  }, [rawImages, product, availableColors, extractDesignFromImageUrl, extractCanonicalColorFromImageUrl]);

  useEffect(() => {
    if (product?.id) {
      localStorage.setItem(`editableEpisodes_${product.id}`, JSON.stringify(editableEpisodes));
    }
  }, [editableEpisodes, product?.id]);

  useEffect(() => {
    if (product?.id) {
      localStorage.setItem(`episodeIndex_${product.id}`, selectedEpisodeIndex.toString());
    }
  }, [selectedEpisodeIndex, product?.id]);

  useEffect(() => {
    if (product?.name === 'NCC-1701' && isAutoPlay && !isEditingText) {
      const interval = setInterval(() => {
        setSelectedEpisodeIndex((prev) => (prev + 1) % episodes.length);
      }, ROTATION_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, isEditingText, product?.name, ROTATION_INTERVAL]);

  useEffect(() => {
    if (!showGalleryModal) return;
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') prevGalleryImage();
      if (e.key === 'ArrowRight') nextGalleryImage();
      if (e.key === 'Escape') closeGallery();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showGalleryModal, galleryImageIndex]);

  useEffect(() => {
    if (product) trackProductView(product);
  }, [product]);

  useEffect(() => {
    if (isEditingText || showGalleryModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isEditingText, showGalleryModal]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-black">Producte no trobat</h1>
          <p className="text-gray-600 mb-4">El producte que busques no existeix o ha estat eliminat.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Tornar a l'inici
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    const productToAdd = {
      ...product,
      selectedVariant,
      variant: selectedVariant,
      selectedColor
    };
    trackAddToCart(productToAdd, quantity);
    onAddToCart(productToAdd, selectedSize, quantity, true);
    success('Producte afegit al cistell');
  };

  const openGallery = (index) => {
    setGalleryImageIndex(index);
    setShowGalleryModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setShowGalleryModal(false);
    document.body.style.overflow = 'auto';
  };

  const nextGalleryImage = () => {
    setGalleryImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevGalleryImage = () => {
    setGalleryImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDoubleClickEdit = () => {
    setIsEditingText(true);
    setEditedText(currentEpisode.text);
  };

  const handleSaveText = () => {
    const updatedEpisodes = [...editableEpisodes];
    updatedEpisodes[selectedEpisodeIndex] = {
      ...updatedEpisodes[selectedEpisodeIndex],
      text: editedText
    };
    setEditableEpisodes(updatedEpisodes);
    setIsEditingText(false);
    success('Text actualitzat');
  };

  const handleCancelEdit = () => {
    setIsEditingText(false);
    setEditedText('');
  };

  const nextEpisode = () => {
    setSelectedEpisodeIndex((prev) => (prev + 1) % episodes.length);
  };

  const prevEpisode = () => {
    setSelectedEpisodeIndex((prev) => (prev - 1 + episodes.length) % episodes.length);
  };

  const handleExportEpisodes = () => {
    const exportText = editableEpisodes.map((ep, index) => {
      return `${index + 1}. ${ep.originalTitle}\n   ${ep.title}\n   \n   ${ep.text}\n`;
    }).join('\n---\n\n');

    const fullText = `EPISODIS DE STAR TREK - TEXTOS MODIFICATS\n${'='.repeat(50)}\n\n${exportText}\n${'='.repeat(50)}\n\nExportat: ${new Date().toLocaleString('ca-ES')}`;

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'episodis-star-trek-modificats.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    success('Episodis exportats');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href
        });
        trackShare('product', product.id, 'native');
      } catch (error) {
        // User cancelled share
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleWishlistToggle = () => {
    const wasInWishlist = isInWishlist(product.id);
    toggleWishlist(product);
    if (!wasInWishlist) {
      trackAddToWishlist(product);
      success('Afegit a favorits');
    }
  };

  const handleCheckout = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const getCollectionLogoSrc = (collection) => {
    switch (collection) {
      case 'cube':
        return '/custom_logos/collections/collection-cube-logo.svg';
      case 'first-contact':
        return '/custom_logos/collections/collection-first-contact-logo.svg';
      case 'austen':
      case 'jean-austen':
        return '/custom_logos/collections/collection-jean-austen-logo.svg';
      case 'outcasted':
        return '/custom_logos/collections/collection-outcasted-logo.svg';
      default:
        return '/custom_logos/collections/collection-thin-square-logo-5.svg';
    }
  };

  const relatedCollections = Array.from(
    new Set(
      products
        .map((p) => p.collection)
        .filter((c) => c && c !== product.collection)
    )
  ).slice(0, 4);

  const isTepaEnabled = false;

  useEffect(() => {
    if (!isTepaEnabled) {
      console.warn('[TEPA] "També et podria agradar" està desactivat temporalment. Cal definir comportament i reactivar-ho abans de tancar el projecte.');
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>{product.name} | GRÀFIC</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <SEOProductSchema product={product} />

      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <nav className="pt-[8px] lg:pt-[10px] pb-4 ml-[5px] -mt-[25px]">
            <ol className="flex items-center space-x-2 text-sm uppercase">
              <li><Link to="/" className="text-gray-500 hover:text-gray-900 transition-colors">Inici</Link></li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li><Link to={`/${product.collection}`} className="text-gray-500 hover:text-gray-900 transition-colors">{humanizeLabel(product.collection)}</Link></li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li className="text-gray-900 font-medium truncate">{formatProductName(product.name)}</li>
            </ol>
          </nav>
        </div>

        {/* Layout Desktop */}
        <div data-pdp-desktop="1" className="max-w-7xl mx-auto px-4 lg:px-8 hidden lg:block mt-[25px]" style={{ position: 'relative', minHeight: '1000px' }}>
          <ProductGallery
            images={images}
            thumbnailRows={thumbnailRows}
            selectedColor={selectedColor}
            onColorSelect={(color) => {
              const canonical = normalizeToCanonicalColor(color) || color;
              setSelectedColor(canonical);

              const hasCurrentSize = validVariants.some((v) => {
                return v?.size === selectedSize && normalizeToCanonicalColor(v?.color) === normalizeToCanonicalColor(canonical);
              });

              if (!hasCurrentSize) {
                const firstForColor = validVariants.find((v) => {
                  return normalizeToCanonicalColor(v?.color) === normalizeToCanonicalColor(canonical);
                });
                if (firstForColor?.size) setSelectedSize(firstForColor.size);
              }
            }}
            productName={product.name}
            onImageClick={openGallery}
            layout="desktop"
          />

          <ProductInfo
            product={product}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
            selectedVariant={selectedVariant}
            availableSizes={availableSizes}
            availableColors={availableColors}
            onSizeChange={setSelectedSize}
            onColorChange={setSelectedColor}
            onWishlistToggle={handleWishlistToggle}
            onCheckout={handleCheckout}
            onShare={handleShare}
            isInWishlist={isInWishlist(product.id)}
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            layout="desktop"
          />

        <EpisodeControls
          currentEpisode={currentEpisode}
          onPrevious={prevEpisode}
          onNext={nextEpisode}
          layout="desktop"
        />

        <EpisodeDisplay
          currentEpisode={currentEpisode}
          isEditing={isEditingText}
          editedText={editedText}
          onTextChange={setEditedText}
          onSave={handleSaveText}
          onCancel={handleCancelEdit}
          onDoubleClick={handleDoubleClickEdit}
          layout="desktop"
        />
      </div>

      {/* Layout Mòbil/Tablet */}
      <div className="max-w-7xl mx-auto px-4 lg:hidden mt-[25px]">
        <ProductGallery
          images={images}
          thumbnailRows={thumbnailRows}
          selectedColor={selectedColor}
          onColorSelect={(color) => {
            const canonical = normalizeToCanonicalColor(color) || color;
            setSelectedColor(canonical);

            const hasCurrentSize = validVariants.some((v) => {
              return v?.size === selectedSize && normalizeToCanonicalColor(v?.color) === normalizeToCanonicalColor(canonical);
            });

            if (!hasCurrentSize) {
              const firstForColor = validVariants.find((v) => {
                return normalizeToCanonicalColor(v?.color) === normalizeToCanonicalColor(canonical);
              });
              if (firstForColor?.size) setSelectedSize(firstForColor.size);
            }
          }}
          productName={product.name}
          onImageClick={openGallery}
          layout="mobile"
        />

        <h1 className="font-oswald text-3xl sm:text-4xl font-bold uppercase mb-4">
          {formatProductName(product.name)}
        </h1>

        <div className="flex items-center justify-between mb-4">
          <p className="font-oswald text-2xl sm:text-3xl font-normal">
            {product.price.toFixed(2).replace('.', ',')} €
          </p>
          <EpisodeControls
            currentEpisode={currentEpisode}
            onPrevious={prevEpisode}
            onNext={nextEpisode}
            layout="mobile"
          />
        </div>

        <EpisodeDisplay
          currentEpisode={currentEpisode}
          isEditing={isEditingText}
          editedText={editedText}
          onTextChange={setEditedText}
          onSave={handleSaveText}
          onCancel={handleCancelEdit}
          onDoubleClick={handleDoubleClickEdit}
          layout="mobile"
        />

        <ProductInfo
          product={product}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          selectedVariant={selectedVariant}
          availableSizes={availableSizes}
          availableColors={availableColors}
          onSizeChange={setSelectedSize}
          onColorChange={setSelectedColor}
          onWishlistToggle={handleWishlistToggle}
          onCheckout={handleCheckout}
          onShare={handleShare}
          isInWishlist={isInWishlist(product.id)}
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
          layout="mobile"
        />
      </div>

      {product.name === 'NCC-1701' && (
        <div className="fixed right-4 bottom-4 z-[10000]">
          <button
            onClick={handleExportEpisodes}
            className="bg-white hover:bg-gray-100 px-4 py-2 rounded-full shadow-lg transition-colors border border-gray-300 font-oswald text-sm font-semibold"
            aria-label="Exportar episodis"
            title="Exportar textos dels episodis modificats"
          >
            EXPORTA EPISODIS
          </button>
        </div>
      )}

      {/* Galeria Modal Fullscreen */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-[20000] bg-black/95 flex items-center justify-center">
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
            aria-label="Tancar galeria"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <button
            onClick={prevGalleryImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors"
            aria-label="Imatge anterior"
          >
            <ChevronLeft className="h-8 w-8 text-white" />
          </button>

          <div className="max-w-7xl max-h-[90vh] mx-auto px-4">
            <img
              src={images[galleryImageIndex]}
              alt={`${product.name} - Vista ${galleryImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <div className="text-white text-center mt-4 font-oswald">
              {galleryImageIndex + 1} / {images.length}
            </div>
          </div>

          <button
            onClick={nextGalleryImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors"
            aria-label="Imatge següent"
          >
            <ChevronRight className="h-8 w-8 text-white" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-3 rounded-lg">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setGalleryImageIndex(idx)}
                className={`w-16 h-16 rounded overflow-hidden transition-all ${
                  idx === galleryImageIndex ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Miniatura ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {isTepaEnabled && relatedCollections.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="border-t border-gray-200 pt-12">
            <h2 className="font-roboto text-2xl sm:text-3xl font-normal uppercase mb-8" style={{ color: '#141414' }}>
              També et podria agradar
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-center">
              {relatedCollections.map((collection) => (
                <div key={collection} className="w-full">
                  <div
                    className="w-full bg-white flex items-center justify-center"
                    style={{ height: '110px' }}
                  >
                    <img
                      src={getCollectionLogoSrc(collection)}
                      alt={humanizeLabel(collection)}
                      style={{
                        maxWidth: '220px',
                        maxHeight: '70px',
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'grayscale(100%)',
                        opacity: 0.35
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
</>
  );
};

export default ProductDetailPage;
