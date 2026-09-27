import { useEffect, useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { api } from '../api/client';
import { Link } from 'react-router-dom';

export default function ArtistsHubPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await api.getTattooArtists();
        if (response.success) {
          setArtists(response.data || []);
        }
      } catch (err) {
        console.error('Error fetching artists', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
              Descubre a tu Tatuador Ideal
            </h1>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
              Explora artistas, estilos y promociones cerca de ti.
            </p>
          </div>

          <div className="flex justify-center mb-8 gap-4 flex-wrap">
            {['All', 'Realismo', 'Tradicional', 'Blackwork', 'Minimalista'].map((style) => (
              <button
                key={style}
                onClick={() => setFilter(style)}
                className={`px-4 py-2 rounded-full font-medium ${
                  filter === style
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Cargando artistas...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {artists.map((artist, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden group">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                    <img 
                      src={artist.design || artist.photoUrl || `https://ui-avatars.com/api/?name=${artist.name || 'Artist'}&background=random`} 
                      alt="Tattoo preview" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {artist.name || `Tatuador #${artist.id || i}`}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">{artist.address || 'Ubicación no especificada'}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-primary">{artist.price ? `$${artist.price}` : 'Consultar'}</span>
                      <Link to={`/artist/${artist.id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition">
                        Ver Perfil →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
