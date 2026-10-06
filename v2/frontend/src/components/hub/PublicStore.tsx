

import { useCurrency } from '../../context/CurrencyContext';
import { useGuestGate } from '../../context/GuestGateContext';

// Interfaces mock
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  material: string;
  in_stock: boolean;
  image_url: string;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Piercing Titanio Grado Implante - Aro Básico',
    description: 'Aro básico de titanio ASTM F136, ideal para primera perforación. Hipoalergénico.',
    price: 15.00,
    material: 'Titanio Grado Implante',
    in_stock: true,
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '2',
    name: 'Crema Aftercare - Cuidado Posterior',
    description: 'Crema vegana para el cuidado del tatuaje. Ayuda a la cicatrización rápida.',
    price: 12.50,
    material: 'Natural/Vegano',
    in_stock: true,
    image_url: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '3',
    name: 'Piercing Oro 14k - Gema Blanca',
    description: 'Joya para nostril o cartílago con incrustación de gema blanca.',
    price: 45.00,
    material: 'Oro 14k',
    in_stock: false,
    image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=400',
  }
];

export function PublicStore() {
  const { formatPrice } = useCurrency();
  const { requireAuth } = useGuestGate();

  const handleOrder = (product: Product) => {
    requireAuth(
      () => {
        alert(
          `Has iniciado un pedido para: ${product.name} (${formatPrice(product.price)}).\n\nEn la versión final, esto abrirá un modal de confirmación y enviará el pedido al tatuador para que lo apartes y retires en el estudio.`
        );
      },
      {
        title: 'Reservar Producto',
        message: 'Para apartar este producto en el estudio oficial, crea tu cuenta o inicia sesión en Tattoo Hub.',
        redirectUrl: '/hub',
      }
    );
  };

  return (
    <div className="bg-zinc-900 min-h-screen text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Tienda del Estudio</h2>
            <p className="text-zinc-400 mt-2">Joyería corporal, cuidado posterior y mercancía oficial.</p>
          </div>
          <div className="text-sm text-zinc-500 hidden sm:block">
            * Retiro exclusivo en el estudio.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PRODUCTS.map((product) => (
            <div 
              key={product.id} 
              className="bg-zinc-800/50 rounded-xl overflow-hidden border border-zinc-700/50 hover:border-violet-500/50 transition-colors group flex flex-col"
            >
              <div className="aspect-square bg-zinc-800 relative overflow-hidden">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!product.in_stock && 'grayscale opacity-60'}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    Sin imagen
                  </div>
                )}
                
                {!product.in_stock && (
                  <div className="absolute top-3 right-3 bg-red-500/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                    Agotado
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-zinc-100 leading-tight">
                    {product.name}
                  </h3>
                </div>
                
                {product.material && (
                  <span className="inline-block bg-zinc-700/50 text-zinc-300 text-xs px-2 py-1 rounded w-max mb-3">
                    {product.material}
                  </span>
                )}
                
                <p className="text-zinc-400 text-sm mb-4 flex-1">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-700/50">
                  <span className="text-xl font-bold text-violet-400">
                    {formatPrice(product.price)}
                  </span>
                  
                  <button
                    onClick={() => handleOrder(product)}
                    disabled={!product.in_stock}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-lg
                      ${product.in_stock 
                        ? 'bg-violet-600 text-white hover:bg-violet-500 hover:shadow-violet-500/25 active:scale-95' 
                        : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'}`}
                  >
                    {product.in_stock ? 'Reservar' : 'No disponible'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 bg-violet-900/20 border border-violet-500/20 rounded-xl p-6 flex items-start gap-4">
          <div className="p-3 bg-violet-500/20 rounded-full text-violet-400 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-violet-300 font-semibold mb-1">Sobre la Joyería Corporal</h4>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Por razones de higiene y salud, no aceptamos devoluciones en joyería corporal (piercings) una vez entregados. Te garantizamos que todas nuestras piezas son de materiales biocompatibles seguros para implantes. Podrás revisar el producto en el estudio antes de concretar la compra.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
