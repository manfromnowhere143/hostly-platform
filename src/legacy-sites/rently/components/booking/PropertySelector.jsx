// ═══════════════════════════════════════════════════════════════════════════════
// PROPERTY SELECTOR - Available Apartments (Same Style as Apartments Page)
// ═══════════════════════════════════════════════════════════════════════════════
// Shows available apartments after date selection - identical cards to main page
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from 'react';
import { useBooking } from '../../context/BookingContext';
import { bookingAPI, formatDate, formatPrice } from '../../services/booking';
import { SEASIDE_APARTMENTS, EILAT42_APARTMENTS } from '../../rently.config';

// ─── Smooth Image Component (Same as Apartments Page) ─────────────────────────
function SmoothImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="smooth-image-container">
      {!loaded && !error && (
        <div className="image-skeleton">
          <div className="skeleton-shimmer" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </div>
  );
}

// ─── Apartment Card (Identical to Apartments Page) ────────────────────────────
function ApartmentCard({ apartment, onSelect, lang, isSelected, pricing }) {
  const name = apartment.name?.[lang] || apartment.name?.en || apartment.name;
  const projectLabel = apartment.project === 'seaside'
    ? (lang === 'he' ? 'סי סייד' : 'Sea Side')
    : (lang === 'he' ? 'אילת 42' : 'Eilat 42');

  return (
    <article
      className={`apt-card booking-apt-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(apartment)}
    >
      <div className="apt-card-image">
        <SmoothImage src={apartment.images?.[0]} alt={name} />

        {/* Project Badge */}
        <span className="apt-card-badge">{projectLabel}</span>

        {/* Selected Check */}
        {isSelected && (
          <div className="apt-card-selected">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
        )}

        {/* Image Dots */}
        {apartment.images?.length > 1 && (
          <div className="apt-card-dots">
            {apartment.images.slice(0, 5).map((_, i) => (
              <span key={i} className={`apt-card-dot ${i === 0 ? 'active' : ''}`} />
            ))}
          </div>
        )}
      </div>

      <div className="apt-card-info">
        <div className="apt-card-header">
          <h3 className="apt-card-title">{name}</h3>
          <span className="apt-card-rating">
            <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            {apartment.rating || '4.9'}
          </span>
        </div>
        <p className="apt-card-details">
          {apartment.specs?.beds || 1} {lang === 'he' ? 'מיטות' : 'beds'} · {apartment.specs?.sqm || 50} {lang === 'he' ? 'מ״ר' : 'sqm'}
        </p>
        {pricing ? (
          <p className="apt-card-price">
            <strong>{formatPrice(pricing.total, pricing.currency)}</strong>
            <span className="price-nights">
              {' '}/ {pricing.nights} {lang === 'he' ? 'לילות' : 'nights'}
            </span>
          </p>
        ) : (
          <p className="apt-card-price">
            <strong>{apartment.price || '₪850'}</strong> {lang === 'he' ? '/ לילה' : '/ night'}
          </p>
        )}
      </div>
    </article>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PropertySelector() {
  const {
    checkIn,
    checkOut,
    adults,
    children,
    lang = 'en',
    selectProperty,
    property: selectedProperty,
    setStep,
  } = useBooking();

  const [loading, setLoading] = useState(true);
  const [availableApartments, setAvailableApartments] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  // All local apartments combined with lookup by name
  const allLocalApartments = useMemo(() => {
    const byName = {};
    const all = [...SEASIDE_APARTMENTS, ...EILAT42_APARTMENTS];
    all.forEach(apt => {
      // Store by multiple name variations for better matching
      const name = apt.name?.en?.toLowerCase().trim() || '';
      byName[name] = apt;
      // Also store without spaces for fuzzy matching
      const nameNoSpaces = name.replace(/\s+/g, '');
      byName[nameNoSpaces] = apt;
    });
    return { byName, all };
  }, []);

  // Fetch available properties from Hostly API and match with local data
  useEffect(() => {
    if (!checkIn || !checkOut) return;

    const fetchAvailable = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('[PropertySelector] Fetching available properties...', {
          checkIn: formatDate(checkIn),
          checkOut: formatDate(checkOut),
          adults,
          children,
        });

        const result = await bookingAPI.getAvailableProperties({
          checkIn: formatDate(checkIn),
          checkOut: formatDate(checkOut),
          adults,
          children,
        });

        console.log('[PropertySelector] API Response:', {
          available: result.available,
          total: result.total,
          propertiesCount: result.properties?.length,
        });

        // Match Hostly properties with local apartment data (for images)
        const enrichedApartments = (result.properties || []).map(hostlyProp => {
          // Extract apartment name from Hostly property name (e.g., "Mykonos - Sea Side #3" -> "mykonos")
          const aptName = hostlyProp.name.split(' - ')[0].toLowerCase().trim();
          const aptNameNoSpaces = aptName.replace(/\s+/g, '');

          // Try multiple matching strategies
          const localApt = allLocalApartments.byName[aptName] ||
                          allLocalApartments.byName[aptNameNoSpaces];

          // Debug logging for development
          if (!localApt) {
            console.log(`[PropertySelector] No local match for: "${hostlyProp.name}" (searched: "${aptName}")`);
          }

          // Determine the project from Hostly property name
          const project = hostlyProp.name.toLowerCase().includes('eilat 42') ? 'eilat42' : 'seaside';

          return {
            ...localApt,
            // ALWAYS include Hostly data - this ensures booking works even without local match
            id: localApt?.id || hostlyProp.id, // Use local id for display, or Hostly id as fallback
            hostlyId: hostlyProp.id, // CRITICAL: Always set the Hostly property ID
            hostlySlug: hostlyProp.slug,
            pricing: hostlyProp.pricing,
            // Override with Hostly data where available
            maxGuests: hostlyProp.maxGuests,
            bedrooms: hostlyProp.bedrooms,
            // Fallback data if no local match
            name: localApt?.name || { en: hostlyProp.name.split(' - ')[0], he: hostlyProp.name.split(' - ')[0] },
            project: localApt?.project || project,
            images: localApt?.images || ['/apartments/placeholder.jpg'],
            specs: localApt?.specs || { beds: hostlyProp.bedrooms || 1, baths: 1, sqm: 50 },
          };
        }).filter(apt => apt.hostlyId); // Filter by hostlyId (should always exist from API)

        console.log('[PropertySelector] Enriched apartments:', enrichedApartments.length);

        // IMPORTANT: Only show available apartments from API - no fallback to all apartments
        // This ensures availability filtering works correctly
        if (enrichedApartments.length > 0) {
          setAvailableApartments(enrichedApartments);
        } else if (result.properties?.length === 0 && result.available === 0) {
          // API explicitly says no apartments available for these dates
          console.log('[PropertySelector] No apartments available for selected dates');
          setAvailableApartments([]);
        } else {
          // API returned no data (might be standalone mode or connection issue)
          // Only then fallback to local apartments
          console.warn('[PropertySelector] API returned no properties, falling back to local data');
          const localWithIds = allLocalApartments.all.map(apt => ({
            ...apt,
            hostlyId: `prop_${apt.id}`,
          }));
          setAvailableApartments(localWithIds);
        }
      } catch (err) {
        console.error('[PropertySelector] Failed to fetch available properties:', err);
        // On API error, fallback to local apartments with a warning
        // This ensures users can still browse/book even if API is temporarily unavailable
        console.warn('[PropertySelector] Falling back to local apartments due to API error');
        const localWithIds = allLocalApartments.all.map(apt => ({
          ...apt,
          hostlyId: `prop_${apt.id}`,
        }));
        setAvailableApartments(localWithIds);
        // Don't show error to user - just log it
      } finally {
        setLoading(false);
      }
    };

    fetchAvailable();
  }, [checkIn, checkOut, adults, children, allLocalApartments]);

  // Filter apartments by project
  const filteredApartments = useMemo(() => {
    if (filter === 'all') return availableApartments;
    return availableApartments.filter(apt => apt.project === filter);
  }, [availableApartments, filter]);

  // Handle apartment selection
  const handleSelect = (apartment) => {
    // CRITICAL: Ensure we always have a valid property ID for booking
    const propertyId = apartment.hostlyId || apartment.id;

    if (!propertyId) {
      console.error('[PropertySelector] Cannot select apartment without ID:', apartment);
      return;
    }

    // Create Hostly-compatible property object
    const hostlyProperty = {
      id: propertyId, // This is the Hostly property ID (e.g., 'prop_s3')
      slug: apartment.hostlySlug || `${apartment.project}-${(apartment.name?.en || '').toLowerCase().replace(/\s+/g, '-')}`,
      name: apartment.name?.en || apartment.name,
      bedrooms: apartment.bedrooms || apartment.specs?.beds || 1,
      beds: apartment.specs?.beds || 1,
      bathrooms: apartment.specs?.baths || 1,
      maxGuests: apartment.maxGuests || apartment.specs?.guests || 6,
      pricing: apartment.pricing,
      images: apartment.images,
      project: apartment.project,
    };

    console.log('[PropertySelector] Selected property:', { id: hostlyProperty.id, name: hostlyProperty.name });
    selectProperty(hostlyProperty);
  };

  // Counts for filter tabs
  const seasideCount = availableApartments.filter(a => a.project === 'seaside').length;
  const eilat42Count = availableApartments.filter(a => a.project === 'eilat42').length;

  const texts = {
    en: {
      title: 'Choose Your Apartment',
      subtitle: 'apartments available for your dates',
      all: 'All',
      seaside: 'Sea Side',
      eilat42: 'Eilat 42',
      loading: 'Finding available apartments...',
      noResults: 'No apartments available for these dates',
      error: 'Failed to load apartments',
    },
    he: {
      title: 'בחר את הדירה שלך',
      subtitle: 'דירות זמינות לתאריכים שלך',
      all: 'הכל',
      seaside: 'סי סייד',
      eilat42: 'אילת 42',
      loading: 'מחפש דירות זמינות...',
      noResults: 'אין דירות זמינות לתאריכים אלו',
      error: 'שגיאה בטעינת הדירות',
    },
  };

  const t = texts[lang];

  if (loading) {
    return (
      <div className="property-selector-loading">
        <div className="loading-spinner" />
        <p>{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="property-selector-error">
        <svg viewBox="0 0 24 24" width="48" height="48">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <p>{t.error}</p>
      </div>
    );
  }

  return (
    <div className="property-selector">
      {/* Header */}
      <div className="property-selector-header">
        <h3 className="property-selector-title">{t.title}</h3>
        <p className="property-selector-subtitle">
          <span className="available-count">{filteredApartments.length}</span> {t.subtitle}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="property-selector-filters">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t.all} ({availableApartments.length})
        </button>
        <button
          className={`filter-tab ${filter === 'seaside' ? 'active' : ''}`}
          onClick={() => setFilter('seaside')}
        >
          {t.seaside} ({seasideCount})
        </button>
        <button
          className={`filter-tab ${filter === 'eilat42' ? 'active' : ''}`}
          onClick={() => setFilter('eilat42')}
        >
          {t.eilat42} ({eilat42Count})
        </button>
      </div>

      {/* Apartments Grid - Same Style as Main Page */}
      {filteredApartments.length > 0 ? (
        <div className="property-selector-grid">
          {filteredApartments.map(apartment => (
            <ApartmentCard
              key={apartment.id}
              apartment={apartment}
              onSelect={handleSelect}
              lang={lang}
              isSelected={selectedProperty?.id === apartment.hostlyId || selectedProperty?.id === `prop_${apartment.id}`}
              pricing={apartment.pricing}
            />
          ))}
        </div>
      ) : (
        <div className="property-selector-empty">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          <p>{t.noResults}</p>
        </div>
      )}
    </div>
  );
}
