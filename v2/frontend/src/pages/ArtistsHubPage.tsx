import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  MapPin,
  Compass,
  X,
  Phone,
  MessageCircle,
  LocateFixed,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { PageTransition } from '../components/common/PageTransition';
import { HubSkeleton, HubDrawerSkeleton } from '../components/hub/HubSkeleton';
import { api } from '../api/client';
import {
  DEFAULT_COORDINATES,
  normalizeHubArtist,
  SAMPLE_HUB_ARTISTS,
  NormalizedHubArtist,
} from '../utils/geo';

// Fix for leaflet default icons in Vite
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// @ts-ignore
import markerRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom animated pulsing divIcon for user GPS location
const UserGpsIcon = L.divIcon({
  className: 'user-gps-marker',
  html: `
    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background: rgba(59, 130, 246, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 14px; height: 14px; border-radius: 9999px; background: #3b82f6; border: 2.5px solid #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.6);"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

/**
 * Controller component to smoothly re-center and animate the map when coordinates change.
 */
export function MapRecenter({
  center,
  zoom = 13,
}: {
  center: [number, number];
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (center && typeof center[0] === 'number' && typeof center[1] === 'number') {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center[0], center[1], zoom, map]);
  return null;
}

export default function ArtistsHubPage() {
  const [rawArtists, setRawArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_COORDINATES);
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [gpsStatus, setGpsStatus] = useState<
    'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported'
  >('idle');
  const [gpsNotification, setGpsNotification] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const navigate = useNavigate();

  // 1. Fetch live artists with high-fidelity sample fallback
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await api.getTattooArtists();
        if (response.success && response.data && response.data.length > 0) {
          setRawArtists(response.data);
        } else {
          setRawArtists(SAMPLE_HUB_ARTISTS);
        }
      } catch (err) {
        console.warn('Could not load live artists for hub, using sample dataset:', err);
        setRawArtists(SAMPLE_HUB_ARTISTS);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  // 2. Request browser GPS Geolocation
  const requestUserLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsStatus('unsupported');
      setGpsNotification('La geolocalización no está soportada por tu navegador.');
      return;
    }

    setGpsStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords([lat, lng]);
        setMapCenter([lat, lng]);
        setMapZoom(13);
        setGpsStatus('granted');
        setGpsNotification(null);
      },
      (error) => {
        console.warn('Geolocation denied or unavailable:', error?.message);
        setGpsStatus('denied');
        setGpsNotification('📍 Ubicación no disponible. Mostrando artistas globales.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    requestUserLocation();
  }, [requestUserLocation]);

  // 3. Normalize artists with accurate coordinates & distance
  const normalizedArtists: NormalizedHubArtist[] = useMemo(() => {
    return rawArtists.map((artist, index) =>
      normalizeHubArtist(artist, index, userCoords)
    );
  }, [rawArtists, userCoords]);

  // 4. Style filter matching
  const filteredArtists = useMemo(() => {
    return normalizedArtists.filter((artist) => {
      if (filter === 'All') return true;
      const s = (artist.style || '').toLowerCase();
      const f = filter.toLowerCase();
      if (f === 'realismo') return s.includes('realis');
      if (f === 'tradicional') return s.includes('tradicional');
      if (f === 'blackwork') return s.includes('black');
      if (f === 'minimalista') return s.includes('minimal') || s.includes('line');
      if (f === 'neotradicional') return s.includes('neotrad');
      return s.includes(f);
    });
  }, [normalizedArtists, filter]);

  // 5. Sort artists by proximity (if GPS granted) or portfolio works
  const sortedArtists = useMemo(() => {
    const list = [...filteredArtists];
    if (userCoords) {
      return list.sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999));
    }
    return list.sort((a, b) => b.worksCount - a.worksCount);
  }, [filteredArtists, userCoords]);

  const handleChat = (artistId: string) => {
    navigate(`/chat?artist=${artistId}`);
  };

  const handleCenterOnArtist = (artist: NormalizedHubArtist) => {
    setMapCenter([artist.lat, artist.lng]);
    setMapZoom(15);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#090d16] flex flex-col overflow-hidden">
        <Navbar />

      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] relative overflow-hidden">
        {/* Top Floating Control Bar: Style Filters & GPS Status */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] flex items-center justify-between gap-3 w-full max-w-6xl px-4 pointer-events-none">
          {/* Style Filter Pills */}
          <div
            data-testid="style-filter-bar"
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pointer-events-auto py-1 px-2 bg-gray-900/80 backdrop-blur-md rounded-full border border-white/10 shadow-2xl"
          >
            {['All', 'Realismo', 'Tradicional', 'Blackwork', 'Minimalista', 'Neotradicional'].map(
              (style) => (
                <button
                  key={style}
                  data-testid={`filter-pill-${style.toLowerCase()}`}
                  onClick={() => setFilter(style)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 whitespace-nowrap ${
                    filter === style
                      ? 'bg-primary text-white shadow-[0_0_20px_rgba(105,68,255,0.45)] ring-1 ring-primary/50'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {style}
                </button>
              )
            )}
          </div>

          {/* Action buttons: GPS & Drawer toggle */}
          <div className="flex items-center gap-2 pointer-events-auto flex-shrink-0">
            <button
              data-testid="gps-locate-btn"
              onClick={requestUserLocation}
              title={userCoords ? 'GPS Activo (Centrar)' : '📍 Usar mi ubicación'}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md border flex items-center gap-1.5 transition-all duration-100 active:scale-95 ${
                userCoords
                  ? 'bg-blue-600/90 hover:bg-blue-500 text-white border-blue-400/40 shadow-blue-500/20'
                  : 'bg-gray-900/90 hover:bg-gray-800 text-gray-200 border-white/10'
              }`}
            >
              <LocateFixed
                size={14}
                className={gpsStatus === 'requesting' ? 'animate-spin' : ''}
              />
              <span className="hidden md:inline">
                {gpsStatus === 'requesting'
                  ? 'Localizando...'
                  : userCoords
                  ? 'Mi Ubicación'
                  : '📍 Usar mi ubicación'}
              </span>
            </button>

            <button
              data-testid="drawer-toggle-btn"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md border bg-gray-900/90 hover:bg-gray-800 active:scale-95 text-gray-200 border-white/10 flex items-center gap-1.5 transition-all duration-100"
              title="Mostrar lista de artistas cercanos"
            >
              <Compass size={14} className="text-primary" />
              <span className="hidden sm:inline">Cercanos ({sortedArtists.length})</span>
            </button>
          </div>
        </div>

        {/* Friendly GPS Notification Banner */}
        {gpsNotification && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[1000] max-w-md w-[92%] bg-gray-900/95 backdrop-blur-md border border-amber-500/30 text-amber-200 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-amber-400 flex-shrink-0" />
              <span>{gpsNotification}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={requestUserLocation}
                className="underline font-bold text-white hover:text-primary transition"
              >
                📍 Usar mi ubicación
              </button>
              <button
                onClick={() => setGpsNotification(null)}
                className="text-gray-400 hover:text-white transition p-0.5"
                aria-label="Cerrar notificación"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Floating Collapsible Nearest Artists Drawer */}
        <div
          data-testid="nearest-drawer"
          className={`absolute left-4 top-20 bottom-4 z-[1000] w-80 sm:w-96 max-w-[calc(100vw-32px)] bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col transition-all duration-300 transform ${
            isDrawerOpen
              ? 'translate-x-0 opacity-100 pointer-events-auto'
              : '-translate-x-[115%] opacity-0 pointer-events-none'
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/20 text-primary">
                <Sparkles size={16} />
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-white">Artistas más cercanos</h2>
                <p className="text-[11px] text-gray-400">
                  {userCoords
                    ? 'Ordenados por distancia exacta'
                    : 'Activa tu GPS para calcular distancias'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              aria-label="Cerrar panel"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer GPS Prompt if inactive */}
          {!userCoords && (
            <div className="m-3 p-3 bg-blue-950/40 border border-blue-500/20 rounded-2xl flex items-center justify-between text-xs text-blue-200">
              <div className="flex items-center gap-2">
                <LocateFixed size={16} className="text-blue-400 flex-shrink-0" />
                <span>¿Deseas ver distancias exactas?</span>
              </div>
              <button
                onClick={requestUserLocation}
                className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] transition shadow"
              >
                📍 Usar mi ubicación
              </button>
            </div>
          )}

          {/* Drawer Artist List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
            {loading ? (
              <HubDrawerSkeleton />
            ) : sortedArtists.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                No hay artistas disponibles con el filtro seleccionado.
              </div>
            ) : (
              sortedArtists.map((artist, idx) => (
                <div
                  key={artist.id}
                  data-testid="artist-card"
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-violet-500/30 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-950/50 group flex flex-col gap-2"
                >
                  <div className="flex items-start gap-3">
                    {/* Rank Badge */}
                    <span className="text-[11px] font-extrabold text-gray-500 group-hover:text-primary transition pt-1">
                      #{idx + 1}
                    </span>

                    {/* Artist Avatar */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                      <img
                        src={artist.photoUrl}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            artist.name
                          )}&background=2a2a2a&color=fff`;
                        }}
                      />
                    </div>

                    {/* Artist Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 data-testid="artist-name" className="font-bold text-sm text-white truncate">{artist.name}</h3>
                        {artist.distanceKm !== undefined && (
                          <span
                            data-testid="distance-badge"
                            className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"
                          >
                            {userCoords && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                            {artist.distanceKm} km
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                        <span data-testid="artist-style" className="capitalize text-primary font-medium">{artist.style}</span>
                        <span>•</span>
                        <span className="truncate">{artist.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                    <button
                      data-testid="btn-center-artist"
                      onClick={() => handleCenterOnArtist(artist)}
                      className="flex-1 flex items-center justify-center gap-1 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold py-1.5 px-2 rounded-xl transition duration-100"
                    >
                      <MapPin size={12} className="text-primary" />
                      <span>Centrar</span>
                    </button>

                    {artist.whatsappUrl ? (
                      <a
                        data-testid="btn-whatsapp-artist"
                        href={artist.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white text-xs font-bold py-1.5 px-2 rounded-xl transition shadow duration-100"
                        title="Contactar vía WhatsApp"
                      >
                        <Phone size={12} />
                        <span>WhatsApp</span>
                      </a>
                    ) : null}

                    <Link
                      to={`/artist/${artist.id}`}
                      className="flex items-center justify-center p-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl transition duration-100"
                      title="Ver perfil completo"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map Container */}
        {loading ? (
          <div className="flex-1 w-full h-full min-h-[calc(100vh-64px)] relative" data-testid="hub-map-container">
            <HubSkeleton />
          </div>
        ) : (
          <div className="flex-1 w-full h-full min-h-[calc(100vh-64px)] relative" data-testid="hub-map-container">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              className="w-full h-full z-0"
              style={{ height: 'calc(100vh - 64px)', minHeight: '400px', width: '100%' }}
            >
              {/* Dynamic Re-centering controller */}
              <MapRecenter center={mapCenter} zoom={mapZoom} />

              {/* Dark Map Tiles */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {/* Pulsing User GPS Marker */}
              {userCoords && (
                <Marker position={userCoords} icon={UserGpsIcon}>
                  <Popup className="custom-popup">
                    <div className="p-3 bg-gray-900 text-white rounded-xl text-xs font-bold border border-blue-500/30 flex items-center gap-2 shadow-2xl">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></div>
                      <span>📍 Tu ubicación actual</span>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Filtered Artist Markers */}
              {filteredArtists.map((artist) => (
                <Marker key={artist.id} position={[artist.lat, artist.lng]}>
                  <Popup className="custom-popup">
                    <div className="w-72 bg-gray-900 text-white rounded-2xl overflow-hidden shadow-2xl p-0 m-0 border border-white/10">
                      <div className="relative h-32 w-full overflow-hidden bg-gray-800">
                        <img
                          src={artist.photoUrl}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              artist.name
                            )}&background=2a2a2a&color=fff`;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                        <span className="absolute bottom-2 left-3 text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/90 text-white backdrop-blur-sm capitalize">
                          {artist.style}
                        </span>
                        {artist.distanceKm !== undefined && (
                          <span className="absolute bottom-2 right-3 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600/90 text-white backdrop-blur-sm">
                            📍 {artist.distanceKm} km
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-extrabold text-base text-white truncate">
                          {artist.name}
                        </h3>
                        <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                          <MapPin size={12} className="text-primary flex-shrink-0" />
                          <span className="truncate">{artist.address}</span>
                        </p>

                        <div className="flex justify-between items-center mb-3 text-xs">
                          <span className="text-gray-400">Tarifa estimada:</span>
                          <span className="font-bold text-emerald-400">
                            {artist.price ? `Desde ${artist.price}` : 'Consultar'}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {artist.whatsappUrl ? (
                            <a
                              href={artist.whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold py-2 px-3 rounded-xl transition shadow"
                            >
                              <Phone size={14} /> WhatsApp
                            </a>
                          ) : (
                            <button
                              onClick={() => handleChat(artist.id)}
                              className="flex-1 flex items-center justify-center gap-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 rounded-xl transition"
                            >
                              <MessageCircle size={14} /> Chatear
                            </button>
                          )}

                          <Link
                            to={`/artist/${artist.id}`}
                            className="flex-1 flex items-center justify-center gap-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 rounded-xl transition border border-white/10"
                          >
                            Perfil
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </main>

      <style>{`
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .leaflet-popup-tip {
          background: #111827 !important;
        }
        .user-gps-marker {
          background: transparent;
          border: none;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
      </div>
    </PageTransition>
  );
}
