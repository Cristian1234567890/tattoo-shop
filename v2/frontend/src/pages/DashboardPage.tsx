import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StyleFilter } from '../components/dashboard/StyleFilter';
import { ArtistCard } from '../components/dashboard/ArtistCard';
import { OffCanvasMenu } from '../components/dashboard/OffCanvasMenu';
import { SvgIcons } from '../components/common/SvgIcons';
import { TattooArtistCard } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { OnboardingModal } from '../components/auth/OnboardingModal';
import { SubscriptionNoticeModal } from '../components/auth/SubscriptionNoticeModal';
import { PageTransition } from '../components/common/PageTransition';

export const DashboardPage: React.FC = () => {
  const [artists, setArtists] = useState<TattooArtistCard[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showArtistNotice, setShowArtistNotice] = useState<boolean>(false);

  useEffect(() => {
    if (!authLoading && user) {
      const meta = user.user_metadata || {};
      const normalizedRole = (meta.tipo || meta.role || '').toLowerCase();
      const hasValidRole = normalizedRole === 'cliente' || normalizedRole === 'tatuador';
      const hasCompletedOnboarding =
        meta.onboarding_completed === true &&
        meta.legal_accepted === true &&
        hasValidRole;

      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
        // Smart role redirector
        if (normalizedRole === 'tatuador') {
          navigate('/artist-dashboard', { replace: true });
        } else if (normalizedRole === 'cliente') {
          navigate('/client-dashboard', { replace: true });
        }
      }
    } else {
      setShowOnboarding(false);
    }
  }, [user, authLoading, navigate]);

  const handleOnboardingCompleted = (selectedRole?: string) => {
    setShowOnboarding(false);
    const meta = user?.user_metadata || {};
    const finalRole = (selectedRole || meta.tipo || meta.role || '').toLowerCase();
    if (finalRole === 'tatuador') {
      navigate('/artist-dashboard', { replace: true });
    } else {
      navigate('/client-dashboard', { replace: true });
    }
  };

  useEffect(() => {
    fetchArtists();
    if (window.location.hash && window.location.hash.includes('access_token')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const fetchArtists = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getTattooArtists();
      if (res.success && res.data && res.data.length > 0) {
        setArtists(res.data);
      } else {
        // Fallback default sample artists if database table is initially unpopulated
        setArtists(sampleArtists);
      }
    } catch (err: any) {
      console.warn('Could not load live artists, using sample catalogue:', err);
      setArtists(sampleArtists);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  // Filter artists reactively
  const filteredArtists = artists.filter((artist) => {
    const data = artist.data;
    const fullName = `${data.nombre || ''} ${data.apellido || ''}`.toLowerCase();
    const style = (data.work_type || '').toLowerCase();
    const city = (data.ciudad || '').toLowerCase();
    const province = (data.provincia || '').toLowerCase();
    const query = search.toLowerCase().trim();

    const matchesSearch =
      !query ||
      fullName.includes(query) ||
      style.includes(query) ||
      city.includes(query) ||
      province.includes(query);

    const matchesStyle =
      selectedStyles.length === 0 ||
      selectedStyles.some((s) => style.includes(s.toLowerCase()));

    return matchesSearch && matchesStyle;
  });

  return (
    <PageTransition>
      <div className="min-h-screen relative p-4 md:p-8">
      <SvgIcons />
      <OffCanvasMenu />

      <div className="container mx-auto flex flex-col md:flex-row gap-8 items-start">
        {/* Left Column: Style Filters */}
        <StyleFilter
          selectedStyles={selectedStyles}
          onToggleStyle={handleToggleStyle}
        />

        {/* Center Column: Search & Artist Grid */}
        <div className="column2 flex-1 w-full">
          <div className="search mb-4">
            <input
              type="text"
              name="busqueda"
              placeholder="🔍 Buscar tatuador"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 text-gray-900 dark:text-white shadow-lg focus:ring-2 focus:ring-primary focus:outline-none transition text-base"
            />
          </div>

          <hr className="my-4 border-gray-300 dark:border-gray-700" />

          {loading ? (
            <div className="flex justify-center items-center py-20 text-white font-semibold">
              Cargando tatuadores...
            </div>
          ) : error ? (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center">
              {error}
            </div>
          ) : (
            <div id="card-container" className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {filteredArtists.length > 0 ? (
                filteredArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))
              ) : (
                <div className="col-span-full py-16 text-center bg-white/80 dark:bg-gray-800/80 rounded-xl shadow p-8">
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-200">
                    No se encontraron tatuadores con esos criterios.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Prueba cambiando los filtros de estilo o término de búsqueda.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {user && (
        <OnboardingModal
          isOpen={showOnboarding}
          user={user}
          onCompleted={handleOnboardingCompleted}
        />
      )}

      <SubscriptionNoticeModal
        isOpen={showArtistNotice}
        onContinue={() => setShowArtistNotice(false)}
        onCancel={() => setShowArtistNotice(false)}
      />
      </div>
    </PageTransition>
  );
};

// High-fidelity fallback artist dataset when database has 0 rows
const sampleArtists: TattooArtistCard[] = [
  {
    id: 'artist-001',
    data: {
      email: 'giovanni.tattoo@example.com',
      nombre: 'Giovanni',
      apellido: 'Buglione',
      work_type: 'realista',
      telefono: '60012345',
      provincia: 'Panamá',
      ciudad: 'Ciudad de Panamá',
      direccion: 'Bella Vista, Calle 50',
      profile: '/assets/GB Tattoo.jpg',
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
      link: 'https://instagram.com',
      followersCount: 1598,
      followingCount: 65,
      worksCount: 85,
    },
  },
  {
    id: 'artist-002',
    data: {
      email: 'cristian.tattoo@example.com',
      nombre: 'Cristian',
      apellido: 'Castillo',
      work_type: 'blackwork',
      telefono: '67894321',
      provincia: 'Chiriquí',
      ciudad: 'David',
      direccion: 'Barrio Bolívar',
      profile: '/assets/GB.jpeg',
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
      link: 'https://instagram.com',
      followersCount: 2340,
      followingCount: 110,
      worksCount: 142,
    },
  },
  {
    id: 'artist-003',
    data: {
      email: 'luis.tattoo@example.com',
      nombre: 'Luis',
      apellido: 'Lopez',
      work_type: 'japones',
      telefono: '69001122',
      provincia: 'Colón',
      ciudad: 'Colón',
      direccion: 'Cuatro Altos',
      profile: '/assets/1251.jpg',
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
      link: 'https://instagram.com',
      followersCount: 980,
      followingCount: 42,
      worksCount: 63,
    },
  },
  {
    id: 'artist-004',
    data: {
      email: 'ana.tradicional@example.com',
      nombre: 'Ana',
      apellido: 'Valdés',
      work_type: 'tradicional',
      telefono: '61112233',
      provincia: 'Panamá Oeste',
      ciudad: 'La Chorrera',
      direccion: 'Avenida Central',
      profile: '/assets/1571.jpg',
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
      link: 'https://instagram.com',
      followersCount: 1250,
      followingCount: 88,
      worksCount: 97,
    },
  },
];
